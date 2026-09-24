import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Terminal,
  Play,
  RotateCcw,
  Shield,
  HelpCircle,
  Users,
  Flame,
  GitBranch,
  AlertCircle,
  CheckCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import type {
  GitChallenge,
  SessionState,
  Player,
  TerminalEntry,
  VisualAction,
  WebSocketServerMessage,
} from './types.ts';
import { soundManager } from './utils/audio.ts';
import { Navbar } from './components/Navbar.tsx';
import { GitVisualizer } from './components/GitVisualizer.tsx';
import { ChallengeCard } from './components/ChallengeCard.tsx';
import { TerminalConsole } from './components/TerminalConsole.tsx';
import { Leaderboard } from './components/Leaderboard.tsx';
import { PlayerOnboardingModal } from './components/PlayerOnboardingModal.tsx';
import { AdminPanelModal } from './components/AdminPanelModal.tsx';
import { GameOverModal } from './components/GameOverModal.tsx';
import { HelpModal } from './components/HelpModal.tsx';
import { LobbyScreen } from './components/LobbyScreen.tsx';

// Initial placeholder state
const DEFAULT_SESSION: SessionState = {
  sessionId: 'session-default',
  status: 'waiting',
  durationSeconds: 900, // 15 minutes
  timeRemaining: 900,
  startedAt: null,
  endsAt: null,
  activeChallengeIds: [],
  players: [],
};

