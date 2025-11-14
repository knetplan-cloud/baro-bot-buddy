#!/usr/bin/env python3
"""
바로빌 챗봇 지식베이스 검증기
JSON 파일의 데이터 품질을 검증

사용법:
    python validate_knowledge_base.py --file barobill-knowledge.json
    python validate_knowledge_base.py -f barobill-knowledge.json --strict
"""

import json
import argparse
from typing import Dict, List, Any
import sys
from collections import Counter


class KnowledgeBaseValidator:
    """지식베이스 JSON 파일 검증 클래스"""
    
    def __init__(self, json_file: str, strict_mode: bool = False):
        self.json_file = json_file
        self.strict_mode = strict_mode
        self.data = None
        self.errors = []
        self.warnings = []
        self.stats = {}
    
    def load_json(self) -> Dict:
        """JSON 파일 로드"""
        try:
            with open(self.json_file, 'r', encoding='utf-8') as f:
                self.data = json.load(f)
            print(f"✓ JSON 파일 로드 성공: {self.json_file}")
            return self.data
        except json.JSONDecodeError as e:
            print(f"❌ JSON 문법 오류: {e}")
            sys.exit(1)
        except FileNotFoundError:
            print(f"❌ 파일을 찾을 수 없습니다: {self.json_file}")
            sys.exit(1)
        except Exception as e:
            print(f"❌ 파일 로드 실패: {e}")
            sys.exit(1)
    
    def validate_structure(self):
        """기본 구조 검증"""
        print("\n[1/5] 기본 구조 검증...")
        
        # 필수 최상위 키 확인
        required_keys = ['metadata', 'items']
        for key in required_keys:
            if key not in self.data:
                self.errors.append(f"필수 키 '{key}'가 없습니다.")
        
        # items가 배열인지 확인
        if 'items' in self.data and not isinstance(self.data['items'], list):
            self.errors.append("'items'는 배열이어야 합니다.")
        
        if not self.errors:
            print("  ✓ 기본 구조 정상")
    
    def validate_items(self):
        """items 배열의 각 항목 검증"""
        print("\n[2/5] 항목별 데이터 검증...")
        
        items = self.data.get('items', [])
        
        for idx, item in enumerate(items):
            item_id = item.get('id', f'UNKNOWN_{idx}')
            
            # 필수 필드 체크
            required_fields = ['id', 'type', 'category', 'title', 'keywords', 'priority', 'responses']
            for field in required_fields:
                if field not in item:
                    self.errors.append(f"[{item_id}] 필수 필드 '{field}'가 없습니다.")
            
            # type 값 검증
            if 'type' in item and item['type'] not in ['intent', 'knowledge', 'case']:
                self.errors.append(f"[{item_id}] type은 'intent', 'knowledge', 'case' 중 하나여야 합니다: {item['type']}")
            
            # priority 범위 검증
            if 'priority' in item:
                priority = item['priority']
                if not isinstance(priority, int) or not (1 <= priority <= 10):
                    self.errors.append(f"[{item_id}] priority는 1-10 사이의 정수여야 합니다: {priority}")
            
            # keywords 검증
            if 'keywords' in item:
                keywords = item['keywords']
                if not isinstance(keywords, list):
                    self.errors.append(f"[{item_id}] keywords는 배열이어야 합니다.")
                elif len(keywords) < 2 and self.strict_mode:
                    self.warnings.append(f"[{item_id}] 키워드가 2개 미만입니다: {len(keywords)}개")
                elif not keywords:
                    self.warnings.append(f"[{item_id}] 키워드가 비어있습니다.")
            
            # responses 검증
            if 'responses' in item:
                responses = item['responses']
                if not isinstance(responses, dict):
                    self.errors.append(f"[{item_id}] responses는 객체여야 합니다.")
                else:
                    # 최소 한 가지 어투 필요
                    if not responses:
                        self.errors.append(f"[{item_id}] responses가 비어있습니다.")
                    
                    # 어투별 답변 길이 체크
                    for tone, text in responses.items():
                        if not isinstance(text, str):
                            self.errors.append(f"[{item_id}] {tone} 답변은 문자열이어야 합니다.")
                        elif len(text) < 20 and self.strict_mode:
                            self.warnings.append(f"[{item_id}] {tone} 답변이 너무 짧습니다 ({len(text)}자)")
                        elif len(text) > 2000:
                            self.warnings.append(f"[{item_id}] {tone} 답변이 너무 깁니다 ({len(text)}자)")
        
        if not self.errors:
            print(f"  ✓ {len(items)}개 항목 검증 완료")
    
    def check_duplicates(self):
        """중복 체크"""
        print("\n[3/5] 중복 데이터 검증...")
        
        items = self.data.get('items', [])
        
        # ID 중복
        ids = [item.get('id') for item in items if 'id' in item]
        id_counts = Counter(ids)
        duplicates = [id for id, count in id_counts.items() if count > 1]
        if duplicates:
            self.errors.append(f"중복된 ID가 발견되었습니다: {duplicates}")
        
        # 제목 중복 (경고)
        titles = [item.get('title') for item in items if 'title' in item]
        title_counts = Counter(titles)
        duplicate_titles = [title for title, count in title_counts.items() if count > 1]
        if duplicate_titles:
            self.warnings.append(f"중복된 제목이 발견되었습니다: {len(duplicate_titles)}개")
        
        if not duplicates:
            print("  ✓ 중복 데이터 없음")
    
    def validate_synonyms(self):
        """동의어 사전 검증"""
        print("\n[4/5] 동의어 사전 검증...")
        
        if 'synonyms' not in self.data:
            print("  ⚠️  동의어 사전이 없습니다.")
            return
        
        synonyms = self.data['synonyms']
        
        if not isinstance(synonyms, dict):
            self.errors.append("synonyms는 객체여야 합니다.")
            return
        
        for main_word, synonym_list in synonyms.items():
            if not isinstance(synonym_list, list):
                self.errors.append(f"동의어 '{main_word}'의 값은 배열이어야 합니다.")
            elif not synonym_list:
                self.warnings.append(f"동의어 '{main_word}'의 동의어 목록이 비어있습니다.")
        
        if not self.errors:
            print(f"  ✓ {len(synonyms)}개 동의어 검증 완료")
    
    def generate_statistics(self):
        """통계 생성"""
        print("\n[5/5] 통계 생성...")
        
        items = self.data.get('items', [])
        
        # 기본 통계
        self.stats = {
            'total_items': len(items),
            'total_synonyms': len(self.data.get('synonyms', {})),
            'type_distribution': Counter([item.get('type') for item in items]),
            'category_distribution': Counter([item.get('category') for item in items]),
            'priority_distribution': Counter([item.get('priority') for item in items]),
            'avg_keywords_per_item': sum(len(item.get('keywords', [])) for item in items) / len(items) if items else 0,
            'avg_response_length': {
                'formal': sum(len(item.get('responses', {}).get('formal', '')) for item in items) / len(items) if items else 0,
                'casual': sum(len(item.get('responses', {}).get('casual', '')) for item in items) / len(items) if items else 0,
                'plain': sum(len(item.get('responses', {}).get('plain', '')) for item in items) / len(items) if items else 0,
            }
        }
        
        print("  ✓ 통계 생성 완료")
    
    def print_report(self):
        """검증 결과 리포트 출력"""
        print("\n" + "=" * 60)
        print("검증 결과 리포트")
        print("=" * 60)
        
        # 에러
        if self.errors:
            print(f"\n❌ 에러 ({len(self.errors)}개):")
            for error in self.errors:
                print(f"  • {error}")
        
        # 경고
        if self.warnings:
            print(f"\n⚠️  경고 ({len(self.warnings)}개):")
            for warning in self.warnings[:10]:  # 최대 10개만
                print(f"  • {warning}")
            if len(self.warnings) > 10:
                print(f"  ... 외 {len(self.warnings) - 10}개")
        
        # 통계
        if self.stats:
            print(f"\n📊 통계:")
            print(f"  • 총 항목 수: {self.stats['total_items']}개")
            print(f"  • 동의어 수: {self.stats['total_synonyms']}개")
            print(f"  • 평균 키워드 수: {self.stats['avg_keywords_per_item']:.1f}개/항목")
            
            print(f"\n  📈 타입별 분포:")
            for type_name, count in self.stats['type_distribution'].items():
                percentage = (count / self.stats['total_items'] * 100) if self.stats['total_items'] else 0
                print(f"    - {type_name}: {count}개 ({percentage:.1f}%)")
            
            print(f"\n  📂 카테고리별 분포 (상위 5개):")
            for category, count in self.stats['category_distribution'].most_common(5):
                percentage = (count / self.stats['total_items'] * 100) if self.stats['total_items'] else 0
                print(f"    - {category}: {count}개 ({percentage:.1f}%)")
            
            print(f"\n  🎯 우선순위 분포:")
            for priority in sorted(self.stats['priority_distribution'].keys(), reverse=True):
                count = self.stats['priority_distribution'][priority]
                print(f"    - Priority {priority}: {count}개")
            
            print(f"\n  📝 평균 답변 길이:")
            for tone, length in self.stats['avg_response_length'].items():
                print(f"    - {tone}: {length:.0f}자")
        
        # 최종 결과
        print("\n" + "=" * 60)
        if self.errors:
            print("❌ 검증 실패!")
            print("=" * 60)
            return False
        elif self.warnings and self.strict_mode:
            print("⚠️  경고가 있지만 사용 가능합니다.")
            print("=" * 60)
            return True
        else:
            print("✅ 검증 성공!")
            print("=" * 60)
            return True
    
    def validate_all(self) -> bool:
        """전체 검증 프로세스 실행"""
        print("=" * 60)
        print("바로빌 챗봇 지식베이스 검증 시작")
        print("=" * 60)
        
        self.load_json()
        self.validate_structure()
        self.validate_items()
        self.check_duplicates()
        self.validate_synonyms()
        self.generate_statistics()
        
        return self.print_report()


def main():
    parser = argparse.ArgumentParser(
        description='바로빌 챗봇 지식베이스 JSON 파일 검증',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
예시:
  python validate_knowledge_base.py -f barobill-knowledge.json
  python validate_knowledge_base.py -f barobill-knowledge.json --strict
        """
    )
    
    parser.add_argument('-f', '--file', required=True, help='검증할 JSON 파일 경로')
    parser.add_argument('--strict', action='store_true', help='엄격 모드 (경고도 실패로 간주)')
    
    args = parser.parse_args()
    
    # 검증 실행
    validator = KnowledgeBaseValidator(args.file, args.strict)
    is_valid = validator.validate_all()
    
    if not is_valid:
        sys.exit(1)
    else:
        print("\n🎉 JSON 파일을 프로젝트에 안전하게 사용할 수 있습니다!")


if __name__ == '__main__':
    main()
