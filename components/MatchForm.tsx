
import React, { useState, useEffect } from 'react';
import { Player, Game } from '../types';

interface MatchFormProps {
  players: Player[];
  games: Game[];
  onSubmit: (gameId: string, results: { playerId: string, position: number }[]) => void;
}

const MatchForm: React.FC<MatchFormProps> = ({ players, games, onSubmit }) => {
  const [selectedGameId, setSelectedGameId] = useState('');
  const [numPlayers, setNumPlayers] = useState(0);
  const [positions, setPositions] = useState<Record<number, string>>({});
  const [tuWinners, setTuWinners] = useState<string[]>([]);
  const [tuParticipants, setTuParticipants] = useState<string[]>([]);

  const selectedGame = games.find(g => g.id === selectedGameId);
  
  // Garantir que temos as regras de pontuação
  const availablePlayerCounts = selectedGame 
    ? Object.keys(selectedGame.scoring).map(Number).sort((a,b) => a-b) 
    : [];

  const handleGameSelect = (id: string) => {
    setSelectedGameId(id);
    const game = games.find(g => g.id === id);
    if (game) {
      const counts = Object.keys(game.scoring).map(Number).sort((a,b) => a-b);
      setNumPlayers(counts[0]);
      setPositions({});
      setTuWinners([]);
      setTuParticipants([]);
    }
  };

  const handleTuParticipantToggle = (playerId: string) => {
    setTuParticipants(prev => 
      prev.includes(playerId) ? prev.filter(id => id !== playerId) : [...prev, playerId]
    );
  };

  const handleTuWinnerToggle = (playerId: string) => {
    setTuWinners(prev => 
      prev.includes(playerId) ? prev.filter(id => id !== playerId) : [...prev, playerId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGameId || !selectedGame) return;
    
    let results: { playerId: string, position: number }[] = [];

    if (selectedGame.id === 'tu') {
      if (tuParticipants.length < 4) {
        alert("Times Up requer no mínimo 4 participantes.");
        return;
      }
      if (tuWinners.length === 0) {
        alert("Selecione os vencedores do grupo.");
        return;
      }
      results = tuParticipants.map(id => ({
        playerId: id,
        position: tuWinners.includes(id) ? 1 : 2
      }));
    } else {
      results = Array.from({ length: numPlayers }).map((_, i) => ({
        playerId: positions[i + 1],
        position: i + 1
      }));

      if (results.some(r => !r.playerId)) {
        alert("Selecione todos os jogadores.");
        return;
      }

      if (new Set(results.map(r => r.playerId)).size !== results.length) {
        alert("Não é permitido jogadores duplicados na mesma partida!");
        return;
      }
    }

    onSubmit(selectedGameId, results);
  };

  if (players.length === 0) {
    return (
      <div className="max-w-lg mx-auto mt-10 p-10 bg-slate-800 rounded-2xl border border-dashed border-slate-600 text-center">
        <div className="bg-indigo-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        </div>
        <h2 className="text-xl font-black text-white uppercase tracking-tighter">Ninguém cadastrado!</h2>
        <p className="text-slate-400 text-sm mt-2">Cadastre os jogadores em <strong>Config</strong> para começar.</p>
      </div>
    );
  }

  return (
    <div className="animate-in slide-in-from-right-4 duration-500 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Nova Partida</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-700 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-50" />
        
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-2 tracking-widest">Escolha o Jogo</label>
          <select 
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-4 outline-none focus:ring-2 focus:ring-indigo-500 font-black text-lg appearance-none cursor-pointer"
            value={selectedGameId}
            onChange={(e) => handleGameSelect(e.target.value)}
            required
          >
            <option value="">{games.length === 0 ? 'Carregando jogos...' : 'Selecione...'}</option>
            {games.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>

        {selectedGame && selectedGame.id === 'tu' ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-indigo-900/20 border border-indigo-500/30 p-4 rounded-xl text-xs text-indigo-300 font-bold uppercase">
              Regra: Vitória = +30 pontos.
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {players.map(p => {
                const isParticipant = tuParticipants.includes(p.id);
                const isWinner = tuWinners.includes(p.id);
                return (
                  <div key={p.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${isParticipant ? 'bg-slate-900 border-slate-600' : 'bg-slate-900/30 border-slate-800 opacity-60'}`}>
                    <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => handleTuParticipantToggle(p.id)}>
                      <div className={`w-5 h-5 rounded border flex items-center justify-center ${isParticipant ? 'bg-indigo-600 border-indigo-400' : 'bg-slate-800 border-slate-700'}`}>
                        {isParticipant && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                      </div>
                      <span className={`font-bold text-sm ${isParticipant ? 'text-white' : 'text-slate-500'}`}>{p.name}</span>
                    </div>
                    {isParticipant && (
                      <button type="button" onClick={() => handleTuWinnerToggle(p.id)} className={`px-3 py-2 rounded-lg text-[10px] font-black ${isWinner ? 'bg-yellow-500 text-yellow-950' : 'bg-slate-700 text-slate-400'}`}>
                        {isWinner ? 'VENCEU' : 'PERDEU'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <button type="submit" className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl active:scale-95 text-lg">
              FINALIZAR TIME'S UP
            </button>
          </div>
        ) : selectedGame && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase block mb-3 tracking-widest text-center">Jogadores na mesa</label>
              <div className="flex gap-2">
                {availablePlayerCounts.map(count => (
                  <button key={count} type="button" onClick={() => setNumPlayers(count)} className={`flex-1 py-4 rounded-xl font-black border transition-all text-lg ${numPlayers === count ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}>
                    {count}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {Array.from({ length: numPlayers }).map((_, i) => {
                const pos = i + 1;
                const points = (selectedGame.scoring[numPlayers] || selectedGame.scoring[availablePlayerCounts[0]])[pos] || 0;
                return (
                  <div key={pos} className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black shrink-0 ${pos === 1 ? 'bg-yellow-500 text-yellow-950' : 'bg-slate-700 text-slate-400'}`}>
                      {pos}º
                    </div>
                    <select
                      className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                      value={positions[pos] || ""}
                      onChange={(e) => setPositions({...positions, [pos]: e.target.value})}
                      required
                    >
                      <option value="">Selecione...</option>
                      {players.map(p => (
                        <option key={p.id} value={p.id} disabled={Object.values(positions).includes(p.id) && positions[pos] !== p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <div className="w-10 text-right">
                      <span className="text-indigo-400 font-black text-xs">+{points}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <button type="submit" className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl active:scale-95 text-lg">
              SALVAR RESULTADO
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default MatchForm;
