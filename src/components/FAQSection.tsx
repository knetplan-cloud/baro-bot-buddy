import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

interface FAQSectionProps {
  faqs: FAQItem[];
}

export const FAQSection = ({ faqs }: FAQSectionProps) => {
  const categories = Array.from(new Set(faqs.map(faq => faq.category)));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">자주 묻는 질문</h2>
      
      {categories.map((category) => (
        <div key={category} className="space-y-3">
          <h3 className="text-lg font-semibold text-primary">{category}</h3>
          <Card className="border-border bg-card">
            <Accordion type="multiple" className="w-full">
              {faqs
                .filter((faq) => faq.category === category)
                .map((faq, index) => (
                  <AccordionItem key={index} value={`${category}-${index}`} className="border-border">
                    <AccordionTrigger className="px-4 text-left hover:no-underline hover:bg-muted/50 transition-colors">
                      <span className="font-medium">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {faq.answer}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
            </Accordion>
          </Card>
        </div>
      ))}
    </div>
  );
};
