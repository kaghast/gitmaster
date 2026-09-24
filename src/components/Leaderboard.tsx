import React from 'react';
import {
  Trophy,
  Flame,
  Medal,
  Users,
  Zap,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import type { Player } from '../types.ts';

interface LeaderboardProps {
  players: Player[];
  currentPlayerId?: string;
  totalChallengesCount: number;
  recentStrikes?: Array<{
    id: string;
    playerName: string;
    avatar: string;
    strike: number;
    pointsEarned: number;
    timestamp: number;
  }>;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  players,
  currentPlayerId,
  totalChallengesCount,
  recentStrikes = [],
}) => {
  // Sort players by score descending, then by completed challenges descending
  const sortedPlayers = [...players].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return (b.completedChallengeIds?.length || 0) - (a.completedChallengeIds?.length || 0);
  });

  return (
    <aside className="w-full lg:w-80 shrink-0 bg-slate-950/80 backdrop-blur-md border-l border-slate-800/80 flex flex-col h-full overflow-hidden">
      {/* Leaderboard Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              Canlı Sıralama
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h2>
            <p className="text-[11px] text-slate-400">
              {players.length} Katılımcı Yarışıyor
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-md">
          <Users className="w-3 h-3" />
          <span>{players.filter((p) => p.isOnline).length} Online</span>
        </div>
      </div>

      {/* Players List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {sortedPlayers.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
            <Users className="w-8 h-8 stroke-1 text-slate-600" />
            <span>Henüz katılımcı bulunmuyor.</span>
            <span className="text-[10px] text-slate-600">
              Sol taraftan takma ad ve avatarını seçerek ilk sen katıl!
            </span>
          </div>
        ) : (
          sortedPlayers.map((player, index) => {
            const isMe = player.id === currentPlayerId;
            const rank = index + 1;

            let rankBadge = (
              <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-xs font-mono font-bold">
                {rank}
              </span>
            );

            if (rank === 1) {
              rankBadge = (
                <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center text-xs font-bold shadow-sm shadow-amber-500/30">
                  🥇
                </div>
              );
            } else if (rank === 2) {
              rankBadge = (
                <div className="w-6 h-6 rounded-full bg-slate-400/20 text-slate-200 border border-slate-400/40 flex items-center justify-center text-xs font-bold">
                  🥈
                </div>
              );
            } else if (rank === 3) {
              rankBadge = (
                <div className="w-6 h-6 rounded-full bg-amber-700/20 text-amber-500 border border-amber-700/40 flex items-center justify-center text-xs font-bold">
                  🥉
                </div>
              );
            }

            return (
              <div
                key={player.id}
                className={`relative rounded-xl p-2.5 transition-all border ${
                  isMe
                    ? 'bg-gradient-to-r from-orange-950/40 via-amber-950/20 to-slate-900 border-orange-500/40 ring-1 ring-orange-500/30'
                    : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {rankBadge}

                  <div className="relative text-xl shrink-0 leading-none">
                    <span>{player.avatar}</span>
                    {player.isOnline && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`text-xs font-bold truncate ${
                          isMe ? 'text-amber-300' : 'text-slate-200'
                        }`}
                      >
                        {player.name} {isMe && <span className="text-[10px] text-orange-400">(Sen)</span>}
                      </span>
                      <span className="font-mono text-xs font-extrabold text-amber-400 shrink-0">
                        {player.score.toLocaleString()} P
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 text-[10px] text-slate-400">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        {player.completedChallengeIds?.length || 0} / {totalChallengesCount}
                      </span>

                      {player.strike > 1 ? (
                        <span className="flex items-center gap-0.5 font-extrabold text-orange-400 bg-orange-500/10 px-1.5 py-0.2 rounded-full border border-orange-500/30 animate-pulse">
                          <Flame className="w-3 h-3 fill-orange-500 text-orange-500" />
                          {player.strike}x STRIKE
                        </span>
                      ) : player.maxStrike > 2 ? (
                        <span className="text-[10px] text-slate-500">
                          Maks: {player.maxStrike}x
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Live Strike Ticker / Feed */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/40">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-orange-400 uppercase tracking-wider mb-2">
          <Zap className="w-3.5 h-3.5 fill-orange-400" />
          <span>Canlı Strike Bildirimleri</span>
        </div>
        <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
          {recentStrikes.length === 0 ? (
            <p className="text-[11px] text-slate-500 italic">
              Peş peşe doğru komut girildiğinde strike patlamaları burada görünecek! 🔥
            </p>
          ) : (
            recentStrikes.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 p-1.5 rounded-lg bg-orange-950/30 border border-orange-500/20 text-[11px] animate-fadeIn"
              >
                <span>{item.avatar}</span>
                <div className="flex-1 truncate">
                  <span className="font-bold text-slate-200">{item.playerName}</span>
                  <span className="text-orange-400 ml-1 font-extrabold">
                    {item.strike}x STRIKE! (+{item.pointsEarned}P)
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
};
