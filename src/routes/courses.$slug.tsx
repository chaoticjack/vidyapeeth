import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getAdminDb } from "@/lib/firebase-admin";
import { getSeoMeta, getCanonicalLink, siteUrl } from "@/lib/seo";
import { CheckCircle2, Clock, Users, BookOpen, Trophy, ArrowUpRight, ChevronRight, Home, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchCourseBySlug, fetchSubjectsByCourse, type Course, type Subject } from "@/lib/firestore";
import { useAuth } from "@/hooks/use-auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

const fetchCourseSeo = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    try {
      const adminDb = getAdminDb();
      const snap = await adminDb.collection("courses").where("slug", "==", slug).limit(1).get();
      if (snap.empty) return null;
      const data = snap.docs[0].data();
      return { title: data.title, description: data.description };
    } catch (e) {
      return null;
    }
  });

export const Route = createFileRoute("/courses/$slug")({
  loader: async ({ params }) => {
    return await fetchCourseSeo({ data: params.slug });
  },
  head: ({ loaderData, params }) => {
    const slug = params.slug;
    const urlPath = `/courses/${slug}`;
    if (!loaderData) {
      return {
        meta: getSeoMeta("Course Not Found", "This course could not be found.", urlPath),
        links: [getCanonicalLink(urlPath)],
      };
    }
    const { title, description } = loaderData;
    return {
      meta: getSeoMeta(title, description || `Learn about ${title} on Vidyapeeth.`, urlPath),
      links: [getCanonicalLink(urlPath)],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Course",
            name: title,
            description: description || `Learn about ${title}`,
            provider: {
              "@type": "EducationalOrganization",
              name: "Vidyapeeth",
              url: siteUrl,
            },
          }),
        },
      ],
    };
  },
  component: CourseCurriculumPage,
});

