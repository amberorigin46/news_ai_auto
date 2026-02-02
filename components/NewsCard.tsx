
import React from 'react';
import { NewsArticle } from '../types';

interface NewsCardProps {
  article: NewsArticle;
}

const NewsCard: React.FC<NewsCardProps> = ({ article }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300 flex flex-col h-full group">
      <div className="flex justify-between items-start mb-4">
        <span className="px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-600 rounded-full uppercase tracking-wider">
          {article.category}
        </span>
        <span className="text-xs text-slate-400 font-medium">
          {article.source}
        </span>
      </div>
      
      <h3 className="text-xl font-bold text-slate-900 mb-4 leading-snug group-hover:text-blue-600 transition-colors">
        {article.title}
      </h3>
      
      <div className="space-y-3 flex-grow">
        {article.summary.map((point, idx) => (
          <div key={idx} className="flex items-start text-sm text-slate-600 leading-relaxed">
            <span className="mr-3 mt-1.5 w-1 h-1 bg-slate-400 rounded-full flex-shrink-0" />
            <p>{point}</p>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
        <a 
          href={article.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center"
        >
          원문 기사 읽기
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
        <span className="text-[10px] text-slate-400 italic">확인됨 {article.timestamp}</span>
      </div>
    </div>
  );
};

export default NewsCard;
