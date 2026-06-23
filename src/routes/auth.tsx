import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, BookOpen, Target, MessageCircle, Trophy, LineChart, Video } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

const showcaseFeatures = [
  { icon: BookOpen, title: "Concept-First Learning", desc: "Understand deeply instead of memorizing." },
  { icon: Target, title: "Personal Learning Plans", desc: "Weekly roadmaps tailored to every student." },
  { icon: MessageCircle, title: "Live Doubt Solving", desc: "Get unstuck instantly with expert mentors." },
  { icon: Trophy, title: "Scholarship Opportunities", desc: "Compete in VSAT and earn rewards." },
  { icon: LineChart, title: "Parent Progress Reports", desc: "Transparent performance tracking." },
  { icon: Video, title: "Interactive Live Classes", desc: "Engaging sessions with expert teachers." },
];

function AuthPage() {
  const { mode = "signin", redirect = "/dashboard" } = useSearch({ from: "/auth" });
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"signin" | "signup">(mode);
  const { user, signIn, signUp, signInWithGoogle } = useAuth();

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [classLevel, setClassLevel] = useState("");
  
  const [loading, setLoading] = useState(false);
  
  // Showcase State
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % showcaseFeatures.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isHovered]);

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

  async function handleGoogleSignIn() {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast.success("Successfully authenticated with Google");
    } catch (err: any) {
      if (err.code !== "auth/popup-closed-by-user") {
        toast.error(err.message || "Failed to authenticate with Google");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-dvh overflow-hidden flex flex-col md:flex-row bg-cream grain">
      {/* Left Side: Branding / Promo (Hidden on mobile, shown on md and up) */}
      <div className="hidden md:flex md:w-1/2 bg-navy flex-col justify-between p-10 lg:p-16 relative overflow-hidden text-cream border-r border-navy/20">
        {/* Background illustration/image */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="absolute -left-20 top-20 w-80 h-80 bg-saffron/15 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10">
          <Link to="/" className="text-xl font-black font-display tracking-wide text-cream flex items-center gap-3">
            <span className="w-9 h-9 rounded bg-saffron flex items-center justify-center text-navy shadow-lg">V</span>
            Vidyapeeth
          </Link>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-end pb-8 pt-16">
          <div 
            className="relative min-h-[200px] w-full max-w-lg"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <AnimatePresence mode="wait">
              {showcaseFeatures.map((feature, idx) => (
                idx === currentFeature && (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="absolute inset-0 flex items-start"
                  >
                    <div className="relative flex-1">
                      <h4 className="relative z-10 font-black font-display text-3xl lg:text-4xl text-cream tracking-wide leading-tight">
                        {feature.title}
                      </h4>
                      <p className="relative z-10 text-lg lg:text-xl text-cream/70 mt-4 font-medium leading-relaxed italic">
                        — {feature.desc}
                      </p>
                    </div>
                  </motion.div>
                )
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="relative z-10 border-t border-cream/10 pt-8 mt-auto flex items-center gap-8 opacity-80">
          <div>
            <p className="font-display font-black text-xl text-cream">50K+</p>
            <p className="text-[10px] text-cream/60 uppercase tracking-widest font-bold mt-1">Students</p>
          </div>
          <div>
            <p className="font-display font-black text-xl text-cream">100+</p>
            <p className="text-[10px] text-cream/60 uppercase tracking-widest font-bold mt-1">Courses</p>
          </div>
          <div>
            <p className="font-display font-black text-xl text-cream">95%</p>
            <p className="text-[10px] text-cream/60 uppercase tracking-widest font-bold mt-1">Success</p>
          </div>
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="w-full md:w-1/2 h-full flex flex-col items-center justify-center p-6 md:p-10 lg:p-16 overflow-y-auto">
        <div className="w-full max-w-md my-auto py-8">
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

          <div className="mt-6 rounded-3xl border border-navy/10 bg-card shadow-[0_30px_60px_-30px_rgba(27,42,74,0.15)] overflow-hidden">
            <div className="p-6 md:px-8 md:pt-8 pb-0">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-navy/15 bg-white px-7 py-3.5 text-sm font-semibold text-navy transition-all hover:bg-navy/5 disabled:opacity-60 shadow-sm"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleIcon />}
                Continue with Google
              </button>

              <div className="relative mt-6 mb-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-navy/10"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-wider">
                  <span className="bg-card px-3 font-bold text-navy/40">Or continue with email</span>
                </div>
              </div>
            </div>

            <form onSubmit={onSubmit} className="p-6 md:px-8 md:pb-8 pt-4 space-y-4">
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

function GoogleIcon() {
  return (
    <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
      <path d="M1 1h22v22H1z" fill="none" />
    </svg>
  );
}