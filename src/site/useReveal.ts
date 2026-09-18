import { useEffect } from 'react';

export const useReveal = (root: string) => {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(`${root} [data-reveal]`));
    const show = (node: Element) => node.setAttribute('data-revealed', '');

    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      nodes.forEach(show);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          show(entry.target);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [root]);
};
