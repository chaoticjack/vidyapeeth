import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({ meta: [{ title: "Get started — Vidyapeeth" }] }),
  component: OnboardingPage,
});

const ROLES = [
  { value: "student", label: "I'm a student" },
  { value: "parent", label: "I'm a parent" },
] as const;

function OnboardingPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<"student" | "parent">("student");
  const [classLevel, setClassLevel] = useState<number>(8);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Firebase auth will populate this later
    const storedUser = localStorage.getItem("mock_user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.fullName) setFullName(user.fullName);
      } catch (e) {
        // ignore
      }
    }
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      // Simulate network delay for Firebase preparation
      await new Promise(resolve => setTimeout(resolve, 800));

      toast.success("You're all set.");
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save profile");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="grain bg-cream pt-32 pb-24 md:pt-40">
      <div className="mx-auto w-full max-w-xl px-6">
        <span className="text-xs font-bold uppercase tracking-[0.22em] text-saffron">
          One more step
        </span>
        <h1 className="mt-3 font-display text-4xl font-black text-navy md:text-5xl">
          Tell us about yourself
        </h1>
        <p className="mt-2 text-sm text-ink/80">
          We'll match you with the right mentor and class.
        </p>
        <form onSubmit={onSubmit} className="mt-8 space-y-5 rounded-3xl border border-navy/10 bg-card p-7 shadow-[0_30px_60px_-30px_rgba(27,42,74,0.35)]">
          <Field label="I am a…">
            <div className="grid grid-cols-2 gap-3">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                    role === r.value
                      ? "border-saffron bg-saffron/10 text-navy"
                      : "border-navy/15 text-navy/70 hover:border-navy/30"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Full name">
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} required className="vp-input" />
          </Field>
          <Field label="Phone (WhatsApp)">
            <input value={phone} onChange={(e) => setPhone(e.target.value)} required inputMode="numeric" placeholder="98xxxxxxxx" className="vp-input" />
          </Field>
          <Field label={role === "student" ? "Your class" : "Your child's class"}>
            <select value={classLevel} onChange={(e) => setClassLevel(Number(e.target.value))} className="vp-input">
              {[6, 7, 8, 9, 10].map((c) => (
                <option key={c} value={c}>Class {c}</option>
              ))}
            </select>
          </Field>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-navy px-7 py-3.5 text-sm font-semibold text-cream transition-all hover:bg-saffron disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Take me to my dashboard
          </button>
        </form>
      </div>
      <style>{`
        .vp-input{width:100%;border-radius:12px;border:1px solid rgba(27,42,74,0.16);background:#FFF8F0;padding:12px 14px;font-size:14px;color:#1B2A4A;outline:none;transition:border-color 160ms ease, box-shadow 160ms ease;}
        .vp-input:focus{border-color:#F4700B;box-shadow:0 0 0 4px rgba(244,112,11,0.15);}
      `}</style>
    </section>
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