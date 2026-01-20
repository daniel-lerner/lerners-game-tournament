
import React, { useState, useEffect } from 'react';
import { Player, Game, Match } from '../types';
import { DEFAULT_GAMES } from '../constants';

interface AdminPanelProps {
  players: Player[];
  games: Game[];
  matches: Match[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  setGames: React.Dispatch<React.SetStateAction<Game[]>>;
  setMatches: React.Dispatch<React.SetStateAction<Match[]>>;
  onReset: () => void;
  onDeleteMatch: (id: string) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (val: boolean) => void;
  addToast: (msg: string, type?: 'success' | 'info') => void;
  supabase: any;
  fetchData: () => Promise<void>;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  players, 
  games, 
  matches,
  setPlayers, 
  setGames, 
  setMatches,
  onReset, 
  onDeleteMatch,
  isAuthenticated, 
  setIsAuthenticated,
  addToast,
  supabase,
  fetchData
}) => {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [passcode, setPasscode] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmReset2025, setConfirmReset2025] = useState(false);
  const [confirmRules, setConfirmRules] = useState(false);
  const [confirmDeletePlayerId, setConfirmDeletePlayerId] = useState<string | null>(null);
  const [confirmDeleteMatchId, setConfirmDeleteMatchId] = useState<string | null>(null);
  const [csvText, setCsvText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let timer: number;
    if (confirmReset) timer = window.setTimeout(() => setConfirmReset(false), 4000);
    if (confirmRules) timer = window.setTimeout(() => setConfirmRules(false), 4000);
    if (confirmDeletePlayerId) timer = window.setTimeout(() => setConfirmDeletePlayerId(null), 4000);
    if (confirmDeleteMatchId) timer = window.setTimeout(() => setConfirmDeleteMatchId(null), 4000);
    return () => clearTimeout(timer);
  }, [confirmReset, confirmRules, confirmDeletePlayerId, confirmDeleteMatchId]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === 'lerner2026' || passcode === 'admin') {
      setIsAuthenticated(true);
      addToast("Acesso administrativo liberado", "info");
    }
    else alert("Senha incorreta!");
  };

  const handleFileUpload = (playerId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      const targetId = isNaN(Number(playerId)) ? playerId : Number(playerId);
      const { error } = await supabase.from('players').update({ avatar_url: base64 }).eq('id', targetId);
      
      if (!error) {
        addToast("Foto atualizada!");
        await fetchData();
      } else {
        alert("Erro na foto: " + error.message);
      }
    };
    reader.readAsDataURL(file);
  };

  const addPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    const nameToAdd = newPlayerName.trim();
    if (!nameToAdd || isProcessing) return;
    
    setIsProcessing(true);
    setNewPlayerName('');
    const { error } = await supabase.from('players').insert({ 
      name: nameToAdd, 
      edition_id: '2026',
      total_points: 0, matches_played: 0, wins: 0
    });

    if (error) alert("Erro ao adicionar: " + error.message);
    else addToast(`${nameToAdd} adicionado!`);
    
    await fetchData();
    setIsProcessing(false);
  };

  const syncGamesToSupabase = async () => {
    if (!confirmRules) {
      setConfirmRules(true);
      return;
    }
    
    setIsProcessing(true);
    setConfirmRules(false);
    try {
      const gamesToUpload = DEFAULT_GAMES.map(g => ({
        id: g.id,
        name: g.name,
        scoring: g.scoring,
        is_plus_rule: g.isPlusRule || false
      }));
      
      const { error } = await supabase
        .from('games')
        .upsert(gamesToUpload, { onConflict: 'id' });

      if (error) throw new Error(error.message);
      
      addToast("Regras atualizadas com sucesso!", 'success');
      await fetchData();
    } catch (err: any) {
      alert("ERRO AO ATUALIZAR REGRAS:\n" + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const deletePlayer = async (id: string) => {
    if (confirmDeletePlayerId !== id) {
      setConfirmDeletePlayerId(id);
      return;
    }

    setIsProcessing(true);
    setConfirmDeletePlayerId(null);
    try {
      const targetId = isNaN(Number(id)) ? id : Number(id);
      const { error } = await supabase.from('players').delete().eq('id', targetId);
      if (error) {
        alert(`Erro de exclusão: ${error.message}`);
      } else {
        addToast("Jogador removido");
        await fetchData();
      }
    } catch (err: any) {
      alert("Erro: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteMatch = async (id: string) => {
    if (confirmDeleteMatchId !== id) {
      setConfirmDeleteMatchId(id);
      return;
    }

    setConfirmDeleteMatchId(null);
    setDeletingId(id);
    try {
      await onDeleteMatch(id);
    } finally {
      setDeletingId(null);
    }
  };

  const clear2025Data = async () => {
    const { error } = await supabase.from('players').delete().eq('edition_id', '2025');
    if (error) alert("Erro: " + error.message);
    else { addToast("Dados de 2025 removidos!"); await fetchData(); }
  };

  const importLerner2025 = async () => {
    if (!csvText.trim()) return;
    try {
      const lines = csvText.trim().split('\n');
      const dataToInsert = lines.slice(1).map(l => {
        const c = l.split(';');
        return { name: c[0].replace(/^\ufeff/, '').trim(), total_points: parseInt(c[12]) || 0, edition_id: '2025', matches_played: 0, wins: 0 };
      }).filter(d => d.name);
      const { error } = await supabase.from('players').insert(dataToInsert);
      if (error) alert(error.message);
      else { addToast("Importado!", 'success'); setCsvText(''); await fetchData(); }
    } catch (e) { alert("Erro CSV"); }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700 shadow-2xl text-center">
        <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-tighter">Acesso Admin</h2>
        <form onSubmit={handleAuth} className="space-y-4">
          <input type="password" placeholder="Senha" className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-4 text-center focus:ring-2 focus:ring-indigo-500 font-black" value={passcode} onChange={(e) => setPasscode(e.target.value)} />
          <button type="submit" className="w-full bg-indigo-600 py-4 rounded-xl text-white font-black uppercase">Entrar</button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-white uppercase italic">Painel de Controle</h2>
        <div className="flex gap-2">
          <button onClick={() => { setIsProcessing(true); fetchData().finally(() => setIsProcessing(false)); }} className="text-[10px] font-black bg-slate-800 text-indigo-400 px-3 py-1 rounded-full border border-slate-700 uppercase">Sync</button>
          <button 
            onClick={syncGamesToSupabase} 
            disabled={isProcessing}
            className={`text-[10px] font-black px-3 py-1 rounded-full border uppercase shadow-lg transition-all ${
              isProcessing ? 'bg-slate-700 text-slate-500 border-slate-600' : 
              confirmRules ? 'bg-emerald-500 text-white border-emerald-300 animate-pulse' :
              'bg-emerald-600 text-white border-emerald-400'
            }`}
          >
            {isProcessing ? 'Processando...' : confirmRules ? 'Clique p/ Confirmar' : 'Atualizar Regras'}
          </button>
        </div>
      </div>

      <section className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-black text-white mb-4 uppercase tracking-tighter flex items-center gap-2">
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
          Gerenciar Jogadores
        </h3>
        <form onSubmit={addPlayer} className="flex gap-2 mb-6">
          <input type="text" placeholder="Nome do jogador..." className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-xl p-4 font-bold" value={newPlayerName} onChange={(e) => setNewPlayerName(e.target.value)} disabled={isProcessing} />
          <button type="submit" className="bg-indigo-600 text-white font-black px-6 rounded-xl disabled:opacity-50" disabled={isProcessing}>ADD</button>
        </form>
        <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
          {players.map(p => (
            <div key={p.id} className="bg-slate-900/50 p-3 rounded-xl border border-slate-700 flex justify-between items-center group">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12">
                   <div className="w-full h-full rounded-full bg-slate-800 border-2 border-slate-700 overflow-hidden flex items-center justify-center">
                     {p.avatarUrl ? <img src={p.avatarUrl} alt="" className="w-full h-full object-cover" /> : <img src={`https://robohash.org/${p.id}?size=40x40&bgset=bg2`} alt="" className="w-full h-full object-cover opacity-20" />}
                   </div>
                   <label className="absolute -bottom-1 -right-1 bg-indigo-600 text-white p-1.5 rounded-full cursor-pointer shadow-lg border border-slate-900 hover:bg-indigo-500 transition-colors">
                     <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                     <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(p.id, e)} />
                   </label>
                </div>
                <span className="text-slate-100 font-bold">{p.name}</span>
              </div>
              <button 
                onClick={() => deletePlayer(p.id)} 
                className={`transition-all font-black text-[10px] px-3 py-1.5 rounded-lg border uppercase ${
                  confirmDeletePlayerId === p.id 
                    ? 'bg-red-600 text-white border-red-400 animate-pulse' 
                    : 'text-slate-500 hover:text-red-500 border-transparent hover:border-red-500/20'
                }`} 
                disabled={isProcessing}
              >
                {confirmDeletePlayerId === p.id ? 'Confirmar?' : 'Excluir'}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-black text-white mb-4 uppercase flex items-center gap-2"><div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />Excluir Partida</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
          {matches.map(m => (
            <div key={m.id} className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex justify-between items-center">
              <div className="overflow-hidden pr-2">
                <p className="text-sm font-black text-white truncate">{games.find(g => g.id === m.gameId)?.name || 'Jogo'}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase">{new Date(m.timestamp).toLocaleTimeString()}</p>
              </div>
              <button 
                onClick={() => handleDeleteMatch(m.id)} 
                disabled={deletingId === m.id}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black border transition-all shrink-0 ${
                  deletingId === m.id 
                    ? 'bg-slate-700 text-slate-500 border-slate-600' 
                    : confirmDeleteMatchId === m.id
                    ? 'bg-red-600 text-white border-red-400 animate-pulse'
                    : 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border-red-500/20'
                }`}
              >
                {deletingId === m.id ? 'EXCLUINDO...' : confirmDeleteMatchId === m.id ? 'CONFIRMAR?' : 'EXCLUIR'}
              </button>
            </div>
          ))}
          {matches.length === 0 && <p className="text-center text-slate-600 italic py-4">Sem partidas registradas.</p>}
        </div>
      </section>

      <section className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-black text-white uppercase mb-4">Reset & Histórico</h3>
        <button onClick={() => confirmReset ? onReset() : setConfirmReset(true)} className={`w-full font-black py-4 rounded-xl transition-all border-2 ${confirmReset ? 'bg-red-600 border-red-400 text-white animate-pulse' : 'bg-transparent border-red-900/30 text-red-600 hover:border-red-600'}`}>
          {confirmReset ? '⚠ CONFIRMAR RESET 2026' : 'RESETAR TORNEIO 2026'}
        </button>
        <div className="mt-6 pt-6 border-t border-slate-700">
          <textarea className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-slate-300 font-mono text-xs h-24 mb-3" placeholder='CSV: Jogador;Pts;...' value={csvText} onChange={(e) => setCsvText(e.target.value)} />
          <div className="flex gap-2">
            <button onClick={importLerner2025} className="flex-1 bg-emerald-700 text-white font-black py-3 rounded-xl text-xs uppercase">Importar 2025</button>
            <button onClick={() => confirmReset2025 ? clear2025Data() : setConfirmReset2025(true)} className={`px-4 font-black rounded-xl text-[10px] uppercase border transition-all ${confirmReset2025 ? 'bg-red-500 text-white border-red-400' : 'bg-slate-900 text-red-500 border-red-900/30'}`}>
              {confirmReset2025 ? 'CONFIRMAR' : 'LIMPAR 2025'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminPanel;
