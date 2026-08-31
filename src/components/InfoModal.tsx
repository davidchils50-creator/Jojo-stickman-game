import React from 'react';
import { motion } from 'motion/react';
import { X, Info, Sparkles, ShieldAlert, BookOpen, Swords, Scale } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto select-none">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: 'spring', duration: 0.4 }}
        className="relative w-full max-w-2xl bg-[#0e0b1c] border border-yellow-500/30 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(234,179,8,0.2)] z-10 my-auto flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900/90 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/20 border border-yellow-500/40 text-yellow-400">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-wider font-serif text-slate-100 flex items-center gap-2">
                Informasi Game & Legal Notice
              </h2>
              <p className="text-xs text-slate-400">Tentang JoJo's Bizarre Adventure, Game ini, & Hak Cipta</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-sm leading-relaxed">
          
          {/* Section 1: Apa itu JJBA */}
          <section className="bg-slate-900/60 p-4 rounded-xl border border-purple-900/40 space-y-2">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-base uppercase font-serif">
              <BookOpen className="w-4 h-4 text-purple-400" />
              1. Apa itu JoJo's Bizarre Adventure (JJBA)?
            </div>
            <p className="text-xs sm:text-sm text-slate-300">
              <strong className="text-yellow-400">JoJo's Bizarre Adventure</strong> (ジョジョの奇妙な冒険) adalah serial manga dan anime aksi-fantasi legendaris karya <strong className="text-white">Hirohiko Araki</strong> yang dipublikasikan sejak tahun 1987.
            </p>
            <p className="text-xs sm:text-sm text-slate-400">
              Serial ini menceritakan takdir silsilah keluarga <strong className="text-yellow-300">Joestar</strong> dari berbagai era dalam pertarungan melawan takdir jahat dan vampir. Sistem pertarungan khas JJBA meliputi kekuatan <strong className="text-amber-400">Hamon (波紋 - Energi Pernapasan Matahari)</strong> pada era awal (Part 1 & Part 2), serta manifestasi spiritual fisik jiwa yang disebut <strong className="text-purple-400">Stand (スタンド)</strong> pada era setelahnya.
            </p>
          </section>

          {/* Section 2: Game Ini Game Apaan */}
          <section className="bg-slate-900/60 p-4 rounded-xl border border-yellow-500/30 space-y-2">
            <div className="flex items-center gap-2 text-yellow-400 font-bold text-base uppercase font-serif">
              <Swords className="w-4 h-4 text-yellow-400" />
              2. Game Ini Game Apaan?
            </div>
            <p className="text-xs sm:text-sm text-slate-300">
              <strong className="text-yellow-400">JoJo Stand Stickman Battle</strong> adalah sebuah <strong className="text-white">2D Arcade Fighting Game Engine</strong> buatan penggemar (Fan-Made Game) berbasis TypeScript & React Canvas. Game ini memadukan estetika anime JoJo dengan gaya pertarungan stickman 2D yang cepat, responsif, dan penuh efek visual manga.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs text-slate-300">
              <div className="p-2 bg-slate-950/70 rounded border border-slate-800 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-300">Aura Pernapasan Hamon</strong>
                  <p className="text-[11px] text-slate-400">Karakter tanpa Stand (Jonathan & Young Joseph) memiliki efek Radiant Breathing Aura khas Hamon.</p>
                </div>
              </div>
              <div className="p-2 bg-slate-950/70 rounded border border-slate-800 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-purple-300">Engine Time Stop</strong>
                  <p className="text-[11px] text-slate-400">Kemampuan menghentikan waktu (Toki wo Tomare) milik DIO [The World] dan Jotaro [Star Platinum].</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Hukum & Disclaimers */}
          <section className="bg-slate-900/60 p-4 rounded-xl border border-rose-900/40 space-y-2">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-base uppercase font-serif">
              <Scale className="w-4 h-4 text-rose-400" />
              3. Hukum, Hak Cipta, & Disclaimer
            </div>
            <div className="space-y-2 text-xs text-slate-300">
              <p>
                • <strong className="text-rose-300">Proyek Fan-Made Non-Komersial:</strong> Game ini dibuat murni untuk hiburan, sarana latihan pemrograman, dan bentuk apresiasi karya seni penggemar. Game ini <strong className="text-white">TIDAK dijual</strong> dan tidak memungut keuntungan finansial dalam bentuk apapun.
              </p>
              <p>
                • <strong className="text-rose-300">Pemilik Hak Cipta Asli:</strong> Seluruh nama karakter (Jotaro Kujo, DIO, Jonathan Joestar, Joseph Joestar, Josuke, Diavolo, Polnareff), nama Stand, konsep Hamon, dan waralaba *JoJo's Bizarre Adventure* adalah hak cipta sepenuhnya milik <strong className="text-yellow-400">Hirohiko Araki, SHUEISHA Inc., Lucky Land Communications, dan David Production</strong>.
              </p>
              <p>
                • Proyek ini tidak terafiliasi secara resmi dengan Shueisha, Bandai Namco Entertainment, atau pemegang lisensi resmi JoJo's Bizarre Adventure.
              </p>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </motion.div>
    </div>
  );
};
