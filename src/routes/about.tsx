import { createFileRoute, Link } from "@tanstack/react-router";
import { Gamepad2, Bot, Cookie, Star, Target, Eye, Sparkles, ArrowUpRight } from "lucide-react";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import React, { useRef, useEffect } from "react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Vidyapeeth" },
      {
        name: "description",
        content:
          "Vidyapeeth is an ed-tech company focused on quality, affordable education for Class 6–12 students. Founded in 2022 in Delhi.",
      },
      { property: "og:title", content: "About Us — Vidyapeeth" },
      {
        property: "og:description",
        content: "Quality education accessible to everyone — that's our mission.",
      },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

const tiers = [
  {
    Icon: Gamepad2,
    title: "Beginner",
    body: "With analytics tools to help you share with current and future learners.",
  },
  {
    Icon: Cookie,
    title: "Intermediate",
    body: "Total collections, quoting, enrolment and reporting in regional and English mediums.",
  },
  {
    Icon: Bot,
    title: "Advanced",
    body: "All services for our team of industry experts, with personalised training.",
  },
  {
    Icon: Star,
    title: "Mastery",
    body: "We help you set up and manage your study groups when you become our partner.",
  },
];

const characters = {
  students: "https://api.dicebear.com/9.x/micah/svg?seed=Annie&backgroundColor=transparent",
  board: "https://api.dicebear.com/9.x/micah/svg?seed=Felix&backgroundColor=transparent",
  live: "https://api.dicebear.com/9.x/micah/svg?seed=Christian&backgroundColor=transparent"
};

