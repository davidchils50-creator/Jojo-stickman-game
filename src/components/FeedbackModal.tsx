import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Send, Mail, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setErrorMsg('Silakan ketik pesan feedback atau saran Anda terlebih dahulu.');
      return;
    }

    const recipient = 'davidchils50@gmail.com';
    const senderName = name.trim() || 'Penggemar JoJo Game';
    const subject = encodeURIComponent(`Feedback JoJo Game - dari ${senderName}`);
    const body = encodeURIComponent(
      `Halo David,\n\nBerikut adalah masukan / feedback untuk JoJo Stand Stickman Battle:\n\n` +
      `Nama Pengirim: ${senderName}\n` +
      `Pesan:\n${message.trim()}\n\n` +
      `---\nDikirim via In-Game Feedback Form`
    );

    const mailtoUrl = `mailto:${recipient}?subject=${subject}&body=${body}`;

    // Open mail client
    window.location.href = mailtoUrl;

    // Show confirmation UI
    setSentSuccess(true);
    setErrorMsg('');
  };

  const handleReset = () => {
    setName('');
    setMessage('');
    setSentSuccess(false);
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: 'spring', duration: 0.4 }}
        className="relative w-full max-w-lg bg-[#0e0b1c] border border-cyan-500/30 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.2)] z-10 my-auto flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900/90 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-wider font-serif text-slate-100">
                Feedback & Saran Game
              </h2>
              <p className="text-xs text-slate-400">Pesan otomatis terkirim ke email developer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {sentSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center py-6 space-y-4"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.4)]">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-100">Feedback Siap Terkirim!</h3>
                <p className="text-xs text-slate-300 max-w-xs mx-auto">
                  Pesan Anda telah dibuat dan aplikasi email dibuka untuk dikirimkan secara otomatis ke <strong className="text-cyan-300 font-mono">davidchils50@gmail.com</strong>.
                </p>
              </div>
              <button
                onClick={handleReset}
                className="mt-4 px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg"
              >
                Selesai & Kembali
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Recipient info banner */}
              <div className="flex items-center gap-2 p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-xl text-xs text-cyan-300">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Tujuan: <strong className="text-white font-mono">davidchils50@gmail.com</strong></span>
              </div>

              {errorMsg && (
                <div className="flex items-center gap-2 p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Sender Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Nama Anda (Opsional)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Jotaro Fan / Player 1"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-all"
                />
              </div>

              {/* Message */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Pesan / Saran / Laporan Bug <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="Tuliskan masukan, saran fitur, atau pesan Anda untuk game ini..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-all resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
                >
                  <Send className="w-4 h-4" />
                  Kirim ke davidchils50@gmail.com
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
