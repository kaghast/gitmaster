import React from 'react';
import {
  Terminal,
  Clock,
  Flame,
  Volume2,
  VolumeX,
  Shield,
  Trophy,
  GitBranch,
  HelpCircle,
  Play,
  RotateCcw,
} from 'lucide-react';
import type { SessionState, Player } from '../types.ts';
import { soundManager } from '../utils/audio.ts';

interface NavbarProps {
  session: SessionState;
  currentPlayer: Player | null;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenOnboarding: () => void;
  onShowHelp: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  session,
  currentPlayer,
  isMuted,
  onToggleMute,
  onOpenOnboarding,
  onShowHelp,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isLowTime = session.status === 'running' && session.timeRemaining < 120;

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Brand / Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-600 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/20 ring-1 ring-orange-400/30">
            <GitBranch className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg tracking-tight bg-gradient-to-r from-amber-400 via-orange-300 to-rose-400 bg-clip-text text-transparent">
                GitMaster Live
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/30">
                Çok Oyunculu
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              15 Dakikalık Canlı İnteraktif Git Arenası
            </p>
          </div>
        </div>

        {/* Center: Session Timer & Status (Only shown once session is started or running/finished) */}
        {session.status !== 'waiting' ? (
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2.5 px-4 py-1.5 rounded-xl border transition-all ${
                session.status === 'running'
                  ? isLowTime
                    ? 'bg-red-950/60 border-red-500/60 shadow-lg shadow-red-500/20 animate-pulse'
                    : 'bg-slate-900 border-orange-500/30 shadow-md shadow-orange-500/10'
                  : session.status === 'finished'
                  ? 'bg-amber-950/40 border-amber-500/40'
                  : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              <Clock
                className={`w-4 h-4 ${
                  session.status === 'running'
                    ? isLowTime
                      ? 'text-red-400 animate-spin'
                      : 'text-orange-400'
                    : 'text-slate-400'
                }`}
              />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 leading-none">
                  {session.status === 'running'
                    ? 'Kalan Süre'
                    : session.status === 'finished'
                    ? 'Süre Doldu'
                    : session.status === 'paused'
                    ? 'Duraklatıldı'
                    : 'Oturum Bekleniyor'}
                </span>
                <span
                  className={`font-mono text-base font-extrabold tracking-wider leading-tight ${
                    session.status === 'running'
                      ? isLowTime
                        ? 'text-red-400'
                        : 'text-amber-300'
                      : 'text-slate-300'
                  }`}
                >
                  {formatTime(session.timeRemaining)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/70 border border-slate-800 text-[11px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Oturum Henüz Başlatılmadı</span>
          </div>
        )}

        {/* Right: Player Profile & Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Current Player badge */}
          {currentPlayer ? (
            <button
              onClick={onOpenOnboarding}
              className="flex items-center gap-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-1.5 transition text-left cursor-pointer"
              title="Profilini düzenle"
            >
              <div className="text-xl leading-none">{currentPlayer.avatar}</div>
              <div className="hidden sm:block">
                <div className="text-xs font-bold text-slate-200 truncate max-w-[90px]">
                  {currentPlayer.name}
                </div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="text-amber-400 font-bold">{currentPlayer.score} XP</span>
                  {currentPlayer.strike > 1 && (
                    <span className="text-orange-400 font-extrabold flex items-center gap-0.5 animate-bounce">
                      <Flame className="w-3 h-3 fill-orange-500" />
                      {currentPlayer.strike}x
                    </span>
                  )}
                </div>
              </div>
            </button>
          ) : (
            <button
              onClick={onOpenOnboarding}
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-orange-600 hover:bg-orange-500 text-white shadow-md shadow-orange-600/30 transition cursor-pointer"
            >
              Giriş Yap
            </button>
          )}

          {/* Mute toggle */}
          <button
            onClick={onToggleMute}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition cursor-pointer"
            title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Help Button */}
          <button
            onClick={onShowHelp}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition cursor-pointer"
            title="Oyun Rehberi & Kurallar"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
