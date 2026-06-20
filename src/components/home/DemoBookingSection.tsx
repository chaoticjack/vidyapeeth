import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Clock3, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";

const schema = z.object({
  studentName: z.string().min(2, "Add a name"),
  parentPhone: z.string().min(10, "10-digit mobile number"),
  email: z.string().email("Use a valid email"),
  classLevel: z.string().min(1, "Pick a class"),
});
type Form = z.infer<typeof schema>;

const benefits = [
  "60 minutes with a real Vidyapeeth mentor — not a sales call.",
  "Live, in-browser. Your child solves problems on screen.",
  "Get a written learning plan within 24 hours.",
  "Zero pressure. Cancel any time. No card needed.",
];

export function DemoBookingSection() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<Form>({ resolver: zodResolver(schema), mode: "onBlur" });

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
      setCountdown(`${d}d ${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const onSubmit = async (data: Form) => {
    // Simulate network delay for Firebase preparation
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // MOCK SUBMISSION
    const mockBookingId = `demo_${Math.random().toString(36).slice(2, 9)}`;
    const mockAuthed = false; // Will be replaced by Firebase Auth

    toast.success("Demo booked. We'll WhatsApp you within 4 hours.");
    setConfirmation({
      studentName: data.studentName,
      classLevel: data.classLevel,
      bookingId: mockBookingId,
      authed: mockAuthed,
    });
    reset();
  };

  function goToProgress() {
    if (!confirmation) return;
    navigate({
      to: "/dashboard/progress",
      search: { confirmed: "demo", ref: confirmation.bookingId },
    });
  }


  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      {/* Classroom background image */}
      <div
        className="absolute inset-0 z-0"
        aria-hidden="true"
      >
        <img
          src="/images/classroom-bg.png"
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover object-center"
        />
      </div>
      {/* Soft white overlay for readability (washes out the image) */}
      <div
        className="absolute inset-0 z-[1] bg-cream/85 backdrop-blur-[2px]"
        aria-hidden="true"
      />
      <div className="relative z-[3] mx-auto max-w-7xl px-6">
        <div className="grid items-start gap-14 md:grid-cols-2">
          <div className="md:pr-8">
            <span className="font-display text-xs font-bold uppercase tracking-[0.22em] text-saffron">
              Free demo class
            </span>
            <h2 className="mt-3 font-display text-4xl font-black leading-[1.05] text-navy md:text-6xl">
              Try one class.{" "}
              <span className="italic font-light text-navy/65">
                Decide with proof.
              </span>
            </h2>
            <ul className="mt-9 space-y-4">
              {benefits.map((b) => (
                <li key={b} className="flex items-start gap-3 text-base text-ink">
                  <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-saffron" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div className="mb-3 flex items-center gap-3 rounded-2xl border border-saffron/30 bg-saffron/10 px-4 py-3 text-sm text-navy">
              <Clock3 size={18} className="text-saffron" />
              <span className="font-medium">
                Next live demo cohort opens in{" "}
                <span className="font-display font-bold tabular-nums">{countdown}</span>
              </span>
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
        </div>
      </div>
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
    </section>
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