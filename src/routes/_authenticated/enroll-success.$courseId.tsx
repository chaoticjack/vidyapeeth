import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchCourseBySlug, type Course } from "@/lib/firestore";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PartyPopper, Calendar, User, Phone, ArrowRight, LayoutDashboard, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/enroll-success/$courseId")({
  component: EnrollSuccessPage,
});

function EnrollSuccessPage() {
  const { courseId } = Route.useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const docRef = doc(db, "courses", courseId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setCourse({ id: snap.id, ...snap.data() } as Course);
        } else {
          const bySlug = await fetchCourseBySlug(courseId);
          setCourse(bySlug);
        }
      } catch (err) {
        console.error("Failed to load course:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [courseId]);

  // Mock data for success page
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 2); // Class starts in 2 days
  
  const mentorName = "Dr. Sharma";
  const supportPhone = "+91 1800-123-4567";

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-cream"><Loader2 className="h-8 w-8 animate-spin text-navy" /></div>;
  }
  if (!course) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-cream">
        <h1 className="font-display text-4xl font-black text-navy">Course not found</h1>
        <Link to="/courses" className="mt-4 text-saffron hover:underline">Back to courses</Link>
      </div>
    );
  }

  return (
    <div className="bg-cream min-h-screen flex items-center justify-center pt-24 pb-12">
      <div className="w-full max-w-2xl px-6">
        <div className="rounded-3xl border border-navy/10 bg-white p-8 md:p-12 shadow-xl text-center">
          
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 text-green-500 mb-6">
            <PartyPopper size={40} />
          </div>

          <h1 className="font-display text-4xl font-black text-navy mb-2">Enrollment Successful!</h1>
          <p className="text-ink/70 text-lg mb-10">Welcome aboard. You are now enrolled in <span className="font-bold text-navy">{course.name}</span>.</p>

          <div className="grid gap-4 md:grid-cols-3 mb-10 text-left">
            <div className="rounded-2xl border border-navy/5 bg-navy/5 p-4">
              <Calendar className="text-saffron mb-2" size={24} />
              <p className="text-xs font-bold text-navy/50 uppercase tracking-wider mb-1">First Class Starts</p>
              <p className="font-bold text-navy">{startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
            </div>
            <div className="rounded-2xl border border-navy/5 bg-navy/5 p-4">
              <User className="text-saffron mb-2" size={24} />
              <p className="text-xs font-bold text-navy/50 uppercase tracking-wider mb-1">Assigned Mentor</p>
              <p className="font-bold text-navy">{mentorName}</p>
            </div>
            <div className="rounded-2xl border border-navy/5 bg-navy/5 p-4">
              <Phone className="text-saffron mb-2" size={24} />
              <p className="text-xs font-bold text-navy/50 uppercase tracking-wider mb-1">Support Team</p>
              <p className="font-bold text-navy text-sm">{supportPhone}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/dashboard"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-navy px-8 py-3.5 text-sm font-bold text-white transition-transform hover:-translate-y-1 hover:shadow-lg"
            >
              <LayoutDashboard size={18} /> Go to Dashboard
            </Link>
            <Link
              to="/courses"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border-2 border-navy/10 px-8 py-3.5 text-sm font-bold text-navy transition-colors hover:bg-navy/5"
            >
              Browse More Courses <ArrowRight size={18} />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
