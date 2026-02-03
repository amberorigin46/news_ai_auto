
import { GoogleGenAI, Type } from "@google/genai";
import { NewsArticle, GroundingSource, NewsCategory } from "../types";

const CACHE_KEY = 'global_pulse_news_cache_v5';
const CACHE_TIME = 15 * 60 * 1000; // 15분으로 연장

export const fetchAllCategoriesBriefing = async (categories: string[], forceRefresh = false): Promise<{ articles: NewsArticle[], sources: GroundingSource[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  if (!forceRefresh) {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_TIME) return { articles: parsed.articles, sources: parsed.sources };
    }
  }

  // 404 방지를 위해 뉴스 통신사 우선순위 및 영구 링크(Permalink) 지침 강화
  const prompt = `
    당신은 세계 최고의 비주얼 뉴스 큐레이션 AI입니다. 
    다음 카테고리별로 기사를 1개씩 선정하세요: [${categories.join(', ')}]
    
    [중요 규칙: 404 오류 및 링크 신뢰성 보장]
    1. 뉴스 소스 제한: 반드시 Reuters, Associated Press(AP), BBC News, ABC News, The Guardian, CNN 등 신뢰도가 높고 링크가 변하지 않는 글로벌 주요 매체만 사용하세요.
    2. 링크 유효성: 반드시 실시간으로 존재하는 '영구 링크(Canonical URL/Permalink)'를 가져와야 합니다. 단축 URL이나 소셜 미디어 공유용 링크는 절대 사용하지 마세요.
    3. 유료벽 배제: 구독이 필요한 유료 기사(NYT, WSJ 등)는 피하고, 누구나 즉시 읽을 수 있는 무료 공개 기사만 선정하세요.
    4. 이미지 품질: 기사와 직접적으로 연관된 고화질 실제 보도 사진 URL을 정확하게 매칭하세요.
    5. 내용: 요약은 팩트 중심의 중립적인 톤을 유지하세요.

    [응답 형식]
    JSON 배열로 반환하세요.
    - title: 제목 (한국어 번역)
    - category: 카테고리
    - summary: 요약 3문장 (배열, 한국어)
    - source: 매체명 (예: BBC News)
    - url: 실제 뉴스 기사 영구 링크
    - imageUrl: 기사 관련 고화질 이미지 URL
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
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
              summary: { type: Type.ARRAY, items: { type: Type.STRING } },
              source: { type: Type.STRING },
              url: { type: Type.STRING },
              imageUrl: { type: Type.STRING }
            },
            required: ["title", "category", "summary", "source", "url", "imageUrl"]
          }
        }
      }
    });

    const parsedArticles = JSON.parse(response.text || "[]");
    const articles: NewsArticle[] = parsedArticles.map((item: any, idx: number) => ({
      ...item,
      id: `art-${idx}-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('ko-KR')
    }));

    const data = { articles, sources: [], timestamp: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    return { articles, sources: [] };
  } catch (error) {
    console.error("News fetch error:", error);
    throw error;
  }
};
