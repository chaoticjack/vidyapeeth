import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { 
  Trophy, CalendarDays, ShieldCheck, Sparkles, 
  IndianRupee, Loader2, CheckCircle2, 
  BookOpen, Clock, FileText, MonitorCheck,
  Calendar
} from "lucide-react";
import { toast } from "sonner";

const schema = z.object({
  studentName: z.string().min(2, "Student name is required"),
  parentName: z.string().min(2, "Parent name is required"),
  school: z.string().min(2, "School is required"),
  classLevel: z.coerce.number().min(6).max(12),
  city: z.string().min(2, "City is required"),
  phone: z.string().min(10, "10-digit mobile"),
  email: z.string().email("Valid email please"),
});
type Form = z.infer<typeof schema>;

const prizes = [
  { rank: "Rank 1", value: "₹25,00,000", note: "Full scholarship + mentor" },
  { rank: "Rank 2–10", value: "₹5,00,000", note: "Free course + 1:1 prep" },
  { rank: "Rank 11–100", value: "₹50,000", note: "75% course discount" },
  { rank: "Top 1000", value: "Up to 40%", note: "Course discount" },
];

const timeline = [
  { date: "15 Jul 2026", label: "Registrations open", icon: BookOpen },
  { date: "30 Sep 2026", label: "Registrations close", icon: Clock },
  { date: "12 Oct 2026", label: "Admit cards released", icon: FileText },
  { date: "26 Oct 2026", label: "Test day (online, 2 hours)", icon: MonitorCheck },
  { date: "10 Nov 2026", label: "Results & scholarships", icon: Trophy },
];

const points = [
  { Icon: ShieldCheck, label: "100% free to apply. No card. No catch." },
  { Icon: Sparkles, label: "MCQs across Maths, Science, Reasoning & English." },
  { Icon: CalendarDays, label: "Online, proctored, 120 minutes." },
  { Icon: Trophy, label: "Top 1000 students get scholarships." },
];

