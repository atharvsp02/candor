import { useEffect, useRef, useState } from 'react';

type Props = {
  to: number;
  suffix?: string;
  duration?: number;
};

const prefersStill = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function CountUp({ to, suffix = '', duration = 1400 }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(() => (prefersStill() ? to : 0));

  useEffect(() => {
    const element = ref.current;
    if (!element || to === 0 || prefersStill() || !('IntersectionObserver' in window)) {
      setValue(to);
      return;
    }

    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const progress = Math.min(1, (now - start) / duration);
          setValue(Math.round(to * (1 - (1 - progress) ** 3)));
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );
    observer.observe(element);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [to, duration]);

  return (
    <>
      <span ref={ref} aria-hidden="true">
        {value.toLocaleString()}
        {suffix}
      </span>
      <span className="sr-only">
        {to.toLocaleString()}
        {suffix}
      </span>
    </>
  );
}