function InteractiveStatCard({ 
  endValue, 
  suffix, 
  title, 
  imageSrc 
}: { 
  endValue: number; 
  suffix: string; 
  title: string; 
  imageSrc: string; 
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString());

  useEffect(() => {
    if (isInView) {
      animate(count, endValue, { duration: 2.5, ease: "easeOut" });
    }
  }, [isInView, endValue, count]);

  return (
    <motion.div 
      ref={ref}
      className="group relative overflow-hidden rounded-[2rem] bg-[#FFF8E8] p-8 md:p-10 shadow-[0_15px_40px_-15px_rgba(27,42,74,0.1)] transition-all duration-300 hover:shadow-[0_30px_60px_-15px_rgba(244,112,11,0.25)] cursor-pointer flex flex-col justify-center items-center"
      initial={{ height: 220 }}
      whileHover={{ height: 340 }}
      whileTap={{ height: 340 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <motion.div 
        className="relative z-20 flex flex-col items-center justify-center text-center w-full"
        initial={{ y: 0 }}
        whileHover={{ y: -60 }}
        whileTap={{ y: -60 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="flex items-baseline font-display text-5xl font-black text-navy md:text-6xl tracking-tight">
          <motion.span>{rounded}</motion.span>
          <span className="ml-1">{suffix}</span>
        </div>
        <p className="mt-2 text-xl font-medium text-navy/80">{title}</p>
      </motion.div>

      <motion.div 
        className="absolute bottom-0 left-0 right-0 z-10 w-full flex justify-center pointer-events-none px-4"
        initial={{ y: "100%", opacity: 0 }}
        whileHover={{ y: 0, opacity: 1 }}
        whileTap={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
      >
        <div className="w-full h-48 max-w-[280px] flex justify-center items-end pb-4">
          <img src={imageSrc} alt={title} className="w-40 h-40 object-contain drop-shadow-xl" />
        </div>
      </motion.div>
    </motion.div>
  );
}

function AboutPage() {
  return (
    <div className="grain bg-cream">
      {/* Hero */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <span className="font-display text-xs font-bold uppercase tracking-[0.22em] text-saffron">
            About Us
          </span>
          <h1 className="mt-4 font-display text-5xl font-black leading-[1.05] text-navy md:text-7xl">
            Vidyapeeth aims to provide{" "}
            <span className="italic font-light text-navy/65">quality content</span> to every
            child.
          </h1>
        </div>
      </section>

      {/* Background */}
      <section className="py-16 md:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 md:grid-cols-2">
          <div className="relative">
            <div className="absolute -left-6 -top-6 h-40 w-40 rounded-full bg-saffron/20 blur-3xl" />
            <div className="relative aspect-[3/2] overflow-hidden rounded-3xl border border-navy/10 bg-card">
              <img
                src="https://vidyapeeth.org.in/wp-content/uploads/2024/08/admin-ajax.webp"
                alt="Vidyapeeth team"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.22em] text-saffron">
              Background
            </span>
            <h2 className="mt-3 font-display text-4xl font-black text-navy md:text-5xl">
              Founded in 2022. <span className="italic font-light text-navy/65">Built in Delhi.</span>
            </h2>
            <p className="mt-5 text-ink">
              Vidyapeeth is an ed-tech company that focuses on quality education. The company was
              founded in 2022 by two 12th pass-outs, Aditya Sharma and Ritesh Chauhan.
              Vidyapeeth's mission is to make quality education accessible to everyone.
            </p>
            <p className="mt-4 text-ink">
              We've built a unique technology platform that enables us to offer personalised,
              interactive and engaging courses. Our team of experienced educators designs and
              delivers every class, and we invest deeply in research and development so the
              quality of our lessons keeps improving.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="border-y border-navy/10 bg-navy py-20 text-cream md:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-2">
          <div className="rounded-3xl border border-saffron/30 bg-cream text-navy p-8 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.5)]">
            <Target className="text-saffron" size={32} />
            <h3 className="mt-4 font-display text-3xl font-black">Mission</h3>
            <p className="mt-3 text-ink">
              To provide quality education to all learners through innovative and
              technology-enabled solutions — affordable, personalised, and rooted in care.
            </p>
          </div>
          <div className="rounded-3xl border border-saffron/30 bg-cream text-navy p-8 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.5)]">
            <Eye className="text-saffron" size={32} />
            <h3 className="mt-4 font-display text-3xl font-black">Vision</h3>
            <p className="mt-3 text-ink">
              A future where every learner — regardless of background or geography — has access
              to the same calibre of education and the benefits it unlocks.
            </p>
          </div>
        </div>

      </section>

      {/* Unique */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-[0.22em] text-saffron">
              What makes us unique
            </span>
            <h2 className="mt-3 font-display text-4xl font-black text-navy md:text-5xl">
              Quality content, <span className="italic font-light text-navy/65">end-to-end support.</span>
            </h2>
            <p className="mt-5 text-ink">
              Beyond classes, Vidyapeeth offers career guidance and counselling — a comprehensive
              approach that goes deeper than most ed-tech companies. We don't just teach the
              syllabus; we help students figure out where to take it next.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {tiers.map(({ Icon, title, body }) => (
              <div
                key={title}
                className="rounded-3xl border border-navy/10 bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgba(27,42,74,0.35)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-saffron/15 text-saffron">
                  <Icon size={22} />
                </div>
                <h3 className="mt-5 font-display text-xl font-bold text-navy">{title}</h3>
                <p className="mt-2 text-sm text-ink">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stat strip */}
      <section className="pb-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-6 md:grid-cols-3">
            <InteractiveStatCard 
              endValue={52000} 
              suffix="+" 
              title="Students learning" 
              imageSrc={characters.students} 
            />
            <InteractiveStatCard 
              endValue={96} 
              suffix="%" 
              title="Board pass rate" 
              imageSrc={characters.board} 
            />
            <InteractiveStatCard 
              endValue={1240} 
              suffix="+" 
              title="Live classes / month" 
              imageSrc={characters.live} 
            />
          </div>
          <div className="mt-10 flex items-center justify-center gap-2 text-sm text-ink/60">
            <Sparkles size={16} className="text-saffron" /> Hover over the cards to see the impact. Numbers updated quarterly.
          </div>
        </div>
      </section>
      {/* Cross-links */}
      <section className="pb-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-6 sm:grid-cols-3">
            <Link
              to="/demo-class"
              className="group flex flex-col justify-between rounded-3xl border border-navy/10 bg-card p-7 transition-all hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgba(27,42,74,0.35)]"
            >
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-saffron">Try us</span>
                <h3 className="mt-2 font-display text-xl font-bold text-navy">Book a free demo class</h3>
                <p className="mt-2 text-sm text-ink/70">60 minutes with a real mentor. No card needed.</p>
              </div>
              <span className="mt-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-navy text-cream transition-colors group-hover:bg-saffron">
                <ArrowUpRight size={16} />
              </span>
            </Link>
            <Link
              to="/courses"
              className="group flex flex-col justify-between rounded-3xl border border-navy/10 bg-card p-7 transition-all hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgba(27,42,74,0.35)]"
            >
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-saffron">Learn</span>
                <h3 className="mt-2 font-display text-xl font-bold text-navy">Browse all courses</h3>
                <p className="mt-2 text-sm text-ink/70">Class 6–10, live classes, weekly tests.</p>
              </div>
              <span className="mt-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-navy text-cream transition-colors group-hover:bg-saffron">
                <ArrowUpRight size={16} />
              </span>
            </Link>
            <Link
              to="/blog"
              className="group flex flex-col justify-between rounded-3xl border border-navy/10 bg-card p-7 transition-all hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgba(27,42,74,0.35)]"
            >
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-saffron">Read</span>
                <h3 className="mt-2 font-display text-xl font-bold text-navy">Study tips & guides</h3>
                <p className="mt-2 text-sm text-ink/70">Weekly articles from our mentors and toppers.</p>
              </div>
              <span className="mt-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-navy text-cream transition-colors group-hover:bg-saffron">
                <ArrowUpRight size={16} />
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
