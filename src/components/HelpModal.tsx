import React from 'react';
import { HelpCircle, X, Flame, GitBranch, Trophy, Shield, Terminal } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-400 border border-orange-500/30 flex items-center justify-center">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-100">Nasıl Oynanır & Oyun Kuralları</h2>
            <p className="text-xs text-slate-400">GitMaster Live Çok Oyunculu Eğitim Rehberi</p>
          </div>
        </div>

        <div className="space-y-4 text-xs text-slate-300">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <h3 className="font-bold text-amber-300 flex items-center gap-2 mb-1.5">
              <Terminal className="w-4 h-4 text-amber-400" />
              1. Terminal Konsolu ile Komut Girme
            </h3>
            <p className="text-slate-400 leading-relaxed">
              Her görevde belirtilen senaryoyu dikkatle oku. İlgili Git komutunu terminal kutusuna yaz ve Enter tuşuna bas.
              (Örn: <code className="text-amber-300 bg-slate-900 px-1.5 py-0.5 rounded font-mono">git commit -m &quot;feat: login&quot;</code>).
              Hızlı komut butonlarını veya Tab tuşunu otomatik tamamlama için kullanabilirsin.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <h3 className="font-bold text-orange-400 flex items-center gap-2 mb-1.5">
              <Flame className="w-4 h-4 text-orange-400" />
              2. Strike Kombo Sistemi (Peş Peşe Doğru Yanıt)
            </h3>
            <p className="text-slate-400 leading-relaxed">
              Hata yapmadan art arda doğru komut girdiğinde <span className="text-orange-400 font-bold">STRIKE</span> çarpanı devreye girer:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 font-mono text-[11px]">
              <div className="bg-slate-900 p-2 rounded border border-slate-800 text-center">
                <div className="text-slate-400">1. Doğru</div>
                <div className="font-bold text-slate-200">1.0x Puan</div>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800 text-center">
                <div className="text-orange-400 font-bold">2x STRIKE</div>
                <div className="font-bold text-amber-400">1.5x Çarpan</div>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800 text-center">
                <div className="text-orange-400 font-bold">3x STRIKE</div>
                <div className="font-bold text-amber-400">2.0x Çarpan</div>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-slate-800 text-center">
                <div className="text-orange-400 font-bold">5+ STRIKE</div>
                <div className="font-bold text-amber-400">3.0x Çarpan</div>
              </div>
            </div>
            <p className="text-[11px] text-rose-400 mt-2">
              ⚠️ Dikkat: Yanlış bir komut girildiğinde mevcut Strike sıfırlanır!
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <h3 className="font-bold text-cyan-300 flex items-center gap-2 mb-1.5">
              <GitBranch className="w-4 h-4 text-cyan-400" />
              3. Canlı Git DAG Görselleştirici
            </h3>
            <p className="text-slate-400 leading-relaxed">
              Ekranın üstündeki görselleştirici, girdiğin komutların Git iç yapısında neye dönüştüğünü gösterir:
              Çalışma alanı (Working Tree) ➔ Hazırlık Alanı (Staging) ➔ Yerel Depo (Commit Ağacı & Dallar) ➔ Uzak Depo (origin).
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <h3 className="font-bold text-amber-300 flex items-center gap-2 mb-1.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              4. Canlı Oturum & Liderlik Sıralaması
            </h3>
            <p className="text-slate-400 leading-relaxed">
              Yarışma başladığında 15 dakikalık geri sayım çalışır. Verilen görevleri en hızlı ve en yüksek Strike kombosu ile tamamlayarak liderlik tablosunun zirvesine yerleşin! Oturum bittiğinde podyum ve derece alanlar ilan edilir.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
        >
          Anladım, Kapat
        </button>
      </div>
    </div>
  );
};
