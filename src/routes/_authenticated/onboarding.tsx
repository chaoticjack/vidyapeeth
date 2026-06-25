import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, LayoutDashboard, Target, TrendingUp, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({ meta: [{ title: "Get started — Vidyapeeth" }] }),
  component: OnboardingPage,
});

const onboardingSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  phone: z.string().regex(/^[0-9]{10}$/, "Must be a valid 10-digit Indian phone number"),
  classLevel: z.string().min(1, "Please select a class"),
});

type OnboardingForm = z.infer<typeof onboardingSchema>;

const TRANSITION_TEXTS = [
  "✓ Profile Created",
  "Finding courses for you...",
  "Preparing your dashboard...",
  "Loading recommendations...",
  "Adding your learning profile..."
];

function OnboardingPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [transitionIndex, setTransitionIndex] = useState(0);
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid, isSubmitting },
  } = useForm<OnboardingForm>({
    resolver: zodResolver(onboardingSchema),
    mode: "onChange",
    defaultValues: {
      classLevel: "8",
      fullName: "",
      phone: "",
    }
  });

  useEffect(() => {
    if (user?.fullName) {
      setValue("fullName", user.fullName, { shouldValidate: true });
    }
    if (user?.phone) {
      setValue("phone", user.phone, { shouldValidate: true });
    }
    if (user?.classLevel) {
      setValue("classLevel", user.classLevel, { shouldValidate: true });
    }
  }, [user, setValue]);

  // Transition text sequence
  useEffect(() => {
    if (step === 3) {
      const interval = setInterval(() => {
        setTransitionIndex((prev) => {
          if (prev < TRANSITION_TEXTS.length - 1) return prev + 1;
          clearInterval(interval);
          return prev;
        });
      }, 400); // 400ms per text for ~2s total

      const timeout = setTimeout(() => {
        window.location.href = "/dashboard";
      }, 2500);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [step]);

  async function onSubmit(data: OnboardingForm) {
    if (!user) return;
    try {
      await setDoc(doc(db, "users", user.id), {
        fullName: data.fullName,
        phone: data.phone,
        classLevel: data.classLevel,
        onboardingCompleted: true,
        onboarded: true, // Legacy fallback
        updatedAt: serverTimestamp(),
      }, { merge: true });

      setStep(3);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save profile");
    }
  }

  const slideVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <section className="grain bg-cream min-h-screen pt-24 pb-24 md:pt-32 overflow-hidden flex flex-col items-center">
      <div className="mx-auto w-full max-w-md px-6">
        
        {step < 3 && (
          <div className="mb-8 flex justify-center">
            <span className="text-xs font-bold uppercase tracking-[0.22em] text-saffron bg-saffron/10 px-3 py-1 rounded-full">
              Step {step} of 2
            </span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <div className="text-center">
                <h1 className="font-display text-4xl font-black text-navy">
                  Welcome to Vidyapeeth 👋
                </h1>
                <p className="mt-3 text-sm text-ink/70">
                  Let's set up your learning profile in less than a minute.
                </p>
              </div>

              <div className="mt-10 space-y-4">
                <FeatureCard icon={<LayoutDashboard />} title="Personalized Dashboard" />
                <FeatureCard icon={<Target />} title="Recommended Courses" />
                <FeatureCard icon={<TrendingUp />} title="Track Your Progress" />
              </div>

              <button
                onClick={() => setStep(2)}
                className="mt-10 inline-flex w-full items-center justify-center gap-2 rounded-full bg-navy px-7 py-4 text-sm font-semibold text-cream transition-all hover:bg-saffron shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Continue &rarr;
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 rounded-3xl border border-navy/10 bg-card p-8 shadow-[0_30px_60px_-30px_rgba(27,42,74,0.35)]">
                <div className="mb-2">
                  <h2 className="font-display text-2xl font-bold text-navy">Profile Setup</h2>
                  <p className="text-xs text-ink/60 mt-1">Complete your details to finish.</p>
                </div>

                <Field label="Email Address">
                  <input value={user?.email || ""} disabled className="vp-input opacity-60 cursor-not-allowed bg-gray-100" />
                </Field>

                <Field label="Full Name">
                  <input {...register("fullName")} placeholder="Your full name" className="vp-input" />
                  {errors.fullName && <p className="mt-1 text-[11px] text-red-500 font-semibold">{errors.fullName.message}</p>}
                </Field>

                <Field label="Phone (WhatsApp)">
                  <input {...register("phone")} inputMode="numeric" placeholder="10-digit mobile number" className="vp-input" />
                  {errors.phone && <p className="mt-1 text-[11px] text-red-500 font-semibold">{errors.phone.message}</p>}
                </Field>

                <Field label="Your class">
                  <select {...register("classLevel")} className="vp-input bg-white">
                    <option value="" disabled>Select Class</option>
                    {[6, 7, 8, 9, 10].map((c) => (
                      <option key={c} value={c.toString()}>Class {c}</option>
                    ))}
                  </select>
                  {errors.classLevel && <p className="mt-1 text-[11px] text-red-500 font-semibold">{errors.classLevel.message}</p>}
                </Field>

                <button
                  type="submit"
                  disabled={!isValid || isSubmitting}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-navy px-7 py-3.5 text-sm font-semibold text-cream transition-all hover:bg-saffron disabled:opacity-50 disabled:hover:bg-navy disabled:cursor-not-allowed shadow-md"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving Profile...
                    </>
                  ) : (
                    "Finish Setup"
                  )}
                </button>
              </form>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="w-full flex flex-col items-center justify-center text-center mt-20"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                className="h-16 w-16 bg-green-500 rounded-full flex items-center justify-center text-white mb-6 shadow-lg shadow-green-500/20"
              >
                <CheckCircle2 size={32} />
              </motion.div>
              
              <div className="h-6 overflow-hidden relative w-full mb-8">
                <AnimatePresence mode="popLayout">
                  <motion.h3
                    key={transitionIndex}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="font-display text-lg font-bold text-navy absolute w-full left-0"
                  >
                    {TRANSITION_TEXTS[transitionIndex]}
                  </motion.h3>
                </AnimatePresence>
              </div>

              <div className="w-48 h-1.5 bg-navy/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2.2, ease: "easeInOut" }}
                  className="h-full bg-saffron rounded-full"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        .vp-input{width:100%;border-radius:12px;border:1px solid rgba(27,42,74,0.16);background:#FFF8F0;padding:12px 14px;font-size:14px;color:#1B2A4A;outline:none;transition:border-color 160ms ease, box-shadow 160ms ease;}
        .vp-input:focus:not(:disabled){border-color:#F4700B;box-shadow:0 0 0 4px rgba(244,112,11,0.15);}
        .vp-input:disabled{opacity:0.6;background-color:rgba(27,42,74,0.05);border-color:rgba(27,42,74,0.1);}
      `}</style>
    </section>
  );
}

function FeatureCard({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-navy/5 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-navy/10">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-saffron/10 text-saffron">
        {icon}
      </div>
      <p className="font-semibold text-navy">{title}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-navy/80">{label}</span>
      {children}
    </label>
  );
}