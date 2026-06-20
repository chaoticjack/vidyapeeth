import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const searchSchema = z.object({
  mode: z.enum(["signin", "signup"]).optional(),
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Authentication — Vidyapeeth" },
      { name: "description", content: "Sign in or create your Vidyapeeth account." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode = "signin", redirect = "/dashboard" } = useSearch({ from: "/auth" });
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"signin" | "signup">(mode);
  const { user, signIn, signUp } = useAuth();

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [classLevel, setClassLevel] = useState("");
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.isAdmin && redirect === "/dashboard") {
        navigate({ to: "/admin" });
      } else {
        navigate({ to: redirect as any });
      }
    }
  }, [user, navigate, redirect]);

  // Sync state with URL if mode changes
  useEffect(() => {
    setActiveTab(mode);
  }, [mode]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (activeTab === "signup") {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }
        if (!email || !password || !fullName || !phone || !classLevel) {
          throw new Error("Please fill all fields");
        }
        
        await signUp(email, password, {
          fullName,
          phone,
          classLevel,
        });
        
        toast.success("Account created successfully!");
        navigate({ to: "/dashboard" });
      } else {
        // Sign in
        if (!email || !password) throw new Error("Please fill all fields");
        
        await signIn(email, password);
        
        toast.success("Welcome back!");
        navigate({ to: redirect as "/dashboard" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-cream grain pt-20 lg:pt-[88px]">
      {/* Left Side: Branding / Promo (Hidden on mobile, shown on md and up) */}
      <div className="hidden md:flex md:w-[45%] lg:w-[40%] bg-navy flex-col justify-between p-10 lg:p-16 relative overflow-hidden text-cream border-r border-navy/20">
        {/* Background illustration/image */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="absolute -left-20 top-20 w-80 h-80 bg-saffron/20 rounded-full blur-[80px]"></div>
        
        <div className="relative z-10">
          <Link to="/" className="text-xl font-black font-display tracking-wide text-cream flex items-center gap-3">
            <span className="w-9 h-9 rounded bg-saffron flex items-center justify-center text-navy shadow-lg">V</span>
            Vidyapeeth
          </Link>

          <div className="mt-20 lg:mt-28">
            <h2 className="font-display text-4xl lg:text-5xl font-black leading-[1.1]">
              Learn Smarter.<br />
              <span className="text-saffron">Grow Faster.</span>
            </h2>
            <p className="mt-5 text-cream/80 text-base max-w-md leading-relaxed">
              Join India's most effective learning platform designed to help you achieve your academic dreams without the stress.
            </p>

            <div className="mt-12 space-y-7">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-cream/10 flex items-center justify-center text-saffron shrink-0 shadow-inner">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                </div>
                <div>
                  <h4 className="font-bold text-cream text-sm">Top Curriculum</h4>
                  <p className="text-xs text-cream/70 mt-0.5">NCERT aligned, concept-first approach.</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-cream/10 flex items-center justify-center text-saffron shrink-0 shadow-inner">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div>
                  <h4 className="font-bold text-cream text-sm">Doubt Solving</h4>
                  <p className="text-xs text-cream/70 mt-0.5">Live 1-on-1 problem solving rooms.</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-cream/10 flex items-center justify-center text-saffron shrink-0 shadow-inner">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <h4 className="font-bold text-cream text-sm">Proven Results</h4>
                  <p className="text-xs text-cream/70 mt-0.5">Consistent top rankers every year.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 border-t border-cream/10 pt-8 mt-12">
          <div className="flex items-center gap-8">
            <div>
              <p className="font-display font-black text-2xl text-cream">50k+</p>
              <p className="text-[10px] text-cream/60 uppercase tracking-widest font-bold mt-1">Students</p>
            </div>
            <div>
              <p className="font-display font-black text-2xl text-cream">100+</p>
              <p className="text-[10px] text-cream/60 uppercase tracking-widest font-bold mt-1">Courses</p>
            </div>
            <div>
              <p className="font-display font-black text-2xl text-cream">95%</p>
              <p className="text-[10px] text-cream/60 uppercase tracking-widest font-bold mt-1">Success</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10 lg:p-16">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <Link to="/" className="md:hidden text-xs font-semibold uppercase tracking-[0.22em] text-saffron flex justify-center mb-8">
            Vidyapeeth
          </Link>
          
          <div>
            <h1 className="font-display text-3xl font-black text-navy md:text-4xl">
              {activeTab === "signup" ? "Create an account" : "Welcome back"}
            </h1>
            <p className="mt-2 text-sm text-ink/80">
              {activeTab === "signup"
                ? "Join our community of passionate learners."
                : "Sign in to access your dashboard and courses."}
            </p>
          </div>

          <div className="mt-8 rounded-3xl border border-navy/10 bg-card shadow-[0_30px_60px_-30px_rgba(27,42,74,0.15)] overflow-hidden">
            <form onSubmit={onSubmit} className="p-7 md:p-8 space-y-4">
              {activeTab === "signup" && (
                <>
                  <Field label="Full Name">
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="vp-input"
                      placeholder="e.g. Aanya Sharma"
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Phone Number">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="vp-input"
                        placeholder="10-digit number"
                      />
                    </Field>
                    <Field label="Class">
                      <select
                        value={classLevel}
                        onChange={(e) => setClassLevel(e.target.value)}
                        required
                        className="vp-input"
                      >
                        <option value="" disabled>Select Class</option>
                        <option value="6">Class 6</option>
                        <option value="7">Class 7</option>
                        <option value="8">Class 8</option>
                        <option value="9">Class 9</option>
                        <option value="10">Class 10</option>
                      </select>
                    </Field>
                  </div>
                </>
              )}

              <Field label="Email address">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="vp-input"
                  placeholder="you@example.com"
                />
              </Field>

              <Field label="Password">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="vp-input"
                  placeholder="••••••••"
                />
              </Field>

              {activeTab === "signup" && (
                <Field label="Confirm Password">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="vp-input"
                    placeholder="••••••••"
                  />
                </Field>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-full bg-navy px-7 py-3.5 text-sm font-semibold text-cream transition-all hover:bg-saffron disabled:opacity-60"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {activeTab === "signup" ? "Create Account" : "Login"}
              </button>
            </form>
            
            <div className="bg-navy/5 p-6 text-center border-t border-navy/10">
              {activeTab === "signin" ? (
                <p className="text-sm text-ink/80">
                  New to Vidyapeeth?{" "}
                  <button
                    type="button"
                    onClick={() => setActiveTab("signup")}
                    className="font-semibold text-saffron hover:text-saffron-deep hover:underline transition-colors"
                  >
                    Create an account
                  </button>
                </p>
              ) : (
                <p className="text-sm text-ink/80">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setActiveTab("signin")}
                    className="font-semibold text-saffron hover:text-saffron-deep hover:underline transition-colors"
                  >
                    Login
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>

        <style>{`
          .vp-input { width: 100%; border-radius: 12px; border: 1px solid rgba(27,42,74,0.16); background: #FFF8F0; padding: 12px 14px; font-size: 14px; color: #1B2A4A; outline: none; transition: border-color 160ms ease, box-shadow 160ms ease; }
          .vp-input:focus { border-color: #F4700B; box-shadow: 0 0 0 4px rgba(244,112,11,0.15); }
        `}</style>
      </div>
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