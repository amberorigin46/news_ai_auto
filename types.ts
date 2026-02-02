
export interface NewsArticle {
  id: string;
  category: string;
  title: string;
  summary: string[];
  source: string;
  url: string;
  timestamp: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface BriefingState {
  articles: NewsArticle[];
  sources: GroundingSource[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export enum NewsCategory {
  ECONOMY = '경제',
  TECH = '테크',
  POLITICS = '정치',
  SOCIETY = '사회',
  CULTURE = '문화',
  GLOBAL = '글로벌 이슈'
}
