import { useEffect } from 'react';

export function useGlassPointer() {
  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const origin = event.target instanceof Element ? event.target : null;
      const surface = origin?.closest<HTMLElement>('[data-glass-pointer]');
      if (!surface) return;
      const bounds = surface.getBoundingClientRect();
      surface.style.setProperty('--mx', `${event.clientX - bounds.left}px`);
      surface.style.setProperty('--my', `${event.clientY - bounds.top}px`);
    };

    document.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => document.removeEventListener('pointermove', handlePointerMove);
  }, []);
}