function CourseCurriculumPage() {
  const { slug } = Route.useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    async function loadData() {
      const c = await fetchCourseBySlug(slug);
      if (!c) {
        setLoading(false);
        return;
      }
      setCourse(c);
      const subs = await fetchSubjectsByCourse(c.id);
      setSubjects(subs);
      
      if (user) {
        const q = query(collection(db, "enrollments"), where("userId", "==", user.id), where("courseId", "==", c.id), where("status", "==", "active"));
        const snap = await getDocs(q);
        setIsEnrolled(!snap.empty);
      }
      
      setLoading(false);
    }
    loadData();
  }, [slug, user]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-cream">
        <Loader2 className="h-8 w-8 animate-spin text-navy" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-cream">
        <h1 className="font-display text-4xl font-black text-navy">Course not found</h1>
        <Link to="/courses" className="mt-4 text-saffron hover:underline">Back to courses</Link>
      </div>
    );
  }

  const isSaffron = (course.displayOrder ?? 0) % 2 !== 0;

  return (
    <div className="bg-cream selection:bg-navy/20">
      <div className={`relative overflow-hidden ${isSaffron ? "bg-saffron" : "bg-navy"}`}>
        {/* Grain texture */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.3 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
        
        {/* Breadcrumb Navigation */}
        <div className="mx-auto max-w-6xl px-6 pt-24 relative z-10">
          <nav className="flex items-center gap-2 text-sm font-semibold text-cream/70">
            <Link to="/" className="hover:text-cream transition-colors"><Home size={14} /></Link>
            <ChevronRight size={14} className="opacity-50" />
            <Link to="/courses" className="hover:text-cream transition-colors">Courses</Link>
            <ChevronRight size={14} className="opacity-50" />
            <span className="text-cream">Class {course.classLevel}</span>
          </nav>
        </div>

        <section className="relative px-6 py-16 md:py-24 z-10">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl text-cream">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${isSaffron ? "bg-cream/20" : "bg-saffron/20 text-saffron"}`}>
                    Class {course.classLevel}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-cream/20 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em]">
                    {course.duration}
                  </span>
                </div>
                <h1 className="mt-6 font-display text-5xl font-black leading-[1.05] md:text-7xl">
                  {course.name}
                </h1>
                <p className="mt-6 text-lg text-cream/90 md:text-xl">
                  {course.description}
                </p>
                <div className="mt-10 flex flex-wrap items-center gap-4">
                  {isEnrolled ? (
                    <Link
                      to="/learn/$courseId"
                      params={{ courseId: course.id }}
                      search={{ lessonId: undefined }}
                      className={`inline-flex h-14 items-center justify-center rounded-full px-8 text-sm font-bold transition-transform hover:-translate-y-1 ${
                        isSaffron ? "bg-navy text-cream shadow-xl" : "bg-saffron text-cream shadow-xl shadow-saffron/20"
                      }`}
                    >
                      Go to Course <ArrowUpRight size={18} className="ml-2" />
                    </Link>
                  ) : (
                    <Link
                      to="/enroll/$courseId"
                      params={{ courseId: course.slug || course.id }}
                      className={`inline-flex h-14 items-center justify-center rounded-full px-8 text-sm font-bold transition-transform hover:-translate-y-1 ${
                        isSaffron ? "bg-navy text-cream shadow-xl" : "bg-saffron text-cream shadow-xl shadow-saffron/20"
                      }`}
                    >
                      Enroll Now <ArrowUpRight size={18} className="ml-2" />
                    </Link>
                  )}
                  <Link
                    to="/demo-class"
                    className="inline-flex h-14 items-center justify-center rounded-full border-2 border-cream/20 px-8 text-sm font-bold text-cream transition-colors hover:bg-cream/10"
                  >
                    Book Free Demo
                  </Link>
                </div>
              </div>

              {/* Course Features Card */}
              <div className="w-full max-w-sm rounded-3xl bg-cream p-8 shadow-2xl lg:ml-auto">
                <div className="mb-6 flex items-end justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-ink/50">Full course fee</p>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="font-display text-3xl font-black text-navy">{course.price ? `₹${course.price.toLocaleString('en-IN')}` : "Free"}</span>
                      {(course.salePrice ?? 0) > 0 && (
                        <span className="text-sm font-semibold text-ink/40 line-through">₹{course.salePrice?.toLocaleString('en-IN')}</span>
                      )}
                    </div>
                  </div>
                  <span className="rounded-lg bg-green-100 px-2 py-1 text-xs font-bold text-green-700">
                    Save ~35%
                  </span>
                </div>
                
                <div className="space-y-4 border-t border-navy/10 pt-6">
                  <FeatureItem icon={<Clock size={20} />} title={course.duration || "1 Year"} />
                  <FeatureItem icon={<Users size={20} />} title={"Max 30 Students"} />
                  <FeatureItem icon={<BookOpen size={20} />} title={`${subjects.length} core subjects`} />
                  <FeatureItem icon={<CheckCircle2 size={20} />} title="Weekly chapter tests" />
                  <FeatureItem icon={<CheckCircle2 size={20} />} title="Daily 8pm doubt rooms" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <span className="font-display text-xs font-bold uppercase tracking-[0.22em] text-saffron">
              Curriculum Overview
            </span>
            <h2 className="mt-4 font-display text-3xl font-black text-navy md:text-5xl">
              Subject modules
            </h2>
            <p className="mt-5 text-lg text-ink">
              {course.curriculum}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject, idx) => (
              <div key={subject.id || idx} className="flex flex-col rounded-3xl border border-navy/10 bg-white p-8 shadow-sm transition-shadow hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-navy">
                  <BookOpen size={24} />
                </div>
                <h3 className="font-display text-2xl font-black text-navy">{subject.title}</h3>
                <p className="mt-3 text-sm text-ink/80 flex-grow">
                  {subject.description}
                </p>
                <div className="my-6 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-navy/50 mb-3">Key Outcomes</p>
                  {((subject as any).learningOutcomes || ["Concept mastery", "Improved grades", "Board exam readiness"]).slice(0, 3).map((item: string, i: number) => (
                    <div key={i} className="flex items-start gap-2.5 text-sm text-ink/90">
                      <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-saffron" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <Link
                  to="/courses/$classSlug/$subjectSlug"
                  params={{ classSlug: course.slug || course.id, subjectSlug: subject.slug }}
                  className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-xl bg-navy/5 px-4 py-3 text-sm font-semibold text-navy transition-colors hover:bg-navy hover:text-cream"
                >
                  Read More <ArrowUpRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureItem({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3 text-sm font-medium text-navy">
      <div className="text-saffron">{icon}</div>
      <span>{title}</span>
    </div>
  );
}
