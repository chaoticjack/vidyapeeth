import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Trophy, Sparkles, BookOpen, Target, Clock, GraduationCap, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { COURSES_DATA, type CourseData } from "@/data/courses";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
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
  
  const [dbCourses, setDbCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState("All");

  useEffect(() => {
    const q = query(
      collection(db, "courses"),
      where("status", "==", "published")
    );
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const coursesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setDbCourses(coursesData);
        setLoading(false);
      },
      (error) => {
        console.error("Failed to fetch courses:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const hardcodedCourses = Object.values(COURSES_DATA);
  const allCourses = [...hardcodedCourses, ...dbCourses];
  
  const classLevels = ["All", "6", "7", "8", "9", "10", "11", "12"];
  
  // Filter by matching classLevel directly or checking if the grade string includes the class number
  const filteredCourses = selectedClass === "All" 
    ? allCourses 
    : allCourses.filter(
        (c: any) => String(c.classLevel) === selectedClass || String(c.grade || "").includes(selectedClass)
      );

  return (
    <div className="grain bg-cream min-h-screen">
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

      {/* Class Level Tabs */}
      <div className="mx-auto max-w-7xl px-5 sm:px-6 mb-8">
        <div className="flex items-end justify-between gap-4 mb-6">
          <h2 className="font-display text-3xl font-black text-navy md:text-4xl">
            Featured courses
          </h2>
          <span className="hidden text-sm text-ink/70 sm:inline-flex">
            <Sparkles size={14} className="mr-1.5 text-saffron" /> Updated for 2026 board pattern
          </span>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
          {classLevels.map(level => (
            <button
              key={level}
              onClick={() => setSelectedClass(level)}
              className={`px-6 py-2 rounded-full font-semibold whitespace-nowrap transition-all ${
                selectedClass === level
                  ? "bg-navy text-cream shadow-lg"
                  : "bg-white text-navy border border-navy/10 hover:border-navy/30"
              }`}
            >
              {level === "All" ? "All Courses" : `Class ${level}`}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      <section className="pb-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin">
                <div className="h-8 w-8 border-4 border-navy border-t-saffron rounded-full"></div>
              </div>
              <p className="mt-4 text-ink/70">Loading courses...</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="py-20 text-center text-ink/70 bg-white rounded-3xl border border-navy/5">
              <p className="text-xl font-bold text-navy mb-2">No courses found</p>
              <p>We are currently updating our courses for Class {selectedClass}. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredCourses.map((c, i) => (
                  <ScrollReveal 
                    key={c.slug || c.id} 
                    delay={Math.min(i * 0.05, 0.25)} 
                    className="flex"
                  >
                    <CourseCard course={c} />
                  </ScrollReveal>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>

      {/* Curriculum Overview */}
      {!loading && filteredCourses.length > 0 && (
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
              {filteredCourses.map((c: any, index: number) => {
                const isOpen = expanded === (c.slug || c.id);
                return (
                  <div
                    key={c.slug || c.id}
                    className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
                      isOpen
                        ? "border-saffron/40 bg-card shadow-[0_20px_50px_-20px_rgba(27,42,74,0.20)]"
                        : "border-navy/10 bg-card hover:border-navy/20"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setExpanded(isOpen ? null : (c.slug || c.id))}
                      className="flex w-full items-center justify-between gap-4 p-6 text-left md:p-7"
                    >
                      <div className="flex items-center gap-4">
                        <span className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-display text-sm font-black text-cream ${
                          index % 2 === 0 ? "bg-navy" : "bg-saffron"
                        }`}>
                          {(c.grade || c.classLevel || "").replace("Class ", "")}
                        </span>
                        <div>
                          <h3 className="font-display text-lg font-bold text-navy md:text-xl">
                            {c.grade || `Class ${c.classLevel}`} — {c.title || c.name}
                          </h3>
                          <p className="mt-0.5 text-sm text-ink/70">{c.subjectsSummary || c.subject}</p>
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
                              {(c.keyTopics || (c.curriculum ? c.curriculum.split('\n') : ["Live interactive classes", "Doubt solving", "Weekly tests"])).slice(0, 4).map((t: string) => (
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
                              {(c.learningOutcomes || ["Concept mastery", "Improved grades", "Board exam readiness"]).map((o: string) => (
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
                                <p className="mt-1 text-sm font-medium text-navy">{c.duration || "1 Year"}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-ink/50">Level</p>
                                <p className="mt-1 text-sm font-medium text-navy">Class {c.classLevel}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-ink/50">Price</p>
                                <p className="mt-1 text-sm text-navy">
                                  <span className="font-display text-lg font-black">{c.price ? `₹${c.price.toLocaleString('en-IN')}` : "Free"}</span>
                                  {c.original && <span className="ml-2 text-ink/50 line-through">{c.original}</span>}
                                </p>
                              </div>
                              <Link
                                to="/courses/$slug"
                                params={{ slug: c.slug || c.id || "course" }}
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
      )}
      
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

function CourseCard({ course }: { course: any }) {
  const isSaffron = course.theme === "saffron" || course.classLevel === "9" || course.classLevel === "11";
  const subjects = (course.subjectsSummary || course.subject || "All Subjects").split(" · ");
  
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 240, damping: 24 }}
      data-cursor="lift"
      whileHover={{ y: -8, scale: 1.02 }}
      className={`group relative flex h-full min-w-0 w-full flex-col justify-between overflow-hidden rounded-3xl border transition-all duration-300 shadow-sm hover:shadow-xl ${
        isSaffron
          ? "border-saffron/30 bg-saffron text-cream hover:bg-[#E66100] shadow-saffron/20"
          : "border-navy/10 bg-card text-navy hover:border-navy shadow-navy/5"
      }`}
    >
      {/* Thumbnail Area for Admin Courses */}
      {course.thumbnail && (
        <div className="w-full h-40 overflow-hidden relative border-b border-white/10">
          <img 
            src={course.thumbnail} 
            alt={course.title || course.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      )}
      
      <div className={`p-6 sm:p-7 flex-grow flex flex-col justify-start`}>
        <div
          className={`inline-flex self-start items-center gap-2 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
            isSaffron ? "bg-cream text-saffron" : "bg-navy text-cream"
          }`}
        >
          {course.grade || `Class ${course.classLevel}`}
        </div>
        <h3 className="mt-5 font-display text-2xl font-black leading-tight md:text-[26px] transition-colors">
          {course.title || course.name}
        </h3>
        <p className={`mt-3 text-sm leading-relaxed line-clamp-3 ${isSaffron ? "text-cream/90" : "text-ink"}`}>
          {course.blurb || course.description}
        </p>
        <ul className="mt-5 flex flex-wrap gap-1.5">
          {subjects.map((s: string) => (
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
      
      <div className={`px-6 pb-6 sm:px-7 sm:pb-7 flex items-end justify-between gap-3 relative z-10 border-t ${isSaffron ? "border-white/10 pt-5" : "border-navy/5 pt-5"}`}>
        <div className="min-w-0">
          <p className={`text-xs ${isSaffron ? "text-cream/70" : "text-ink/70"}`}>From</p>
          <p className="font-display text-2xl font-black">
            {course.price ? `₹${course.price.toLocaleString('en-IN')}` : "Free"}
            <span
              className={`ml-2 align-middle text-sm font-medium line-through ${
                isSaffron ? "text-cream/55" : "text-ink/50"
              }`}
            >
              {course.original || ""}
            </span>
          </p>
        </div>
        <Link
          to="/courses/$slug"
          params={{ slug: course.slug || course.id || "course" }}
          aria-label={`View ${course.title || course.name}`}
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
