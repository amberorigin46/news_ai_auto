
import { GoogleGenAI, Type } from "@google/genai";
import { NewsArticle, GroundingSource } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const CACHE_KEY = 'global_pulse_news_cache';
const CACHE_TIME = 10 * 60 * 1000; // 10분 캐시 유지

interface CachedData {
  articles: NewsArticle[];
  sources: GroundingSource[];
  timestamp: number;
}

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const fetchAllCategoriesBriefing = async (categories: string[], forceRefresh = false): Promise<{ articles: NewsArticle[], sources: GroundingSource[] }> => {
  // 1. 캐시 확인
  if (!forceRefresh) {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsedCache: CachedData = JSON.parse(cached);
      if (Date.now() - parsedCache.timestamp < CACHE_TIME) {
        console.log("캐시된 데이터를 사용합니다.");
        return { articles: parsedCache.articles, sources: parsedCache.sources };
      }
    }
  }

  const maxRetries = 3;
  let retryCount = 0;

  const executeFetch = async (): Promise<{ articles: NewsArticle[], sources: GroundingSource[] }> => {
    try {
      const prompt = `
        글로벌 뉴스 브리핑 AI로서 역할을 수행하세요.
        다음 각 카테고리별로 지난 24시간 동안 가장 중요한 글로벌 뉴스를 딱 1개씩 선정하여 브리핑을 생성하세요: [${categories.join(', ')}]
        
        규칙:
        - 반드시 한국어로 답변하세요.
        - 각 카테고리당 1개의 기사, 총 ${categories.length}개의 기사를 반환하세요.
        - 사실적이고 중립적이어야 하며 의견을 배제하세요.
        - **중요: 반드시 유료 구독(Paywall) 없이 무료로 전문을 읽을 수 있는 뉴스 소스(예: BBC, Reuters, AP News, 연합뉴스, YTN 등)를 선정하세요.**
        - 유료 결제가 필요한 매체(WSJ, FT, NYT 일부 등)는 제외하세요.
        - 기사 전문을 복제하지 말고 핵심 내용을 요약하세요.
        - 항상 출처를 명시하세요.
        - JSON 배열 객체 형태로 반환하세요.
        
        형식:
        각 객체는 다음을 포함해야 합니다:
        - title: 간결한 헤드라인 (한국어).
        - category: 요청받은 카테고리명 중 하나 (예: 경제, 테크 등).
        - summary: 3~5개의 불렛 포인트 요약 배열 (한국어).
        - source: 언론사 명칭.
        - url: 기사 원문 URL (반드시 유효하고 무료로 접근 가능한 링크여야 함).
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                category: { type: Type.STRING },
                summary: { 
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                source: { type: Type.STRING },
                url: { type: Type.STRING }
              },
              required: ["title", "category", "summary", "source", "url"]
            }
          }
        }
      });

      const text = response.text || '[]';
      let articles: NewsArticle[] = [];
      try {
        const parsed = JSON.parse(text);
        articles = parsed.map((item: any, index: number) => ({
          ...item,
          id: `article-${index}-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString('ko-KR')
        }));
      } catch (e) {
        console.error("뉴스 JSON 파싱 실패", e);
      }

      const sources: GroundingSource[] = [];
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        chunks.forEach((chunk: any) => {
          if (chunk.web) {
            sources.push({
              title: chunk.web.title || '관련 출처',
              uri: chunk.web.uri
            });
          }
        });
      }

      // 결과 캐싱
      const dataToCache: CachedData = { articles, sources, timestamp: Date.now() };
      localStorage.setItem(CACHE_KEY, JSON.stringify(dataToCache));

      return { articles, sources };
    } catch (error: any) {
      const isQuotaError = error?.message?.includes('429') || error?.status === 'RESOURCE_EXHAUSTED';
      
      if (isQuotaError && retryCount < maxRetries) {
        retryCount++;
        const waitTime = Math.pow(2, retryCount) * 5000; 
        console.warn(`429 할당량 초과. ${waitTime}ms 후 재시도 (${retryCount}/${maxRetries})...`);
        await delay(waitTime);
        return executeFetch();
      }
      throw error;
    }
  };

  return executeFetch();
};

export const fetchNewsBriefing = async (category: string): Promise<{ articles: NewsArticle[], sources: GroundingSource[] }> => {
  return fetchAllCategoriesBriefing([category]);
};
