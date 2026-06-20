import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { Trophy, Calendar, BadgeIndianRupee, FileCheck2 } from "lucide-react";
import { VsatCard } from "@/components/illustrations/VsatCard";

const points = [
  { Icon: BadgeIndianRupee, label: "₹25 lakh prize pool, paid as scholarships" },
  { Icon: Calendar, label: "Two test windows · January & March 2026" },
  { Icon: FileCheck2, label: "Online · 90 minutes · Class 6–10 streams" },
  { Icon: Trophy, label: "Top 50 rankers get a free Board Blitz seat" },
];

export function VSATBlock() {
  const reduced = useReducedMotion();
  return (
    <section className="relative overflow-hidden bg-navy text-cream">
      <div className="pointer-events-none absolute -right-40 top-10 h-96 w-96 rounded-full bg-saffron/20 blur-3xl" />
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-24 md:grid-cols-2 md:py-32">
        <div>
          <span className="font-display text-xs font-bold uppercase tracking-[0.22em] text-saffron">
            VSAT 2026 · Scholarship test
          </span>
          <h2 className="mt-4 font-display text-4xl font-black leading-[1.05] md:text-6xl">
            One test.{" "}
            <span className="italic font-light text-cream/65">
              Real money for real students.
            </span>
          </h2>
          <p className="mt-6 max-w-md text-cream/75">
            The Vidyapeeth Scholastic Aptitude Test rewards genuine curiosity, not
            coaching tricks. No registration fee. No catch.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {points.map(({ Icon, label }, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-cream/85">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cream/8 text-saffron">
                  <Icon size={16} />
                </span>
                {label}
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              to="/vsat"
              data-cursor="lift"
              className="inline-flex items-center gap-2 rounded-full bg-saffron px-7 py-4 text-sm font-semibold text-cream transition-all hover:-translate-y-0.5 hover:bg-cream hover:text-navy"
            >
              Register for VSAT
            </Link>
            <Link
              to="/vsat"
              className="inline-flex items-center gap-2 rounded-full border border-cream/25 px-6 py-4 text-sm font-semibold text-cream hover:border-cream"
            >
              Download syllabus
            </Link>
          </div>
        </div>

        <motion.div
          initial={reduced ? false : { opacity: 0, rotate: -6, y: 30 }}
          whileInView={{ opacity: 1, rotate: -3, y: 0 }}
          whileHover={{ rotate: 0, scale: 1.02 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, margin: "-80px" }}
          style={{ transformPerspective: 800 }}
          className="relative mx-auto w-full max-w-xl"
        >
          <VsatCard className="w-full drop-shadow-[0_30px_60px_rgba(0,0,0,0.35)]" />
        </motion.div>
      </div>
    </section>
  );
}