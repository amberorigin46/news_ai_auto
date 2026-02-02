
import React, { useState, useEffect, useCallback } from 'react';
import { fetchAllCategoriesBriefing } from './services/geminiService';
import { NewsArticle, NewsCategory } from './types';
import LoadingSkeleton from './components/LoadingSkeleton';

const HORSE_IMAGE = "/horse.png";

const App: React.FC = () => {
  const [view, setView] = useState<'intro' | 'detail'>('intro');
  const [articles, setArticles] = useState<(NewsArticle | { id: string, category: string, title: string, error: boolean })[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const loadTarotCards = useCallback(async (force = false) => {
    setLoading(true);
    setGlobalError(null);
    const categories = Object.values(NewsCategory);
    
    try {
      const { articles: fetchedArticles } = await fetchAllCategoriesBriefing(categories, force);
      
      const results = categories.map(cat => {
        const found = fetchedArticles.find(a => a.category === cat || a.category.includes(cat));
        if (found) return found;
        return { 
          id: `fail-${cat}-${Date.now()}`, 
          category: cat, 
          title: '정보를 불러오지 못했습니다', 
          error: true 
        };
      });

      setArticles(results);
      setLoading(false);
    } catch (e: any) {
      console.error("전체 로드 프로세스 오류", e);
      setGlobalError("Gemini API 할당량이 초과되었습니다. 잠시 후 다시 시도해주세요.");
      
      const failbacks = categories.map(cat => ({
        id: `fail-${cat}-${Date.now()}`, 
        category: cat, 
        title: '데이터 전송 오류 (429)', 
        error: true 
      }));
      setArticles(failbacks);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTarotCards();
  }, [loadTarotCards]);

  const handleCardClick = (item: any) => {
    if (item.error) return; 
    setSelectedArticle(item as NewsArticle);
    setView('detail');
    setIsExpanded(false);
  };

  const handleBack = () => {
    setView('intro');
    setSelectedArticle(null);
    setIsExpanded(false);
  };

  if (view === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0E2A2F] to-[#12343A] flex flex-col items-center justify-center p-6 md:p-12 overflow-hidden relative">
        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="z-10 text-white space-y-10 order-2 lg:order-1">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <h1 className="text-4xl md:text-5xl font-bold serif tracking-tight">글로벌 펄스 AI</h1>
                <button 
                  onClick={() => loadTarotCards(true)}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                  title="새로고침"
                  disabled={loading}
                >
                  <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
              <p className="text-blue-200/60 text-sm font-bold tracking-[0.4em] uppercase">Neutral News Tarot</p>
            </div>
            
            <div className="space-y-4 text-white/80 text-lg font-medium leading-relaxed max-w-lg">
              <p>이 인터페이스는 검증된 국제 출처 기반으로 전세계 뉴스를 요약합니다.</p>
              <p>모든 브리핑은 동일한 형식으로 구성되며, 편향 없이 정리합니다.</p>
              {globalError && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                  {globalError}
                </div>
              )}
            </div>

            <div className="pt-4">
              <div className="flex flex-wrap gap-4 md:gap-5 justify-start">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div 
                      key={i} 
                      style={{ transform: `rotate(${(i - 2.5) * 2}deg)` }}
                      className="w-28 h-44 md:w-36 md:h-56 bg-white/5 border border-white/10 rounded-lg animate-pulse" 
                    />
                  ))
                ) : (
                  articles.map((item: any, idx) => (
                    <button
                      key={item.id}
                      onClick={() => handleCardClick(item)}
                      style={{ transform: `rotate(${(idx - 2.5) * 3}deg)` }}
                      disabled={item.error}
                      className={`group relative w-28 h-44 md:w-36 md:h-56 bg-[#F4F5F2] border border-slate-300 rounded-lg shadow-xl transition-all duration-300 flex flex-col p-4 text-left overflow-hidden ${
                        item.error ? 'opacity-60 cursor-not-allowed' : 'hover:-translate-y-6 hover:rotate-0 hover:z-50 hover:shadow-2xl'
                      }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 pointer-events-none" />
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-200 pb-1">
                        {item.category}
                      </span>
                      
                      <h3 className={`text-slate-900 text-xs md:text-sm font-bold leading-snug truncate-2-lines group-hover:text-blue-700 ${item.error ? 'text-slate-400 italic' : ''}`}>
                        {item.title}
                      </h3>
                      
                      {item.error ? (
                        <div className="mt-auto flex justify-center opacity-30">
                          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                      ) : (
                        <div className="mt-auto self-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="relative order-1 lg:order-2 flex justify-center lg:justify-end">
            <div className="relative w-full aspect-[4/5] max-w-sm md:max-w-md rounded-2xl overflow-hidden shadow-2xl border border-white/5 ring-1 ring-white/10">
              <img 
                src={HORSE_IMAGE} 
                alt="Symbolic White Horse" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0E2A2F] via-transparent to-transparent opacity-40"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FBFC] flex flex-col pb-24">
      <div className="relative w-full h-[35vh] md:h-[45vh] overflow-hidden bg-slate-900">
        <img 
          src={HORSE_IMAGE} 
          alt="Briefing Header" 
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#F9FBFC] via-[#F9FBFC]/20 to-transparent"></div>
        
        <div className="absolute bottom-8 left-0 w-full px-6 md:px-12">
          <button 
            onClick={handleBack}
            className="mb-6 flex items-center text-slate-900 font-bold text-sm bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-sm hover:bg-white transition-all group w-fit"
          >
            <svg className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            카드 선택으로
          </button>
          
          <div className="max-w-4xl">
            <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-full uppercase tracking-widest mb-3 inline-block">
              {selectedArticle?.category}
            </span>
            <h2 className="text-2xl md:text-5xl font-bold text-slate-900 leading-tight serif drop-shadow-sm">
              {selectedArticle?.title}
            </h2>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 w-full -mt-6 relative z-10 space-y-5">
        <div className="grid grid-cols-1 gap-4">
          {selectedArticle?.summary.slice(0, 5).map((point, idx) => (
            <div 
              key={idx} 
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start space-x-5 hover:border-blue-200 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-serif text-blue-600 font-bold">{idx + 1}</span>
              </div>
              <p className="text-base md:text-lg text-slate-700 font-medium leading-relaxed">
                {point}
              </p>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-4">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2 px-8 py-3.5 bg-slate-900 text-white rounded-full font-bold shadow-xl hover:bg-slate-800 transition-all active:scale-95"
          >
            <span className="text-sm">{isExpanded ? '간략히 보기' : '심층 브리핑 더보기'}</span>
            <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {isExpanded && (
          <div className="bg-white border border-blue-50 rounded-3xl p-8 md:p-12 shadow-2xl animate-in slide-in-from-bottom-8 duration-700">
            <h3 className="text-xl font-bold text-slate-900 mb-8 border-b border-slate-100 pb-4 serif flex items-center">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full mr-3" />
              심층 리포트
            </h3>
            <div className="space-y-6">
              {selectedArticle?.summary.map((point, idx) => (
                <div key={idx} className="flex items-start">
                  <div className="w-1 h-1 bg-slate-300 rounded-full mt-3 mr-4 flex-shrink-0" />
                  <p className="text-slate-600 leading-loose text-lg">{point}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 font-bold border border-slate-100">
                  {selectedArticle?.source.charAt(0)}
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">출처 확인</p>
                  <p className="text-sm font-bold text-slate-900">{selectedArticle?.source}</p>
                </div>
              </div>
              
              <a 
                href={selectedArticle?.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full md:w-auto text-center px-12 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100/50"
              >
                원문 기사로 이동
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
