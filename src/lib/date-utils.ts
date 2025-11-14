/**
 * 날짜 패턴 추출 및 신고 마감일 계산 유틸리티
 */

export interface ExtractedDate {
  fullDate: string;      // "2025년 11월 20일"
  monthDay: string;      // "11월 20일"
  isoDate: string;       // "2025-11-20"
  year?: number;
  month?: number;
  day?: number;
}

/**
 * 질문에서 날짜 패턴을 추출합니다.
 * 다양한 날짜 형식을 지원합니다.
 */
export const extractDateFromQuery = (query: string): ExtractedDate | null => {
  // 패턴 1: "2025년 11월 20일" 형식
  const fullDateMatch = query.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);
  if (fullDateMatch) {
    const [, year, month, day] = fullDateMatch;
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    const dayNum = parseInt(day);
    
    return {
      fullDate: `${year}년 ${month}월 ${day}일`,
      monthDay: `${month}월 ${day}일`,
      isoDate: `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`,
      year: yearNum,
      month: monthNum,
      day: dayNum
    };
  }
  
  // 패턴 2: "11월 20일" 형식 (년도 없음 - 현재 년도 추정)
  const monthDayMatch = query.match(/(\d{1,2})월\s*(\d{1,2})일/);
  if (monthDayMatch && !fullDateMatch) {
    const [, month, day] = monthDayMatch;
    const currentYear = new Date().getFullYear();
    const monthNum = parseInt(month);
    const dayNum = parseInt(day);
    
    return {
      fullDate: `${currentYear}년 ${month}월 ${day}일`,
      monthDay: `${month}월 ${day}일`,
      isoDate: `${currentYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`,
      year: currentYear,
      month: monthNum,
      day: dayNum
    };
  }
  
  // 패턴 3: "2025-11-20" 또는 "2025/11/20" 형식
  const isoDateMatch = query.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (isoDateMatch) {
    const [, year, month, day] = isoDateMatch;
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    const dayNum = parseInt(day);
    
    return {
      fullDate: `${year}년 ${month}월 ${day}일`,
      monthDay: `${month}월 ${day}일`,
      isoDate: `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`,
      year: yearNum,
      month: monthNum,
      day: dayNum
    };
  }
  
  // 패턴 4: "11.20" 형식 (월일만, 현재 년도 추정)
  const dotDateMatch = query.match(/(\d{1,2})\.(\d{1,2})/);
  if (dotDateMatch && !fullDateMatch && !monthDayMatch && !isoDateMatch) {
    const [, month, day] = dotDateMatch;
    const currentYear = new Date().getFullYear();
    const monthNum = parseInt(month);
    const dayNum = parseInt(day);
    
    // 월이 1-12 범위인지 확인
    if (monthNum >= 1 && monthNum <= 12 && dayNum >= 1 && dayNum <= 31) {
      return {
        fullDate: `${currentYear}년 ${month}월 ${day}일`,
        monthDay: `${month}월 ${day}일`,
        isoDate: `${currentYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`,
        year: currentYear,
        month: monthNum,
        day: dayNum
      };
    }
  }
  
  // 패턴 5: "11월 거래분" 같은 불완전한 날짜 (월만 있는 경우)
  const monthOnlyMatch = query.match(/(\d{1,2})월\s*거래/);
  if (monthOnlyMatch && !fullDateMatch && !monthDayMatch) {
    const [, month] = monthOnlyMatch;
    const currentYear = new Date().getFullYear();
    const monthNum = parseInt(month);
    
    if (monthNum >= 1 && monthNum <= 12) {
      // 월만 있는 경우, 해당 월의 첫째 날로 추정
      return {
        fullDate: `${currentYear}년 ${month}월`,
        monthDay: `${month}월`,
        isoDate: `${currentYear}-${month.padStart(2, '0')}-01`,
        year: currentYear,
        month: monthNum,
        day: 1
      };
    }
  }
  
  return null;
};

/**
 * 거래일 기준으로 부가가치세 신고 마감일을 계산합니다.
 * 
 * 규칙:
 * - 1~6월 거래: 해당 년도 7월 25일까지 신고
 * - 7~12월 거래: 다음 해 1월 25일까지 신고
 */
export const calculateVATDeadline = (transactionDate: ExtractedDate): string => {
  const { year, month } = transactionDate;
  
  if (!year || !month) {
    return "";
  }
  
  // 1~6월 거래 → 7월 25일
  if (month >= 1 && month <= 6) {
    return `${year}년 7월 25일`;
  } 
  // 7~12월 거래 → 다음 해 1월 25일
  else if (month >= 7 && month <= 12) {
    return `${year + 1}년 1월 25일`;
  }
  
  return "";
};

/**
 * 오늘 날짜를 포맷팅합니다.
 */
export const getTodayFormatted = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  
  return `${year}년 ${month}월 ${day}일`;
};

/**
 * 답변 텍스트에서 동적 변수를 치환합니다.
 */
export const replaceDynamicVariables = (
  text: string,
  extractedDate?: ExtractedDate | null
): string => {
  let result = text;
  
  // {today} 변수 치환
  result = result.replace(/{today}/g, getTodayFormatted());
  
  // 날짜가 추출된 경우
  if (extractedDate) {
    // {date} 변수 치환
    result = result.replace(/{date}/g, extractedDate.fullDate);
    
    // {deadline} 변수 치환
    const deadline = calculateVATDeadline(extractedDate);
    if (deadline) {
      result = result.replace(/{deadline}/g, deadline);
    }
  }
  
  return result;
};

