import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, PlayCircle, Sparkles } from "lucide-react";
import { HeroIllustration } from "@/components/illustrations/HeroIllustration";

export function HeroSection() {
  const reduced = useReducedMotion();

  return (
    <section className="grain relative overflow-hidden pt-28 md:pt-36">
      <div className="pointer-events-none absolute -left-32 top-40 h-72 w-72 rounded-full bg-saffron/15 blur-3xl" />
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-20 md:grid-cols-5 md:gap-10 md:pb-28">
        {/* 60% — text */}
        <motion.div
          initial={reduced ? false : { opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="md:col-span-3"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-navy/15 bg-cream/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-navy/70">
            <Sparkles size={12} className="text-saffron" />
            Class 6 – 10 · Live mentor classes
          </span>
          <h1 className="mt-6 font-display text-[2.6rem] font-black leading-[1.02] tracking-tight text-navy sm:text-6xl md:text-[5.2rem]">
            Education{" "}
            <span className="relative inline-block">
              matters.
              <svg
                viewBox="0 0 280 18"
                className="absolute -bottom-2 left-0 h-3 w-full"
                aria-hidden
              >
                <path
                  d="M2 12 C 80 2, 200 18, 278 6"
                  stroke="#F4700B"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </span>
            <br />
            <span className="font-display text-navy/60 italic font-light">
              the rest is noise.
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-lg leading-relaxed text-ink md:text-xl">
            India's most patient online school for Class 6–10. Live classes,
            mentor doubt rooms, weekly tests — and parents who finally relax.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              to="/demo-class"
              data-cursor="lift"
              className="group inline-flex items-center gap-2 rounded-full bg-navy px-7 py-4 text-base font-semibold text-cream shadow-[0_18px_40px_-18px_rgba(27,42,74,0.7)] transition-all hover:-translate-y-0.5 hover:bg-saffron"
            >
              Book a free demo
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/courses"
              data-cursor="lift"
              className="group inline-flex items-center gap-2 rounded-full border border-navy/20 px-6 py-4 text-base font-semibold text-navy transition-all hover:border-navy hover:bg-navy hover:text-cream"
            >
              <PlayCircle size={18} className="text-saffron transition-colors group-hover:text-cream" />
              See how a class runs
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-ink">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-saffron" />
              CBSE · ICSE · State Boards
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-saffron" />
              7-day money-back guarantee
            </span>
          </div>
        </motion.div>

        {/* 40% — illustration */}
        <motion.div
          initial={reduced ? false : { opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="relative md:col-span-2"
        >
          <HeroIllustration className="mx-auto h-auto w-full max-w-[440px]" />
          <div className="absolute -bottom-2 left-2 hidden rounded-2xl border border-navy/10 bg-card px-4 py-3 shadow-xl md:block">
            <p className="font-display text-xs uppercase tracking-[0.2em] text-navy/60">Today</p>
            <p className="font-display text-lg font-bold text-navy">Algebra — Doubt Room</p>
            <p className="text-xs text-ink">Live · 18 students · Mr. Verma</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}