import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Trophy, Sparkles, BookOpen, Target, Clock, GraduationCap, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef } from "react";
import { COURSES_DATA, type CourseData } from "@/data/courses";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollReveal } from "@/components/shared/ScrollReveal";

export const Route = createFileRoute("/courses/")({
  head: () => ({
    meta: [
      { title: "Academic Courses — Vidyapeeth" },
      {
        name: "description",
        content:
          "Browse Vidyapeeth's academic courses for Class 6–12 students. Live mentor-led classes, doubt rooms and weekly tests.",
      },
      { property: "og:title", content: "Academic Courses — Vidyapeeth" },
      {
        property: "og:description",
        content: "Live mentor-led courses for Class 6–12 students.",
      },
      { property: "og:url", content: "/courses" },
    ],
    links: [{ rel: "canonical", href: "/courses" }],
  }),
  component: CoursesPage,
});

function CoursesPage() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const classes = Object.values(COURSES_DATA);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.clientWidth / 3;
      scrollContainerRef.current.scrollBy({ left: -cardWidth * 2, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.clientWidth / 3;
      scrollContainerRef.current.scrollBy({ left: cardWidth * 2, behavior: "smooth" });
    }
  };

  return (
    <div className="grain bg-cream">
      <section className="pt-32 pb-12 md:pt-40 md:pb-16">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <span className="font-display text-xs font-bold uppercase tracking-[0.22em] text-saffron">
            Academic Courses
          </span>
          <h1 className="mt-4 font-display text-5xl font-black leading-[1.05] text-navy md:text-7xl">
            Browse every <span className="italic font-light text-navy/65">Vidyapeeth course.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-ink">
            Live mentor-led classes, doubt rooms and weekly tests for Class 6–12 students.
            Pick a course and meet your mentor on day one.
          </p>
        </div>
      </section>

      {/* VSAT highlight */}
      <section className="pb-12">
        <div className="mx-auto max-w-6xl px-6">
          <Link
            to="/vsat"
            className="group flex flex-col items-start justify-between gap-6 rounded-3xl bg-navy p-8 text-cream transition-all hover:bg-navy-deep md:flex-row md:items-center md:p-10"
          >
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-saffron/40 bg-saffron/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-saffron">
                <Trophy size={14} /> VSAT 2026
              </span>
              <h2 className="mt-4 font-display text-3xl font-black md:text-4xl">
                Vidyapeeth Scholarship Admission Test
              </h2>
              <p className="mt-2 text-cream/80">
                VSAT is for Class 6 to 12 students. Win scholarships up to ₹25 lakh.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-saffron px-6 py-3 text-sm font-semibold text-cream transition-transform group-hover:translate-x-1">
              Register free <ArrowUpRight size={16} />
            </span>
          </Link>
        </div>
      </section>

      {/* Professional Carousel/Slider layout */}
      <section className="pb-16 overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 className="font-display text-3xl font-black text-navy md:text-4xl">
              Featured courses
            </h2>
            <span className="hidden text-sm text-ink/70 sm:inline-flex">
              <Sparkles size={14} className="mr-1.5 text-saffron" /> Updated for 2026 board pattern
            </span>
          </div>

          <div className="relative group/slider -mx-5 sm:mx-0">
            <div
              ref={scrollContainerRef}
              className="flex gap-5 overflow-x-auto snap-x snap-mandatory hide-scrollbar px-5 sm:px-0 pb-8 pt-4 items-stretch"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <AnimatePresence mode="popLayout">
                {classes.map((c, i) => (
                  <ScrollReveal 
                    key={c.slug} 
                    delay={Math.min(i * 0.05, 0.25)} 
                    className="w-[85vw] sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)] xl:w-[calc(25%-15px)] shrink-0 snap-start flex"
                  >
                    <CourseCard course={c} />
                  </ScrollReveal>
                ))}
              </AnimatePresence>
            </div>
            
            {/* Navigation Arrows */}
            <button
              onClick={scrollLeft}
              className="hidden lg:flex absolute left-[-24px] top-[calc(50%-24px)] z-10 h-12 w-12 items-center justify-center rounded-full bg-cream shadow-xl border border-navy/10 text-navy hover:bg-navy hover:text-cream transition-all duration-300 opacity-0 group-hover/slider:opacity-100 hover:scale-110"
              aria-label="Previous courses"
            >
              <ChevronLeft size={24} />
            </button>
            
            <button
              onClick={scrollRight}
              className="hidden lg:flex absolute right-[-24px] top-[calc(50%-24px)] z-10 h-12 w-12 items-center justify-center rounded-full bg-cream shadow-xl border border-navy/10 text-navy hover:bg-navy hover:text-cream transition-all duration-300 opacity-0 group-hover/slider:opacity-100 hover:scale-110"
              aria-label="Next courses"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </section>

      {/* Curriculum Overview */}
      <section className="pb-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10 max-w-3xl">
            <span className="font-display text-xs font-bold uppercase tracking-[0.22em] text-saffron">
              Curriculum Overview
            </span>
            <h2 className="mt-3 font-display text-3xl font-black text-navy md:text-4xl">
              What every course{" "}
              <span className="italic font-light text-navy/65">covers.</span>
            </h2>
            <p className="mt-4 text-ink">
              Each Vidyapeeth course includes live classes, weekly tests, doubt rooms and detailed progress reports.
              Tap any course below to explore its curriculum.
            </p>
          </div>

          <div className="space-y-4">
            {classes.map((c, index) => {
              const isOpen = expanded === c.slug;
              return (
                <div
                  key={c.slug}
                  className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
                    isOpen
                      ? "border-saffron/40 bg-card shadow-[0_20px_50px_-20px_rgba(27,42,74,0.20)]"
                      : "border-navy/10 bg-card hover:border-navy/20"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : c.slug)}
                    className="flex w-full items-center justify-between gap-4 p-6 text-left md:p-7"
                  >
                    <div className="flex items-center gap-4">
                      <span className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-display text-sm font-black text-cream ${
                        index % 2 === 0 ? "bg-navy" : "bg-saffron"
                      }`}>
                        {c.grade.replace("Class ", "")}
                      </span>
                      <div>
                        <h3 className="font-display text-lg font-bold text-navy md:text-xl">
                          {c.grade} — {c.title}
                        </h3>
                        <p className="mt-0.5 text-sm text-ink/70">{c.subjectsSummary}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="hidden rounded-full border border-navy/15 px-3 py-1 text-xs font-semibold text-navy/70 sm:inline-block">
                        {c.classLevel}
                      </span>
                      <ChevronDown
                        size={20}
                        className={`shrink-0 text-navy/50 transition-transform duration-300 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-navy/10 px-6 pb-7 pt-6 md:px-7">
                      <div className="grid gap-6 md:grid-cols-3">
                        {/* Key Topics */}
                        <div className="rounded-2xl border border-navy/8 bg-cream/60 p-5">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-saffron/15 text-saffron">
                              <BookOpen size={18} />
                            </div>
                            <h4 className="font-display text-sm font-bold uppercase tracking-[0.14em] text-navy">
                              Key Topics
                            </h4>
                          </div>
                          <ul className="mt-4 space-y-2.5">
                            {c.keyTopics.map((t) => (
                              <li key={t} className="flex items-start gap-2 text-sm text-ink">
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-saffron" />
                                {t}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Learning Outcomes */}
                        <div className="rounded-2xl border border-navy/8 bg-cream/60 p-5">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-saffron/15 text-saffron">
                              <Target size={18} />
                            </div>
                            <h4 className="font-display text-sm font-bold uppercase tracking-[0.14em] text-navy">
                              Learning Outcomes
                            </h4>
                          </div>
                          <ul className="mt-4 space-y-2.5">
                            {c.learningOutcomes.map((o) => (
                              <li key={o} className="flex items-start gap-2 text-sm text-ink">
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-navy/40" />
                                {o}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Duration & Details */}
                        <div className="rounded-2xl border border-navy/8 bg-cream/60 p-5">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-saffron/15 text-saffron">
                              <Clock size={18} />
                            </div>
                            <h4 className="font-display text-sm font-bold uppercase tracking-[0.14em] text-navy">
                              Course Details
                            </h4>
                          </div>
                          <div className="mt-4 space-y-4">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wider text-ink/50">Duration</p>
                              <p className="mt-1 text-sm font-medium text-navy">{c.duration}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wider text-ink/50">Level</p>
                              <p className="mt-1 text-sm font-medium text-navy">{c.classLevel}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wider text-ink/50">Price</p>
                              <p className="mt-1 text-sm text-navy">
                                <span className="font-display text-lg font-black">{c.price}</span>
                                <span className="ml-2 text-ink/50 line-through">{c.original}</span>
                              </p>
                            </div>
                            <Link
                              to="/courses/$slug"
                              params={{ slug: c.slug }}
                              className="inline-flex items-center gap-1.5 rounded-full bg-navy px-4 py-2 text-xs font-semibold text-cream transition-colors hover:bg-saffron"
                            >
                              View full syllabus <ArrowUpRight size={14} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
      
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

function CourseCard({ course }: { course: CourseData }) {
  const isSaffron = course.theme === "saffron";
  const subjects = course.subjectsSummary.split(" · ");
  
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
          {course.grade}
        </div>
        <h3 className="mt-5 font-display text-2xl font-black leading-tight md:text-[26px] transition-colors">
          {course.title}
        </h3>
        <p className={`mt-3 text-sm leading-relaxed line-clamp-3 ${isSaffron ? "text-cream/90" : "text-ink"}`}>
          {course.blurb}
        </p>
        <ul className="mt-5 flex flex-wrap gap-1.5">
          {subjects.map((s) => (
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
            {course.price}
            <span
              className={`ml-2 align-middle text-sm font-medium line-through ${
                isSaffron ? "text-cream/55" : "text-ink/50"
              }`}
            >
              {course.original}
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
