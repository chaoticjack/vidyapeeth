import { useEffect, useRef, useState } from "react";

export function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;
    setEnabled(true);

    let rafId = 0;
    let tx = -100,
      ty = -100,
      cx = -100,
      cy = -100;

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      const t = e.target as HTMLElement | null;
      const interactive = !!t?.closest("a, button, [data-cursor='lift'], input, textarea, select");
      setHovering(interactive);
    };
    const tick = () => {
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      if (ringRef.current) ringRef.current.style.transform = `translate3d(${cx - 16}px, ${cy - 16}px, 0)`;
      if (dotRef.current) dotRef.current.style.transform = `translate3d(${tx - 3}px, ${ty - 3}px, 0)`;
      rafId = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", onMove);
    rafId = requestAnimationFrame(tick);
    document.documentElement.style.cursor = "none";
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(rafId);
      document.documentElement.style.cursor = "";
    };
  }, []);

  if (!enabled) return null;
  return (
    <>
      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[100] rounded-full border-2 mix-blend-difference transition-[width,height,border-color] duration-200"
        style={{
          borderColor: hovering ? "#F4700B" : "#FFF8F0",
          width: hovering ? 56 : 32,
          height: hovering ? 56 : 32,
        }}
      />
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[101] h-1.5 w-1.5 rounded-full bg-[#F4700B]"
      />
    </>
  );
}