export default function App() {
  const [session, setSession] = useState<SessionState>(DEFAULT_SESSION);
  const [challenges, setChallenges] = useState<GitChallenge[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [playerId, setPlayerId] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Modals
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [showAdmin, setShowAdmin] = useState<boolean>(false);
  const [showGameOver, setShowGameOver] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [adminAuth, setAdminAuth] = useState<boolean>(false);
  const [adminLoginError, setAdminLoginError] = useState<string>('');

  // Terminal & Animation States
  const [terminalEntries, setTerminalEntries] = useState<TerminalEntry[]>([
    {
      id: 'welcome-1',
      type: 'system',
      text: 'GitMaster Terminal v2.4 (Çok Oyunculu Canlı Mod)',
      timestamp: new Date().toLocaleTimeString(),
    },
    {
      id: 'welcome-2',
      type: 'info',
      text: 'Hoş geldiniz! Senaryoları dikkatle okuyun ve istenen Git komutlarını girin.',
      timestamp: new Date().toLocaleTimeString(),
    },
    {
      id: 'welcome-3',
      type: 'info',
      text: 'Peş peşe doğru komutlarda STRIKE bonusu kazanırsınız! 🔥',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  const [lastVisualAction, setLastVisualAction] = useState<VisualAction | null>(null);
  const [strikeFeedback, setStrikeFeedback] = useState<{
    strike: number;
    points: number;
    show: boolean;
  } | null>(null);
  const [errorFeedback, setErrorFeedback] = useState<{
    show: boolean;
    message: string;
  } | null>(null);

  // Recent strikes feed
  const [recentStrikes, setRecentStrikes] = useState<
    Array<{
      id: string;
      playerName: string;
      avatar: string;
      strike: number;
      pointsEarned: number;
      timestamp: number;
    }>
  >([]);

  // WebSocket Ref
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check URL for /admin or #admin
  useEffect(() => {
    const checkAdminRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();

      if (
        path === '/admin' ||
        path === '/admin/' ||
        path.endsWith('/admin') ||
        path.includes('/admin') ||
        hash === '#admin' ||
        hash.includes('admin') ||
        search.includes('admin')
      ) {
        setShowAdmin(true);
      }
    };

    checkAdminRoute();
    window.addEventListener('popstate', checkAdminRoute);
    window.addEventListener('hashchange', checkAdminRoute);

    const interval = setInterval(checkAdminRoute, 500);

    return () => {
      window.removeEventListener('popstate', checkAdminRoute);
      window.removeEventListener('hashchange', checkAdminRoute);
      clearInterval(interval);
    };
  }, []);

  // Initialize or fetch stored Player
  useEffect(() => {
    let storedId = localStorage.getItem('gitmaster_player_id');
    const storedName = localStorage.getItem('gitmaster_player_name');
    const storedAvatar = localStorage.getItem('gitmaster_player_avatar');

    if (!storedId) {
      storedId = 'player_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('gitmaster_player_id', storedId);
    }

    setPlayerId(storedId);

    if (storedName) {
      setCurrentPlayer({
        id: storedId,
        name: storedName,
        avatar: storedAvatar || '🐱',
        score: 0,
        strike: 0,
        maxStrike: 0,
        completedChallengeIds: [],
        currentChallengeIndex: 0,
        lastActiveAt: Date.now(),
        isOnline: true,
      });
    }
  }, []);

  // Fetch initial challenges and session via HTTP
  useEffect(() => {
    fetch('/api/challenges')
      .then((res) => res.json())
      .then((data: GitChallenge[]) => {
        setChallenges(data);
      })
      .catch((err) => console.error('Failed to load challenges:', err));

    fetch('/api/session')
      .then((res) => res.json())
      .then((data: SessionState) => {
        setSession(data);
      })
      .catch((err) => console.error('Failed to load session:', err));
  }, []);

  // Setup WebSocket connection
  const connectWebSocket = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      // Send join message if player exists
      const pName = localStorage.getItem('gitmaster_player_name');
      const pAvatar = localStorage.getItem('gitmaster_player_avatar');
      const pId = localStorage.getItem('gitmaster_player_id');

      if (pId && pName) {
        ws.send(
          JSON.stringify({
            type: 'join',
            payload: {
              playerId: pId,
              name: pName,
              avatar: pAvatar || '🐱',
            },
          })
        );
      }
    };

    ws.onmessage = (event) => {
      try {
        const msg: WebSocketServerMessage = JSON.parse(event.data);

        switch (msg.type) {
          case 'session_state': {
            setSession(msg.payload);

            // Sync current player data
            const curId = localStorage.getItem('gitmaster_player_id');
            if (curId && msg.payload.players) {
              const updatedMe = msg.payload.players.find((p) => p.id === curId);
              if (updatedMe) {
                setCurrentPlayer(updatedMe);
              }
            }

            // Check if game just finished
            if (msg.payload.status === 'finished') {
              setShowGameOver(true);
            }
            break;
          }

          case 'strike_event': {
            const { playerName, avatar, strike, pointsEarned } = msg.payload;
            setRecentStrikes((prev) => [
              {
                id: Math.random().toString(),
                playerName,
                avatar,
                strike,
                pointsEarned,
                timestamp: Date.now(),
              },
              ...prev.slice(0, 10),
            ]);
            break;
          }

          case 'command_result': {
            const { success, pointsEarned, strike, message, visualAction } = msg.payload;

            if (success) {
              soundManager.playSuccess();
              if (strike && strike > 1) {
                soundManager.playStrike(strike);
                if (strike >= 3) {
                  confetti({
                    particleCount: 50,
                    spread: 60,
                    origin: { y: 0.8 },
                  });
                }
              }

              if (visualAction) {
                setLastVisualAction(visualAction);
              }

              setStrikeFeedback({
                strike: strike || 1,
                points: pointsEarned || 100,
                show: true,
              });
              setTimeout(() => setStrikeFeedback(null), 2500);

              setTerminalEntries((prev) => [
                ...prev,
                {
                  id: Math.random().toString(),
                  type: 'success',
                  text: `✔ ${message}`,
                  timestamp: new Date().toLocaleTimeString(),
                },
              ]);
            } else {
              soundManager.playError();
              setErrorFeedback({
                show: true,
                message: message,
              });
              setTimeout(() => setErrorFeedback(null), 3000);

              setTerminalEntries((prev) => [
                ...prev,
                {
                  id: Math.random().toString(),
                  type: 'error',
                  text: `✖ ${message}`,
                  timestamp: new Date().toLocaleTimeString(),
                },
              ]);
            }
            break;
          }

          case 'admin_auth_result': {
            if (msg.payload.success) {
              setAdminAuth(true);
              setAdminLoginError('');
            } else {
              setAdminLoginError(msg.payload.message || 'Geçersiz şifre!');
            }
            break;
          }

          case 'notification': {
            setTerminalEntries((prev) => [
              ...prev,
              {
                id: Math.random().toString(),
                type: 'system',
                text: `[Duyuru] ${msg.payload.message}`,
                timestamp: new Date().toLocaleTimeString(),
              },
            ]);
            break;
          }
        }
      } catch (e) {
        console.error('Error processing WS event:', e);
      }
    };

    ws.onclose = () => {
      reconnectTimeoutRef.current = setTimeout(() => {
        connectWebSocket();
      }, 2500);
    };

    wsRef.current = ws;
  }, []);

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      wsRef.current?.close();
    };
  }, [connectWebSocket]);

  // Determine active challenge for current player
  const activeChallenges = challenges.filter(
    (c) => session.activeChallengeIds.length === 0 || session.activeChallengeIds.includes(c.id)
  );

  const myCompletedIds = currentPlayer?.completedChallengeIds || [];
  const currentChallengeIndex = currentPlayer?.currentChallengeIndex || 0;
  const currentChallenge = activeChallenges[currentChallengeIndex] || null;

  // Handle Command Submission
  const handleExecuteCommand = (cmd: string) => {
    if (!currentChallenge) return;
    const curId = localStorage.getItem('gitmaster_player_id');
    if (!curId) {
      setShowOnboarding(true);
      return;
    }

    // Append to local terminal immediately
    setTerminalEntries((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        type: 'command',
        text: cmd,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'submit_command',
          payload: {
            playerId: curId,
            challengeId: currentChallenge.id,
            command: cmd,
          },
        })
      );
    }
  };

  // Onboarding Save
  const handleSaveProfile = (name: string, avatar: string) => {
    const curId = playerId || 'player_' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem('gitmaster_player_id', curId);
    localStorage.setItem('gitmaster_player_name', name);
    localStorage.setItem('gitmaster_player_avatar', avatar);

    setPlayerId(curId);
    setCurrentPlayer((prev) => ({
      id: curId,
      name,
      avatar,
      score: prev?.score || 0,
      strike: prev?.strike || 0,
      maxStrike: prev?.maxStrike || 0,
      completedChallengeIds: prev?.completedChallengeIds || [],
      currentChallengeIndex: prev?.currentChallengeIndex || 0,
      lastActiveAt: Date.now(),
      isOnline: true,
    }));

    setShowOnboarding(false);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'join',
          payload: {
            playerId: curId,
            name,
            avatar,
          },
        })
      );
    }
  };

  // Admin Actions
  const handleAdminLogin = (password: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'admin_login',
          payload: { password },
        })
      );
    }
  };

  const handleStartGame = (durationMinutes?: number) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'admin_start',
          payload: { durationMinutes },
        })
      );
    }
  };

  const handleEndGame = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'admin_stop' }));
    }
  };

  const handlePauseGame = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'admin_pause' }));
    }
  };

  const handleResetGame = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'admin_reset' }));
    }
  };

  const handleSaveChallenges = (selectedIds: string[], durationMinutes: number) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'admin_set_challenges',
          payload: { activeChallengeIds: selectedIds },
        })
      );
    }
  };

  const handleResetScores = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'admin_reset_scores' }));
    }
  };

  const handleToggleMute = () => {
    const isNowMuted = soundManager.toggleMute();
    setIsMuted(!isNowMuted);
  };

  const isGameRunning = session.status === 'running';

  // If session is waiting or player has no name yet (even if running, they need a name to play), show Lobby Screen!
  const shouldShowLobby = session.status === 'waiting' || !currentPlayer?.name;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-orange-500/30">
      {shouldShowLobby ? (
        /* Lobby Screen */
        <LobbyScreen
          currentPlayer={currentPlayer}
          session={session}
          onJoin={handleSaveProfile}
          onUpdateProfile={handleSaveProfile}
          onShowHelp={() => setShowHelp(true)}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      ) : (
        /* Active Game Arena Screen (shown when admin starts game and user has profile) */
        <>
          {/* Top Navbar */}
          <Navbar
            session={session}
            currentPlayer={currentPlayer}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onOpenOnboarding={() => setShowOnboarding(true)}
            onShowHelp={() => setShowHelp(true)}
          />

          {/* Main Body Layout: Content Area (Left) + Fixed Leaderboard (Right) */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Left / Center: Interactive Playground */}
            <main className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4 max-w-5xl mx-auto w-full">
              {/* 1. Git Visualizer & Architecture Animation */}
              <GitVisualizer
                lastAction={lastVisualAction}
                activeBranch={currentChallenge?.visualAction?.branch || 'main'}
              />

              {/* 2. Current Challenge Mission Card */}
              <ChallengeCard
                challenge={currentChallenge}
                currentIndex={currentChallengeIndex}
                totalCount={activeChallenges.length}
                currentStrike={currentPlayer?.strike || 0}
              />

              {/* 3. Developer Terminal Console */}
              <TerminalConsole
                onExecuteCommand={handleExecuteCommand}
                entries={terminalEntries}
                activeBranch={currentChallenge?.visualAction?.branch || 'main'}
                isGameRunning={isGameRunning}
                onClear={() => setTerminalEntries([])}
                strikeFeedback={strikeFeedback}
                errorFeedback={errorFeedback}
                currentHint={currentChallenge?.hint}
              />
            </main>

            {/* Right: Fixed Real-time Leaderboard */}
            <Leaderboard
              players={session.players}
              currentPlayerId={playerId}
              totalChallengesCount={activeChallenges.length}
              recentStrikes={recentStrikes}
            />
          </div>
        </>
      )}

      {/* Modals */}
      <PlayerOnboardingModal
        isOpen={showOnboarding}
        initialName={currentPlayer?.name}
        initialAvatar={currentPlayer?.avatar}
        onSave={handleSaveProfile}
        onClose={() => setShowOnboarding(false)}
        isInitial={!currentPlayer?.name}
      />

      <AdminPanelModal
        isOpen={showAdmin}
        onClose={() => {
          setShowAdmin(false);
          // clean URL path or hash so it doesn't immediately re-open
          if (window.location.pathname.toLowerCase().includes('/admin')) {
            window.history.replaceState(null, '', '/');
          } else if (window.location.hash.toLowerCase().includes('admin')) {
            window.history.replaceState(null, '', window.location.pathname);
          }
        }}
        session={session}
        allChallenges={challenges}
        isAdminAuthenticated={adminAuth}
        onLogin={handleAdminLogin}
        onStartGame={handleStartGame}
        onEndGame={handleEndGame}
        onPauseGame={handlePauseGame}
        onResetGame={handleResetGame}
        onSaveChallenges={handleSaveChallenges}
        onResetScores={handleResetScores}
        loginError={adminLoginError}
      />

      <GameOverModal
        isOpen={showGameOver}
        onClose={() => setShowGameOver(false)}
        players={session.players}
        currentPlayerId={playerId}
      />

      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
}
