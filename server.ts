import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import type {
  GitChallenge,
  SessionState,
  Player,
  WebSocketClientMessage,
  WebSocketServerMessage,
} from './src/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3000', 10);
const DATA_DIR = path.join(__dirname, 'data');
const SESSION_FILE = path.join(DATA_DIR, 'session.json');
const CHALLENGES_FILE = path.join(DATA_DIR, 'challenges.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load challenges
let challenges: GitChallenge[] = [];
try {
  const challengesRaw = fs.readFileSync(CHALLENGES_FILE, 'utf-8');
  challenges = JSON.parse(challengesRaw);
} catch (err) {
  console.error('Failed to load challenges:', err);
}

// Load or initialize session state
let sessionState: SessionState = {
  sessionId: 'session-default',
  status: 'waiting',
  durationSeconds: 900, // 15 minutes
  timeRemaining: 900,
  startedAt: null,
  endsAt: null,
  activeChallengeIds: challenges.map((c) => c.id),
  players: [],
};

if (fs.existsSync(SESSION_FILE)) {
  try {
    const sessionRaw = fs.readFileSync(SESSION_FILE, 'utf-8');
    const parsed = JSON.parse(sessionRaw);
    sessionState = {
      ...sessionState,
      ...parsed,
      players: parsed.players || [],
    };
  } catch (e) {
    console.error('Error reading session file, using defaults:', e);
  }
}

function persistSession() {
  try {
    fs.writeFileSync(SESSION_FILE, JSON.stringify(sessionState, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write session file:', err);
  }
}

const app = express();
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Map WebSocket to playerId
const clientMap = new Map<WebSocket, { playerId?: string; isAdmin?: boolean }>();

function broadcast(msg: WebSocketServerMessage) {
  const serialized = JSON.stringify(msg);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(serialized);
    }
  }
}

function broadcastSession() {
  broadcast({
    type: 'session_state',
    payload: sessionState,
  });
}

// Timer management
let timerInterval: NodeJS.Timeout | null = null;

function startSessionTimer() {
  if (timerInterval) clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    if (sessionState.status === 'running') {
      if (sessionState.timeRemaining > 0) {
        sessionState.timeRemaining -= 1;
        // Broadcast every second
        broadcastSession();
        // Persist periodically every 15 seconds
        if (sessionState.timeRemaining % 15 === 0) {
          persistSession();
        }
      } else {
        sessionState.status = 'finished';
        persistSession();
        broadcastSession();
        broadcast({
          type: 'notification',
          payload: {
            message: 'Oturum süresi (15 dakika) tamamlandı! Tebrikler!',
            style: 'warning',
          },
        });
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = null;
      }
    }
  }, 1000);
}

function registerOrUpdatePlayer(playerId: string, name: string, avatar: string): Player {
  let player = sessionState.players.find((p) => p.id === playerId);
  if (!player) {
    player = {
      id: playerId,
      name: name || 'Geliştirici',
      avatar: avatar || '🐱',
      score: 0,
      strike: 0,
      maxStrike: 0,
      completedChallengeIds: [],
      currentChallengeIndex: 0,
      lastActiveAt: Date.now(),
      isOnline: true,
    };
    sessionState.players.push(player);
  } else {
    player.name = name || player.name;
    player.avatar = avatar || player.avatar;
    player.isOnline = true;
    player.lastActiveAt = Date.now();
  }

  persistSession();
  broadcastSession();
  return player;
}

interface CommandExecutionResult {
  success: boolean;
  playerId: string;
  challengeId: string;
  pointsEarned?: number;
  strike: number;
  message: string;
  visualAction?: any;
  completedAll?: boolean;
}

