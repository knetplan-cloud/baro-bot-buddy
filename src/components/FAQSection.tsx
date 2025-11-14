import { useState, useMemo, useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, ThumbsUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FAQContentBlock {
  type: "text" | "image";
  content?: string;  // type이 "text"일 때
  src?: string;      // type이 "image"일 때
  alt?: string;      // type이 "image"일 때
  caption?: string;  // type이 "image"일 때
}

interface FAQItem {
  question: string;
  category: string;
  content?: FAQContentBlock[];  // 새로운 구조
  answer?: string;              // 기존 구조 (하위 호환성)
  images?: Array<{              // 기존 구조 (하위 호환성)
    src: string;
    alt?: string;
    caption?: string;
  }>;
}

interface FAQSectionProps {
  faqs: FAQItem[];
  categories?: string[];
  faqIds?: string[]; // FAQ ID 목록 (도움됨 수 조회용)
}

const ITEMS_PER_PAGE = 7;

export const FAQSection = ({ faqs, categories = [], faqIds = [] }: FAQSectionProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [helpfulCounts, setHelpfulCounts] = useState<Record<string, number>>({});
  const [clickedFaqs, setClickedFaqs] = useState<Set<string>>(new Set());
  
  // 카테고리 목록 추출 (categories prop이 없으면 faqs에서 추출)
  const availableCategories = categories.length > 0 
    ? categories 
    : Array.from(new Set(faqs.map(faq => faq.category))).sort();
  
  const [activeTab, setActiveTab] = useState(availableCategories[0] || "");

  // FAQ 도움됨 수 조회
  useEffect(() => {
    const fetchHelpfulCounts = async () => {
      if (faqIds.length === 0) return;
      
      try {
        const { data, error } = await supabase
          .from('faq_helpful')
          .select('faq_id')
          .in('faq_id', faqIds);
        
        if (error) throw error;
        
        // FAQ ID별 카운트 계산
        const counts: Record<string, number> = {};
        data?.forEach((item) => {
          counts[item.faq_id] = (counts[item.faq_id] || 0) + 1;
        });
        
        setHelpfulCounts(counts);
      } catch (error) {
        console.error('Error fetching helpful counts:', error);
      }
    };

    fetchHelpfulCounts();
  }, [faqIds]);

  // 도움됨 클릭 핸들러
  const handleHelpfulClick = async (faqId: string) => {
    // 이미 클릭한 경우 중복 방지
    if (clickedFaqs.has(faqId)) {
      toast.info("이미 도움됨을 클릭하셨습니다.");
      return;
    }

    try {
      // 사용자 IP 가져오기 (간단한 방법)
      const userIp = await fetch('https://api.ipify.org?format=json')
        .then(res => res.json())
        .then(data => data.ip)
        .catch(() => 'unknown');

      const { error } = await supabase
        .from('faq_helpful')
        .insert({
          faq_id: faqId,
          user_ip: userIp
        });

      if (error) throw error;

      // 로컬 상태 업데이트
      setHelpfulCounts(prev => ({
        ...prev,
        [faqId]: (prev[faqId] || 0) + 1
      }));
      setClickedFaqs(prev => new Set([...prev, faqId]));
      
      toast.success("도움됨으로 기록되었습니다!");
    } catch (error) {
      console.error('Error recording helpful click:', error);
      toast.error("도움됨 기록에 실패했습니다.");
    }
  };

  // Filter FAQs based on search query and active tab
  const filteredFaqs = useMemo(() => {
    let filtered = faqs;
    
    // If there's a search query, search across all tabs
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((faq) => {
        const questionMatch = faq.question.toLowerCase().includes(query);
        // content 배열에서 텍스트 검색
        const contentMatch = faq.content?.some(block => 
          block.type === "text" && block.content?.toLowerCase().includes(query)
        );
        // 기존 answer 필드 검색 (하위 호환성)
        const answerMatch = faq.answer?.toLowerCase().includes(query);
        return questionMatch || contentMatch || answerMatch;
      });
    } else {
      // If no search query, filter by active tab
      filtered = filtered.filter(faq => faq.category === activeTab);
    }
    
    return filtered;
  }, [faqs, searchQuery, activeTab]);

  // Paginate FAQs
  const totalPages = Math.ceil(filteredFaqs.length / ITEMS_PER_PAGE);
  const paginatedFaqs = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredFaqs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredFaqs, currentPage]);

  // Reset to page 1 when search query or tab changes
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of FAQ section
    document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' });
    // Close all accordions by resetting the Accordion component
    const accordionTriggers = document.querySelectorAll('[data-state="open"]');
    accordionTriggers.forEach((trigger) => {
      if (trigger instanceof HTMLElement) {
        trigger.click();
      }
    });
  };

  return (
    <div id="faq-section" className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-2xl font-bold text-foreground">자주 묻는 질문</h2>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="질문 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={`grid w-full`} style={{ gridTemplateColumns: `repeat(${availableCategories.length}, 1fr)` }}>
          {availableCategories.map((category) => (
            <TabsTrigger key={category} value={category}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredFaqs.length === 0 ? (
            <Card className="border-border bg-card p-8 text-center">
              <p className="text-muted-foreground">검색 결과가 없습니다.</p>
            </Card>
          ) : (
            <>
              <Card className="border-border bg-card max-h-[600px] overflow-y-auto">
                <Accordion type="multiple" className="w-full">
                  {paginatedFaqs.map((faq, index) => {
                    // 원본 FAQ 배열에서 해당 FAQ의 인덱스 찾기
                    const originalIndex = faqs.findIndex(f => f.question === faq.question && f.category === faq.category);
                    const faqId = faqIds[originalIndex] || `faq_${originalIndex}`;
                    
                    return (
                    <AccordionItem key={index} value={`${activeTab}-${index}`} className="border-border">
                      <AccordionTrigger className="px-4 text-left hover:no-underline hover:bg-muted/50 transition-colors">
                        <span className="font-medium">{faq.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="space-y-4">
                          {faq.content ? (
                            // 새로운 구조: content 배열 사용
                            faq.content.map((block, blockIdx) => {
                              if (block.type === "text") {
                                return (
                                  <p key={blockIdx} className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                                    {block.content}
                                  </p>
                                );
                              } else if (block.type === "image") {
                                return (
                                  <div key={blockIdx} className="flex flex-col items-start my-4">
                                    <img
                                      src={block.src}
                                      alt={block.alt || `FAQ 이미지 ${blockIdx + 1}`}
                                      className="max-w-full h-auto rounded-lg border border-border shadow-sm"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = '/placeholder.svg';
                                        target.alt = '이미지를 불러올 수 없습니다';
                                      }}
                                    />
                                    {block.caption && (
                                      <p className="text-xs text-muted-foreground mt-2 max-w-md">
                                        {block.caption}
                                      </p>
                                    )}
                                  </div>
                                );
                              }
                              return null;
                            })
                          ) : (
                            // 기존 구조: answer + images (하위 호환성)
                            <>
                              {faq.answer && (
                                <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                                  {faq.answer}
                                </p>
                              )}
                              {faq.images && faq.images.length > 0 && (
                                <div className="space-y-3 mt-4">
                                  {faq.images.map((image, imgIdx) => (
                                    <div key={imgIdx} className="flex flex-col items-start">
                                      <img
                                        src={image.src}
                                        alt={image.alt || `FAQ 이미지 ${imgIdx + 1}`}
                                        className="max-w-full h-auto rounded-lg border border-border shadow-sm"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.src = '/placeholder.svg';
                                          target.alt = '이미지를 불러올 수 없습니다';
                                        }}
                                      />
                                      {image.caption && (
                                        <p className="text-xs text-muted-foreground mt-2 max-w-md">
                                          {image.caption}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </>
                          )}
                          
                          {/* 도움됨 버튼 */}
                          <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                              {helpfulCounts[faqId] > 0 && (
                                <span className="font-medium text-foreground">
                                  {helpfulCounts[faqId]}명이 도움이 되었다고 했습니다
                                </span>
                              )}
                            </div>
                            <Button
                              variant={clickedFaqs.has(faqId) ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleHelpfulClick(faqId)}
                              disabled={clickedFaqs.has(faqId)}
                              className="gap-2"
                            >
                              <ThumbsUp className={`w-4 h-4 ${clickedFaqs.has(faqId) ? 'fill-current' : ''}`} />
                              도움됨
                            </Button>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    );
                  })}
                </Accordion>
              </Card>

              {totalPages > 1 && (
                <Pagination className="mt-4">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
