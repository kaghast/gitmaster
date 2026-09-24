export type DifficultyLevel = 'Başlangıç' | 'Orta' | 'İleri';

export interface VisualAction {
  type:
    | 'init'
    | 'status'
    | 'stage'
    | 'commit'
    | 'create_branch'
    | 'switch_branch'
    | 'create_and_switch_branch'
    | 'merge'
    | 'log'
    | 'remote_add'
    | 'push'
    | 'pull'
    | 'stash_save'
    | 'stash_pop'
    | 'diff'
    | 'unstage'
    | 'reset_soft'
    | 'tag'
    | 'delete_branch'
    | 'rebase';
  branch?: string;
  files?: string[];
  message?: string;
  sourceBranch?: string;
  targetBranch?: string;
  remote?: string;
  tag?: string;
  file?: string;
  base?: string;
}

export interface GitChallenge {
  id: string;
  category: string;
  level: DifficultyLevel;
  title: string;
  scenario: string;
  task: string;
  commandPattern: string;
  solution: string;
  hint: string;
  explanation: string;
  points: number;
  visualAction: VisualAction;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  score: number;
  strike: number;
  maxStrike: number;
  completedChallengeIds: string[];
  currentChallengeIndex: number;
  lastActiveAt: number;
  isOnline: boolean;
}

export type GameStatus = 'waiting' | 'running' | 'paused' | 'finished';

export interface SessionState {
  sessionId: string;
  status: GameStatus;
  durationSeconds: number;
  timeRemaining: number;
  startedAt: number | null;
  endsAt: number | null;
  activeChallengeIds: string[];
  players: Player[];
}

export interface TerminalEntry {
  id: string;
  type: 'command' | 'output' | 'error' | 'success' | 'info' | 'system';
  text: string;
  timestamp: string;
}

export interface CommitNode {
  id: string;
  hash: string;
  message: string;
  branch: string;
  parentHash?: string;
  author: string;
  tags?: string[];
  isMerge?: boolean;
}

export interface GitGraphState {
  isInitialized: boolean;
  activeBranch: string;
  branches: string[];
  headCommitId: string;
  stagedFiles: string[];
  workingFiles: string[];
  commits: CommitNode[];
  stashCount: number;
  remoteBranchHead?: string;
  tags: Record<string, string>; // tag -> commitId
}

export type WebSocketClientMessage =
  | { type: 'join'; payload: { playerId: string; name: string; avatar: string } }
  | { type: 'submit_command'; payload: { playerId: string; challengeId: string; command: string } }
  | { type: 'admin_login'; payload: { password: string } }
  | { type: 'admin_start'; payload: { durationMinutes?: number } }
  | { type: 'admin_pause' }
  | { type: 'admin_stop' }
  | { type: 'admin_reset' }
  | { type: 'admin_set_challenges'; payload: { activeChallengeIds: string[] } }
  | { type: 'admin_reset_scores' }
  | { type: 'heartbeat'; payload: { playerId: string } };

export type WebSocketServerMessage =
  | { type: 'session_state'; payload: SessionState }
  | {
      type: 'strike_event';
      payload: {
        playerId: string;
        playerName: string;
        avatar: string;
        strike: number;
        pointsEarned: number;
        challengeTitle: string;
      };
    }
  | {
      type: 'command_result';
      payload: {
        playerId: string;
        challengeId: string;
        success: boolean;
        pointsEarned?: number;
        strike?: number;
        message: string;
        visualAction?: VisualAction;
        completedAll?: boolean;
      };
    }
  | { type: 'admin_auth_result'; payload: { success: boolean; message?: string } }
  | { type: 'notification'; payload: { message: string; style: 'info' | 'success' | 'warning' } };
