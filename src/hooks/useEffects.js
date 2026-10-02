// Scroll effects: AOS (reveal-on-scroll) + lightweight parallax driven by [data-parallax="speed"].
// A MutationObserver picks up elements React adds later, so pages don't have to register anything.
// Parallax offsets come from the (untransformed) parent so there is no feedback loop.
import { useEffect } from 'react';
import AOS from 'aos';

export function useEffects() {
  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    AOS.init({ duration: 700, easing: 'ease-out-cubic', once: true, offset: 50, disable: reduce });

    let queued = false;
    const frame = () => {
      queued = false;
      const vh = innerHeight;
      document.querySelectorAll('[data-parallax]').forEach((el) => {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const y = (vh / 2 - (r.top + r.height / 2)) * (parseFloat(el.dataset.parallax) || 0);
        el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
      });
    };
    const request = () => { if (!queued && !reduce) { queued = true; requestAnimationFrame(frame); } };

    let timer;
    const observer = new MutationObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(() => { AOS.refreshHard(); request(); }, 60);
    });
    observer.observe(document.getElementById('root'), { childList: true, subtree: true });

    addEventListener('scroll', request, { passive: true });
    addEventListener('resize', request);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
      removeEventListener('scroll', request);
      removeEventListener('resize', request);
    };
  }, []);
}
