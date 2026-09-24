import React, { useState } from 'react';
import {
  Shield,
  KeyRound,
  Play,
  Pause,
  RotateCcw,
  CheckSquare,
  Square,
  Clock,
  Users,
  CheckCircle2,
  X,
  Sliders,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import type { GitChallenge, SessionState } from '../types.ts';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: SessionState;
  allChallenges: GitChallenge[];
  isAdminAuthenticated: boolean;
  onLogin: (password: string) => void;
  onStartGame: (durationMinutes?: number) => void;
  onEndGame: () => void;
  onPauseGame: () => void;
  onResetGame: () => void;
  onSaveChallenges: (selectedIds: string[], durationMinutes: number) => void;
  onResetScores: () => void;
  loginError?: string;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  session,
  allChallenges,
  isAdminAuthenticated,
  onLogin,
  onStartGame,
  onEndGame,
  onPauseGame,
  onResetGame,
  onSaveChallenges,
  onResetScores,
  loginError,
}) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>(
    session.activeChallengeIds || allChallenges.map((c) => c.id)
  );
  const [durationMinutes, setDurationMinutes] = useState<number>(
    Math.round(session.durationSeconds / 60) || 15
  );
  const [activeTab, setActiveTab] = useState<'controls' | 'challenges' | 'players'>('controls');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(passwordInput);
  };

  const handleToggleChallenge = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds(allChallenges.map((c) => c.id));
  };

  const handleSelectBeginnerOnly = () => {
    setSelectedIds(allChallenges.filter((c) => c.level === 'Başlangıç').map((c) => c.id));
  };

  const handleSelectIntermediateAdvanced = () => {
    setSelectedIds(
      allChallenges.filter((c) => c.level === 'Orta' || c.level === 'İleri').map((c) => c.id)
    );
  };

  const handleSaveConfig = () => {
    onSaveChallenges(selectedIds, durationMinutes);
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Yönetici Paneli (Admin)
              {isAdminAuthenticated && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                  Giriş Yapıldı
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400">
              Oyun oturumunu başlat, 15 dakikalık süreyi yönet ve geçerli Git komutlarını belirle.
            </p>
          </div>
        </div>

        {/* Not Authenticated: Password Screen */}
        {!isAdminAuthenticated ? (
          <form onSubmit={handleLoginSubmit} className="py-6 space-y-4 max-w-sm mx-auto w-full">
            <div className="text-center mb-4">
              <KeyRound className="w-10 h-10 mx-auto text-amber-400 mb-2 stroke-1" />
              <p className="text-xs text-slate-300">
                Admin paneline erişmek için şifrenizi girin (Varsayılan: 1234)
              </p>
            </div>

            <div>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Admin Şifresi..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-4 py-2.5 text-sm text-center font-mono tracking-widest text-slate-100 outline-none"
                autoFocus
              />
              {loginError && (
                <p className="text-xs text-rose-400 mt-2 text-center">{loginError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shadow-lg shadow-amber-600/30 cursor-pointer"
            >
              Giriş Yap
            </button>
          </form>
        ) : (
          /* Authenticated Admin Controls */
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-3 text-xs font-bold">
              <button
                onClick={() => setActiveTab('controls')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeTab === 'controls'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Oturum Kontrolü
              </button>
              <button
                onClick={() => setActiveTab('challenges')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'challenges'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Geçerli Git Komutları</span>
                <span className="text-[10px] bg-slate-800 px-1.5 py-0.2 rounded-full text-slate-300">
                  {selectedIds.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('players')}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'players'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Katılımcılar</span>
                <span className="text-[10px] bg-slate-800 px-1.5 py-0.2 rounded-full text-slate-300">
                  {session.players.length}
                </span>
              </button>
            </div>

            {/* Tab 1: Session Controls */}
            {activeTab === 'controls' && (
              <div className="space-y-4 overflow-y-auto pr-1">
                {/* Status Card */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-semibold">
                      Mevcut Durum
                    </span>
                    <div className="text-lg font-black text-slate-100 mt-0.5">
                      {session.status === 'running'
                        ? '🟢 Oyun Devam Ediyor (Canlı)'
                        : session.status === 'paused'
                        ? '🟡 Oyun Duraklatıldı'
                        : session.status === 'finished'
                        ? '🏁 Oturum Tamamlandı'
                        : '⚪ Başlangıç Bekleniyor'}
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-xs text-slate-400">Kalan Süre</span>
                    <div className="text-lg font-bold text-amber-400">
                      {Math.floor(session.timeRemaining / 60)}:
                      {(session.timeRemaining % 60).toString().padStart(2, '0')}
                    </div>
                  </div>
                </div>

                {/* Duration Config */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Oyun Süresi (Varsayılan 15 Dakika)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {[5, 10, 15, 20, 30].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setDurationMinutes(mins)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                          durationMinutes === mins
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {mins} dk
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    onClick={() => onStartGame(durationMinutes)}
                    className="py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>{session.status === 'running' ? 'Yeniden Başlat' : 'Oyunu Başlat'} ({durationMinutes} Dk)</span>
                  </button>

                  <button
                    onClick={onEndGame}
                    disabled={session.status !== 'running' && session.status !== 'paused'}
                    className="py-3 px-4 rounded-xl bg-gradient-to-r from-rose-700 to-red-600 hover:from-rose-600 hover:to-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-black shadow-lg shadow-rose-700/20 flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Square className="w-4 h-4 fill-white" />
                    <span>Oyunu Bitir (Sonuçları Açıkla)</span>
                  </button>

                  <button
                    onClick={onPauseGame}
                    disabled={session.status === 'waiting' || session.status === 'finished'}
                    className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-bold border border-slate-700 flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Pause className="w-4 h-4" />
                    <span>
                      {session.status === 'paused' ? 'Devam Ettir' : 'Duraklat'}
                    </span>
                  </button>

                  <button
                    onClick={onResetGame}
                    className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold border border-slate-700 flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Oturumu Sıfırla</span>
                  </button>

                  <button
                    onClick={onResetScores}
                    className="sm:col-span-2 py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 text-xs font-bold border border-slate-700/80 hover:border-rose-500/40 flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Tüm Katılımcı Skorlarını Sıfırla</span>
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: Valid Challenges Selection */}
            {activeTab === 'challenges' && (
              <div className="flex-1 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      onClick={handleSelectAll}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 font-semibold cursor-pointer"
                    >
                      Tümünü Seç
                    </button>
                    <button
                      onClick={handleSelectBeginnerOnly}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-emerald-400 font-semibold cursor-pointer"
                    >
                      Sadece Başlangıç
                    </button>
                    <button
                      onClick={handleSelectIntermediateAdvanced}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-amber-400 font-semibold cursor-pointer"
                    >
                      Orta & İleri
                    </button>
                  </div>

                  <button
                    onClick={handleSaveConfig}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Kaydet & Uygula</span>
                  </button>
                </div>

                {saveSuccessMsg && (
                  <div className="p-2 mb-2 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs">
                    Aktif komut ayarları başarıyla oturuma uygulandı!
                  </div>
                )}

                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                  {allChallenges.map((challenge) => {
                    const isChecked = selectedIds.includes(challenge.id);
                    return (
                      <div
                        key={challenge.id}
                        onClick={() => handleToggleChallenge(challenge.id)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs transition cursor-pointer select-none ${
                          isChecked
                            ? 'bg-slate-950 border-amber-500/40 text-slate-200'
                            : 'bg-slate-950/40 border-slate-800/80 text-slate-500'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-amber-400 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-600 shrink-0" />
                          )}
                          <div>
                            <div className="font-bold">{challenge.title}</div>
                            <div className="font-mono text-[11px] text-slate-400">
                              {challenge.solution}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">
                            {challenge.category}
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                              challenge.level === 'Başlangıç'
                                ? 'text-emerald-400 bg-emerald-500/10'
                                : challenge.level === 'Orta'
                                ? 'text-amber-400 bg-amber-500/10'
                                : 'text-rose-400 bg-rose-500/10'
                            }`}
                          >
                            {challenge.level}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 3: Connected Players */}
            {activeTab === 'players' && (
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {session.players.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-xs">
                    Henüz odaya katılan oyuncu yok.
                  </div>
                ) : (
                  session.players.map((p, idx) => (
                    <div
                      key={p.id}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{p.avatar}</span>
                        <div>
                          <span className="font-bold text-slate-200">{p.name}</span>
                          <span className="text-[10px] text-slate-500 ml-2">
                            {p.isOnline ? '🟢 Online' : '⚪ Çevrimdışı'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 font-mono">
                        <span className="text-amber-400 font-bold">{p.score} P</span>
                        <span className="text-orange-400">🔥 {p.strike}x</span>
                        <span className="text-slate-400">
                          {p.completedChallengeIds?.length || 0} tamamlandı
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
