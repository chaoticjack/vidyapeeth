import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { COURSES_DATA } from "@/data/courses";
import { PartyPopper, Calendar, User, Phone, ArrowRight, LayoutDashboard } from "lucide-react";

export const Route = createFileRoute("/_authenticated/enroll-success/$courseId")({
  loader: ({ params }) => {
    const course = COURSES_DATA[params.courseId];
    if (!course) {
      throw notFound();
    }
    return { course };
  },
  component: EnrollSuccessPage,
});

function EnrollSuccessPage() {
  const { course } = Route.useLoaderData();

  // Mock data for success page
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 2); // Class starts in 2 days
  
  const mentorName = "Dr. Sharma";
  const supportPhone = "+91 1800-123-4567";

  return (
    <div className="bg-cream min-h-screen flex items-center justify-center pt-24 pb-12">
      <div className="w-full max-w-2xl px-6">
        <div className="rounded-3xl border border-navy/10 bg-white p-8 md:p-12 shadow-xl text-center">
          
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 text-green-500 mb-6">
            <PartyPopper size={40} />
          </div>

          <h1 className="font-display text-4xl font-black text-navy mb-2">Enrollment Successful!</h1>
          <p className="text-ink/70 text-lg mb-10">Welcome aboard. You are now enrolled in <span className="font-bold text-navy">{course.title}</span>.</p>

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
