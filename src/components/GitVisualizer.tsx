import React, { useEffect, useState } from 'react';
import {
  GitBranch,
  GitCommit,
  ArrowRight,
  FolderGit2,
  HardDrive,
  Cloud,
  FileCode2,
  Archive,
  Layers,
  Sparkles,
  GitMerge,
  Tag,
  CheckCircle,
} from 'lucide-react';
import type { VisualAction, GitGraphState, CommitNode } from '../types.ts';

interface GitVisualizerProps {
  lastAction?: VisualAction | null;
  activeBranch?: string;
}

const INITIAL_COMMITS: CommitNode[] = [
  {
    id: 'c1',
    hash: 'a1b2c3d',
    message: 'init: project setup',
    branch: 'main',
    author: '🐱',
  },
];

export const GitVisualizer: React.FC<GitVisualizerProps> = ({
  lastAction,
  activeBranch = 'main',
}) => {
  const [graphState, setGraphState] = useState<GitGraphState>({
    isInitialized: true,
    activeBranch: 'main',
    branches: ['main'],
    headCommitId: 'c1',
    stagedFiles: [],
    workingFiles: ['index.html', 'style.css'],
    commits: INITIAL_COMMITS,
    stashCount: 0,
    remoteBranchHead: 'c1',
    tags: {},
  });

  const [animatingZone, setAnimatingZone] = useState<string | null>(null);
  const [activeMessage, setActiveMessage] = useState<string>('Git çalışma mekanizması hazır.');

  // React to visual actions triggered by correct commands
  useEffect(() => {
    if (!lastAction) return;

    switch (lastAction.type) {
      case 'init': {
        setGraphState((prev) => ({
          ...prev,
          isInitialized: true,
          activeBranch: 'main',
          branches: ['main'],
        }));
        setAnimatingZone('local');
        setActiveMessage('Yeni Git deposu başlatıldı: .git klasörü oluşturuldu.');
        break;
      }

      case 'stage': {
        const filesToAdd = lastAction.files || ['index.html', 'style.css'];
        setGraphState((prev) => ({
          ...prev,
          stagedFiles: Array.from(new Set([...prev.stagedFiles, ...filesToAdd])),
          workingFiles: prev.workingFiles.filter((f) => !filesToAdd.includes(f)),
        }));
        setAnimatingZone('staging');
        setActiveMessage('Değişiklikler Hazırlık Alanına (Staging / Index) taşındı.');
        break;
      }

      case 'commit': {
        const newCommitId = `c${Date.now().toString().slice(-4)}`;
        const shortHash = Math.random().toString(36).substring(2, 9);
        const branch = lastAction.branch || graphState.activeBranch;
        const msg = lastAction.message || 'feat: update';

        const newCommit: CommitNode = {
          id: newCommitId,
          hash: shortHash,
          message: msg,
          branch,
          parentHash: graphState.headCommitId,
          author: '⚡',
        };

        setGraphState((prev) => ({
          ...prev,
          commits: [...prev.commits, newCommit],
          headCommitId: newCommitId,
          stagedFiles: [],
          workingFiles: ['app.tsx', 'api.ts'],
        }));
        setAnimatingZone('local');
        setActiveMessage(`Yeni Commit oluşturuldu: [${shortHash}] "${msg}"`);
        break;
      }

      case 'create_branch': {
        const br = lastAction.branch || 'feature';
        setGraphState((prev) => ({
          ...prev,
          branches: Array.from(new Set([...prev.branches, br])),
        }));
        setAnimatingZone('branches');
        setActiveMessage(`Yeni dal açıldı: '${br}'`);
        break;
      }

      case 'switch_branch': {
        const br = lastAction.branch || 'main';
        setGraphState((prev) => ({
          ...prev,
          activeBranch: br,
        }));
        setAnimatingZone('branches');
        setActiveMessage(`HEAD işaretçisi '${br}' dalına geçti.`);
        break;
      }

      case 'create_and_switch_branch': {
        const br = lastAction.branch || 'feature';
        setGraphState((prev) => ({
          ...prev,
          branches: Array.from(new Set([...prev.branches, br])),
          activeBranch: br,
        }));
        setAnimatingZone('branches');
        setActiveMessage(`'${br}' dalı oluşturuldu ve anında geçiş yapıldı.`);
        break;
      }

      case 'merge': {
        const source = lastAction.sourceBranch || 'feature-cart';
        const target = lastAction.targetBranch || 'main';
        const mergeCommitId = `m${Date.now().toString().slice(-4)}`;
        const shortHash = Math.random().toString(36).substring(2, 9);

        const mergeCommit: CommitNode = {
          id: mergeCommitId,
          hash: shortHash,
          message: `Merge branch '${source}' into ${target}`,
          branch: target,
          author: '🔀',
          isMerge: true,
        };

        setGraphState((prev) => ({
          ...prev,
          commits: [...prev.commits, mergeCommit],
          headCommitId: mergeCommitId,
        }));
        setAnimatingZone('local');
        setActiveMessage(`'${source}' dalı '${target}' dalına başarıyla birleştirildi!`);
        break;
      }

      case 'push': {
        setGraphState((prev) => ({
          ...prev,
          remoteBranchHead: prev.headCommitId,
        }));
        setAnimatingZone('remote');
        setActiveMessage("Commit'ler uzak depodaki 'origin/main' dalına başarıyla gönderildi (push).");
        break;
      }

      case 'pull': {
        setAnimatingZone('remote');
        setActiveMessage('Uzak depodaki en son değişiklikler çekildi (fetch + merge).');
        break;
      }

      case 'stash_save': {
        setGraphState((prev) => ({
          ...prev,
          stashCount: prev.stashCount + 1,
          stagedFiles: [],
          workingFiles: [],
        }));
        setAnimatingZone('stash');
        setActiveMessage('Çalışma alanındaki değişiklikler Zula (stash) yığınına saklandı.');
        break;
      }

      case 'stash_pop': {
        setGraphState((prev) => ({
          ...prev,
          stashCount: Math.max(0, prev.stashCount - 1),
          workingFiles: ['cart.ts', 'styles.css'],
        }));
        setAnimatingZone('stash');
        setActiveMessage('Zulalanan son değişiklikler çalışma alanına geri yüklendi (stash pop).');
        break;
      }

      case 'unstage': {
        const file = lastAction.file || 'secret.key';
        setGraphState((prev) => ({
          ...prev,
          stagedFiles: prev.stagedFiles.filter((f) => f !== file),
          workingFiles: [...prev.workingFiles, file],
        }));
        setAnimatingZone('staging');
        setActiveMessage(`'${file}' hazırlık alanından geri çıkarıldı (unstage yapıldı).`);
        break;
      }

      case 'reset_soft': {
        // Soft reset moves HEAD back but preserves staged changes
        setGraphState((prev) => {
          if (prev.commits.length <= 1) return prev;
          const newCommits = [...prev.commits];
          const popped = newCommits.pop();
          return {
            ...prev,
            commits: newCommits,
            headCommitId: newCommits[newCommits.length - 1].id,
            stagedFiles: ['login.component.ts', 'auth.service.ts'],
          };
        });
        setAnimatingZone('local');
        setActiveMessage('Son commit geri alındı, dosyalar hazırlık alanında korundu (soft reset).');
        break;
      }

      case 'tag': {
        const tagName = lastAction.tag || 'v1.0.0';
        setGraphState((prev) => ({
          ...prev,
          tags: { ...prev.tags, [tagName]: prev.headCommitId },
        }));
        setAnimatingZone('local');
        setActiveMessage(`Mevcut commit noktasına '${tagName}' sürüm etiketi konuldu.`);
        break;
      }

      case 'delete_branch': {
        const br = lastAction.branch || 'feature-login';
        setGraphState((prev) => ({
          ...prev,
          branches: prev.branches.filter((b) => b !== br),
        }));
        setAnimatingZone('branches');
        setActiveMessage(`Tamamlanan '${br}' dalı yerelden silindi.`);
        break;
      }

      case 'rebase': {
        setAnimatingZone('local');
        setActiveMessage("Özellik dalı doğrusal geçmiş için 'main' üzerine rebase edildi.");
        break;
      }

      default:
        break;
    }

    const timer = setTimeout(() => {
      setAnimatingZone(null);
    }, 2400);

    return () => clearTimeout(timer);
  }, [lastAction]);

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 shadow-xl flex flex-col gap-3">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <FolderGit2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
              Git Mimari Görselleştirici (DAG & Durum Ağacı)
              {animatingZone && (
                <span className="text-[10px] font-mono text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full border border-orange-500/20 flex items-center gap-1 animate-pulse">
                  <Sparkles className="w-3 h-3" /> Canlı Animasyon
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-400">
              Komutların Git yaşam döngüsündeki hareketini canlı izle
            </p>
          </div>
        </div>

        {/* Branch / HEAD indicator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300">
            <GitBranch className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-slate-400">Aktif Dal:</span>
            <span className="text-amber-400 font-bold">{graphState.activeBranch}</span>
          </div>
          {graphState.stashCount > 0 && (
            <div className="flex items-center gap-1 text-[11px] font-mono bg-indigo-950/40 border border-indigo-500/30 px-2 py-1 rounded-lg text-indigo-300">
              <Archive className="w-3.5 h-3.5" />
              <span>Zula ({graphState.stashCount})</span>
            </div>
          )}
        </div>
      </div>

      {/* 4 Git Lifecycle Columns */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Zone 1: Working Directory */}
        <div
          className={`p-3 rounded-xl border transition-all duration-300 flex flex-col justify-between min-h-[140px] ${
            animatingZone === 'working'
              ? 'bg-amber-950/30 border-amber-500/50 shadow-lg shadow-amber-500/10'
              : 'bg-slate-950/60 border-slate-800/80'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <FileCode2 className="w-3.5 h-3.5 text-amber-400" />
                Çalışma Alanı (Working)
              </span>
              <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                {graphState.workingFiles.length} dosya
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mb-2">
              Düzenlenen ama henüz stajlanmamış dosyalar
            </p>

            <div className="space-y-1">
              {graphState.workingFiles.length === 0 ? (
                <div className="text-[11px] text-slate-600 italic py-2">
                  Çalışma alanı temiz (Clean)
                </div>
              ) : (
                graphState.workingFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-[11px] font-mono bg-slate-900 px-2 py-1 rounded border border-slate-800 text-rose-400"
                  >
                    <span>{file}</span>
                    <span className="text-[9px] text-rose-400/80 font-sans">değiştirildi</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-2 text-[10px] font-mono text-slate-500 flex items-center gap-1">
            <span>git add .</span>
            <ArrowRight className="w-3 h-3 text-orange-400" />
          </div>
        </div>

        {/* Zone 2: Staging Area / Index */}
        <div
          className={`p-3 rounded-xl border transition-all duration-300 flex flex-col justify-between min-h-[140px] ${
            animatingZone === 'staging'
              ? 'bg-emerald-950/30 border-emerald-500/50 shadow-lg shadow-emerald-500/10 scale-[1.02]'
              : 'bg-slate-950/60 border-slate-800/80'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                Hazırlık Alanı (Staging)
              </span>
              <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                {graphState.stagedFiles.length} stajlı
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mb-2">
              Commit edilmeye hazır snapshot içeriği
            </p>

            <div className="space-y-1">
              {graphState.stagedFiles.length === 0 ? (
                <div className="text-[11px] text-slate-600 italic py-2">
                  Staging boş (git add bekleniyor)
                </div>
              ) : (
                graphState.stagedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-[11px] font-mono bg-emerald-950/30 px-2 py-1 rounded border border-emerald-500/30 text-emerald-300 animate-fadeIn"
                  >
                    <span>{file}</span>
                    <span className="text-[9px] text-emerald-400 font-sans">staged</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-2 text-[10px] font-mono text-slate-500 flex items-center gap-1">
            <span>git commit</span>
            <ArrowRight className="w-3 h-3 text-emerald-400" />
          </div>
        </div>

        {/* Zone 3: Local Repository (Commit DAG Tree) */}
        <div
          className={`p-3 rounded-xl border transition-all duration-300 flex flex-col justify-between min-h-[140px] md:col-span-1 ${
            animatingZone === 'local'
              ? 'bg-cyan-950/30 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
              : 'bg-slate-950/60 border-slate-800/80'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                Yerel Depo (Commit DAG)
              </span>
              <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                {graphState.commits.length} commit
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mb-2">
              Kalıcı sürüm zinciri ve dal işaretçileri
            </p>

            {/* Commit list & DAG graph */}
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {graphState.commits.slice(-4).map((c, idx) => {
                const isHead = c.id === graphState.headCommitId;
                return (
                  <div
                    key={c.id}
                    className={`flex items-center gap-2 p-1.5 rounded-lg border text-xs font-mono transition-all ${
                      isHead
                        ? 'bg-cyan-950/50 border-cyan-500/40 text-cyan-200 ring-1 ring-cyan-500/30'
                        : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="relative">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${
                          c.isMerge
                            ? 'bg-purple-500 text-white'
                            : isHead
                            ? 'bg-cyan-400 text-slate-950 font-bold'
                            : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {c.isMerge ? <GitMerge className="w-2.5 h-2.5" /> : idx + 1}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold text-cyan-400 truncate">
                          {c.hash}
                        </span>
                        {isHead && (
                          <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1 rounded font-bold">
                            HEAD
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] truncate text-slate-300">{c.message}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-2 text-[10px] font-mono text-slate-500 flex items-center gap-1">
            <span>git push</span>
            <ArrowRight className="w-3 h-3 text-cyan-400" />
          </div>
        </div>

        {/* Zone 4: Remote Repository (origin) */}
        <div
          className={`p-3 rounded-xl border transition-all duration-300 flex flex-col justify-between min-h-[140px] ${
            animatingZone === 'remote'
              ? 'bg-purple-950/30 border-purple-500/50 shadow-lg shadow-purple-500/10 scale-[1.02]'
              : 'bg-slate-950/60 border-slate-800/80'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Cloud className="w-3.5 h-3.5 text-purple-400" />
                Uzak Depo (origin)
              </span>
              <span className="text-[10px] font-mono bg-purple-950/60 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded">
                origin/main
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mb-2">
              GitHub / GitLab merkezi senkronizasyon
            </p>

            <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
              <div className="flex items-center justify-between text-[11px] text-slate-300 mb-1">
                <span>Durum:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Senkron
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Son Senk: {graphState.remoteBranchHead || 'a1b2c3d'}
              </div>
            </div>
          </div>

          <div className="mt-2 text-[10px] font-mono text-slate-400 flex items-center justify-between">
            <span className="text-purple-400">git fetch & pull</span>
            <span className="text-slate-500">HTTPS / SSH</span>
          </div>
        </div>
      </div>

      {/* Realtime Action Notification Footer */}
      <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-orange-400 animate-ping" />
          <span className="font-mono text-slate-300 text-[11px]">{activeMessage}</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
          <span>Dallar:</span>
          {graphState.branches.map((b) => (
            <span
              key={b}
              className={`px-1.5 py-0.5 rounded ${
                b === graphState.activeBranch
                  ? 'bg-orange-500/20 text-orange-300 font-bold border border-orange-500/40'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {b}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
