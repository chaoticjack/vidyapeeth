import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpen, Sparkles, CalendarCheck2, PlayCircle, Trophy, Bell, Clock, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useDashboardData } from "@/hooks/use-dashboard-data";

import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Student Dashboard — Vidyapeeth" }] }),
  component: DashboardPage,
});



function DashboardPage() {
  const { user } = useAuth();
  const { activities, activeCourses, liveClasses, overallProgress, enrolledCount, loading } = useDashboardData(user?.id);

  if (!user) return null; // Route guard handles redirect


  return (
    <section className="grain bg-cream pt-32 pb-24 md:pt-36">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.22em] text-saffron">
              Student Dashboard
            </span>
            <h1 className="mt-2 font-display text-4xl font-black text-navy md:text-5xl">
              Welcome back, {user.fullName.split(" ")[0]}!
            </h1>
            <p className="mt-1 text-sm text-ink/70">
              Class {user.classLevel} • {user.email}
            </p>
          </div>

        </div>

        {/* Top Stats */}
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <Card icon={<BookOpen className="text-saffron" size={20} />} label="Enrolled Courses" value={`${enrolledCount} Active`} />
          <Card icon={<Sparkles className="text-saffron" size={20} />} label="Overall Progress" value={`${overallProgress}%`} />
          <Card icon={<Trophy className="text-saffron" size={20} />} label="Reward Points" value={(user.rewardPoints || 0).toLocaleString()} />
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {/* Main Content Area: Continue Learning */}
          <div className="md:col-span-2 space-y-6">
            <Panel title="Continue Learning">
              {activeCourses.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-navy/20 p-8 text-center bg-navy/5">
                  <BookOpen className="text-navy/40 mb-3" size={32} />
                  <p className="text-sm font-semibold text-navy">No active courses</p>
                  <p className="text-xs text-ink/60 mt-1 mb-4">You haven't started any courses yet. Explore our catalog!</p>
                  <Link to="/courses" className="rounded-full bg-saffron px-5 py-2 text-xs font-semibold text-white hover:bg-[#d65f08] transition-colors">
                    Explore Courses
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeCourses.map((course) => (
                    <div key={course.id} className="rounded-2xl border border-navy/10 p-5 transition-shadow hover:shadow-md">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-display text-lg font-bold text-navy">{course.title}</h3>
                          <p className="text-sm text-ink/70 flex items-center gap-1 mt-1">
                            <PlayCircle size={14} className="text-saffron" /> 
                            Next: {course.nextLesson} ({course.duration})
                          </p>
                        </div>
                        <span className="text-sm font-bold text-navy">{course.progress}%</span>
                      </div>
                      {/* Progress Bar */}
                      <div className="h-2.5 w-full rounded-full bg-navy/10 overflow-hidden">
                        <div 
                          className="h-full bg-saffron rounded-full transition-all duration-1000" 
                          style={{ width: `${course.progress}%` }} 
                        />
                      </div>
                      <div className="mt-4 flex justify-end">
                        <button 
                          onClick={() => toast.success("Resuming lesson...")}
                          className="rounded-full bg-navy px-5 py-2 text-xs font-semibold text-cream hover:bg-saffron transition-colors"
                        >
                          Resume Lesson
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Panel>

            <Panel title="Upcoming Live Classes">
              {liveClasses.length === 0 ? (
                <div className="rounded-2xl border border-navy/10 p-5 text-center bg-white">
                  <p className="text-sm font-medium text-navy/70">No live classes scheduled for today.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {liveClasses.map((course) => (
                    <div key={course.id} className="flex items-center gap-4 rounded-2xl border border-saffron/30 bg-saffron/5 p-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-saffron text-cream">
                        <CalendarCheck2 size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-navy">{course.upcomingLiveClass?.title}</p>
                        <p className="text-sm text-ink/70 flex items-center gap-1">
                          <Clock size={14} /> {course.upcomingLiveClass?.date}, {course.upcomingLiveClass?.time}
                        </p>
                      </div>
                      <button 
                        onClick={() => toast.success("Joining class...")}
                        className="ml-auto rounded-full border border-navy px-4 py-1.5 text-xs font-semibold text-navy hover:bg-navy hover:text-cream transition-colors"
                      >
                        Join Now
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </div>

          {/* Sidebar Area: Activity & Quick Links */}
          <div className="space-y-6">
            <Panel title="Recent Activity">
              {activities.length === 0 ? (
                <div className="rounded-2xl p-4 text-center">
                  <p className="text-sm font-medium text-navy/70">No recent activity found. Start learning to earn points!</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {activities.map((act) => (
                    <li key={act.id} className="relative pl-6 before:absolute before:left-1 before:top-2 before:h-2 before:w-2 before:rounded-full before:bg-saffron">
                      <p className="text-sm font-medium text-navy">{act.text}</p>
                      <p className="text-xs text-ink/50 mt-0.5">{act.time}</p>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <Panel title="Quick Actions">
              <div className="space-y-3">
                <DashLink to="/dashboard/progress" title="My Progress & Reports" body="View detailed test analytics." />
                <DashLink to="/courses" title="Explore New Courses" body="Find more topics to learn." />
                <DashLink to="/demo-class" title="Book a 1-on-1 Mentorship" body="Schedule doubt clearing." />
              </div>
            </Panel>

            <AccountSecurityPanel />
          </div>
        </div>
      </div>
    </section>
  );
}

function Card({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-navy/10 bg-card p-5">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-ink/60">{icon}{label}</div>
      <p className="mt-2 font-display text-2xl font-black capitalize text-navy">{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-navy/10 bg-card p-6">
      <h2 className="font-display text-lg font-bold text-navy">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function DashLink({ to, title, body }: { to: "/courses" | "/demo-class" | "/dashboard/progress"; title: string; body: string }) {
  return (
    <Link to={to} className="block rounded-xl border border-navy/10 px-4 py-3 transition-colors hover:border-saffron hover:bg-saffron/5">
      <p className="text-sm font-semibold text-navy">{title}</p>
      <p className="text-xs text-ink/60">{body}</p>
    </Link>
  );
}

function AccountSecurityPanel() {
  const { changePassword } = useAuth();
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (newPass !== confirmPass) {
      toast.error("New passwords do not match.");
      return;
    }
    if (newPass.length < 6) {
      toast.error("Password should be at least 6 characters.");
      return;
    }
    
    setLoading(true);
    try {
      await changePassword(currentPass, newPass);
      toast.success("Password updated successfully!");
      setCurrentPass("");
      setNewPass("");
      setConfirmPass("");
    } catch (err: any) {
      toast.error(err.message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl border border-saffron/20 bg-[#F4700B]/5 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-saffron shadow-sm border border-saffron/10">
          <ShieldCheck size={20} />
        </div>
        <div>
          <h2 className="font-display text-base font-bold text-navy leading-tight">Account Security</h2>
          <p className="text-[11px] font-medium text-ink/60 mt-0.5">Keep your account safe</p>
        </div>
      </div>
      
      <form onSubmit={handlePasswordChange} className="mt-5 space-y-3.5">
        <div>
          <label className="mb-1 block text-xs font-bold text-navy">Current Password</label>
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              value={currentPass}
              placeholder="••••••••"
              onChange={(e) => setCurrentPass(e.target.value)}
              className="w-full rounded-xl border border-navy/10 bg-white px-3 py-2 text-sm text-navy outline-none transition-colors focus:border-saffron focus:ring-1 focus:ring-saffron"
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-navy transition-colors"
            >
              {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        
        <div>
          <label className="mb-1 block text-xs font-bold text-navy">New Password</label>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              value={newPass}
              placeholder="••••••••"
              onChange={(e) => setNewPass(e.target.value)}
              className="w-full rounded-xl border border-navy/10 bg-white px-3 py-2 text-sm text-navy outline-none transition-colors focus:border-saffron focus:ring-1 focus:ring-saffron"
              required
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-navy transition-colors"
            >
              {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p className="mt-1 text-[10px] text-ink/50">Minimum 6 characters</p>
        </div>
        
        <div>
          <label className="mb-1 block text-xs font-bold text-navy">Confirm New Password</label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPass}
              placeholder="••••••••"
              onChange={(e) => setConfirmPass(e.target.value)}
              className="w-full rounded-xl border border-navy/10 bg-white px-3 py-2 text-sm text-navy outline-none transition-colors focus:border-saffron focus:ring-1 focus:ring-saffron"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-navy transition-colors"
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-xl bg-saffron py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#d65f08] disabled:opacity-50 shadow-sm"
        >
          {loading ? "Updating..." : "Change Password"}
        </button>
      </form>
    </div>
  );
}