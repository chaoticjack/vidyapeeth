import { useEffect, useRef } from "react";
import { howSteps } from "@/data/home";
import { Step1, Step2, Step3 } from "@/components/illustrations/HowSteps";

const icons = [Step1, Step2, Step3];

export function HowItWorks() {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    let cleanup = () => {};
    let cancelled = false;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    (async () => {
      const { default: gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (cancelled || !pathRef.current) return;
      gsap.registerPlugin(ScrollTrigger);
      const length = pathRef.current.getTotalLength();
      gsap.set(pathRef.current, { strokeDasharray: length, strokeDashoffset: length });
      const tween = gsap.to(pathRef.current, {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: {
          trigger: pathRef.current,
          start: "top 80%",
          end: "bottom 50%",
          scrub: 0.6,
        },
      });
      cleanup = () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  return (
    <section className="relative bg-cream py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="font-display text-xs font-bold uppercase tracking-[0.22em] text-saffron">
            How Vidyapeeth works
          </span>
          <h2 className="mt-3 font-display text-4xl font-black leading-[1.05] text-navy md:text-6xl">
            Three honest steps.
          </h2>
        </div>

        <div className="relative mt-20 grid gap-14 md:grid-cols-3 md:gap-8">
          <svg
            viewBox="0 0 1000 80"
            preserveAspectRatio="none"
            className="pointer-events-none absolute left-0 right-0 top-[68px] hidden h-20 w-full md:block"
            aria-hidden
          >
            <path
              ref={pathRef}
              d="M120 40 C 300 -10, 460 90, 660 30 C 800 -10, 880 60, 920 40"
              fill="none"
              stroke="#F4700B"
              strokeWidth="2.5"
              strokeDasharray="2 8"
              strokeLinecap="round"
            />
          </svg>

          {howSteps.map((s, i) => {
            const Ill = icons[i];
            return (
              <article key={s.n} className="relative text-center">
                <div className="mx-auto h-32 w-32">
                  <Ill />
                </div>
                <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-navy/15 bg-cream px-3 py-1 font-display text-xs font-bold tracking-[0.18em] text-navy">
                  STEP {s.n}
                </div>
                <h3 className="mt-4 font-display text-2xl font-black text-navy">
                  {s.title}
                </h3>
                <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-ink">
                  {s.body}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}