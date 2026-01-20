
import React, { useState, useEffect, useRef } from 'react';
import { ViewMode, Player, Game, Match, MatchResult } from './types';
import { DEFAULT_GAMES } from './constants';
import Dashboard from './components/Dashboard';
import RankingTable from './components/RankingTable';
import MatchForm from './components/MatchForm';
import MatchHistory from './components/MatchHistory';
import AdminPanel from './components/AdminPanel';
import Header from './components/Header';
import Nav from './components/Nav';
import Toast from './components/Toast';
import { GoogleGenAI, Modality } from "@google/genai";
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rqdsbudpisnwdvaugukf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_US4jmKUFdi82enu1yHgVtg_RBJxH9WQ';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function decodeBase64(base64: string) {
  const binaryString = atob(base64.split(',')[1] || base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) { channelData[i] = dataInt16[i * numChannels + channel] / 32768.0; }
  }
  return buffer;
}

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>(ViewMode.DASHBOARD);
  const [players, setPlayers] = useState<Player[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [aiInsights, setAiInsights] = useState<string>("");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'online' | 'syncing' | 'offline'>('online');
  const [toasts, setToasts] = useState<{id: number, message: string, type: 'success' | 'info'}[]>([]);
  
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const fetchData = async () => {
    setSyncStatus('syncing');
    try {
      const { data: dbGames } = await supabase.from('games').select('*');
      if (dbGames && dbGames.length > 0) {
        setGames(dbGames.map(g => ({
          id: String(g.id),
          name: g.name,
          scoring: g.scoring,
          isPlusRule: g.is_plus_rule
        })));
      } else {
        setGames(DEFAULT_GAMES);
      }

      const { data: dbPlayers } = await supabase.from('players').select('*');
      const { data: dbMatches } = await supabase.from('matches').select('*').eq('edition_id', '2026').order('timestamp', { ascending: false });

      if (dbPlayers) setPlayers(dbPlayers.map(p => ({
        id: String(p.id),
        name: p.name,
        avatarUrl: p.avatar_url,
        totalPoints: p.total_points,
        matchesPlayed: p.matches_played,
        wins: p.wins,
        editionId: p.edition_id
      })));
      
      if (dbMatches) setMatches(dbMatches.map(m => ({
        id: String(m.id),
        gameId: String(m.game_id),
        timestamp: new Date(m.timestamp).getTime(),
        results: m.results,
        editionId: m.edition_id
      })));
      
      setSyncStatus('online');
    } catch (err) {
      console.error("Erro na sincronização:", err);
      setSyncStatus('offline');
    }
  };

  useEffect(() => {
    fetchData();
    const channel = supabase.channel('realtime-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const addToast = (message: string, type: 'success' | 'info' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const deleteMatch = async (matchId: string) => {
    // Localizar a partida no estado atual
    const matchToDelete = matches.find(m => String(m.id) === String(matchId));
    if (!matchToDelete) {
      alert("Erro: Partida não encontrada no estado local.");
      return;
    }

    setSyncStatus('syncing');
    try {
      // 1. Estornar estatísticas dos jogadores
      for (const res of matchToDelete.results) {
        const player = players.find(p => String(p.id) === String(res.playerId));
        if (player) {
          const pId = isNaN(Number(player.id)) ? player.id : Number(player.id);
          const { error: pErr } = await supabase.from('players').update({
            total_points: Math.max(0, player.totalPoints - res.pointsEarned),
            matches_played: Math.max(0, player.matchesPlayed - 1),
            wins: res.position === 1 ? Math.max(0, player.wins - 1) : player.wins
          }).eq('id', pId);
          if (pErr) console.error("Erro ao estornar jogador:", pErr);
        }
      }

      // 2. Deletar partida do banco
      const mId = isNaN(Number(matchId)) ? matchId : Number(matchId);
      const { error: deleteError } = await supabase.from('matches').delete().eq('id', mId);
      
      if (deleteError) {
        throw new Error(deleteError.message);
      } else {
        addToast("Partida removida e pontos estornados!", 'info');
        await fetchData();
      }
    } catch (err: any) {
      alert("Erro ao excluir partida: " + err.message);
    } finally {
      setSyncStatus('online');
    }
  };

  const addMatch = async (gameId: string, results: { playerId: string, position: number }[]) => {
    const game = games.find(g => g.id === gameId);
    if (!game) return;

    setSyncStatus('syncing');
    const numPlayers = results.length;
    const newMatchResults: MatchResult[] = results.map(res => {
        let rule = game.scoring[numPlayers];
        if (!rule && game.isPlusRule) {
          const availableCounts = Object.keys(game.scoring).map(Number).sort((a,b)=>a-b);
          rule = game.scoring[availableCounts[0]];
        }
        return {
          playerId: String(res.playerId),
          position: res.position,
          pointsEarned: rule ? (rule[res.position] || 0) : 0
        };
    });

    const { error: matchError } = await supabase.from('matches').insert({
      game_id: gameId,
      results: newMatchResults,
      edition_id: '2026'
    });

    if (!matchError) {
      for (const res of newMatchResults) {
        const player = players.find(p => p.id === String(res.playerId));
        if (player) {
          const pId = isNaN(Number(player.id)) ? player.id : Number(player.id);
          await supabase.from('players').update({
            total_points: player.totalPoints + res.pointsEarned,
            matches_played: player.matchesPlayed + 1,
            wins: res.position === 1 ? player.wins + 1 : player.wins
          }).eq('id', pId);
        }
      }
      addToast(`Partida registrada!`);
      await fetchData();
      setView(ViewMode.DASHBOARD);
    } else {
      alert("Erro ao salvar: " + matchError.message);
      setSyncStatus('online');
    }
  };

  const resetTournamentDB = async () => {
    if (!window.confirm("Isso apagará TODAS as partidas de 2026 e zerará os pontos. Tem certeza?")) return;
    setSyncStatus('syncing');
    try {
      await supabase.from('matches').delete().eq('edition_id', '2026');
      await supabase.from('players').update({ total_points: 0, wins: 0, matches_played: 0 }).eq('edition_id', '2026');
      await fetchData();
      addToast("Temporada 2026 reiniciada!");
      setView(ViewMode.DASHBOARD);
    } catch (e: any) {
      alert("Erro no reset: " + e.message);
      setSyncStatus('online');
    }
  };

  const getAiInsights = async () => {
    if (matches.length === 0) return setAiInsights("Joguem algo para eu poder cornetar!");
    setIsGeneratingAudio(true);
    setAiInsights("Analisando a mesa...");
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const currentRanking = players.filter(p => p.editionId === '2026').sort((a,b) => b.totalPoints - a.totalPoints);
      const textResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Torneio do Lerner 2026. Ranking: ${currentRanking.map(p => `${p.name} (${p.totalPoints})`).join(', ')}.`,
        config: { systemInstruction: "Seja um mestre de board games sarcástico e engraçado." }
      });
      const text = textResponse.text || "";
      setAiInsights(text);
      const tts = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } }
        }
      });
      const audioData = tts.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (audioData) {
        if (!audioContextRef.current) audioContextRef.current = new AudioContext({ sampleRate: 24000 });
        const buffer = await decodeAudioData(decodeBase64(audioData), audioContextRef.current, 24000, 1);
        setAudioBuffer(buffer);
      }
    } catch (e) { console.error(e); } finally { setIsGeneratingAudio(false); }
  };

  const handleAudioToggle = async () => {
    if (!audioBuffer || !audioContextRef.current) return;
    if (isPlaying && !isPaused) { await audioContextRef.current.suspend(); setIsPaused(true); }
    else if (isPlaying && isPaused) { await audioContextRef.current.resume(); setIsPaused(false); }
    else {
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => { setIsPlaying(false); setIsPaused(false); };
      source.start(0);
      currentSourceRef.current = source;
      setIsPlaying(true);
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-0 md:pt-16">
      <Header syncStatus={syncStatus} />
      <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => <Toast key={t.id} message={t.message} type={t.type} />)}
      </div>
      <main className="max-w-4xl mx-auto px-4 py-6">
        {view === ViewMode.DASHBOARD && <Dashboard players={players} matches={matches} games={games} aiInsights={aiInsights} onGetInsights={getAiInsights} isGeneratingAudio={isGeneratingAudio} audioBuffer={audioBuffer} onAudioToggle={handleAudioToggle} isPlaying={isPlaying} isPaused={isPaused} playbackSpeed={1} onSpeedChange={()=>{}} />}
        {view === ViewMode.RANKING && <RankingTable players={players} />}
        {view === ViewMode.ADD_MATCH && <MatchForm players={players.filter(p => p.editionId === '2026')} games={games} onSubmit={addMatch} />}
        {view === ViewMode.HISTORY && <MatchHistory matches={matches} games={games} players={players} />}
        {view === ViewMode.ADMIN && (
          <AdminPanel 
            players={players.filter(p => p.editionId === '2026')} 
            games={games} 
            matches={matches} 
            setPlayers={setPlayers}
            setGames={setGames} 
            setMatches={setMatches} 
            onReset={resetTournamentDB} 
            onDeleteMatch={deleteMatch}
            isAuthenticated={isAdminAuthenticated} 
            setIsAuthenticated={setIsAdminAuthenticated} 
            addToast={addToast} 
            supabase={supabase}
            fetchData={fetchData}
          />
        )}
      </main>
      <Nav currentView={view} setView={setView} />
    </div>
  );
};

export default App;
