
import React from 'react';

interface HeaderProps {
  syncStatus?: 'online' | 'syncing' | 'offline';
}

const Header: React.FC<HeaderProps> = ({ syncStatus = 'online' }) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 py-4 px-6 fixed top-0 w-full z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white leading-none">Torneio do Lerner <span className="text-indigo-500">2026</span></h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">Sincronizado em Nuvem</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700">
          <div className={`w-2 h-2 rounded-full ${
            syncStatus === 'online' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 
            syncStatus === 'syncing' ? 'bg-amber-500 animate-pulse' : 
            'bg-red-500'
          }`} />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {syncStatus === 'online' ? 'Realtime' : 
             syncStatus === 'syncing' ? 'Salvando...' : 
             'Offline'}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