export function VsatPage() {
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const now = new Date();
  const activeIndex = timeline.findIndex(t => new Date(t.date) >= now);

  const timelineWithStatus = timeline.map((t, i) => {
    let status: "past" | "active" | "upcoming";
    if (activeIndex === -1) {
      status = "past";
    } else if (i < activeIndex) {
      status = "past";
    } else if (i === activeIndex) {
      status = "active";
    } else {
      status = "upcoming";
    }
    return { ...t, status };
  });

  async function onSubmit(values: Form) {
    // Simulate network delay for Firebase preparation
    await new Promise(resolve => setTimeout(resolve, 800));

    toast.success("Registration submitted. Check your email.");
    setDone(true);
    reset();
  }

  return (
    <div className="grain bg-cream">
      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
        {/* Faded Background Image */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img src="/vsat-bg.png" alt="VSAT Background" className="h-full w-full object-cover opacity-40 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-r from-cream via-cream/90 to-cream/20"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-cream/40 via-transparent to-cream"></div>
        </div>

        <div className="mx-auto max-w-7xl px-6 relative z-10">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-saffron/30 bg-saffron/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-saffron">
                <Trophy size={14} /> VSAT 2026
              </span>
              <h1 className="mt-5 font-display text-5xl font-black leading-[1.02] text-navy md:text-7xl">
                Win up to{" "}
                <span className="text-saffron">₹25 lakh</span>{" "}
                <span className="italic font-light text-navy/65">in scholarships.</span>
              </h1>
              <p className="mt-5 max-w-lg text-lg text-ink">
                The Vidyapeeth Scholastic Aptitude Test — a free national exam
                for Class 6–12 students. Rewards real curiosity, not rote.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href="#register"
                  data-cursor="lift"
                  className="inline-flex items-center gap-2 rounded-full bg-navy px-7 py-3.5 text-sm font-semibold text-cream transition-all hover:bg-saffron"
                >
                  Register free <IndianRupee size={14} />
                </a>
                <a
                  href="#syllabus"
                  className="inline-flex items-center gap-2 rounded-full border border-navy/20 px-7 py-3.5 text-sm font-semibold text-navy hover:border-navy/50"
                >
                  See syllabus
                </a>
              </div>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {points.map(({ Icon, label }) => (
                  <li key={label} className="flex items-start gap-2 text-sm text-ink">
                    <Icon size={18} className="mt-0.5 shrink-0 text-saffron" />
                    <span>{label}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative">
              <div className="absolute -left-6 -top-6 h-40 w-40 rounded-full bg-saffron/20 blur-3xl" />
              <div className="relative rounded-[2rem] border border-navy/10 bg-card p-8 shadow-[0_30px_60px_-30px_rgba(27,42,74,0.4)]">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-saffron">Prize pool</p>
                <p className="mt-2 font-display text-5xl font-black text-navy">₹2.4 Cr+</p>
                <p className="mt-1 text-sm text-ink/70">Distributed across 1000+ students</p>
                <div className="mt-6 space-y-3">
                  {prizes.map((p) => (
                    <div key={p.rank} className="flex items-center justify-between gap-3 rounded-xl border border-navy/10 px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-navy">{p.rank}</p>
                        <p className="text-xs text-ink/60">{p.note}</p>
                      </div>
                      <p className="font-display text-lg font-black text-saffron">{p.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section id="timeline" className="border-y border-navy/10 bg-navy py-20 text-cream overflow-hidden">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center md:text-left mb-16">
             <span className="text-xs font-bold uppercase tracking-[0.22em] text-saffron">Timeline</span>
             <h2 className="mt-3 font-display text-4xl font-black md:text-5xl">Scholarship Journey.</h2>
          </div>
          
          <div className="relative">
             {/* Continuous horizontal line (hidden on mobile) */}
             <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-[2px] bg-cream/10 z-0" />
             
             {/* Active Fill Line */}
             <div 
               className="hidden md:block absolute top-12 left-[10%] h-[2px] bg-saffron z-0 transition-all duration-1000 ease-in-out" 
               style={{ width: `${activeIndex === -1 ? 80 : (activeIndex / (timeline.length - 1)) * 80}%` }} 
             />
             
             <div className="grid gap-12 md:grid-cols-5 md:gap-4 relative z-10">
               {timelineWithStatus.map((t) => {
                 const isActive = t.status === "active";
                 const isPast = t.status === "past";
                 const Icon = t.icon;

                 return (
                   <div key={t.label} className="relative flex flex-col items-center text-center group">
                     {/* Milestone Icon Badge */}
                     <div className={`relative z-10 flex h-24 w-24 items-center justify-center rounded-full border-4 transition-all duration-300 ${
                       isActive 
                         ? 'border-saffron bg-navy text-saffron shadow-[0_0_30px_rgba(244,112,11,0.4)] scale-110' 
                         : isPast
                           ? 'border-saffron bg-[#2c1d11] text-saffron'
                           : 'border-cream/10 bg-cream/5 text-cream/40 group-hover:border-cream/30 group-hover:text-cream/60'
                     }`}>
                       <Icon size={32} className={`transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
                     </div>

                     {/* Content */}
                     <div className="mt-8 flex flex-col items-center">
                       <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                         isActive ? 'bg-saffron/10 text-saffron ring-1 ring-saffron/30' : 'bg-cream/5 text-cream/60'
                       }`}>
                         <Calendar size={12} />
                         {t.date}
                       </span>
                       <p className={`mt-4 text-sm font-semibold transition-colors duration-300 ${
                         isActive || isPast ? 'text-cream' : 'text-cream/60'
                       }`}>
                         {t.label}
                       </p>
                     </div>
                   </div>
                 );
               })}
             </div>
          </div>
        </div>
      </section>

      {/* Register */}
      <section id="register" className="py-24 md:py-32">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.22em] text-saffron">Register</span>
            <h2 className="mt-3 font-display text-4xl font-black text-navy md:text-5xl">
              Free to apply.{" "}
              <span className="italic font-light text-navy/65">Lifetime payoff.</span>
            </h2>
            <p className="mt-5 text-ink">
              Fill the form once. We'll WhatsApp your admit card and full
              syllabus PDF within 24 hours.
            </p>
            <ul className="mt-7 space-y-3 text-sm text-ink">
              {[
                "No registration fee — ever.",
                "Admit card + syllabus delivered to your inbox.",
                "Online test, take it from home.",
                "Result + scholarship within 2 weeks.",
              ].map((b) => (
                <li key={b} className="flex items-start gap-2">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-saffron" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="rounded-3xl border border-navy/10 bg-card p-7 shadow-[0_30px_60px_-30px_rgba(27,42,74,0.35)] md:p-9"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Student name" error={errors.studentName?.message}>
                <input {...register("studentName")} className="vp-input" placeholder="Aanya Sharma" />
              </Field>
              <Field label="Class" error={errors.classLevel?.message}>
                <select {...register("classLevel")} className="vp-input">
                  {[6, 7, 8, 9, 10, 11, 12].map((c) => (
                    <option key={c} value={c}>Class {c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Parent name" error={errors.parentName?.message}>
                <input {...register("parentName")} className="vp-input" placeholder="R. Sharma" />
              </Field>
              <Field label="School" error={errors.school?.message}>
                <input {...register("school")} className="vp-input" placeholder="DPS Jaipur" />
              </Field>
              <Field label="City" error={errors.city?.message}>
                <input {...register("city")} className="vp-input" placeholder="Jaipur" />
              </Field>
              <Field label="Parent's mobile" error={errors.phone?.message}>
                <input {...register("phone")} inputMode="numeric" className="vp-input" placeholder="98xxxxxxxx" />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Email" error={errors.email?.message}>
                  <input {...register("email")} type="email" className="vp-input" placeholder="you@example.com" />
                </Field>
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              data-cursor="lift"
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-navy px-7 py-4 text-sm font-semibold text-cream transition-all hover:bg-saffron disabled:opacity-60"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? "Submitting…" : "Register for VSAT 2026"}
            </button>
            {done && (
              <p className="mt-4 text-sm font-medium text-saffron">
                ✓ You're in. Admit card lands within 24 hours.
              </p>
            )}
          </form>
        </div>
      </section>
      <style>{`
        .vp-input{width:100%;border-radius:12px;border:1px solid rgba(27,42,74,0.16);background:#FFF8F0;padding:12px 14px;font-size:14px;color:#1B2A4A;outline:none;transition:border-color 160ms ease, box-shadow 160ms ease;}
        .vp-input:focus{border-color:#F4700B;box-shadow:0 0 0 4px rgba(244,112,11,0.15);}
      `}</style>
    </div>
  );
}

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-navy/80">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-saffron-deep">{error}</span>}
    </label>
  );
}