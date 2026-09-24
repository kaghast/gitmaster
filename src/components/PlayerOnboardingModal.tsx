import React, { useState } from 'react';
import { User, Sparkles, Shuffle, Check } from 'lucide-react';

interface PlayerOnboardingModalProps {
  isOpen: boolean;
  initialName?: string;
  initialAvatar?: string;
  onSave: (name: string, avatar: string) => void;
  onClose?: () => void;
  isInitial?: boolean;
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
];

export const PlayerOnboardingModal: React.FC<PlayerOnboardingModalProps> = ({
  isOpen,
  initialName = '',
  initialAvatar = '🐱',
  onSave,
  onClose,
  isInitial = false,
}) => {
  const [name, setName] = useState(initialName || '');
  const [selectedAvatar, setSelectedAvatar] = useState(initialAvatar);

  if (!isOpen) return null;

  const handleRandomizeName = () => {
    const random = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
    const num = Math.floor(Math.random() * 900 + 100);
    setName(`${random}${num}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim() || 'GitGeliştirici';
    onSave(finalName, selectedAvatar);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-orange-500/20 text-2xl">
            {selectedAvatar}
          </div>
          <h2 className="text-xl font-black text-slate-100">
            {isInitial ? 'GitMaster Live\'a Hoş Geldin!' : 'Profilini Düzenle'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Oyuna katılmak için takma adını ve geliştirici avatarını seç.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Selector */}
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
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition cursor-pointer ${
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
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Örn: GitNinja42"
                maxLength={24}
                required
                className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none font-mono"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-2">
            {!isInitial && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-xs font-bold text-slate-400 hover:text-slate-200 transition cursor-pointer"
              >
                Vazgeç
              </button>
            )}
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-extrabold shadow-lg shadow-orange-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isInitial ? 'Oyuna Katıl' : 'Kaydet'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
