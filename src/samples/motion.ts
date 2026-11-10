import { useCallback, useEffect, useRef } from "react";

export function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// A sleep that stops with the component and is instant under reduced motion.
export function useWait() {
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
      pending.clear();
    };
  }, []);

  return useCallback(
    (ms: number) =>
      new Promise<void>((resolve) => {
        const timer = setTimeout(
          () => {
            timers.current.delete(timer);
            resolve();
          },
          reducedMotion() ? 0 : ms,
        );
        timers.current.add(timer);
      }),
    [],
  );
}
