
import React, { useState } from 'react';
import { Player } from '../types';

interface RankingTableProps {
  players: Player[];
}

const RankingTable: React.FC<RankingTableProps> = ({ players }) => {
  const [selectedEdition, setSelectedEdition] = useState<'2026' | '2025'>('2026');
  const filteredPlayers = players.filter(p => p.editionId === selectedEdition);
  
  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    if (b.wins !== a.wins) return b.wins - a.wins;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Ranking Geral</h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
            {selectedEdition === '2026' ? 'Temporada em curso' : 'Resultados Históricos'}
          </p>
        </div>
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-700">
          <button onClick={() => setSelectedEdition('2026')} className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${selectedEdition === '2026' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>2026</button>
          <button onClick={() => setSelectedEdition('2025')} className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${selectedEdition === '2025' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>2025</button>
        </div>
      </div>
      
      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
        {sortedPlayers.length === 0 ? (
          <div className="p-12 text-center text-slate-500 italic">Nenhum dado encontrado para a temporada de {selectedEdition}.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-900/80 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400 tracking-widest">Pos</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400 tracking-widest">Jogador</th>
                  {selectedEdition === '2026' && (
                    <>
                      <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400 tracking-widest text-center">Jogos</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400 tracking-widest text-center">Vitórias</th>
                    </>
                  )}
                  <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400 tracking-widest text-right">Pontos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {sortedPlayers.map((player, index) => (
                  <tr key={player.id} className="hover:bg-slate-700/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${
                        index === 0 ? 'bg-yellow-500 text-yellow-950' :
                        index === 1 ? 'bg-slate-300 text-slate-900' :
                        index === 2 ? 'bg-amber-700 text-amber-50' : 'text-slate-500'
                      }`}>{index + 1}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-600 overflow-hidden flex items-center justify-center shrink-0">
                          <img 
                            src={player.avatarUrl || `https://robohash.org/${player.id}?size=40x40&bgset=bg2`} 
                            className="w-full h-full object-cover" 
                            alt="" 
                          />
                        </div>
                        <span className="font-bold text-slate-200 group-hover:text-white">{player.name}</span>
                        {selectedEdition === '2025' && index === 0 && (
                          <span className="text-[8px] bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 px-1.5 py-0.5 rounded font-black uppercase">Campeão</span>
                        )}
                      </div>
                    </td>
                    {selectedEdition === '2026' && (
                      <>
                        <td className="px-6 py-4 text-center font-medium text-slate-400">{player.matchesPlayed}</td>
                        <td className="px-6 py-4 text-center font-medium text-slate-400">{player.wins}</td>
                      </>
                    )}
                    <td className="px-6 py-4 text-right">
                      <span className="text-lg font-black text-indigo-400">{player.totalPoints}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RankingTable;
