import { useEffect, useRef, useState } from 'react';
import { X, ExternalLink, Check, Clock } from 'lucide-react';
import { formatIDR } from '../lib/store';

interface Props {
  title: string;
  description?: string;
  imageUrl?: string;
  url: string;
  reward: number;
  duration?: number;
  onComplete: () => void;
  onClose: () => void;
}

export default function AdViewer({ title, description, imageUrl, url, reward, duration = 30, onComplete, onClose }: Props) {
  const [remaining, setRemaining] = useState(duration);
  const [done, setDone] = useState(false);
  const [opened, setOpened] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setDone(true);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  function finish() {
    if (!done) return;
    if (!opened) {
      window.open(url, '_blank', 'noopener,noreferrer');
      setOpened(true);
    }
    onComplete();
  }

  const pct = ((duration - remaining) / duration) * 100;
  const circ = 2 * Math.PI * 46;

  return (
    <div className="fixed inset-0 bg-ink/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="ticket max-w-2xl w-full p-0 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="bg-ink text-paper px-5 py-3 flex items-center justify-between">
          <div className="font-mono text-xs tracking-widest uppercase">Melihat Iklan · {done ? 'Selesai' : 'Berlangsung'}</div>
          <button onClick={onClose} className="text-paper hover:text-amber-brand"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-6 md:p-8">
          <div className="grid md:grid-cols-[auto_1fr] gap-6 items-center">
            <div className="relative w-28 h-28 mx-auto">
              <svg viewBox="0 0 100 100" className="w-28 h-28 -rotate-90">
                <circle cx="50" cy="50" r="46" fill="none" strokeWidth="6" className="ring-bg" />
                <circle
                  cx="50" cy="50" r="46" fill="none" strokeWidth="6"
                  strokeDasharray={circ}
                  strokeDashoffset={circ - (pct / 100) * circ}
                  className="ring-fg"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center font-display">
                <div className="text-3xl font-bold">{remaining}</div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-ink-soft">detik</div>
              </div>
            </div>

            <div>
              {imageUrl && <img src={imageUrl} alt={title} className="w-full h-40 object-cover border-2 border-ink mb-4" />}
              <h3 className="font-display text-2xl font-bold">{title}</h3>
              {description && <p className="mt-1 text-ink-soft">{description}</p>}
              <div className="mt-3 flex items-center gap-2 font-mono text-sm">
                <span className="stamp text-forest">Reward {formatIDR(reward)}</span>
              </div>
            </div>
          </div>

          <div className="divider-dashed my-6"></div>

          {!done ? (
            <div className="flex items-center gap-3 text-ink-soft">
              <Clock className="w-5 h-5" />
              <span>Harap tetap di halaman ini. Reward akan diberikan setelah timer selesai.</span>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              <div className="flex items-center gap-2 text-forest font-semibold">
                <Check className="w-5 h-5" /> Timer selesai! Klik tombol untuk membuka iklan &amp; klaim reward.
              </div>
              <button onClick={finish} className="btn-amber">
                <ExternalLink className="w-4 h-4" /> Buka Iklan &amp; Klaim
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
