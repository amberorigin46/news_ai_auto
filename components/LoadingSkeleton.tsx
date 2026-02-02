
import React from 'react';

const LoadingSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white border border-slate-100 rounded-xl p-6 h-80">
          <div className="flex justify-between mb-4">
            <div className="h-4 w-20 bg-slate-200 rounded-full" />
            <div className="h-4 w-16 bg-slate-100 rounded" />
          </div>
          <div className="h-6 w-3/4 bg-slate-200 rounded mb-4" />
          <div className="h-6 w-1/2 bg-slate-200 rounded mb-6" />
          <div className="space-y-3">
            <div className="h-3 w-full bg-slate-100 rounded" />
            <div className="h-3 w-5/6 bg-slate-100 rounded" />
            <div className="h-3 w-4/5 bg-slate-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
