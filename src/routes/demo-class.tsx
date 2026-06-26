import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { getSeoMeta, getCanonicalLink } from "@/lib/seo";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Clock3,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ArrowUpRight,
  Users,
  BookOpen,
  FileText,
  ShieldCheck,
  Sparkles,
  GraduationCap,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { logActivity } from "@/lib/activity-logger";
import { sendDemoNotification } from "@/lib/server-actions";

const schema = z.object({
  studentName: z.string().min(2, "Add a name"),
  parentPhone: z.string().min(10, "10-digit mobile number"),
  email: z.string().email("Use a valid email"),
  classLevel: z.string().min(1, "Pick a class"),
});
type Form = z.infer<typeof schema>;

export const Route = createFileRoute("/demo-class")({
  head: () => ({
    meta: getSeoMeta(
      "Book a Free Demo Class",
      "Book a free 60-minute live demo class with a Vidyapeeth mentor. Experience real teaching, solve problems live, and get a written learning plan — no card required.",
      "/demo-class"
    ),
    links: [getCanonicalLink("/demo-class")],
  }),
  component: DemoClassPage,
});

const benefits = [
  {
    Icon: Users,
    title: "Real Mentors, Not Recordings",
    body: "60 minutes with a live Vidyapeeth mentor who teaches, not sells. Your child interacts, asks questions, and solves problems in real time.",
  },
  {
    Icon: BookOpen,
    title: "Live Problem-Solving",
    body: "Your child works through actual curriculum problems on-screen during the session. It's a real class, not a slideshow.",
  },
  {
    Icon: FileText,
    title: "Written Learning Plan",
    body: "Within 24 hours of the demo, you receive a personalised learning plan mapping your child's strengths, gaps and recommended pace.",
  },
  {
    Icon: ShieldCheck,
    title: "Zero Pressure, Zero Cost",
    body: "No card required. No auto-enrolment. Cancel any time. We believe the class should speak for itself.",
  },
];

const journeySteps = [
  {
    n: "01",
    title: "Book Your Slot",
    body: "Fill out the form below with your child's details. Pick any class from 6 to 10 — we'll match the right mentor.",
    Icon: MessageCircle,
  },
  {
    n: "02",
    title: "Attend the Live Class",
    body: "Join a 60-minute live session in your browser. Your child solves real problems with a mentor guiding every step.",
    Icon: GraduationCap,
  },
  {
    n: "03",
    title: "Get Your Learning Plan",
    body: "Within 24 hours, receive a detailed written plan — strengths, focus areas and a recommended weekly schedule.",
    Icon: FileText,
  },
];

function DemoClassPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<Form>({ resolver: zodResolver(schema), mode: "onBlur" });

  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmation, setConfirmation] = useState<{
    studentName: string;
    classLevel: string;
    bookingId: string;
    authed: boolean;
  } | null>(null);
  const [countdown, setCountdown] = useState<string>("—");

  useEffect(() => {
    const target = new Date();
    target.setDate(target.getDate() + 2);
    target.setHours(18, 0, 0, 0);
    const tick = () => {
      const diff = Math.max(0, target.getTime() - Date.now());
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff / 3600000) % 24);
      const m = Math.floor((diff / 60000) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setCountdown(
        `${d}d ${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const onSubmit = async (data: Form) => {
    try {
      const docRef = await addDoc(collection(db, "demoRegistrations"), {
        ...data,
        userId: user?.id || null,
        createdAt: serverTimestamp(),
      });

      if (user) {
        await logActivity({
          userId: user.id,
          type: "demo_booked",
          title: `Demo Booked for Class ${data.classLevel}`,
          description: `You have successfully booked a demo class for ${data.studentName}.`,
        });
      }

      // Trigger Email & Admin Notifications securely on the server
      sendDemoNotification({ data: { ...data, bookingId: docRef.id } }).catch(console.error);

      toast.success("Demo booked. We'll WhatsApp you within 4 hours.");
      setConfirmation({
        studentName: data.studentName,
        classLevel: data.classLevel,
        bookingId: docRef.id,
        authed: !!user,
      });
      reset();
    } catch (err) {
      console.error("Error booking demo:", err);
      toast.error("Failed to book demo. Please try again later.");
    }
  };

  function goToProgress() {
    if (!confirmation) return;
    navigate({
      to: "/dashboard/progress",
      search: { confirmed: "demo", ref: confirmation.bookingId },
    });
  }

  return (
    <div className="grain bg-cream">
      {/* Hero */}
      <section className="pt-32 pb-10 md:pt-40 md:pb-14">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <span className="font-display text-xs font-bold uppercase tracking-[0.22em] text-saffron">
            Free Demo Class
          </span>
          <h1 className="mt-4 font-display text-5xl font-black leading-[1.05] text-navy md:text-7xl">
            Try one class.{" "}
            <span className="italic font-light text-navy/65">Decide with proof.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-ink">
            A real 60-minute live session with a Vidyapeeth mentor — not a demo video, not a sales pitch.
            Your child solves problems, asks questions, and you get a written learning plan within 24 hours.
          </p>

          <div className="mx-auto mt-8 flex max-w-md items-center justify-center gap-3 rounded-2xl border border-saffron/30 bg-saffron/10 px-5 py-3.5 text-sm text-navy">
            <Clock3 size={18} className="shrink-0 text-saffron" />
            <span className="font-medium">
              Next live demo cohort opens in{" "}
              <span className="font-display font-bold tabular-nums">{countdown}</span>
            </span>
          </div>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a
              href="#book-demo"
              className="inline-flex items-center gap-2 rounded-full bg-navy px-7 py-3.5 text-sm font-semibold text-cream transition-all hover:bg-saffron"
            >
              Reserve my free seat <ArrowRight size={16} />
            </a>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 rounded-full border border-navy/20 px-7 py-3.5 text-sm font-semibold text-navy transition-all hover:border-navy/50"
            >
              Browse courses
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10 max-w-2xl">
            <span className="font-display text-xs font-bold uppercase tracking-[0.22em] text-saffron">
              Why attend the demo
            </span>
            <h2 className="mt-3 font-display text-3xl font-black text-navy md:text-4xl">
              What makes this{" "}
              <span className="italic font-light text-navy/65">different.</span>
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map(({ Icon, title, body }) => (
              <div
                key={title}
                className="group rounded-3xl border border-navy/10 bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgba(27,42,74,0.35)]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-saffron/15 text-saffron transition-colors group-hover:bg-saffron group-hover:text-cream">
                  <Icon size={22} />
                </div>
                <h3 className="mt-5 font-display text-lg font-bold text-navy">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Journey */}
      <section className="border-y border-navy/10 bg-navy py-20 text-cream md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <span className="font-display text-xs font-bold uppercase tracking-[0.22em] text-saffron">
              Your learning journey
            </span>
            <h2 className="mt-3 font-display text-3xl font-black md:text-4xl">
              From booking to learning plan —{" "}
              <span className="italic font-light text-cream/65">in 3 simple steps.</span>
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {journeySteps.map((step, idx) => (
              <div key={step.n} className="relative">
                {/* Connecting line on desktop */}
                {idx < journeySteps.length - 1 && (
                  <div className="absolute right-0 top-10 hidden h-[2px] w-8 translate-x-full bg-saffron/40 md:block" />
                )}
                <div className="rounded-3xl border border-saffron/20 bg-cream/5 p-7 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <span className="font-display text-3xl font-black text-saffron">{step.n}</span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-saffron/20 text-saffron">
                      <step.Icon size={18} />
                    </div>
                  </div>
                  <h3 className="mt-4 font-display text-xl font-bold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-cream/80">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Strip */}
      <section className="py-14 md:py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-6 text-center sm:grid-cols-3">
            {[
              { k: "52,000+", v: "Students learning with us" },
              { k: "96%", v: "Board pass rate" },
              { k: "4.9 / 5", v: "Average parent rating" },
            ].map((s) => (
              <div key={s.v} className="rounded-2xl border border-navy/10 bg-card p-6">
                <p className="font-display text-3xl font-black text-navy md:text-4xl">{s.k}</p>
                <p className="mt-1.5 text-sm text-ink/70">{s.v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section id="book-demo" className="scroll-mt-28 py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-8 text-center">
            <span className="font-display text-xs font-bold uppercase tracking-[0.22em] text-saffron">
              Book your demo
            </span>
            <h2 className="mt-3 font-display text-3xl font-black text-navy md:text-4xl">
              Reserve your free seat{" "}
              <span className="italic font-light text-navy/65">now.</span>
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-ink">
              Fill in your details and we'll WhatsApp you with a session link within 4 hours.
              No card required. Cancel any time.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="rounded-3xl border border-navy/10 bg-card p-7 shadow-[0_30px_60px_-30px_rgba(27,42,74,0.35)] md:p-9"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Student name" error={errors.studentName?.message}>
                <input
                  {...register("studentName")}
                  placeholder="Aanya Sharma"
                  className="vp-input"
                />
              </Field>
              <Field label="Class" error={errors.classLevel?.message}>
                <select {...register("classLevel")} className="vp-input">
                  <option value="">Select…</option>
                  {[6, 7, 8, 9, 10].map((c) => (
                    <option key={c} value={c}>
                      Class {c}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Parent's mobile" error={errors.parentPhone?.message}>
                <input
                  {...register("parentPhone")}
                  inputMode="numeric"
                  placeholder="98xxxxxxxx"
                  className="vp-input"
                />
              </Field>
              <Field label="Email" error={errors.email?.message}>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="you@example.com"
                  className="vp-input"
                />
              </Field>
            </div>
            <button
              type="submit"
              data-cursor="lift"
              disabled={isSubmitting}
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-navy px-7 py-4 text-sm font-semibold text-cream transition-all hover:bg-saffron disabled:opacity-60 sm:w-auto"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? "Booking…" : "Reserve my free seat"}
            </button>
            {confirmation && (
              <div className="mt-5 rounded-2xl border border-saffron/30 bg-saffron/10 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-saffron" />
                  <div className="min-w-0">
                    <p className="font-display text-base font-black text-navy">
                      Booking confirmed for {confirmation.studentName} (Class{" "}
                      {confirmation.classLevel}).
                    </p>
                    <p className="mt-1 text-xs text-ink/70">
                      Reference:{" "}
                      <span className="font-mono">
                        {confirmation.bookingId.slice(0, 8) || "—"}
                      </span>
                      . We'll WhatsApp you within 4 hours.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {confirmation.authed ? (
                        <button
                          type="button"
                          onClick={goToProgress}
                          className="inline-flex items-center gap-1.5 rounded-full bg-navy px-4 py-2 text-xs font-semibold text-cream hover:bg-saffron"
                        >
                          View in your dashboard <ArrowRight size={14} />
                        </button>
                      ) : (
                        <Link
                          to="/auth"
                          search={{ mode: "signup" }}
                          className="inline-flex items-center gap-1.5 rounded-full bg-navy px-4 py-2 text-xs font-semibold text-cream hover:bg-saffron"
                        >
                          Create account to track it <ArrowRight size={14} />
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => setConfirmation(null)}
                        className="inline-flex items-center rounded-full border border-navy/20 px-4 py-2 text-xs font-semibold text-navy hover:border-navy"
                      >
                        Book another
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <p className="mt-3 text-xs text-ink/70">
              By submitting you agree to our{" "}
              <a className="underline" href="/privacy-policy">
                privacy policy
              </a>
              .
            </p>
          </form>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="pb-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <Link
              to="/courses"
              className="group flex items-center justify-between gap-4 rounded-3xl border border-navy/10 bg-card p-7 transition-all hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgba(27,42,74,0.35)]"
            >
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-saffron">
                  Explore
                </span>
                <h3 className="mt-2 font-display text-xl font-bold text-navy">
                  Browse all courses
                </h3>
                <p className="mt-1 text-sm text-ink/70">
                  Class 6–10 · Live classes · Weekly tests
                </p>
              </div>
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy text-cream transition-colors group-hover:bg-saffron">
                <ArrowUpRight size={18} />
              </span>
            </Link>
            <Link
              to="/contact"
              className="group flex items-center justify-between gap-4 rounded-3xl border border-navy/10 bg-card p-7 transition-all hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgba(27,42,74,0.35)]"
            >
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-saffron">
                  Questions?
                </span>
                <h3 className="mt-2 font-display text-xl font-bold text-navy">
                  Talk to our team
                </h3>
                <p className="mt-1 text-sm text-ink/70">
                  We're open 24×7 · Reply within 4 hours
                </p>
              </div>
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy text-cream transition-colors group-hover:bg-saffron">
                <ArrowUpRight size={18} />
              </span>
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        .vp-input {
          width: 100%;
          border-radius: 12px;
          border: 1px solid rgba(27,42,74,0.16);
          background: #FFF8F0;
          padding: 12px 14px;
          font-size: 14px;
          color: #1B2A4A;
          outline: none;
          transition: border-color 160ms ease, box-shadow 160ms ease;
        }
        .vp-input:focus {
          border-color: #F4700B;
          box-shadow: 0 0 0 4px rgba(244,112,11,0.15);
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  children,
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-navy/80">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-saffron-deep">{error}</span>}
    </label>
  );
}