function executePlayerCommand(
  playerId: string,
  challengeId: string,
  command: string
): CommandExecutionResult | { error: string } {
  const player = sessionState.players.find((p) => p.id === playerId);
  if (!player) return { error: 'Oyuncu bulunamadı' };

  const challenge = challenges.find((c) => c.id === challengeId);
  if (!challenge) return { error: 'Görev bulunamadı' };

  const trimmedCmd = (command || '').trim();
  const regex = new RegExp(challenge.commandPattern, 'i');
  const isCorrect = regex.test(trimmedCmd);

  if (isCorrect) {
    const nextStrike = (player.strike || 0) + 1;
    player.strike = nextStrike;
    player.maxStrike = Math.max(player.maxStrike || 0, nextStrike);

    // Strike multiplier:
    // Strike 1: 1.0x, Strike 2: 1.5x, Strike 3: 2.0x, Strike 4: 2.5x, Strike 5+: 3.0x
    const multiplier =
      nextStrike === 1
        ? 1
        : nextStrike === 2
        ? 1.5
        : nextStrike === 3
        ? 2.0
        : nextStrike === 4
        ? 2.5
        : 3.0;

    const pointsEarned = Math.round(challenge.points * multiplier);
    player.score += pointsEarned;
    player.lastActiveAt = Date.now();

    if (!player.completedChallengeIds.includes(challengeId)) {
      player.completedChallengeIds.push(challengeId);
    }

    // Move to next challenge
    const activeIds = sessionState.activeChallengeIds;
    const currentFilteredIdx = activeIds.indexOf(challengeId);
    if (currentFilteredIdx !== -1 && currentFilteredIdx + 1 < activeIds.length) {
      player.currentChallengeIndex = currentFilteredIdx + 1;
    }

    const isAllCompleted = player.completedChallengeIds.length >= activeIds.length;

    // Broadcast strike event if streak >= 2
    if (nextStrike >= 2) {
      broadcast({
        type: 'strike_event',
        payload: {
          playerId: player.id,
          playerName: player.name,
          avatar: player.avatar,
          strike: nextStrike,
          pointsEarned,
          challengeTitle: challenge.title,
        },
      });
    }

    persistSession();
    broadcastSession();

    return {
      success: true,
      playerId: player.id,
      challengeId: challenge.id,
      pointsEarned,
      strike: nextStrike,
      message: `Harika! Komut başarıyla uygulandı (+${pointsEarned} Puan${
        nextStrike > 1 ? ` | ${nextStrike}x STRIKE!` : ''
      })`,
      visualAction: challenge.visualAction,
      completedAll: isAllCompleted,
    };
  } else {
    // Wrong command - strike resets!
    const previousStrike = player.strike || 0;
    player.strike = 0;
    player.lastActiveAt = Date.now();

    persistSession();
    broadcastSession();

    return {
      success: false,
      playerId: player.id,
      challengeId: challenge.id,
      strike: 0,
      message: `Hatalı komut! Doğru sözdizimini kontrol et. (İpucu: ${challenge.hint})${
        previousStrike > 1 ? ' — Strike sıfırlandı!' : ''
      }`,
    };
  }
}

// REST Endpoints
app.get('/api/session', (req, res) => {
  res.json(sessionState);
});

app.get('/api/challenges', (req, res) => {
  res.json(challenges);
});

app.post('/api/player/join', (req, res) => {
  const { playerId, name, avatar } = req.body;
  if (!playerId) {
    return res.status(400).json({ error: 'playerId gerekli' });
  }
  const player = registerOrUpdatePlayer(playerId, name, avatar);
  res.json({ success: true, player, sessionState });
});

app.post('/api/submit_command', (req, res) => {
  const { playerId, challengeId, command } = req.body;
  if (!playerId || !challengeId) {
    return res.status(400).json({ error: 'Eksik parametre' });
  }
  const result = executePlayerCommand(playerId, challengeId, command);
  res.json(result);
});

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === '1234') {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Geçersiz şifre!' });
  }
});

app.post('/api/admin/config', (req, res) => {
  const { password, activeChallengeIds, durationMinutes } = req.body;
  if (password !== '1234') {
    return res.status(401).json({ success: false, message: 'Yetkisiz erişim' });
  }

  if (Array.isArray(activeChallengeIds)) {
    sessionState.activeChallengeIds = activeChallengeIds;
  }
  if (typeof durationMinutes === 'number' && durationMinutes > 0) {
    sessionState.durationSeconds = durationMinutes * 60;
    if (sessionState.status === 'waiting') {
      sessionState.timeRemaining = sessionState.durationSeconds;
    }
  }
  persistSession();
  broadcastSession();
  res.json({ success: true, sessionState });
});

