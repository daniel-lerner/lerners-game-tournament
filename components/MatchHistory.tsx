
import React from 'react';
import { Match, Game, Player } from '../types';

interface MatchHistoryProps {
  matches: Match[];
  games: Game[];
  players: Player[];
}

const MatchHistory: React.FC<MatchHistoryProps> = ({ matches, games, players }) => {
  return (
    <div className="animate-in slide-in-from-left-4 duration-500">
      <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-tighter">Histórico de Partidas</h2>
      
      {matches.length === 0 ? (
        <div className="bg-slate-800/50 border border-dashed border-slate-600 rounded-2xl p-12 text-center text-slate-500 italic">
          Nenhuma partida registrada até agora. Comece uma no botão "Novo"!
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map(m => {
            const game = games.find(g => g.id === m.gameId);
            return (
              <div key={m.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-5 shadow-lg group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-black text-white group-hover:text-indigo-400 transition-colors">{game?.name}</h4>
                    <p className="text-xs text-slate-500">{new Date(m.timestamp).toLocaleString()}</p>
                  </div>
                  <div className="px-3 py-1 bg-slate-900 rounded-full text-[10px] font-bold text-slate-400 border border-slate-700">
                    ID: #{m.id.slice(-4)}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {m.results.sort((a,b) => a.position - b.position).map(res => {
                    const p = players.find(player => player.id === res.playerId);
                    return (
                      <div key={res.playerId} className={`flex items-center justify-between p-2 rounded-lg ${res.position === 1 ? 'bg-indigo-500/10 border border-indigo-500/20' : 'bg-slate-900/50'}`}>
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className={`w-5 h-5 flex items-center justify-center text-[10px] font-bold rounded ${res.position === 1 ? 'bg-yellow-500 text-yellow-950' : 'bg-slate-700 text-slate-300'}`}>
                            {res.position}
                          </span>
                          <span className="text-sm font-medium text-slate-300 truncate">{p?.name}</span>
                        </div>
                        <span className="text-xs font-bold text-indigo-400">+{res.pointsEarned}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MatchHistory;
