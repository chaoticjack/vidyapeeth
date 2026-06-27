import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpen, Sparkles, CalendarCheck2, PlayCircle, Trophy, ShieldCheck, Video, Clock, CheckCircle2, ChevronRight, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Student Dashboard — Vidyapeeth" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useAuth();
  const { activities, activeCourses, demoBookings, stats, loading } = useDashboardData(user?.id);

  if (!user) return null;

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
          <Card icon={<BookOpen className="text-saffron" size={20} />} label="Active Enrollments" value={`${stats?.enrolledCount || 0} Courses`} />
          <Card icon={<Video className="text-saffron" size={20} />} label="Demo Classes Taken" value={`${stats?.demoClassesTaken || 0} Sessions`} />
          <Card icon={<CheckCircle2 className="text-saffron" size={20} />} label="Topics Mastered" value={`${stats?.topicsMastered || 0} Lessons`} />
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {/* Main Content Area */}
          <div className="md:col-span-2 space-y-6">
            <Panel title="Current Enrollments">
              {activeCourses.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-navy/20 p-12 text-center bg-white">
                  <div className="h-16 w-16 bg-navy/5 rounded-full flex items-center justify-center mb-4">
                    <BookOpen className="text-navy/40" size={32} />
                  </div>
                  <p className="text-lg font-display font-bold text-navy">No active enrollments</p>
                  <p className="text-sm text-ink/60 mt-2 mb-6 max-w-sm">You haven't enrolled in any courses yet. Explore our catalog and start your learning journey!</p>
                  <Link to="/courses" className="rounded-full bg-navy px-8 py-3 text-sm font-bold text-cream hover:bg-saffron transition-transform hover:-translate-y-1 shadow-xl">
                    Browse Courses
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {activeCourses.map((course, index) => (
                    <div key={course.id} className="flex flex-col sm:flex-row gap-5 rounded-2xl border border-navy/10 p-5 bg-white transition-shadow hover:shadow-lg">
                      {/* Thumbnail / Theme Pattern */}
                      <div className="shrink-0">
                        <div className={`h-32 w-full sm:w-48 rounded-xl flex items-center justify-center p-4 text-center font-display font-black text-xl leading-tight shadow-inner ${
                          index % 2 !== 0 ? 'bg-saffron text-cream' : 'bg-navy text-cream'
                        }`}>
                          {course.subjectClass.replace("Class ", "")}
                        </div>
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1 flex flex-col min-w-0">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-xs font-bold uppercase tracking-wider text-saffron bg-saffron/10 px-2 py-1 rounded-md">
                                {course.subjectClass}
                              </span>
                            </div>
                            <h3 className="text-xl font-bold text-navy mb-1">{course.title}</h3>
                            <p className="text-sm text-ink/60 mb-4">Enrolled on {course.enrollmentDate}</p>
                          </div>
                        </div>

                        <div className="mt-auto pt-4">
                          <div className="flex justify-between items-end mb-2">
                            <p className="text-xs font-semibold text-navy">
                              {course.completedLessons} of {course.totalLessons} lessons completed
                            </p>
                            <span className="text-sm font-black text-navy">{course.progress}%</span>
                          </div>
                          {/* Progress Bar */}
                          <div className="h-2 w-full rounded-full bg-navy/5 overflow-hidden">
                            <div 
                              className="h-full bg-saffron rounded-full transition-all duration-1000 relative" 
                              style={{ width: `${course.progress}%` }} 
                            >
                              <div className="absolute inset-0 bg-white/20" />
                            </div>
                          </div>
                          
                          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-navy/5 pt-4">
                            {course.progress >= 100 ? (
                              <button 
                                onClick={() => toast.success("Downloading Certificate...")}
                                className="text-xs font-bold text-saffron hover:text-navy transition-colors flex items-center gap-1"
                              >
                                <Trophy size={14} /> Download Certificate
                              </button>
                            ) : (
                              <p className="text-xs font-medium text-ink/60">Estimated {Math.ceil((course.totalLessons - course.completedLessons) * 45 / 60)} hrs remaining</p>
                            )}
                            
                            <Link 
                              to="/learn/$courseId"
                              params={{ courseId: course.courseId }}
                              search={{ lessonId: undefined }}
                              className="inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2 text-xs font-bold text-cream hover:bg-saffron transition-colors"
                            >
                              <PlayCircle size={14} />
                              {course.progress >= 100 ? 'Review Course' : (course.completedLessons > 0 ? 'Continue Learning' : 'Start Learning')}
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Panel>

            <Panel title="Booking History">
              {demoBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-navy/10 p-8 text-center bg-white">
                  <CalendarCheck2 className="text-navy/20 mb-3" size={32} />
                  <p className="text-sm font-semibold text-navy">No demo classes booked.</p>
                  <p className="text-xs text-ink/60 mt-1 mb-4">Want to speak with a mentor? Book a free session.</p>
                  <Link to="/demo-class" className="rounded-full border-2 border-saffron px-5 py-2 text-xs font-bold text-saffron hover:bg-saffron hover:text-white transition-colors">
                    Book Free Demo
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {demoBookings.map((booking) => (
                    <div key={booking.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-navy/5 bg-white p-4 shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                          booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-saffron/10 text-saffron'
                        }`}>
                          {booking.status === 'completed' ? <CheckCircle2 size={24} /> :
                           booking.status === 'cancelled' ? <XCircle size={24} /> :
                           <CalendarCheck2 size={24} />}
                        </div>
                        <div>
                          <p className="font-bold text-navy flex items-center gap-2">
                            {booking.teacher}
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              booking.status === 'completed' ? 'bg-green-100 text-green-700' :
                              booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                              'bg-saffron/10 text-saffron'
                            }`}>
                              {booking.status}
                            </span>
                          </p>
                          <p className="text-sm text-ink/70 flex items-center gap-1 mt-0.5">
                            <Clock size={14} /> {booking.date} at {booking.time}
                          </p>
                        </div>
                      </div>
                      
                      {booking.status === 'pending' && (
                        <a 
                          href={booking.meetingLink || "#"}
                          target={booking.meetingLink ? "_blank" : undefined}
                          rel={booking.meetingLink ? "noreferrer" : undefined}
                          onClick={(e) => {
                             if (!booking.meetingLink) { e.preventDefault(); toast.error("Meeting link will be shared soon."); }
                          }}
                          className="shrink-0 inline-flex items-center gap-1 rounded-full bg-navy px-4 py-2 text-xs font-bold text-cream hover:bg-saffron transition-colors"
                        >
                          <Video size={14} /> Join Meeting
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-6">
            <Panel title="Recent Activity">
              {activities.length === 0 ? (
                <div className="rounded-2xl p-6 text-center border border-dashed border-navy/10 bg-white">
                  <Sparkles className="text-navy/20 mx-auto mb-2" size={24} />
                  <p className="text-sm font-medium text-navy/70">No recent activity.</p>
                </div>
              ) : (
                <div className="relative border-l-2 border-navy/5 ml-3 pl-5 space-y-6 py-2">
                  {activities.map((act, i) => (
                    <div key={act.id} className="relative">
                      <div className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-cream bg-saffron" />
                      <p className="text-sm font-medium text-navy leading-snug">{act.text}</p>
                      <p className="text-[11px] font-semibold text-ink/40 mt-1 uppercase tracking-wider">{act.time}</p>
                    </div>
                  ))}
                </div>
              )}
            </Panel>

            <Panel title="Quick Actions">
              <div className="space-y-3">
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
    <div className="rounded-2xl border border-navy/10 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink/50">{icon}{label}</div>
      <p className="mt-3 font-display text-3xl font-black capitalize text-navy">{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-navy/10 bg-card p-6 shadow-sm">
      <h2 className="font-display text-lg font-black text-navy mb-5">{title}</h2>
      <div>{children}</div>
    </div>
  );
}

function DashLink({ to, title, body }: { to: "/courses" | "/demo-class" | "/dashboard/progress"; title: string; body: string }) {
  return (
    <Link to={to} className="block rounded-xl border border-navy/5 bg-white p-4 transition-all hover:border-saffron hover:shadow-md group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-navy group-hover:text-saffron transition-colors">{title}</p>
          <p className="text-xs text-ink/60 mt-0.5">{body}</p>
        </div>
        <ChevronRight size={16} className="text-navy/20 group-hover:text-saffron transition-colors" />
      </div>
    </Link>
  );
}

function AccountSecurityPanel() {
  const { changePassword } = useAuth();
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [loading, setLoading] = useState(false);

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
    <div className="rounded-3xl border border-saffron/20 bg-saffron/5 p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-saffron shadow-sm border border-saffron/10">
          <ShieldCheck size={20} />
        </div>
        <div>
          <h2 className="font-display text-base font-bold text-navy leading-tight">Account Security</h2>
          <p className="text-[11px] font-medium text-ink/60 mt-0.5">Keep your account safe</p>
        </div>
      </div>
      
      <form onSubmit={handlePasswordChange} className="space-y-3">
        <input
          type="password"
          placeholder="Current Password"
          value={currentPass}
          onChange={(e) => setCurrentPass(e.target.value)}
          className="w-full rounded-lg border-navy/10 bg-white px-3 py-2 text-sm focus:border-saffron focus:ring-saffron"
          required
        />
        <input
          type="password"
          placeholder="New Password"
          value={newPass}
          onChange={(e) => setNewPass(e.target.value)}
          className="w-full rounded-lg border-navy/10 bg-white px-3 py-2 text-sm focus:border-saffron focus:ring-saffron"
          required
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPass}
          onChange={(e) => setConfirmPass(e.target.value)}
          className="w-full rounded-lg border-navy/10 bg-white px-3 py-2 text-sm focus:border-saffron focus:ring-saffron"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-navy py-2 text-xs font-bold text-cream hover:bg-saffron transition-colors disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
