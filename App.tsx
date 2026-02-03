
import React, { useState, useEffect, useCallback } from 'react';
import { fetchAllCategoriesBriefing } from './services/geminiService';
import { NewsArticle, NewsCategory } from './types';

// [요구사항] 정면을 응시하는 강력하고 신비로운 백마 이미지 (고해상도)
const HORSE_IMAGE = "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=1600";

// 카테고리별 배경 이미지 매핑
const CATEGORY_IMAGES: Record<string, string> = {
  [NewsCategory.ECONOMY]: "https://images.unsplash.com/photo-1611974717482-58a25a3d5be3?auto=format&fit=crop&q=80&w=1200",
  [NewsCategory.TECH]: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200",
  [NewsCategory.POLITICS]: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&q=80&w=1200",
  [NewsCategory.SOCIETY]: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=1200",
  [NewsCategory.CULTURE]: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=80&w=1200",
  [NewsCategory.GLOBAL]: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200",
};

const App: React.FC = () => {
  const [introStep, setIntroStep] = useState<'initial' | 'welcome' | 'transition' | 'ready'>('initial');
  const [view, setView] = useState<'grid' | 'reveal' | 'detail'>('grid');
  const [articles, setArticles] = useState<(NewsArticle | { id: string, category: string, title: string, error: boolean })[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [horseSpeech, setHorseSpeech] = useState("어서오세요. 당신의 혜안을 넓혀줄 오늘의 소식을 준비했습니다.");

  const categories = Object.values(NewsCategory);

  const loadNews = useCallback(async () => {
    setLoading(true);
    try {
      const { articles: fetched } = await fetchAllCategoriesBriefing(categories);
      const results = categories.map(cat => {
        const found = fetched.find(a => a.category === cat || a.category.includes(cat));
        return found || { id: `fail-${cat}`, category: cat, title: '데이터를 가져올 수 없습니다', error: true };
      });
      setArticles(results);
    } catch (e) {
      setArticles(categories.map(cat => ({ id: `fail-${cat}`, category: cat, title: '연결 오류 발생', error: true })));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNews();
    const timer1 = setTimeout(() => setIntroStep('welcome'), 200);
    const timer2 = setTimeout(() => setIntroStep('transition'), 4500);
    const timer3 = setTimeout(() => {
      setIntroStep('ready');
      setHorseSpeech("여섯 장의 카드가 세상의 흐름을 품고 있습니다. 선택해주십시오.");
    }, 6000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [loadNews]);

  const handleCardClick = (item: any) => {
    if (loading || introStep !== 'ready') return;
    setHorseSpeech("카드가 뒤집히며 진실이 드러나고 있습니다.");
    setSelectedArticle(item);
    setView('reveal');
    setTimeout(() => setIsFlipped(true), 300);
  };

  const handleBack = () => {
    setView('grid');
    setIsFlipped(false);
    setSelectedArticle(null);
    setHorseSpeech("또 다른 운명의 조각을 확인하시겠습니까?");
  };

  const renderTarotBack = (categoryName: string, idx: number) => (
    <button
      key={categoryName + idx}
      onClick={() => {
        const article = articles.find(a => a.category === categoryName);
        if (article) handleCardClick(article);
      }}
      disabled={loading || introStep !== 'ready'}
      style={{ 
        transform: introStep === 'ready' 
          ? `rotate(${(idx - 2.5) * 8}deg) translateY(${Math.abs(idx - 2.5) * 15}px)` 
          : `translateY(400px) scale(0.7) rotate(0deg)`,
        opacity: introStep === 'ready' ? 1 : 0,
        transitionDelay: introStep === 'ready' ? `${idx * 150}ms` : '0ms'
      }}
      className={`group relative w-40 h-64 md:w-56 md:h-88 bg-[#050C0D] rounded-2xl shadow-[0_40px_80px_rgba(0,0,0,0.9)] overflow-hidden transition-all duration-[1200ms] cubic-bezier(0.19, 1, 0.22, 1)
        ${!loading ? 'hover:-translate-y-32 hover:scale-[1.05] hover:rotate-0 hover:z-50 hover:shadow-[0_60px_100px_rgba(197,160,89,0.3)] cursor-pointer active:scale-95' : 'cursor-wait'}
      `}
    >
      <div className="absolute inset-2 border-[2px] border-[#C5A059]/40 rounded-xl z-20 pointer-events-none group-hover:border-[#C5A059]/80 transition-colors duration-700"></div>
      <div className="absolute inset-4 border-[1px] border-[#C5A059]/20 rounded-lg z-20 pointer-events-none group-hover:border-[#C5A059]/40 transition-colors duration-700"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-black via-[#0A1A1D] to-black"></div>
      <div className="absolute inset-0 opacity-40 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/black-paper.png')]"></div>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-6">
        <svg className="w-full h-full text-[#C5A059]/30 drop-shadow-[0_0_12px_rgba(197,160,89,0.3)] group-hover:text-[#C5A059]/90 group-hover:drop-shadow-[0_0_25px_rgba(197,160,89,0.8)] transition-all duration-700" viewBox="0 0 100 100" fill="none" stroke="currentColor">
          <circle cx="50" cy="50" r="45" strokeWidth="0.5" strokeDasharray="2 2" />
          <circle cx="50" cy="50" r="30" strokeWidth="1" />
          <path d="M50 5 L55 45 L95 50 L55 55 L50 95 L45 55 L5 50 L45 45 Z" strokeWidth="1" fill="rgba(197,160,89,0.05)" className="group-hover:fill-rgba(197,160,89,0.1) transition-all duration-700" />
          <path d="M50 15 L53 47 L85 50 L53 53 L50 85 L47 53 L15 50 L47 47 Z" strokeWidth="0.5" />
          <path d="M10 10 Q20 10 20 20 M80 10 Q80 20 90 20 M10 90 Q20 90 20 80 M80 90 Q80 80 90 80" strokeWidth="0.8" />
          <circle cx="50" cy="50" r="8" fill="rgba(197,160,89,0.1)" strokeWidth="0.5" />
          <path d="M50 42 V58 M42 50 H58" strokeWidth="0.5" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center z-30">
           <div className="bg-black/70 backdrop-blur-lg px-5 py-3 border border-[#C5A059]/40 rounded-md shadow-2xl transform rotate-[-90deg] group-hover:scale-110 group-hover:border-[#C5A059]/80 transition-all duration-700">
              <span className="text-sm md:text-lg font-bold text-[#C5A059] serif tracking-[0.6em] uppercase whitespace-nowrap group-hover:text-white transition-colors duration-700">
                {categoryName}
              </span>
           </div>
        </div>
      </div>
      <div className="absolute bottom-6 left-0 w-full text-center">
         <span className="text-[9px] font-bold text-[#C5A059]/50 tracking-[0.4em] serif uppercase group-hover:text-[#C5A059]/80 transition-colors duration-700">Universal Pulse</span>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#C5A059]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#010405] text-white overflow-hidden font-sans relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] rounded-full bg-blue-950/20 blur-[200px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] rounded-full bg-amber-950/10 blur-[200px] animate-pulse" style={{animationDelay: '3s'}} />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
      </div>

      <main className="relative z-10 h-screen flex flex-col items-center justify-center p-4">
        
        {/* 인트로 백마 */}
        <div className={`fixed transition-all duration-[2000ms] cubic-bezier(0.19, 1, 0.22, 1) flex flex-col items-center z-[100]
          ${introStep === 'welcome' 
            ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-5xl scale-100 opacity-100' 
            : introStep === 'transition' 
              ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] max-w-2xl scale-95 opacity-0 blur-2xl'
              : 'bottom-10 right-10 w-56 md:w-96 translate-x-0 translate-y-0 scale-100 opacity-100 pointer-events-none'
          }
          ${introStep === 'initial' ? 'opacity-0 scale-105 blur-3xl' : ''}
        `}>
          <div className={`mb-12 px-12 py-10 bg-white/95 backdrop-blur-2xl text-slate-900 rounded-[3.5rem] rounded-bl-none shadow-[0_40px_120px_rgba(255,255,255,0.15)] transition-all duration-[1200ms] relative border border-white/40
            ${introStep === 'welcome' || introStep === 'ready' ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-90'}
          `}>
            <p className="text-2xl md:text-4xl font-bold text-center leading-relaxed serif italic tracking-tighter text-slate-800">
              "{horseSpeech}"
            </p>
            <div className="absolute -bottom-6 left-0 w-12 h-12 bg-white/95 clip-path-speech-tail"></div>
          </div>
          <img src={HORSE_IMAGE} alt="Majestic White Horse" className={`w-full h-auto rounded-[5rem] shadow-[0_0_150px_rgba(255,255,255,0.12)] border-2 border-white/20 transition-all duration-[1500ms]`} />
        </div>

        {/* 타로 카드 그리드 */}
        <div className={`transition-all duration-[2500ms] w-full max-w-7xl px-6
          ${introStep === 'ready' && view === 'grid' ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-40 pointer-events-none'}
        `}>
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 perspective-3000 py-20">
            {categories.map((cat, idx) => renderTarotBack(cat, idx))}
          </div>
          {loading && (
             <div className="mt-12 text-center flex flex-col items-center">
                <div className="w-48 h-[1px] bg-gradient-to-r from-transparent via-[#C5A059] to-transparent animate-pulse mt-8"></div>
                <p className="text-[#C5A059]/40 text-[10px] tracking-[1.5em] font-bold uppercase mt-8 serif">Revealing Truths</p>
             </div>
          )}
        </div>

        {/* [요구사항 반영] 카드 결과 공개 (Reveal) - 상하좌우 테두리 및 레이아웃 수정 */}
        {view === 'reveal' && selectedArticle && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/98 backdrop-blur-3xl p-4 md:p-10" onClick={handleBack}>
            <div 
              className={`relative w-full max-w-3xl h-[92vh] bg-white rounded-[4rem] shadow-[0_0_150px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-[1200ms] transform flex flex-col
                ${isFlipped ? 'rotate-y-0 opacity-100 scale-100' : 'rotate-y-180 opacity-0 scale-90 blur-xl'}
              `}
              onClick={(e) => e.stopPropagation()}
            >
              {/* 상단: 배경 이미지 + 제목 섹션 (상단부 배치) */}
              <div className="h-[45%] relative shrink-0">
                {/* 배경 이미지 */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] scale-110 animate-slow-zoom" 
                  style={{ backgroundImage: `url(${CATEGORY_IMAGES[selectedArticle.category] || CATEGORY_IMAGES[NewsCategory.GLOBAL]})` }}
                ></div>
                {/* 오버레이 그래디언트 */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-transparent"></div>
                
                {/* 제목 및 카테고리 (상단 배치) */}
                <div className="relative z-10 p-12 md:p-16 h-full flex flex-col justify-start">
                  <div className="flex items-center gap-4 mb-8">
                    <span className="px-5 py-1.5 bg-[#C5A059] rounded-full text-[10px] font-bold uppercase tracking-widest text-black shadow-lg serif">
                      {selectedArticle.category}
                    </span>
                    <span className="text-white/60 text-[10px] tracking-widest uppercase serif">{selectedArticle.source}</span>
                  </div>
                  
                  <a href={selectedArticle.url} target="_blank" rel="noopener noreferrer" className="group/title inline-block max-w-2xl">
                    <h2 className="text-4xl md:text-6xl font-black text-[#C5A059] leading-[1.1] serif tracking-tighter drop-shadow-2xl group-hover:text-white transition-colors duration-500">
                      {selectedArticle.title}
                    </h2>
                    <p className="text-white/40 text-[9px] mt-4 opacity-0 group-hover:opacity-100 transition-opacity tracking-[0.4em] serif uppercase">Link to Source ↗</p>
                  </a>
                </div>
                
                {/* 하단 화이트 페이드 (상단 이미지와 하단 텍스트 연결) */}
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent"></div>
              </div>

              {/* 하단: 요점 요약 섹션 (위치가 내려가지 않도록 padding 조절 및 상단 정렬) */}
              <div className="flex-grow p-12 md:p-16 bg-white flex flex-col justify-between overflow-hidden">
                <div className="space-y-10 overflow-y-auto pr-4 custom-scrollbar">
                   {selectedArticle.summary?.map((p: string, i: number) => (
                     <div key={i} className="flex items-start text-slate-800 text-xl md:text-3xl font-medium serif italic leading-snug animate-in" style={{animationDelay: `${(i+1)*200}ms`}}>
                       <span className="w-4 h-4 bg-[#C5A059] rounded-full mt-3 mr-8 flex-shrink-0 shadow-[0_0_10px_rgba(197,160,89,0.5)]" />
                       <p className="tracking-tight text-slate-700">{p}</p>
                     </div>
                   ))}
                </div>
                
                {/* 액션 푸터: 테두리 정렬 */}
                <div className="mt-12 pt-10 border-t border-slate-100 flex justify-between items-center shrink-0">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 tracking-[0.4em] uppercase mb-2 serif">Journal Intelligence</span>
                    <span className="text-xl font-bold text-slate-900 serif tracking-wide opacity-50">{new Date().toLocaleDateString('ko-KR')}</span>
                  </div>
                  <div className="flex gap-6">
                    <a 
                      href={selectedArticle.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-20 h-20 rounded-[2.5rem] bg-slate-50 text-slate-400 border border-slate-200 flex items-center justify-center hover:bg-[#C5A059] hover:text-white transition-all shadow-md group hover:scale-105"
                      title="원문 보기"
                    >
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                    <button 
                      onClick={() => setView('detail')}
                      className="w-20 h-20 rounded-[2.5rem] bg-slate-950 text-[#C5A059] flex items-center justify-center hover:bg-[#C5A059] hover:text-black transition-all shadow-xl group hover:scale-105"
                      title="상세 브리핑"
                    >
                      <svg className="w-10 h-10 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 상세 기사 뷰 */}
        {view === 'detail' && selectedArticle && (
          <div className="fixed inset-0 z-[300] bg-[#FAF9F6] text-slate-900 overflow-y-auto animate-in duration-[1000ms]">
            <header className="sticky top-0 bg-white/95 backdrop-blur-3xl border-b border-[#C5A059]/10 z-10 px-14 py-10 flex justify-between items-center">
              <button onClick={() => setView('reveal')} className="flex items-center text-slate-400 hover:text-slate-950 font-black transition-all text-lg serif uppercase tracking-[0.2em]">
                <svg className="w-8 h-8 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                </svg>
                BACK TO SUMMARY
              </button>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-[0.6em] text-[#C5A059] mb-1">Pulse AI Analytics</p>
                <p className="text-lg font-bold text-slate-400 serif">{selectedArticle.category}</p>
              </div>
            </header>

            <article className="max-w-6xl mx-auto px-8 md:px-14 py-24">
              <div 
                className="w-full h-[40vh] rounded-[3.5rem] bg-cover bg-center mb-20 shadow-inner border border-slate-100"
                style={{ backgroundImage: `url(${CATEGORY_IMAGES[selectedArticle.category] || CATEGORY_IMAGES[NewsCategory.GLOBAL]})` }}
              ></div>
              
              <h1 className="text-5xl md:text-8xl font-black mb-24 leading-[0.9] serif tracking-tighter text-slate-950">
                {selectedArticle.title}
              </h1>
              
              <div className="space-y-24 mb-40">
                {selectedArticle.summary?.map((p: string, i: number) => (
                  <div key={i} className="flex gap-12 md:gap-20 items-start group">
                    <span className="text-7xl md:text-9xl font-serif text-[#C5A059]/10 leading-none select-none group-hover:text-[#C5A059]/25 transition-colors">{i+1}</span>
                    <p className="text-3xl md:text-5xl text-slate-800 leading-[1.2] pt-6 font-medium serif tracking-tight">{p}</p>
                  </div>
                ))}
              </div>

              <div className="p-16 md:p-24 bg-white rounded-[5rem] border border-[#C5A059]/10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-12">
                <div className="flex items-center space-x-10">
                  <div className="w-20 h-20 bg-slate-950 rounded-3xl flex items-center justify-center font-black text-[#C5A059] text-4xl serif">
                    {selectedArticle.source?.[0]}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-2 serif">Source verified</p>
                    <p className="text-3xl font-bold text-slate-900 serif tracking-tighter">{selectedArticle.source}</p>
                  </div>
                </div>
                <a 
                  href={selectedArticle.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full md:w-auto px-16 py-8 bg-slate-950 text-[#C5A059] rounded-[3rem] font-bold hover:bg-[#C5A059] hover:text-black transition-all text-center text-xl md:text-2xl serif uppercase tracking-widest shadow-lg"
                >
                  GO TO ORIGINAL ARTICLE
                </a>
              </div>
            </article>
          </div>
        )}

      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .perspective-3000 { perspective: 3000px; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .rotate-y-0 { transform: rotateY(0deg); }
        .clip-path-speech-tail { clip-path: polygon(0 0, 100% 0, 0 100%); }
        @keyframes slow-zoom {
          from { transform: scale(1.1); }
          to { transform: scale(1.25); }
        }
        .animate-slow-zoom {
          animation: slow-zoom 20s linear infinite alternate;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #C5A05944;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #C5A05988;
        }
      `}} />
    </div>
  );
};

export default App;
