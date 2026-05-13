import { useEffect, useRef, useState } from "react";

export function AnimatedNumber({
  value,
  className,
  format,
}: {
  value: number;
  className?: string;
  format?: (n: number) => string;
}) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const startRef = useRef<number>(0);

  useEffect(() => {
    fromRef.current = display;
    startRef.current = performance.now();
    const duration = 450;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - startRef.current) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const v = Math.round(fromRef.current + (value - fromRef.current) * eased);
      setDisplay(v);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <span className={className}>{format ? format(display) : display}</span>;
}