// WebSocket Handler
wss.on('connection', (ws: WebSocket) => {
  clientMap.set(ws, {});

  // Send initial session state immediately
  ws.send(JSON.stringify({ type: 'session_state', payload: sessionState }));

  ws.on('message', (dataRaw: string) => {
    try {
      const message: WebSocketClientMessage = JSON.parse(dataRaw.toString());
      const clientMeta = clientMap.get(ws) || {};

      switch (message.type) {
        case 'join': {
          const { playerId, name, avatar } = message.payload;
          clientMeta.playerId = playerId;
          clientMap.set(ws, clientMeta);
          registerOrUpdatePlayer(playerId, name, avatar);
          break;
        }

        case 'submit_command': {
          const { playerId, challengeId, command } = message.payload;
          const result = executePlayerCommand(playerId, challengeId, command);
          if ('error' in result) {
            ws.send(
              JSON.stringify({
                type: 'command_result',
                payload: {
                  playerId,
                  challengeId,
                  success: false,
                  strike: 0,
                  message: result.error,
                },
              })
            );
          } else {
            ws.send(
              JSON.stringify({
                type: 'command_result',
                payload: result,
              })
            );
          }
          break;
        }

        case 'admin_login': {
          const { password } = message.payload;
          if (password === '1234') {
            clientMeta.isAdmin = true;
            clientMap.set(ws, clientMeta);
            ws.send(
              JSON.stringify({
                type: 'admin_auth_result',
                payload: { success: true },
              })
            );
          } else {
            ws.send(
              JSON.stringify({
                type: 'admin_auth_result',
                payload: { success: false, message: 'Hatalı şifre!' },
              })
            );
          }
          break;
        }

        case 'admin_start': {
          if (!clientMeta.isAdmin) {
            // Also allow direct trigger if verified in session
            clientMeta.isAdmin = true;
          }
          const duration = message.payload?.durationMinutes
            ? message.payload.durationMinutes * 60
            : sessionState.durationSeconds || 900;

          sessionState.status = 'running';
          sessionState.durationSeconds = duration;
          sessionState.timeRemaining = duration;
          sessionState.startedAt = Date.now();
          sessionState.endsAt = Date.now() + duration * 1000;

          startSessionTimer();
          persistSession();
          broadcastSession();

          broadcast({
            type: 'notification',
            payload: {
              message: `Oyun başladı! ${Math.round(duration / 60)} dakikalık oturum başladı. Bol şans!`,
              style: 'success',
            },
          });
          break;
        }

        case 'admin_pause': {
          if (sessionState.status === 'running') {
            sessionState.status = 'paused';
          } else if (sessionState.status === 'paused') {
            sessionState.status = 'running';
          }
          persistSession();
          broadcastSession();
          break;
        }

        case 'admin_stop': {
          sessionState.status = 'finished';
          sessionState.timeRemaining = 0;
          if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
          }
          persistSession();
          broadcastSession();
          broadcast({
            type: 'notification',
            payload: {
              message: 'Oturum yönetici tarafından sonlandırıldı! Sonuçlar açıklandı.',
              style: 'warning',
            },
          });
          break;
        }

        case 'admin_reset': {
          sessionState.status = 'waiting';
          sessionState.timeRemaining = sessionState.durationSeconds;
          sessionState.startedAt = null;
          sessionState.endsAt = null;
          if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
          }
          persistSession();
          broadcastSession();
          broadcast({
            type: 'notification',
            payload: {
              message: 'Oyun admin tarafından sıfırlandı. Yeni oturum bekleniyor.',
              style: 'info',
            },
          });
          break;
        }

        case 'admin_set_challenges': {
          if (message.payload?.activeChallengeIds) {
            sessionState.activeChallengeIds = message.payload.activeChallengeIds;
            persistSession();
            broadcastSession();
          }
          break;
        }

        case 'admin_reset_scores': {
          sessionState.players.forEach((p) => {
            p.score = 0;
            p.strike = 0;
            p.maxStrike = 0;
            p.completedChallengeIds = [];
            p.currentChallengeIndex = 0;
          });
          persistSession();
          broadcastSession();
          broadcast({
            type: 'notification',
            payload: {
              message: 'Tüm skorlar ve kombolar sıfırlandı.',
              style: 'info',
            },
          });
          break;
        }

        case 'heartbeat': {
          const { playerId } = message.payload;
          const p = sessionState.players.find((pl) => pl.id === playerId);
          if (p) {
            p.isOnline = true;
            p.lastActiveAt = Date.now();
          }
          break;
        }
      }
    } catch (err) {
      console.error('Error handling ws message:', err);
    }
  });

  ws.on('close', () => {
    const meta = clientMap.get(ws);
    if (meta?.playerId) {
      const p = sessionState.players.find((pl) => pl.id === meta.playerId);
      if (p) {
        p.isOnline = false;
        persistSession();
        broadcastSession();
      }
    }
    clientMap.delete(ws);
  });
});

// Setup Vite or Static File Serving
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`GitMaster Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
