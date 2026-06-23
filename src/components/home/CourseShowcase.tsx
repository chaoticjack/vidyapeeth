import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useMemo, useState } from "react";
import { courses } from "@/data/home";
import { ScrollReveal } from "@/components/shared/ScrollReveal";

const TABS = ["All", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"] as const;
type Tab = (typeof TABS)[number];

export function CourseShowcase() {
  const [tab, setTab] = useState<Tab>("All");

  const filtered = useMemo(
    () => (tab === "All" ? courses : courses.filter((c) => c.classLevel === tab)),
    [tab],
  );

  return (
    <section id="our-courses" className="grain relative scroll-mt-24 bg-cream py-20 md:py-28 lg:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:gap-6 lg:flex lg:justify-between">
          <div className="min-w-0 max-w-2xl">
            <span className="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-saffron">
              Our courses
            </span>
            <h2 className="mt-3 font-display text-3xl font-black leading-[1.05] text-navy sm:text-4xl md:text-5xl lg:text-6xl">
              One curriculum.{" "}
              <span className="italic font-light text-navy/70">Five years</span>{" "}
              of momentum.
            </h2>
          </div>
          <div className="hidden lg:flex items-center gap-4 shrink-0">
            <Link
              to="/courses"
              data-cursor="lift"
              className="group items-center gap-2 text-sm font-semibold text-navy hover:text-saffron inline-flex mr-4"
            >
              Browse all courses
              <ArrowUpRight size={16} className="transition-transform group-hover:rotate-45" />
            </Link>
          </div>
        </div>

        {/* Tabs — horizontally scrollable on mobile */}
        <div
          role="tablist"
          aria-label="Filter courses by class"
          className="-mx-5 mt-8 flex snap-x snap-mandatory gap-2 overflow-x-auto px-5 pb-2 sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible hide-scrollbar"
        >
          {TABS.map((t) => {
            const active = tab === t;
            return (
              <button
                key={t}
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t)}
                className={`relative shrink-0 snap-start rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${
                  active
                    ? "border-navy bg-navy text-cream"
                    : "border-navy/15 bg-card text-navy/70 hover:border-navy/40 hover:text-navy"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>

        {/* Grid layout */}
        <div className="mt-8 lg:mt-12">
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((c, i) => (
                <ScrollReveal 
                  key={c.slug} 
                  delay={Math.min(i * 0.05, 0.25)} 
                  className="flex h-full"
                >
                  <CourseCard course={c} />
                </ScrollReveal>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>

        <div className="mt-10 flex justify-center lg:hidden">
          <Link
            to="/courses"
            className="group inline-flex items-center gap-2 rounded-full border border-navy/20 px-5 py-2.5 text-sm font-semibold text-navy hover:border-navy hover:bg-navy hover:text-cream"
          >
            Browse all courses
            <ArrowUpRight size={16} className="transition-transform group-hover:rotate-45" />
          </Link>
        </div>
      </div>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  );
}

function CourseCard({ course }: { course: (typeof courses)[number] }) {
  const isSaffron = course.accent === "saffron";
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 240, damping: 24 }}
      data-cursor="lift"
      whileHover={{ y: -8, scale: 1.02 }}
      className={`group relative flex h-full min-w-0 w-full flex-col justify-between overflow-hidden rounded-3xl border p-6 transition-all duration-300 sm:p-7 shadow-sm hover:shadow-xl ${
        isSaffron
          ? "border-saffron/30 bg-saffron text-cream hover:bg-[#E66100] shadow-saffron/20"
          : "border-navy/10 bg-card text-navy hover:border-navy shadow-navy/5"
      }`}
    >
      <div>
        <div
          className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
            isSaffron ? "bg-cream text-saffron" : "bg-navy text-cream"
          }`}
        >
          {course.classLevel}
        </div>
        <h3 className="mt-5 font-display text-2xl font-black leading-tight md:text-[26px] transition-colors">
          {course.title}
        </h3>
        <p className={`mt-3 text-sm leading-relaxed ${isSaffron ? "text-cream/90" : "text-ink"}`}>
          {course.blurb}
        </p>
        <ul className="mt-5 flex flex-wrap gap-1.5">
          {course.subjects.map((s) => (
            <li
              key={s}
              className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
                isSaffron ? "border-cream/40 text-cream" : "border-navy/15 text-navy/80"
              }`}
            >
              {s}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-8 flex items-end justify-between gap-3 relative z-10">
        <div className="min-w-0">
          <p className={`text-xs ${isSaffron ? "text-cream/70" : "text-ink/70"}`}>From</p>
          <p className="font-display text-2xl font-black">
            ₹{course.price.toLocaleString("en-IN")}
            <span
              className={`ml-2 align-middle text-sm font-medium line-through ${
                isSaffron ? "text-cream/55" : "text-ink/50"
              }`}
            >
              ₹{course.original.toLocaleString("en-IN")}
            </span>
          </p>
        </div>
        <Link
          to="/courses/$slug"
          params={{ slug: course.slug }}
          aria-label={`View ${course.title}`}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 ${
            isSaffron ? "bg-cream text-saffron hover:bg-white" : "bg-navy text-cream hover:bg-saffron hover:border-transparent"
          }`}
        >
          <ArrowUpRight size={18} />
        </Link>
      </div>
      
      {/* Subtle background glow effect on hover */}
      <div className={`absolute inset-0 z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none ${isSaffron ? "bg-gradient-to-tr from-white/0 via-white/5 to-white/20" : "bg-gradient-to-tr from-navy/0 via-navy/5 to-navy/10"}`} />
    </motion.article>
  );
}
