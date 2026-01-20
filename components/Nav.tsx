
import React from 'react';
import { ViewMode } from '../types';

interface NavProps {
  currentView: ViewMode;
  setView: (view: ViewMode) => void;
}

const Nav: React.FC<NavProps> = ({ currentView, setView }) => {
  const items = [
    { id: ViewMode.DASHBOARD, label: 'Início', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: ViewMode.RANKING, label: 'Ranking', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { id: ViewMode.ADD_MATCH, label: 'Novo', icon: 'M12 4v16m8-8H4', primary: true },
    { id: ViewMode.HISTORY, label: 'Histórico', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: ViewMode.ADMIN, label: 'Config', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', locked: true },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-2 py-3 z-50 md:top-0 md:bottom-auto md:border-t-0 md:border-b md:h-16 md:flex md:items-center md:justify-end md:px-12">
      <div className="flex justify-around items-center w-full max-w-lg mx-auto md:mx-0 md:justify-end md:gap-6">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`flex flex-col md:flex-row items-center gap-1 transition-all relative ${
              currentView === item.id 
                ? (item.primary ? 'text-indigo-400 scale-110' : 'text-indigo-400 font-bold') 
                : 'text-slate-400 hover:text-slate-200'
            } ${item.primary ? 'bg-indigo-500/10 px-4 py-1 rounded-2xl border border-indigo-500/20' : ''}`}
          >
            <div className="relative">
              <svg className={`w-6 h-6 md:w-5 md:h-5 ${item.primary ? 'stroke-2' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              {item.locked && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-slate-600 rounded-full border border-slate-900 md:hidden" />
              )}
            </div>
            <span className={`text-[10px] md:text-sm md:font-medium ${item.primary ? 'font-black uppercase tracking-tighter' : ''}`}>
              {item.label}
            </span>
            {item.locked && (
               <svg className="hidden md:block w-3 h-3 text-slate-600 ml-1" fill="currentColor" viewBox="0 0 20 20">
                 <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
               </svg>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Nav;
