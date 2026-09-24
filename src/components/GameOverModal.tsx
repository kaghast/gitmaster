import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Flame, Award, RotateCcw, X, Sparkles } from 'lucide-react';
import type { Player } from '../types.ts';

interface GameOverModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  currentPlayerId?: string;
  onPlayAgain?: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  onClose,
  players,
  currentPlayerId,
  onPlayAgain,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Fire confetti burst!
      const end = Date.now() + 2.5 * 1000;
      const colors = ['#f59e0b', '#ef4444', '#10b981', '#6366f1'];

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const sorted = [...players].sort((a, b) => b.score - a.score);
  const myRank = sorted.findIndex((p) => p.id === currentPlayerId) + 1;
  const myData = sorted.find((p) => p.id === currentPlayerId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-amber-500/25">
          <Trophy className="w-8 h-8 text-white" />
        </div>

        <h2 className="text-2xl font-black text-slate-100">15 Dakikalık Oturum Tamamlandı!</h2>
        <p className="text-xs text-slate-400 mt-1">
          Git arenasında yarışan tüm geliştiricileri tebrik ederiz. İşte oturum şampiyonları!
        </p>

        {/* Podium (Top 3) */}
        <div className="flex items-end justify-center gap-3 my-6 pt-4">
          {/* 2nd Place */}
          {sorted[1] && (
            <div className="flex-1 flex flex-col items-center">
              <div className="text-2xl mb-1">{sorted[1].avatar}</div>
              <div className="text-xs font-bold text-slate-300 truncate max-w-[80px]">
                {sorted[1].name}
              </div>
              <div className="text-[11px] font-mono text-slate-400 font-extrabold">
                {sorted[1].score} P
              </div>
              <div className="w-full h-16 bg-slate-800 rounded-t-xl mt-2 border border-slate-700 flex items-center justify-center text-sm font-black text-slate-400">
                🥈 2.
              </div>
            </div>
          )}

          {/* 1st Place (Champion) */}
          {sorted[0] && (
            <div className="flex-1 flex flex-col items-center -mt-4">
              <div className="relative">
                <span className="text-3xl">{sorted[0].avatar}</span>
                <span className="absolute -top-3 -right-2 text-base">👑</span>
              </div>
              <div className="text-xs font-black text-amber-300 truncate max-w-[90px] mt-1">
                {sorted[0].name}
              </div>
              <div className="text-xs font-mono text-amber-400 font-black">
                {sorted[0].score} P
              </div>
              <div className="w-full h-24 bg-gradient-to-t from-amber-600/30 to-amber-500/20 rounded-t-xl mt-2 border-t-2 border-x border-amber-500/60 flex items-center justify-center text-base font-black text-amber-300 shadow-lg shadow-amber-500/20">
                🥇 1.
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {sorted[2] && (
            <div className="flex-1 flex flex-col items-center">
              <div className="text-2xl mb-1">{sorted[2].avatar}</div>
              <div className="text-xs font-bold text-slate-300 truncate max-w-[80px]">
                {sorted[2].name}
              </div>
              <div className="text-[11px] font-mono text-slate-400 font-extrabold">
                {sorted[2].score} P
              </div>
              <div className="w-full h-12 bg-slate-800/80 rounded-t-xl mt-2 border border-slate-700 flex items-center justify-center text-xs font-black text-amber-600">
                🥉 3.
              </div>
            </div>
          )}
        </div>

        {/* My Performance Card */}
        {myData && (
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 mb-5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5 text-left">
              <span className="text-2xl">{myData.avatar}</span>
              <div>
                <div className="font-bold text-slate-200">
                  Senin Başarın ({myData.name})
                </div>
                <div className="text-[11px] text-slate-400">
                  Genel Sıralama: <span className="font-black text-amber-400">#{myRank}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 font-mono">
              <div>
                <div className="text-[10px] text-slate-500">Skor</div>
                <div className="text-xs font-black text-amber-400">{myData.score} P</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500">Maks Strike</div>
                <div className="text-xs font-black text-orange-400">🔥 {myData.maxStrike}x</div>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-black shadow-lg shadow-orange-600/30 transition cursor-pointer"
        >
          Lider Tablosunu İncele
        </button>
      </div>
    </div>
  );
};
