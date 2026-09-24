import React, { useState } from 'react';
import {
  Sparkles,
  Flame,
  HelpCircle,
  BookOpen,
  Award,
  ChevronDown,
  ChevronUp,
  Target,
} from 'lucide-react';
import type { GitChallenge } from '../types.ts';

interface ChallengeCardProps {
  challenge: GitChallenge | null;
  currentIndex: number;
  totalCount: number;
  currentStrike: number;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge,
  currentIndex,
  totalCount,
  currentStrike,
}) => {
  const [showHint, setShowHint] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  if (!challenge) {
    return (
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 text-center text-slate-400">
        <Award className="w-12 h-12 mx-auto text-amber-400 mb-2" />
        <h3 className="text-base font-bold text-slate-200">Tüm Görevleri Tamamladın! 🎉</h3>
        <p className="text-xs text-slate-400 mt-1">
          Oturumdaki tüm aktif Git komutlarını başarıyla uyguladın. Skorunu koru ve liderliği kutla!
        </p>
      </div>
    );
  }

  // Strike multiplier calculation
  const multiplier =
    currentStrike <= 1
      ? 1
      : currentStrike === 2
      ? 1.5
      : currentStrike === 3
      ? 2.0
      : currentStrike === 4
      ? 2.5
      : 3.0;

  const potentialPoints = Math.round(challenge.points * multiplier);

  const levelColor =
    challenge.level === 'Başlangıç'
      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
      : challenge.level === 'Orta'
      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
      : 'bg-rose-500/10 text-rose-400 border-rose-500/30';

  return (
    <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-xl flex flex-col gap-3">
      {/* Top badges & progress */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
            Görev {currentIndex + 1} / {totalCount}
          </span>
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${levelColor}`}
          >
            {challenge.level}
          </span>
          <span className="text-[11px] font-semibold text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-md hidden sm:inline-block">
            {challenge.category}
          </span>
        </div>

        {/* Potential Reward & Strike Multiplier */}
        <div className="flex items-center gap-2">
          {currentStrike > 1 && (
            <div className="flex items-center gap-1 text-xs font-black text-orange-400 bg-orange-500/10 px-2 py-1 rounded-lg border border-orange-500/30 animate-pulse">
              <Flame className="w-3.5 h-3.5 fill-orange-400" />
              <span>{currentStrike}x STRIKE ({multiplier}x Çarpan)</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-xs font-mono font-extrabold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>+{potentialPoints} XP</span>
          </div>
        </div>
      </div>

      {/* Title & Scenario */}
      <div>
        <h2 className="text-base sm:text-lg font-black text-slate-100 flex items-center gap-2">
          <Target className="w-4 h-4 text-orange-400" />
          {challenge.title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
          {challenge.scenario}
        </p>
      </div>

      {/* Task highlight box */}
      <div className="p-3 rounded-xl bg-orange-950/20 border border-orange-500/30 text-xs sm:text-sm font-semibold text-orange-200 flex items-start gap-2">
        <span className="text-orange-400 font-bold select-none shrink-0">🎯 Görev:</span>
        <span className="leading-snug">{challenge.task}</span>
      </div>

      {/* Collapsible Hint & Explanation buttons */}
      <div className="flex items-center gap-3 pt-1 text-xs border-t border-slate-800/80">
        <button
          type="button"
          onClick={() => setShowHint(!showHint)}
          className="flex items-center gap-1.5 text-amber-400/90 hover:text-amber-300 transition cursor-pointer font-medium"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{showHint ? 'İpucunu Gizle' : 'İpucu Göster'}</span>
          {showHint ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        <button
          type="button"
          onClick={() => setShowExplanation(!showExplanation)}
          className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition cursor-pointer font-medium"
        >
          <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
          <span>{showExplanation ? 'Açıklamayı Gizle' : 'Git Notu & Mantık'}</span>
          {showExplanation ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Hint drawer */}
      {showHint && (
        <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200 animate-fadeIn">
          <span className="font-bold text-amber-400">İpucu: </span>
          {challenge.hint}
        </div>
      )}

      {/* Explanation drawer */}
      {showExplanation && (
        <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-200 animate-fadeIn">
          <span className="font-bold text-cyan-400">Git Mekanizması: </span>
          {challenge.explanation}
        </div>
      )}
    </div>
  );
};
