import React, { useState, useRef, useEffect } from 'react';
import {
  Terminal as TerminalIcon,
  CornerDownLeft,
  Flame,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Trash2,
  Sparkles,
} from 'lucide-react';
import type { TerminalEntry } from '../types.ts';

interface TerminalConsoleProps {
  onExecuteCommand: (cmd: string) => void;
  entries: TerminalEntry[];
  activeBranch?: string;
  isGameRunning: boolean;
  onClear: () => void;
  strikeFeedback?: {
    strike: number;
    points: number;
    show: boolean;
  } | null;
  errorFeedback?: {
    show: boolean;
    message: string;
  } | null;
  currentHint?: string;
}

export const TerminalConsole: React.FC<TerminalConsoleProps> = ({
  onExecuteCommand,
  entries,
  activeBranch = 'main',
  isGameRunning,
  onClear,
  strikeFeedback,
  errorFeedback,
  currentHint,
}) => {
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom whenever new entries arrive
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries]);

  // Keep input focused
  const handleFocus = () => {
    inputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputVal.trim();
    if (!trimmed) return;

    if (trimmed.toLowerCase() === 'clear') {
      onClear();
      setInputVal('');
      return;
    }

    setHistory((prev) => [...prev, trimmed]);
    setHistoryIdx(-1);
    onExecuteCommand(trimmed);
    setInputVal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIdx = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
      setHistoryIdx(nextIdx);
      setInputVal(history[nextIdx]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx === -1) return;
      const nextIdx = historyIdx + 1;
      if (nextIdx >= history.length) {
        setHistoryIdx(-1);
        setInputVal('');
      } else {
        setHistoryIdx(nextIdx);
        setInputVal(history[nextIdx]);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Simple tab autocomplete for git
      if (inputVal === 'git a') setInputVal('git add .');
      else if (inputVal === 'git c') setInputVal('git commit -m ""');
      else if (inputVal === 'git s') setInputVal('git status');
      else if (inputVal === 'git b') setInputVal('git branch ');
      else if (inputVal === 'git m') setInputVal('git merge ');
      else if (inputVal === 'git p') setInputVal('git push');
    }
  };

  const quickCommands = [
    'git status',
    'git add .',
    'git commit -m ""',
    'git branch',
    'git checkout -b',
    'git merge',
    'git push',
    'git pull',
    'git log --oneline',
  ];

  return (
    <div
      onClick={handleFocus}
      className={`relative rounded-2xl bg-slate-950 border transition-all duration-300 shadow-2xl flex flex-col h-[480px] overflow-hidden ${
        strikeFeedback?.show
          ? 'border-emerald-500/80 ring-2 ring-emerald-500/40 shadow-emerald-500/20'
          : errorFeedback?.show
          ? 'border-rose-600 ring-2 ring-rose-500/50 shadow-rose-500/20 animate-shake'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Floating Animated STRIKE Banner Overlay */}
      {strikeFeedback?.show && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-bounce">
          <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white font-black px-6 py-2 rounded-full shadow-2xl shadow-orange-500/50 border border-amber-300 tracking-wider text-sm sm:text-base">
            <Flame className="w-5 h-5 fill-white text-white animate-pulse" />
            <span>
              {strikeFeedback.strike > 1 ? `${strikeFeedback.strike}x STRIKE!` : 'DOĞRU CEVAP!'}
            </span>
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-mono">
              +{strikeFeedback.points} XP
            </span>
            <Sparkles className="w-4 h-4 text-amber-200" />
          </div>
        </div>
      )}

      {/* Terminal Title Bar */}
      <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800/80 flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block border border-rose-600/50" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block border border-amber-600/50" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block border border-emerald-600/50" />
          </div>
          <div className="flex items-center gap-1.5 ml-3 text-xs font-mono text-slate-400">
            <TerminalIcon className="w-3.5 h-3.5 text-slate-400" />
            <span>gitmaster@terminal: ~/project ({activeBranch})</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentHint && (
            <span className="hidden sm:inline-block text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
              Sekme (Tab) ile otomatik tamamla
            </span>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
            title="Terminali Temizle"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Output Area */}
      <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-2 leading-relaxed selection:bg-orange-500/30">
        {entries.map((entry) => {
          if (entry.type === 'command') {
            return (
              <div key={entry.id} className="flex items-start gap-2 text-slate-300">
                <span className="text-emerald-400 font-bold select-none">$</span>
                <span className="font-bold text-amber-300">{entry.text}</span>
              </div>
            );
          }

          if (entry.type === 'success') {
            return (
              <div
                key={entry.id}
                className="flex items-start gap-2 text-emerald-400 bg-emerald-950/20 p-2 rounded-lg border border-emerald-500/20"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                <span className="whitespace-pre-wrap">{entry.text}</span>
              </div>
            );
          }

          if (entry.type === 'error') {
            return (
              <div
                key={entry.id}
                className="flex items-start gap-2 text-rose-400 bg-rose-950/25 p-2 rounded-lg border border-rose-500/30"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span className="whitespace-pre-wrap">{entry.text}</span>
              </div>
            );
          }

          if (entry.type === 'system') {
            return (
              <div
                key={entry.id}
                className="text-slate-400 border-l-2 border-orange-500/60 pl-2.5 py-1 my-1 italic text-[11px]"
              >
                {entry.text}
              </div>
            );
          }

          return (
            <div key={entry.id} className="text-slate-400 whitespace-pre-wrap pl-4">
              {entry.text}
            </div>
          );
        })}
        <div ref={terminalEndRef} />
      </div>

      {/* Quick Snippets Pill Bar */}
      <div className="px-3 py-1.5 bg-slate-900/60 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono">
        <span className="text-slate-500 text-[10px] uppercase tracking-wider shrink-0 font-sans mr-1">
          Hızlı:
        </span>
        {quickCommands.map((cmd) => (
          <button
            key={cmd}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setInputVal(cmd);
              inputRef.current?.focus();
            }}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition whitespace-nowrap cursor-pointer"
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* Terminal Input Line */}
      <form
        onSubmit={handleSubmit}
        className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
      >
        <div className="flex items-center gap-1.5 text-xs font-mono select-none">
          <span className="text-orange-400 font-bold">gitmaster</span>
          <span className="text-slate-500">:</span>
          <span className="text-cyan-400 font-semibold">~/project</span>
          <span className="text-slate-500">(</span>
          <span className="text-amber-300 font-bold">{activeBranch}</span>
          <span className="text-slate-500">)</span>
          <span className="text-emerald-400 font-black ml-0.5">$</span>
        </div>

        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isGameRunning
              ? 'Git komutunu buraya yaz ve Enter\'a bas... (Örn: git commit -m "feat: login")'
              : 'Oturum başladığında komut girebilirsin...'
          }
          disabled={!isGameRunning}
          autoFocus
          className="flex-1 bg-transparent border-none outline-none font-mono text-xs sm:text-sm text-slate-100 placeholder-slate-600 disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={!isGameRunning || !inputVal.trim()}
          className="p-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 disabled:opacity-30 text-white transition cursor-pointer"
          title="Komutu Çalıştır"
        >
          <CornerDownLeft className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
