import { useCallback, useEffect, useRef, useState } from 'react';

export const useCopy = () => {
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = useCallback((key: string, text: string) => {
    if (!text) return;
    void navigator.clipboard?.writeText(text).then(() => {
      setCopied(key);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(null), 1600);
    });
  }, []);

  return { copied, copy };
};
