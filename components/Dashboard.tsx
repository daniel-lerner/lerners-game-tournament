
import React from 'react';
import { Player, Match, Game } from '../types';

interface DashboardProps {
  players: Player[];
  matches: Match[];
  games: Game[];
  aiInsights: string;
  onGetInsights: () => void;
  isGeneratingAudio: boolean;
  audioBuffer: AudioBuffer | null;
  onAudioToggle: () => void;
  isPlaying: boolean;
  isPaused: boolean;
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  players, 
  matches, 
  games, 
  aiInsights, 
  onGetInsights,
  isGeneratingAudio,
  audioBuffer,
  onAudioToggle,
  isPlaying,
  isPaused,
  playbackSpeed,
  onSpeedChange
}) => {
  const currentEditionPlayers = players.filter(p => p.editionId === '2026');
  const sortedPlayers = [...currentEditionPlayers].sort((a, b) => b.totalPoints - a.totalPoints);
  const top3 = sortedPlayers.slice(0, 3);
  const recentMatches = matches.slice(0, 5);
  const champion2025 = players.filter(p => p.editionId === '2025').sort((a,b) => b.totalPoints - a.totalPoints)[0];
  const isActuallyPlaying = isPlaying && !isPaused;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <section className="text-center pt-8 pb-4 md:hidden">
        <h1 className="text-3xl font-extrabold text-white tracking-tighter">Lerner Cup <span className="text-indigo-500">2.0</span></h1>
      </section>

      {/* Podium Section */}
      <section className="flex items-end justify-center gap-2 pt-10 pb-4 h-64 relative">
        {champion2025 && (
          <div className="absolute top-0 right-0 bg-slate-800/80 border border-slate-700 px-3 py-2 rounded-xl flex items-center gap-2 shadow-lg z-20">
            <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-[10px] text-yellow-950 font-black">25</div>
            <div>
              <p className="text-[8px] text-slate-500 font-bold uppercase">Atual Campeão</p>
              <p className="text-[10px] text-white font-black truncate max-w-[60px]">{champion2025.name}</p>
            </div>
          </div>
        )}

        {top3[1] && (
          <div className="flex flex-col items-center">
             <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-500 mb-2 flex items-center justify-center text-xl font-bold overflow-hidden shadow-lg">
                <img src={top3[1].avatarUrl || `https://robohash.org/${top3[1].id}?bgset=bg2`} alt={top3[1].name} className="w-full h-full object-cover" />
             </div>
             <div className="w-24 h-24 bg-gradient-to-t from-slate-800 to-slate-700 rounded-t-lg flex flex-col items-center justify-center shadow-lg relative border-x border-t border-slate-600">
               <span className="text-3xl font-black text-slate-400 absolute -top-10">2</span>
               <p className="text-xs font-bold text-white truncate px-2 w-full text-center">{top3[1].name}</p>
               <p className="text-sm font-black text-indigo-400">{top3[1].totalPoints}</p>
             </div>
          </div>
        )}
        {top3[0] && (
          <div className="flex flex-col items-center z-10">
             <div className="w-20 h-20 rounded-full bg-slate-800 border-4 border-yellow-500 mb-2 flex items-center justify-center text-xl font-bold shadow-xl shadow-yellow-500/30 overflow-hidden ring-4 ring-indigo-500/20">
                <img src={top3[0].avatarUrl || `https://robohash.org/${top3[0].id}?bgset=bg2`} alt={top3[0].name} className="w-full h-full object-cover" />
             </div>
             <div className="w-32 h-32 bg-gradient-to-t from-indigo-900 to-indigo-600 rounded-t-lg flex flex-col items-center justify-center shadow-2xl relative border-x border-t border-indigo-400/30">
               <div className="absolute -top-12 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]">
                 <span className="text-5xl font-black text-yellow-500">1</span>
               </div>
               <p className="text-sm font-bold text-white truncate px-2 w-full text-center">{top3[0].name}</p>
               <p className="text-lg font-black text-yellow-300">{top3[0].totalPoints}</p>
             </div>
          </div>
        )}
        {top3[2] && (
          <div className="flex flex-col items-center">
             <div className="w-14 h-14 rounded-full bg-slate-800 border-2 border-amber-700 mb-2 flex items-center justify-center text-xl font-bold overflow-hidden shadow-md">
                <img src={top3[2].avatarUrl || `https://robohash.org/${top3[2].id}?bgset=bg2`} alt={top3[2].name} className="w-full h-full object-cover" />
             </div>
             <div className="w-20 h-16 bg-gradient-to-t from-slate-800 to-slate-700 rounded-t-lg flex flex-col items-center justify-center shadow-lg relative border-x border-t border-slate-600">
               <span className="text-2xl font-black text-amber-700 absolute -top-8">3</span>
               <p className="text-[10px] font-bold text-white truncate px-1 w-full text-center">{top3[2].name}</p>
               <p className="text-xs font-black text-indigo-400">{top3[2].totalPoints}</p>
             </div>
          </div>
        )}
      </section>

      {/* AI Narrator */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 shadow-xl backdrop-blur-md relative overflow-hidden group">
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-2">
            <span className={`bg-indigo-500 p-2 rounded-lg text-white shadow-lg transition-transform ${isActuallyPlaying ? 'animate-pulse scale-110' : ''}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </span>
            <h3 className="font-black text-lg text-slate-100 uppercase tracking-tighter">Narrador AI</h3>
          </div>
          <div className="flex items-center gap-3">
            {audioBuffer && (
              <div className="flex items-center bg-slate-700/50 rounded-full px-2 py-1 gap-1 border border-slate-600">
                <button onClick={onAudioToggle} className={`p-2 rounded-full transition-all ${isActuallyPlaying ? 'bg-indigo-500 text-white' : 'text-slate-300 hover:text-white'}`}>
                  {isActuallyPlaying ? <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1-1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg> : <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>}
                </button>
              </div>
            )}
            <button onClick={onGetInsights} disabled={isGeneratingAudio} className="text-xs bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black py-2 px-4 rounded-xl transition-all shadow-lg active:scale-95">{isGeneratingAudio ? "..." : "COMENTAR"}</button>
          </div>
        </div>
        <div className="relative z-10">
          <p className="text-slate-300 italic leading-relaxed text-sm font-medium">"{aiInsights || "O Mestre Lerner está observando cada jogada sua..."}"</p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800 border border-slate-700 p-5 rounded-2xl shadow-lg hover:border-slate-600 transition-colors">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Partidas 2026</p>
          <p className="text-3xl font-black text-white">{matches.length}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 p-5 rounded-2xl shadow-lg hover:border-slate-600 transition-colors">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Jogadores Ativos</p>
          <p className="text-3xl font-black text-white">{currentEditionPlayers.length}</p>
        </div>
      </div>

      {/* Recent Matches */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
          <h3 className="font-black text-xs uppercase tracking-widest text-slate-100">Últimas Partidas</h3>
        </div>
        <div className="divide-y divide-slate-700">
          {recentMatches.length > 0 ? recentMatches.map((m) => {
            const game = games.find(g => g.id === m.gameId);
            const winner = currentEditionPlayers.find(p => p.id === m.results.find(r => r.position === 1)?.playerId);
            return (
              <div key={m.id} className="p-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-black">{game?.name[0]}</div>
                  <div>
                    <p className="text-sm font-bold text-slate-100">{game?.name}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Vitória de: <span className="text-indigo-300">{winner?.name || '???'}</span></p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">{new Date(m.timestamp).toLocaleDateString()}</p>
                </div>
              </div>
            );
          }) : <div className="p-8 text-center text-slate-500 italic text-sm">Nenhuma partida em 2026.</div>}
        </div>
      </div>

      {/* Scoring Guide Section */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-700 bg-slate-900/50">
          <h3 className="font-black text-xs uppercase tracking-widest text-slate-100">Guia de Pontuação</h3>
        </div>
        <div className="p-4 bg-slate-900/20">
          <div className="space-y-4">
            {games.length > 0 ? games.map((game) => (
              <div key={game.id} className="bg-slate-800/40 rounded-xl border border-slate-700/50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-black text-white text-sm uppercase tracking-tight">{game.name}</h4>
                  {game.isPlusRule && (
                    <span className="text-[8px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-1.5 py-0.5 rounded-full font-bold uppercase">Regra Especial</span>
                  )}
                </div>
                
                <div className="space-y-2">
                  {Object.entries(game.scoring).sort((a,b) => Number(a[0]) - Number(b[0])).map(([count, rules]) => (
                    <div key={count} className="flex items-center justify-between bg-slate-900/50 p-2 rounded-lg border border-slate-700/30">
                      <div className="flex items-center gap-2">
                        <svg className="w-3 h-3 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                        <span className="text-[10px] font-black text-slate-400 uppercase">{count} JOGADORES</span>
                      </div>
                      <div className="flex gap-3">
                        {rules[1] !== undefined && (
                          <div className="flex flex-col items-center">
                            <span className="text-[8px] text-yellow-500 font-bold uppercase mb-0.5">1º</span>
                            <span className="text-xs font-black text-white">{rules[1]}</span>
                          </div>
                        )}
                        {rules[2] !== undefined && rules[2] > 0 && (
                          <div className="flex flex-col items-center">
                            <span className="text-[8px] text-slate-300 font-bold uppercase mb-0.5">2º</span>
                            <span className="text-xs font-black text-slate-300">{rules[2]}</span>
                          </div>
                        )}
                        {rules[3] !== undefined && rules[3] > 0 && (
                          <div className="flex flex-col items-center">
                            <span className="text-[8px] text-amber-700 font-bold uppercase mb-0.5">3º</span>
                            <span className="text-xs font-black text-amber-700">{rules[3]}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )) : <p className="text-xs text-slate-500 text-center py-4">Carregando guia...</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
