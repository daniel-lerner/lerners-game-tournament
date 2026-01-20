
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

// Configurações do Supabase
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rqdsbudpisnwdvaugukf.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY || 'sb_publishable_US4jmKUFdi82enu1yHgVtg_RBJxH9WQ';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Funções de decodificação oficiais do SDK
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  // Garantindo que o buffer esteja alinhado para Int16
  const dataInt16 = new Int16Array(data.buffer, data.byteOffset, data.byteLength / 2);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
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
    const matchToDelete = matches.find(m => String(m.id) === String(matchId));
    if (!matchToDelete) return;

    setSyncStatus('syncing');
    try {
      for (const res of matchToDelete.results) {
        const player = players.find(p => String(p.id) === String(res.playerId));
        if (player) {
          const pId = isNaN(Number(player.id)) ? player.id : Number(player.id);
          await supabase.from('players').update({
            total_points: Math.max(0, player.totalPoints - res.pointsEarned),
            matches_played: Math.max(0, player.matchesPlayed - 1),
            wins: res.position === 1 ? Math.max(0, player.wins - 1) : player.wins
          }).eq('id', pId);
        }
      }
      const mId = isNaN(Number(matchId)) ? matchId : Number(matchId);
      const { error: deleteError } = await supabase.from('matches').delete().eq('id', mId);
      if (deleteError) throw new Error(deleteError.message);
      addToast("Partida removida!", 'info');
      await fetchData();
    } catch (err: any) {
      alert("Erro ao excluir: " + err.message);
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
    if (matches.length === 0) {
      setAiInsights("Joguem pelo menos uma partida para eu ter o que falar!");
      return;
    }

    setIsGeneratingAudio(true);
    setAiInsights("Invocando o Mestre Lerner...");
    
    try {
      // Cria a instância sempre no momento do uso para pegar a env atualizada
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const currentRanking = players
        .filter(p => p.editionId === '2026')
        .sort((a,b) => b.totalPoints - a.totalPoints);
      
      const stats = currentRanking.map(p => `${p.name}: ${p.totalPoints} pts (${p.wins} vitórias)`).join(', ');
      const recent = matches.slice(0, 3).map(m => {
        const g = games.find(game => game.id === m.gameId)?.name;
        const winner = players.find(p => p.id === m.results.find(r => r.position === 1)?.playerId)?.name;
        return `${g} (vencido por ${winner})`;
      }).join('; ');

      // 1. Gera o Comentário (Text)
      const textResponse = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Analise este torneio: Ranking: ${stats}. Últimas partidas: ${recent}.`,
        config: { 
          systemInstruction: "Você é o Mestre Lerner, o anfitrião ácido e carismático de um torneio de board games. Fale de forma rápida, sarcástica, use gírias de quem joga muito e foque na rivalidade. Dê um apelido engraçado para o primeiro colocado e zoe o último. Mantenha em apenas 2 ou 3 frases curtas em português brasileiro." 
        }
      });
      
      const text = textResponse.text || "Sem comentários para essa mesa vergonhosa.";
      setAiInsights(text);
      
      // 2. Gera a Voz (TTS)
      const ttsResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Diga com um tom sarcástico e animado: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { 
            voiceConfig: { 
              prebuiltVoiceConfig: { voiceName: 'Puck' } 
            } 
          }
        }
      });
      
      const audioData = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (audioData) {
        if (!audioContextRef.current) audioContextRef.current = new AudioContext({ sampleRate: 24000 });
        // Retoma o contexto se estiver suspenso (necessário em alguns navegadores)
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }
        
        const decodedBytes = decode(audioData);
        const buffer = await decodeAudioData(decodedBytes, audioContextRef.current, 24000, 1);
        setAudioBuffer(buffer);
        addToast("Narrador pronto para falar!", "info");
      }
    } catch (e: any) { 
      console.error("Erro AI:", e); 
      setAiInsights("O Mestre Lerner foi tomar um café. Verifique se a API_KEY está correta no Vercel.");
      addToast("Erro na Inteligência Artificial", "info");
    } finally { 
      setIsGeneratingAudio(false); 
    }
  };

  const handleAudioToggle = async () => {
    if (!audioBuffer || !audioContextRef.current) return;
    
    if (isPlaying && !isPaused) { 
      await audioContextRef.current.suspend(); 
      setIsPaused(true); 
    } else if (isPlaying && isPaused) { 
      await audioContextRef.current.resume(); 
      setIsPaused(false); 
    } else {
      // Resume context antes de tocar (gesto do usuário)
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => { 
        setIsPlaying(false); 
        setIsPaused(false); 
      };
      source.start(0);
      currentSourceRef.current = source;
      setIsPlaying(true);
      setIsPaused(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-0 md:pt-16">
      <Header syncStatus={syncStatus} />
      <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => <Toast key={t.id} message={t.message} type={t.type} />)}
      </div>
      <main className="max-w-4xl mx-auto px-4 py-6">
        {view === ViewMode.DASHBOARD && (
          <Dashboard 
            players={players} 
            matches={matches} 
            games={games} 
            aiInsights={aiInsights} 
            onGetInsights={getAiInsights} 
            isGeneratingAudio={isGeneratingAudio} 
            audioBuffer={audioBuffer} 
            onAudioToggle={handleAudioToggle} 
            isPlaying={isPlaying} 
            isPaused={isPaused} 
            playbackSpeed={1} 
            onSpeedChange={()=>{}} 
          />
        )}
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
