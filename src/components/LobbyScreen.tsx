import React, { useState } from 'react';
import {
  Users,
  Sparkles,
  Shuffle,
  Clock,
  Radio,
  CheckCircle,
  Volume2,
  VolumeX,
} from 'lucide-react';
import type { Player, SessionState } from '../types.ts';

interface LobbyScreenProps {
  currentPlayer: Player | null;
  session: SessionState;
  onJoin: (name: string, avatar: string) => void;
  onUpdateProfile: (name: string, avatar: string) => void;
  onShowHelp?: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

const AVATARS = [
  { id: 'octo', emoji: '🐱', label: 'Octocat' },
  { id: 'ninja', emoji: '🥷', label: 'Code Ninja' },
  { id: 'bot', emoji: '🤖', label: 'GitBot' },
  { id: 'wizard', emoji: '🧙‍♂️', label: 'Git Wizard' },
  { id: 'rocket', emoji: '🚀', label: 'Rocket Dev' },
  { id: 'terminal', emoji: '💻', label: 'Terminal Hacker' },
  { id: 'spark', emoji: '⚡', label: 'Tech Spark' },
  { id: 'fox', emoji: '🦊', label: 'Git Fox' },
];

const RANDOM_NAMES = [
  'GitNinja',
  'CommitUstası',
  'BranchMaster',
  'RebaseKahramanı',
  'MergeKrallığı',
  'TerminalLordu',
  'PushUstası',
  'OctoCoder',
  'DevKemal',
  'GitGurusu',
  'StashMaster',
  'CherryPicker',
];

export const LobbyScreen: React.FC<LobbyScreenProps> = ({
  currentPlayer,
  session,
  onJoin,
  onUpdateProfile,
  onShowHelp,
  isMuted,
  onToggleMute,
}) => {
  const hasJoined = Boolean(currentPlayer && currentPlayer.name);
  const [name, setName] = useState(currentPlayer?.name || '');
  const [selectedAvatar, setSelectedAvatar] = useState(currentPlayer?.avatar || '🐱');
  const [isEditing, setIsEditing] = useState(false);

  const handleRandomizeName = () => {
    const random = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
    const num = Math.floor(Math.random() * 900 + 100);
    setName(`${random}${num}`);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim() || 'GitGeliştirici';
    if (!hasJoined) {
      onJoin(finalName, selectedAvatar);
    } else {
      onUpdateProfile(finalName, selectedAvatar);
      setIsEditing(false);
    }
  };

  const onlinePlayers = session.players || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-orange-500/30 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="w-10" />

        <h1 className="text-lg sm:text-xl font-black tracking-tight text-center bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
          GitMaster Live
        </h1>

        <div className="flex items-center gap-2 sm:gap-3 w-10 justify-end">
          <button
            onClick={onToggleMute}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
            title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Lobby Main Grid */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Player Card / Setup Form (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
            {hasJoined && !isEditing ? (
              /* Already Joined Lobby Card */
              <div className="space-y-6 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Lobiye Başarıyla Katıldın</span>
                </div>

                <div className="relative mx-auto w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border-2 border-orange-500/40 flex items-center justify-center text-5xl shadow-xl shadow-orange-500/10">
                  {currentPlayer?.avatar}
                  <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-lg bg-orange-500 text-[10px] font-black text-white shadow">
                    HAZIR
                  </span>
                </div>

                <div>
                  <h2 className="text-xl font-black text-slate-100">{currentPlayer?.name}</h2>
                  <p className="text-xs font-mono text-slate-400 mt-1">ID: {currentPlayer?.id}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-left space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                    <Radio className="w-4 h-4 text-orange-400 animate-pulse" />
                    <span>Oturumun Başlaması Bekleniyor</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Yönetici oturumu başlattığı anda oyun ekranına otomatik olarak aktarılacaksın.
                    Hazırlıklı ol, ilk görev hemen terminal ekranında açılacak!
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setName(currentPlayer?.name || '');
                    setSelectedAvatar(currentPlayer?.avatar || '🐱');
                    setIsEditing(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 transition cursor-pointer"
                >
                  Profilimi / Avatarımı Değiştir
                </button>
              </div>
            ) : (
              /* Profile Setup & Join Form */
              <div>
                <div className="text-center mb-5">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-orange-500/20 text-3xl">
                    {selectedAvatar}
                  </div>
                  <h2 className="text-xl font-black text-slate-100">
                    {hasJoined ? 'Profilini Güncelle' : 'Lobiye Katıl'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Arenaya girmeden önce takma adını ve geliştirici avatarını belirle.
                  </p>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-4">
                  {/* Avatar Picker */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2">
                      Avatarını Seç
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {AVATARS.map((av) => {
                        const isSelected = selectedAvatar === av.emoji;
                        return (
                          <button
                            key={av.id}
                            type="button"
                            onClick={() => setSelectedAvatar(av.emoji)}
                            className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition cursor-pointer ${
                              isSelected
                                ? 'bg-orange-500/20 border-orange-500 ring-2 ring-orange-500/40 text-white'
                                : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                            }`}
                          >
                            <span className="text-2xl">{av.emoji}</span>
                            <span className="text-[10px] text-slate-400 truncate max-w-full">
                              {av.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Nickname Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-300">
                        Geliştirici Takma Adı
                      </label>
                      <button
                        type="button"
                        onClick={handleRandomizeName}
                        className="text-[11px] text-orange-400 hover:text-orange-300 flex items-center gap-1 transition cursor-pointer"
                      >
                        <Shuffle className="w-3 h-3" />
                        <span>Rastgele İsim</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Örn: GitMaster42"
                      maxLength={24}
                      required
                      className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none font-mono"
                    />
                  </div>

                  <div className="pt-2 flex gap-2">
                    {hasJoined && (
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
                      >
                        İptal
                      </button>
                    )}
                    <button
                      type="submit"
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black text-xs shadow-lg shadow-orange-600/30 transition cursor-pointer"
                    >
                      {hasJoined ? 'Kaydet & Lobiye Dön' : 'Lobiye Katıl & Hazırım'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Right Column: Lobby Participants & Rules / Status (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Live Waiting Status Banner */}
            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-100 text-sm sm:text-base">
                    Yarışma Oturumu Bekleniyor
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Yönetici oturumu başlattığı anda oyun ekranına geçiş yapılacaktır.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center px-3.5 py-1.5 rounded-full bg-slate-950 border border-slate-800 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-slate-300 font-bold">
                  {onlinePlayers.length} Katılımcı Lobide
                </span>
              </div>
            </div>

            {/* Online Players Grid in Lobby */}
            <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <Users className="w-4 h-4 text-orange-400" />
                  <span>Lobideki Katılımcılar ({onlinePlayers.length})</span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">Canlı Senkronize</span>
              </div>

              {onlinePlayers.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500">
                  Henüz başka katılımcı bulunmuyor. İlk sen katıldın!
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-80 overflow-y-auto pr-1">
                  {onlinePlayers.map((player) => {
                    const isMe = player.id === currentPlayer?.id;
                    return (
                      <div
                        key={player.id}
                        className={`p-2.5 rounded-2xl border flex items-center gap-2.5 transition ${
                          isMe
                            ? 'bg-orange-500/10 border-orange-500/40 ring-1 ring-orange-500/30'
                            : 'bg-slate-950 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-2xl">{player.avatar}</span>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-slate-200 truncate flex items-center gap-1">
                            <span>{player.name}</span>
                            {isMe && (
                              <span className="text-[9px] px-1 rounded bg-orange-500 text-white font-extrabold">
                                SEN
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span>Hazır</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
