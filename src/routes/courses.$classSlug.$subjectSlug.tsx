import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { COURSES_DATA } from "@/data/courses";
import { 
  Home, 
  ChevronRight, 
  BookOpen, 
  Target, 
  FileText, 
  Video, 
  HelpCircle, 
  CheckCircle2, 
  FileEdit,
  ClipboardList,
  GraduationCap
} from "lucide-react";

export const Route = createFileRoute("/courses/$classSlug/$subjectSlug")({
  loader: ({ params }) => {
    const course = COURSES_DATA[params.classSlug];
    if (!course) throw notFound();

    const subject = course.syllabus.find((s) => s.subjectSlug === params.subjectSlug);
    if (!subject) throw notFound();

    return { course, subject };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData?.subject && loaderData?.course ? `${loaderData.subject.name} - ${loaderData.course.grade} — Vidyapeeth` : 'Subject Details — Vidyapeeth' },
      { name: "description", content: loaderData?.subject?.shortDescription || "" },
    ],
  }),
  component: SubjectDetailsPage,
});

function SubjectDetailsPage() {
  const { course, subject } = Route.useLoaderData();
  const isSaffron = course.theme === "saffron";

  const getIconForMaterial = (material: string) => {
    const lower = material.toLowerCase();
    if (lower.includes("video") || lower.includes("lecture")) return <Video size={24} />;
    if (lower.includes("sheet") || lower.includes("workbook")) return <FileEdit size={24} />;
    if (lower.includes("test") || lower.includes("quiz")) return <ClipboardList size={24} />;
    return <FileText size={24} />;
  };

  return (
    <div className="bg-cream">
      {/* Hero Section */}
      <section className={`relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24 ${isSaffron ? "bg-saffron" : "bg-navy"}`}>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.3 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
        
        <div className="mx-auto max-w-5xl px-6 relative z-10">
          <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold text-cream/70 mb-8">
            <Link to="/" className="hover:text-cream transition-colors"><Home size={14} /></Link>
            <ChevronRight size={14} className="opacity-50" />
            <Link to="/courses" className="hover:text-cream transition-colors">Courses</Link>
            <ChevronRight size={14} className="opacity-50" />
            <Link to="/courses/$slug" params={{ slug: course.slug }} className="hover:text-cream transition-colors">{course.grade}</Link>
            <ChevronRight size={14} className="opacity-50" />
            <span className="text-cream">{subject.name}</span>
          </nav>

          <div className="max-w-3xl">
            <span className={`inline-flex items-center rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] mb-4 ${isSaffron ? "bg-cream/20 text-cream" : "bg-saffron/20 text-saffron"}`}>
              {course.grade} Subject
            </span>
            <h1 className="font-display text-4xl font-black leading-tight text-cream md:text-6xl">
              {subject.name}
            </h1>
            <p className="mt-6 text-lg text-cream/90 md:text-xl font-medium">
              {subject.shortDescription}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-12 lg:grid-cols-3">
            
            {/* Left Content Area */}
            <div className="lg:col-span-2 space-y-16">
              
              {/* About */}
              <div>
                <h2 className="font-display text-2xl font-black text-navy md:text-3xl flex items-center gap-3 border-b border-navy/10 pb-4">
                  <BookOpen className="text-saffron" /> About This Subject
                </h2>
                <p className="mt-6 text-lg text-ink/90 leading-relaxed">
                  {subject.detailedDescription}
                </p>
              </div>

              {/* What You Will Learn */}
              <div>
                <h2 className="font-display text-2xl font-black text-navy md:text-3xl flex items-center gap-3 border-b border-navy/10 pb-4">
                  <Target className="text-saffron" /> What You Will Learn
                </h2>
                <div className="mt-6 grid gap-8 sm:grid-cols-2">
                  <div>
                    <h3 className="font-bold text-navy mb-4">Topics Covered</h3>
                    <ul className="space-y-3">
                      {subject.topicsCovered.map((topic, i) => (
                        <li key={i} className="flex items-start gap-3 text-ink/90 text-sm">
                          <CheckCircle2 size={18} className="text-navy shrink-0 mt-0.5" />
                          <span>{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-bold text-navy mb-4">Learning Outcomes</h3>
                    <ul className="space-y-3">
                      {subject.learningOutcomes.map((outcome, i) => (
                        <li key={i} className="flex items-start gap-3 text-ink/90 text-sm">
                          <CheckCircle2 size={18} className="text-saffron shrink-0 mt-0.5" />
                          <span>{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Course Benefits & Requirements */}
              <div className="grid sm:grid-cols-2 gap-8">
                <div className="rounded-3xl bg-white p-8 shadow-sm border border-navy/5">
                  <h3 className="font-display text-lg font-black text-navy mb-4">Course Benefits</h3>
                  <ul className="space-y-3">
                    {subject.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-ink/80">
                        <span className="w-1.5 h-1.5 rounded-full bg-saffron mt-2 shrink-0"></span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-3xl bg-white p-8 shadow-sm border border-navy/5">
                  <h3 className="font-display text-lg font-black text-navy mb-4">Requirements</h3>
                  <ul className="space-y-3">
                    {subject.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-ink/80">
                        <span className="w-1.5 h-1.5 rounded-full bg-navy/40 mt-2 shrink-0"></span>
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* FAQs */}
              <div>
                <h2 className="font-display text-2xl font-black text-navy md:text-3xl flex items-center gap-3 border-b border-navy/10 pb-4">
                  <HelpCircle className="text-saffron" /> Frequently Asked Questions
                </h2>
                <div className="mt-6 space-y-4">
                  {subject.faqs.map((faq, i) => (
                    <div key={i} className="rounded-2xl border border-navy/10 bg-white p-6">
                      <h4 className="font-bold text-navy text-base">{faq.question}</h4>
                      <p className="mt-2 text-sm text-ink/80">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-8">
                
                {/* CTA Card */}
                <div className="rounded-3xl bg-white p-8 shadow-xl shadow-navy/5 border border-navy/10">
                  <h3 className="font-display text-xl font-black text-navy mb-2">Ready to start?</h3>
                  <p className="text-sm text-ink/70 mb-6">Enroll in the full {course.grade} track to access {subject.name} and all other core subjects.</p>
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="font-display text-3xl font-black text-navy">{course.price}</span>
                    <span className="text-sm font-semibold text-ink/40 line-through">{course.original}</span>
                  </div>
                  <div className="space-y-3">
                    <button className="w-full rounded-full bg-navy py-3.5 text-sm font-bold text-cream transition-transform hover:-translate-y-1 hover:bg-saffron">
                      Enroll Now
                    </button>
                    <Link to="/demo-class" className="flex w-full justify-center rounded-full border-2 border-navy/10 py-3 text-sm font-bold text-navy transition-colors hover:bg-navy/5">
                      Book Free Demo
                    </Link>
                  </div>
                </div>

                {/* Who is this for */}
                <div className="rounded-3xl bg-saffron/10 p-8 border border-saffron/20">
                  <div className="flex items-center gap-3 mb-3 text-saffron">
                    <GraduationCap size={24} />
                    <h3 className="font-display text-lg font-black text-navy">Who is this for?</h3>
                  </div>
                  <p className="text-sm text-ink/90 leading-relaxed">
                    {subject.whoIsThisFor}
                  </p>
                </div>

                {/* Study Material */}
                <div>
                  <h3 className="font-display text-lg font-black text-navy mb-4">Study Material Includes</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {subject.studyMaterial.map((material, i) => (
                      <div key={i} className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-white p-4 text-center shadow-sm border border-navy/5">
                        <div className="text-navy/60">{getIconForMaterial(material)}</div>
                        <span className="text-xs font-semibold text-navy">{material}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
