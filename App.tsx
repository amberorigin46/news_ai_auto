
import React, { useState, useEffect, useCallback } from 'react';
import { fetchAllCategoriesBriefing } from './services/geminiService';
import { NewsArticle, NewsCategory } from './types';

const HORSE_IMAGE = "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=1600";

const CATEGORY_IMAGES: Record<string, string> = {
  [NewsCategory.ECONOMY]: "https://images.unsplash.com/photo-1611974717482-58a25a3d5be3?auto=format&fit=crop&q=80&w=1200",
  [NewsCategory.TECH]: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200",
  [NewsCategory.POLITICS]: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&q=80&w=1200",
  [NewsCategory.SOCIETY]: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=1200",
  [NewsCategory.CULTURE]: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=80&w=1200",
  [NewsCategory.GLOBAL]: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200",
  [NewsCategory.BONUS]: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&q=80&w=1200",
};

const App: React.FC = () => {
  const [introStep, setIntroStep] = useState<'initial' | 'welcome' | 'ready'>('initial');
  const [view, setView] = useState<'grid' | 'reveal' | 'detail'>('grid');
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [horseSpeech, setHorseSpeech] = useState("어서오세요. 운명의 소식을 전하러 온 안내자입니다.");

  const orderedCategories = [
    NewsCategory.ECONOMY,
    NewsCategory.TECH,
    NewsCategory.POLITICS,
    NewsCategory.SOCIETY,
    NewsCategory.CULTURE,
    NewsCategory.GLOBAL,
    NewsCategory.BONUS
  ];

  const loadNews = useCallback(async () => {
    setLoading(true);
    try {
      const { articles: fetched } = await fetchAllCategoriesBriefing(orderedCategories);
      setArticles(fetched);
    } catch (e) {
      console.error("News Load Error:", e);
      setHorseSpeech("별들의 기운이 어지럽습니다. 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNews();
    const t1 = setTimeout(() => setIntroStep('welcome'), 100);
    const t2 = setTimeout(() => setIntroStep('ready'), 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [loadNews]);

  const handleCardClick = (categoryName: string) => {
    if (loading) return;
    const article = articles.find(a => a.category === categoryName);
    if (!article) return;

    setHorseSpeech(`${categoryName}의 진실이 사진과 함께 열립니다.`);
    setSelectedArticle(article);
    setView('reveal');
  };

  const handleHome = () => {
    setView('grid');
    setSelectedArticle(null);
    setHorseSpeech("다른 운명의 소식도 궁금하신가요?");
  };

  const TarotBackPattern = ({ isBonus }: { isBonus: boolean }) => (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className={`w-full h-full border-[10px] ${isBonus ? 'border-purple-500/30' : 'border-[#D4AF37]/30'} m-2 rounded-lg`}></div>
      <div className={`absolute w-[85%] h-[92%] border-[2px] ${isBonus ? 'border-purple-400/20' : 'border-[#D4AF37]/20'} m-4 rounded-md`}></div>
      <div className={`absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 ${isBonus ? 'border-purple-400' : 'border-[#D4AF37]'}`}></div>
      <div className={`absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 ${isBonus ? 'border-purple-400' : 'border-[#D4AF37]'}`}></div>
      <div className={`absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 ${isBonus ? 'border-purple-400' : 'border-[#D4AF37]'}`}></div>
      <div className={`absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 ${isBonus ? 'border-purple-400' : 'border-[#D4AF37]'}`}></div>
      <div className={`relative w-32 h-32 md:w-44 md:h-44 border-2 rounded-full flex items-center justify-center bg-[#050C0D] shadow-inner
        ${isBonus ? 'border-purple-500/50 shadow-purple-500/10' : 'border-[#D4AF37]/50 shadow-amber-500/10'}
      `}>
        <div className={`absolute inset-2 border-t border-b rounded-full animate-spin-slow ${isBonus ? 'border-purple-300/30' : 'border-[#D4AF37]/30'}`} style={{animationDuration: '10s'}}></div>
        <svg className={`w-16 h-16 md:w-20 md:h-20 ${isBonus ? 'text-purple-400' : 'text-[#D4AF37]'} opacity-80`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
           {isBonus ? (
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z" />
           ) : (
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
           )}
        </svg>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020506] text-white overflow-hidden font-sans select-none relative">
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
      </div>

      <main className="relative z-10 h-screen flex flex-col items-center justify-center p-4">
        
        {/* 안내인 */}
        <div className={`fixed transition-all duration-[1200ms] flex flex-col items-center z-[50] pointer-events-none
          ${introStep === 'welcome' ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-125 opacity-100' : 'bottom-6 right-6 scale-75 opacity-100'}
          ${introStep === 'initial' ? 'opacity-0' : ''}
        `}>
          <div className={`mb-4 px-6 py-4 bg-white text-slate-900 shadow-2xl border-2 border-[#D4AF37] relative
            ${introStep === 'welcome' ? 'rounded-[2rem] w-full max-w-sm' : 'rounded-[2rem] rounded-br-none max-w-[200px]'}
          `}>
            <p className="text-sm md:text-lg font-bold text-center serif italic leading-tight tracking-tight">{horseSpeech}</p>
          </div>
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-[#D4AF37]">
            <img src={HORSE_IMAGE} alt="Spirit Guide" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* 그리드 */}
        <div className={`transition-all duration-1000 w-full max-w-7xl flex flex-col items-center
          ${view === 'grid' && (introStep === 'ready' || introStep === 'welcome') ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
        `}>
          <header className="text-center mb-12">
            <h1 className="text-5xl md:text-8xl font-black serif-dec tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-300 to-gray-600">
              Global Pulse
            </h1>
          </header>
          
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 perspective-2000">
            {orderedCategories.map((cat, idx) => {
              const isBonus = cat === NewsCategory.BONUS;
              return (
                <div key={cat} onClick={() => handleCardClick(cat)}
                  style={{ transitionDelay: `${idx * 80}ms`, transform: introStep === 'ready' ? `rotate(${(idx - 3) * 5}deg) translateY(${Math.abs(idx - 3) * 15}px)` : 'translateY(100vh) scale(0.5)' }}
                  className="group relative w-40 h-64 md:w-52 md:h-80 transition-all duration-1000 cursor-pointer active:scale-95"
                >
                  <div className={`relative w-full h-full rounded-xl border-2 transition-all duration-500 overflow-hidden shadow-2xl group-hover:-translate-y-16
                    ${isBonus ? 'bg-[#150a24] border-purple-500/50' : 'bg-[#050C0D] border-[#D4AF37]/50'}
                  `}>
                    <TarotBackPattern isBonus={isBonus} />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-end pb-8">
                       <span className={`text-xl md:text-2xl font-bold serif-dec tracking-widest ${isBonus ? 'text-purple-300' : 'text-[#D4AF37]'}`}>{cat}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 요약 팝업 (사진 반영) */}
        {view === 'reveal' && selectedArticle && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 md:p-8 fade-in" onClick={handleHome}>
             <div className="relative w-full max-w-5xl h-[85vh] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="h-[45%] relative shrink-0 overflow-hidden bg-slate-900">
                  {/* 실제 기사 사진이 있으면 보여주고, 없으면 카테고리 이미지 표시 */}
                  <img 
                    src={selectedArticle.imageUrl || CATEGORY_IMAGES[selectedArticle.category]} 
                    alt={selectedArticle.title}
                    className="w-full h-full object-cover transition-transform duration-[2000ms] hover:scale-110"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = CATEGORY_IMAGES[selectedArticle.category];
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-6 left-10 right-10">
                     <span className={`px-4 py-1.5 text-[10px] font-bold rounded-full uppercase tracking-widest serif text-white mb-4 inline-block shadow-lg
                       ${selectedArticle.category === NewsCategory.BONUS ? 'bg-purple-600' : 'bg-[#D4AF37]'}
                     `}>{selectedArticle.category}</span>
                     <h2 className="text-3xl md:text-6xl font-bold text-white leading-tight serif-dec">{selectedArticle.title}</h2>
                  </div>
                </div>

                <div className="flex-grow p-8 md:p-16 overflow-y-auto bg-[#fffdfa] flex flex-col justify-between">
                   <div className="space-y-8">
                     {selectedArticle.summary.map((point, i) => (
                       <div key={i} className="flex items-start text-xl md:text-3xl text-slate-800 leading-snug font-serif italic group">
                          <span className={`mr-6 mt-4 w-3 h-3 rounded-full flex-shrink-0 ${selectedArticle.category === NewsCategory.BONUS ? 'bg-purple-500' : 'bg-[#D4AF37]'}`} />
                          <p className="tracking-tighter">{point}</p>
                       </div>
                     ))}
                   </div>
                   <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-center">
                      <button onClick={handleHome} className="text-slate-400 font-bold hover:text-slate-900 transition-colors serif tracking-widest text-xs uppercase underline">← BACK TO DECK</button>
                      <button onClick={() => setView('detail')} className={`px-12 py-5 rounded-full font-black shadow-2xl serif tracking-widest text-sm text-white transition-all transform hover:scale-105
                        ${selectedArticle.category === NewsCategory.BONUS ? 'bg-purple-900' : 'bg-slate-950 hover:bg-[#D4AF37] hover:text-black'}
                      `}>DEEP INSIGHT →</button>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* 상세 뷰 (사진 반영) */}
        {view === 'detail' && selectedArticle && (
          <div className="fixed inset-0 z-[2000] bg-[#fafaf9] text-slate-900 overflow-y-auto fade-in">
             <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-6 flex justify-between items-center z-50">
               <button onClick={() => setView('reveal')} className="text-slate-400 font-bold flex items-center hover:text-slate-950 transition-colors serif text-xs uppercase tracking-widest">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth={2} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" /></svg> BACK
               </button>
               <h3 className="font-black text-[#D4AF37] serif tracking-[0.5em] uppercase text-xs">{selectedArticle.category}</h3>
               <button onClick={handleHome} className="p-3 bg-slate-900 text-white rounded-full hover:bg-[#D4AF37] hover:text-black transition-all shadow-lg">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeWidth={2} stroke="currentColor" /></svg>
               </button>
             </header>

             <article className="max-w-4xl mx-auto px-6 py-20">
                <div className="w-full h-[30rem] md:h-[45rem] rounded-[3rem] bg-slate-900 overflow-hidden mb-16 shadow-2xl border-[10px] border-white">
                   <img 
                     src={selectedArticle.imageUrl || CATEGORY_IMAGES[selectedArticle.category]} 
                     className="w-full h-full object-cover" 
                     alt="News Illustration"
                     onError={(e) => { (e.target as HTMLImageElement).src = CATEGORY_IMAGES[selectedArticle.category]; }}
                   />
                </div>
                <h1 className="text-4xl md:text-7xl font-bold mb-12 serif-dec leading-tight tracking-tighter text-slate-950">{selectedArticle.title}</h1>
                <div className="flex items-center gap-6 text-slate-400 mb-16 pb-8 border-b border-slate-100">
                   <span className="font-bold text-slate-900 serif text-xl md:text-2xl">{selectedArticle.source}</span>
                   <span className="serif italic text-lg md:text-xl">{selectedArticle.timestamp}</span>
                </div>
                <div className="space-y-12 md:space-y-20 text-xl md:text-3xl text-slate-800 leading-relaxed font-serif mb-32">
                   {selectedArticle.summary.map((p, i) => (
                     <div key={i} className="flex gap-8 group">
                        <span className="text-5xl md:text-8xl font-black text-[#D4AF37]/20 transition-colors">{i+1}</span>
                        <p className="pt-2 md:pt-4">{p}</p>
                     </div>
                   ))}
                </div>
                <div className="bg-white rounded-[3rem] p-12 md:p-20 shadow-xl border border-slate-100 flex flex-col items-center gap-10">
                   <a href={selectedArticle.url} target="_blank" rel="noopener noreferrer" className="w-full text-center py-8 bg-slate-950 text-white rounded-full font-black hover:bg-[#D4AF37] hover:text-black transition-all serif text-xl md:text-3xl">VIEW ORIGINAL TRUTH ↗</a>
                   <button onClick={handleHome} className="text-slate-300 hover:text-slate-600 underline serif text-sm uppercase tracking-widest">CONSULT ANOTHER CARD</button>
                </div>
             </article>
          </div>
        )}

      </main>
      <style dangerouslySetInnerHTML={{ __html: `
        .animate-spin-slow { animation: spin 20s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}} />
    </div>
  );
};

export default App;
