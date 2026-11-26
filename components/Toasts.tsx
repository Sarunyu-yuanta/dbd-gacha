'use client';

import { useCallback, useRef, useState, type ReactNode } from 'react';

type Toast = { id: number; content: ReactNode; out: boolean };

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);
  const toast = useCallback((content: ReactNode, ms = 2600) => {
    const id = ++idRef.current;
    setToasts((t) => [...t, { id, content, out: false }]);
    setTimeout(() => setToasts((t) => t.map((x) => (x.id === id ? { ...x, out: true } : x))), ms);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), ms + 500);
  }, []);
  return { toasts, toast };
}

export default function Toasts({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="toast-layer">
      {toasts.map((t) => (
        <div key={t.id} className={'toast' + (t.out ? ' out' : '')}>{t.content}</div>
      ))}
    </div>
  );
}
