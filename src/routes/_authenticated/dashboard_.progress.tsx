import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  CalendarCheck2,
  CheckCircle2,
  ReceiptText,
  Sparkles,
} from "lucide-react";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { db } from "@/lib/firebase";

const searchSchema = z.object({
  confirmed: z.enum(["demo", "enrollment"]).optional(),
  ref: z.string().optional(),
});

export const Route = createFileRoute("/_authenticated/dashboard_/progress")({
  head: () => ({ meta: [{ title: "My Courses & Progress — Vidyapeeth" }] }),
  validateSearch: searchSchema,
  component: ProgressPage,
});

// Mock Data Removed

function ProgressPage() {
  const { confirmed, ref } = Route.useSearch();
  const { user } = useAuth();
  const { activeCourses, demoBookings, stats, loading } = useDashboardData(user?.id);

  if (!user || loading) return null;

  return (
    <section className="grain bg-cream pt-32 pb-24 md:pt-36">
      <div className="mx-auto max-w-6xl px-6">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-navy/70 hover:text-saffron"
        >
          <ArrowLeft size={16} /> Back to dashboard
        </Link>

        <div className="mt-6">
          <span className="text-xs font-bold uppercase tracking-[0.22em] text-saffron">
            Your learning journey
          </span>
          <h1 className="mt-2 font-display text-4xl font-black text-navy md:text-5xl">
            My Courses &amp; Progress
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-ink/70">
            Track your enrollments, completed topics, and upcoming scheduled classes.
          </p>
        </div>

        {confirmed && (
          <div className="mt-8 flex items-start gap-4 rounded-3xl border border-saffron/30 bg-saffron/10 p-5 md:p-6">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-saffron text-cream">
              <CheckCircle2 size={20} />
            </span>
            <div className="min-w-0">
              <p className="font-display text-lg font-black text-navy">
                {confirmed === "demo"
                  ? "Demo class confirmed."
                  : "Enrollment confirmed."}
              </p>
              <p className="mt-1 text-sm text-ink/80">
                {confirmed === "demo"
                  ? "Your mentor will WhatsApp you within 4 hours with the slot details."
                  : "Welcome to Vidyapeeth — your learning plan will be emailed within 24 hours."}
                {ref && (
                  <span className="ml-2 text-xs font-medium text-navy/60">
                    Reference: <span className="font-mono">{ref.slice(0, 8)}</span>
                  </span>
                )}
              </p>
            </div>
          </div>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Stat
            icon={<Sparkles size={18} className="text-saffron" />}
            label="Active Enrollments"
            value={stats.enrolledCount}
          />
          <Stat
            icon={<CalendarCheck2 size={18} className="text-saffron" />}
            label="Demo Classes Taken"
            value={stats.demoClassesTaken}
          />
          <Stat
            icon={<CheckCircle2 size={18} className="text-saffron" />}
            label="Topics Mastered"
            value={stats.topicsMastered}
          />
        </div>

        <div className="mt-10 rounded-3xl border border-navy/10 bg-card p-6 md:p-8">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-navy" />
            <h2 className="font-display text-xl font-black text-navy">Current Enrollments</h2>
          </div>
          <div className="mt-5">
            {activeCourses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-navy/15 p-8 text-center">
                <p className="font-semibold text-navy">No active courses</p>
                <Link
                  to="/courses"
                  className="mt-4 inline-flex rounded-full bg-navy px-5 py-2 text-xs font-semibold text-cream hover:bg-saffron"
                >
                  Browse courses
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-navy/10">
                {activeCourses.map((c) => (
                  <li
                    key={c.id}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-4 sm:flex sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-navy">{c.title}</p>
                      <p className="mt-0.5 text-xs text-ink/60">Enrolled on {c.enrollmentDate}</p>
                    </div>
                    <StatusPill status={"active"} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-navy/10 bg-card p-6 md:p-8">
          <div className="flex items-center gap-2">
            <ReceiptText size={18} className="text-navy" />
            <h2 className="font-display text-xl font-black text-navy">Class Booking History</h2>
          </div>

          <div className="mt-5">
            {demoBookings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-navy/15 p-8 text-center">
                <p className="font-semibold text-navy">No class history</p>
                <Link
                  to="/demo-class"
                  className="mt-4 inline-flex rounded-full bg-navy px-5 py-2 text-xs font-semibold text-cream hover:bg-saffron"
                >
                  Book demo
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-navy/10">
                {demoBookings.map((b) => (
                  <li
                    key={b.id}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-4 sm:flex sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-navy">Class {b.classLevel} Demo - {b.studentName}</p>
                      <p className="mt-0.5 text-xs text-ink/60">Scheduled for {b.date} at {b.time}</p>
                    </div>
                    <StatusPill status={b.status || "pending"} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-navy/10 bg-card p-5">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-ink/60">
        {icon}
        {label}
      </div>
      <p className="mt-2 font-display text-3xl font-black text-navy">{value}</p>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const s = status.toLowerCase();
  const tone =
    s === "confirmed" || s === "active" || s === "completed"
      ? "bg-saffron/15 text-saffron"
      : "bg-navy/10 text-navy";
  return (
    <span
      className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${tone}`}
    >
      {s}
    </span>
  );
}
