import knowledgeBase from "@/data/barobill-knowledge-base.json";
import chatbotDataset from "@/data/barobill-chatbot-dataset.json";

export type ToneType = "formal" | "casual";

interface MatchResult {
  found: boolean;
  response?: string;
  relatedGuides?: Array<{
    title: string;
    url: string;
    description: string;
    icon: string;
  }>;
  followUpQuestions?: string[];
}

// Normalize text for comparison
const normalizeText = (text: string): string => {
  return text.toLowerCase().trim().replace(/\s+/g, " ");
};

// Check if query contains any of the keywords
const containsKeywords = (query: string, keywords: string[]): boolean => {
  const normalizedQuery = normalizeText(query);
  return keywords.some((keyword) =>
    normalizedQuery.includes(normalizeText(keyword))
  );
};

// Extract synonyms from dataset
const getSynonyms = (word: string): string[] => {
  const synonyms = (chatbotDataset as any).nlu?.synonyms || {};
  
  // Find the key that contains this word
  for (const [key, values] of Object.entries(synonyms)) {
    if (normalizeText(key) === normalizeText(word) || 
        (Array.isArray(values) && values.some(v => normalizeText(v) === normalizeText(word)))) {
      return [key, ...(Array.isArray(values) ? values : [])];
    }
  }
  
  return [word];
};

// Expand query with synonyms
const expandQueryWithSynonyms = (query: string): string[] => {
  const words = query.split(" ");
  const expandedQueries = [query];
  
  words.forEach(word => {
    const synonyms = getSynonyms(word);
    synonyms.forEach(synonym => {
      if (synonym !== word) {
        expandedQueries.push(query.replace(word, synonym));
      }
    });
  });
  
  return expandedQueries;
};

// Match query against knowledge base
export const matchQuery = (query: string, tone: ToneType): MatchResult => {
  const kb = knowledgeBase as any;
  const expandedQueries = expandQueryWithSynonyms(query);
  
  // Try to find a match in knowledge_base
  for (const [, item] of Object.entries(kb.knowledge_base || {})) {
    const entry = item as any;
    
    // Collect all keywords
    const allKeywords = [
      ...(entry.keywords?.primary || []),
      ...(entry.keywords?.secondary || []),
      ...(entry.keywords?.related || []),
    ];
    
    // Check if any expanded query matches
    for (const expandedQuery of expandedQueries) {
      if (containsKeywords(expandedQuery, allKeywords)) {
        const responseType = tone === "formal" ? "formal" : "casual";
        const response = entry.responses?.[responseType];
        
        if (response) {
          const fullResponse = [
            response.greeting,
            response.content,
            response.closing,
          ].filter(Boolean).join("\n\n");
          
          return {
            found: true,
            response: fullResponse,
            relatedGuides: entry.related_guides || [],
            followUpQuestions: entry.follow_up_questions || [],
          };
        }
      }
    }
  }
  
  // Try to find match in chatbot_dataset
  const dataset = chatbotDataset as any;
  const qaPairs = dataset.qa_pairs || [];
  
  for (const pair of qaPairs) {
    const allKeywords = [
      ...(pair.keywords || []),
      ...(pair.synonyms || []),
    ];
    
    for (const expandedQuery of expandedQueries) {
      if (containsKeywords(expandedQuery, allKeywords)) {
        const answer = tone === "formal" ? pair.answer_polite : pair.answer_casual;
        
        if (answer) {
          return {
            found: true,
            response: answer,
            relatedGuides: pair.related_links || [],
            followUpQuestions: pair.follow_up || [],
          };
        }
      }
    }
  }
  
  return { found: false };
};

// Detect tone from user input
export const detectTone = (query: string): ToneType => {
  const casualMarkers = ["해", "야", "어", "음", "ㅋ", "ㅎ", "요 없이"];
  const formalMarkers = ["습니다", "십시오", "세요", "요"];
  
  const hasCasual = casualMarkers.some((marker) => query.includes(marker));
  const hasFormal = formalMarkers.some((marker) => query.includes(marker));
  
  if (hasCasual && !hasFormal) return "casual";
  if (hasFormal && !hasCasual) return "formal";
  
  return "formal"; // Default to formal
};
