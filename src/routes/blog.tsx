import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Clock, Search, ChevronDown, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchPublishedBlogs, Blog } from "@/lib/firestore";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog — Vidyapeeth" },
      {
        name: "description",
        content:
          "Study tips, parenting notes and exam guides from the Vidyapeeth team.",
      },
      { property: "og:title", content: "Blog — Vidyapeeth" },
      {
        property: "og:description",
        content: "Study tips, parenting notes and exam guides.",
      },
      { property: "og:url", content: "/blog" },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "What classes does Vidyapeeth offer?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Vidyapeeth offers live mentor-led courses for Class 6 through Class 10, covering CBSE, ICSE and state board syllabi.",
              },
            },
            {
              "@type": "Question",
              name: "How do live classes work?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Classes happen in your browser — no downloads needed. A real mentor teaches live, your child solves problems on screen, and doubt rooms are open every evening.",
              },
            },
            {
              "@type": "Question",
              name: "Can I attend a free demo class?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes! You can book a free 60-minute live demo class with a Vidyapeeth mentor. No card required — just fill out the booking form.",
              },
            },
            {
              "@type": "Question",
              name: "What boards are covered?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Vidyapeeth covers CBSE, ICSE and all major state boards. Our curriculum is aligned with the latest NCERT syllabus and board patterns.",
              },
            },
            {
              "@type": "Question",
              name: "How is my child's progress tracked?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Parents receive weekly progress reports with detailed analytics. Students get chapter-wise scores, mock test results and improvement suggestions from their mentor.",
              },
            },
            {
              "@type": "Question",
              name: "What is the VSAT scholarship test?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "VSAT (Vidyapeeth Scholarship Admission Test) is a free scholarship exam for Class 6–12 students. Winners can earn scholarships up to ₹25 lakh.",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: BlogPage,
});

type Theme = "navy" | "saffron";

const posts: Array<{
  tag: string;
  title: string;
  excerpt: string;
  minutes: number;
  theme: Theme;
  kicker: string;
}> = [
  {
    tag: "Exam strategy",
    title: "How to revise the entire Class 10 Maths syllabus in 30 days",
    excerpt:
      "A repeatable, calm 30-day plan that's worked for 800+ Vidyapeeth students. Topic-wise pacing, mock paper rhythm and the trap chapters to handle last.",
    minutes: 7,
    theme: "navy",
    kicker: "Class 10",
  },
  {
    tag: "Parenting",
    title: "What to say to your child the night before a board exam",
    excerpt:
      "Three sentences that work better than 'just do your best'. Built on conversations with 200+ Vidyapeeth parents and our school counsellors.",
    minutes: 4,
    theme: "saffron",
    kicker: "Class 9",
  },
  {
    tag: "Scholarship",
    title: "VSAT 2026 syllabus, dates and how to prepare",
    excerpt:
      "Everything you need to know about the Vidyapeeth Scholarship Admission Test — section-wise weightage, sample questions and a 6-week prep plan.",
    minutes: 9,
    theme: "navy",
    kicker: "VSAT 2026",
  },
  {
    tag: "Study tips",
    title: "The 25-5 study sprint that actually works for Class 8",
    excerpt:
      "Why pomodoro fails for school students and the lighter alternative our mentors give every batch. Includes a free printable tracker.",
    minutes: 5,
    theme: "saffron",
    kicker: "Class 8",
  },
  {
    tag: "Science",
    title: "5 NCERT diagrams Class 9 students must memorise",
    excerpt:
      "The diagrams that show up in board exams year after year — drawn step-by-step with the marks each part typically carries.",
    minutes: 6,
    theme: "navy",
    kicker: "Class 7",
  },
  {
    tag: "Maths",
    title: "Why your child is scared of Algebra — and what to do",
    excerpt:
      "Algebra anxiety usually starts in Class 6. Here's how Vidyapeeth mentors unwind it in three classes flat.",
    minutes: 5,
    theme: "saffron",
    kicker: "Class 6",
  },
];

const faqs = [
  {
    q: "What classes does Vidyapeeth offer?",
    a: (
      <>
        Vidyapeeth offers live mentor-led courses for <strong>Class 6 through Class 10</strong>,
        covering CBSE, ICSE and state board syllabi. Each course includes live classes, doubt rooms,
        weekly tests and detailed progress reports.{" "}
        <Link to="/courses" className="text-saffron underline hover:text-saffron-deep">
          Browse all courses →
        </Link>
      </>
    ),
  },
  {
    q: "How do live classes work?",
    a: (
      <>
        Classes happen in your browser — no downloads needed. A real mentor teaches live, your child
        solves problems on screen, and doubt rooms are open every evening. Batch sizes are capped at
        20–25 students for personal attention.
      </>
    ),
  },
  {
    q: "Can I attend a free demo class?",
    a: (
      <>
        Yes! You can book a <strong>free 60-minute live demo class</strong> with a Vidyapeeth mentor.
        No card required — just fill out the booking form and we'll WhatsApp you a session link within
        4 hours.{" "}
        <Link to="/demo-class" className="text-saffron underline hover:text-saffron-deep">
          Book your free demo →
        </Link>
      </>
    ),
  },
  {
    q: "What boards are covered?",
    a: (
      <>
        Vidyapeeth covers <strong>CBSE, ICSE and all major state boards</strong>. Our curriculum is
        aligned with the latest NCERT syllabus and updated every year to match the current board
        pattern.
      </>
    ),
  },
  {
    q: "How is my child's progress tracked?",
    a: (
      <>
        Parents receive <strong>weekly progress reports</strong> with detailed analytics. Students get
        chapter-wise scores, mock test results and improvement suggestions from their mentor. You can
        track everything from your dashboard after signing up.
      </>
    ),
  },
  {
    q: "What is the VSAT scholarship test?",
    a: (
      <>
        VSAT (Vidyapeeth Scholarship Admission Test) is a free scholarship exam for Class 6–12
        students. Winners can earn scholarships up to <strong>₹25 lakh</strong>. It includes aptitude,
        subject knowledge and reasoning sections.{" "}
        <Link to="/vsat" className="text-saffron underline hover:text-saffron-deep">
          Learn more about VSAT →
        </Link>
      </>
    ),
  },
  {
    q: "How do I contact the Vidyapeeth team?",
    a: (
      <>
        We're open 24×7 and reply within 4 working hours. You can reach us via email, phone or the
        contact form on our website.{" "}
        <Link to="/contact" className="text-saffron underline hover:text-saffron-deep">
          Contact us →
        </Link>
      </>
    ),
  },
  {
    q: "Who are the mentors?",
    a: (
      <>
        Vidyapeeth mentors are experienced educators — many are former school teachers and subject
        toppers. Every mentor goes through a rigorous selection and training process. You'll meet yours
        during the{" "}
        <Link to="/demo-class" className="text-saffron underline hover:text-saffron-deep">
          free demo class
        </Link>
        .{" "}
        <Link to="/about" className="text-saffron underline hover:text-saffron-deep">
          Learn about us →
        </Link>
      </>
    ),
  },
];

const grainBg =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.25 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")";

function ThemedCover({
  theme,
  kicker,
  tag,
  className = "",
}: {
  theme: Theme;
  kicker: string;
  tag: string;
  className?: string;
}) {
  const isNavy = theme === "navy";
  return (
    <div
      className={`relative flex h-full w-full flex-col justify-between overflow-hidden p-6 ${
        isNavy ? "bg-navy text-cream" : "bg-saffron text-cream"
      } ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay"
        style={{ backgroundImage: grainBg }}
        aria-hidden
      />
      <div
        className={`pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full blur-2xl ${
          isNavy ? "bg-saffron/30" : "bg-navy/30"
        }`}
        aria-hidden
      />
      <span className="relative font-display text-xs font-bold uppercase tracking-[0.22em] text-cream/80">
        {tag}
      </span>
      <span className="relative font-display text-4xl font-black leading-none md:text-5xl">
        {kicker}
      </span>
    </div>
  );
}

function BlogPage() {
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const blogs = await fetchPublishedBlogs();
        setAllPosts(blogs); 
      } catch (e) {
        console.error(e);
        setAllPosts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="grain bg-cream flex justify-center items-center h-96"><Loader2 className="animate-spin text-navy" size={32} /></div>;

  const featured = allPosts[0];
  const rest = allPosts.slice(1);

  const filtered = search.trim()
    ? rest.filter(
        (p) =>
          p.title?.toLowerCase().includes(search.toLowerCase()) ||
          (p.tags && p.tags.some((t: string) => t.toLowerCase().includes(search.toLowerCase()))) ||
          p.tag?.toLowerCase().includes(search.toLowerCase()) ||
          p.kicker?.toLowerCase().includes(search.toLowerCase())
      )
    : rest;

  const featuredMatches =
    !search.trim() ||
    (featured && (
      featured.title?.toLowerCase().includes(search.toLowerCase()) ||
      (featured.tags && featured.tags.some((t: string) => t.toLowerCase().includes(search.toLowerCase()))) ||
      featured.tag?.toLowerCase().includes(search.toLowerCase()) ||
      featured.kicker?.toLowerCase().includes(search.toLowerCase())
    ));

  if (!loading && allPosts.length === 0) {
    return (
      <div className="grain bg-cream flex flex-col items-center justify-center py-40 px-6 text-center">
        <h1 className="font-display text-4xl font-black text-navy md:text-5xl">No Articles Yet</h1>
        <p className="mt-4 text-ink text-lg">Check back later for new updates from our team!</p>
      </div>
    );
  }

  return (
    <div className="grain bg-cream">
      <section className="pt-32 pb-12 md:pt-40 md:pb-16">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <span className="font-display text-xs font-bold uppercase tracking-[0.22em] text-saffron">
            Blog
          </span>
          <h1 className="mt-4 font-display text-5xl font-black leading-[1.05] text-navy md:text-7xl">
            Study tips, parenting notes,{" "}
            <span className="italic font-light text-navy/65">exam guides.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-ink">
            Fresh writing from Vidyapeeth mentors, counsellors and toppers — published every week.
          </p>

          {/* Search Bar */}
          <div className="mx-auto mt-8 max-w-lg">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40"
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search articles by topic, class or keyword…"
                className="w-full rounded-2xl border border-navy/12 bg-card py-3.5 pl-11 pr-4 text-sm text-navy shadow-sm outline-none transition-all placeholder:text-ink/40 focus:border-saffron focus:shadow-[0_0_0_4px_rgba(244,112,11,0.12)]"
              />
            </div>
            {search.trim() && (
              <p className="mt-2 text-sm text-ink/60">
                {featuredMatches ? filtered.length + 1 : filtered.length} article
                {(featuredMatches ? filtered.length + 1 : filtered.length) !== 1 ? "s" : ""} found
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Featured */}
      {featuredMatches && (
        <section className="pb-12">
          <div className="mx-auto max-w-6xl px-6">
            <article className="group grid overflow-hidden rounded-3xl border border-navy/10 bg-card md:grid-cols-2">
              <div className="aspect-[4/3] md:aspect-auto">
                {featured.featuredImage ? (
                  <img src={featured.featuredImage} alt={featured.title} className="w-full h-full object-cover" />
                ) : (
                  <ThemedCover
                      theme={featured.theme || "navy"}
                      kicker={featured.kicker || (featured.tags && featured.tags[0]) || "Featured"}
                      tag={featured.tag || "Insight"}
                  />
                )}
              </div>
              <div className="flex flex-col justify-center p-8 md:p-10">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-saffron-deep">
                  {featured.tag}
                </span>
                <h2 className="mt-3 font-display text-3xl font-black text-navy md:text-4xl">
                  {featured.title}
                </h2>
                <p className="mt-4 text-ink">{featured.excerpt || (featured.content && featured.content.substring(0, 100))}</p>
                <div className="mt-6 flex items-center gap-4 text-sm text-ink/70">
                  <Clock size={14} /> {featured.minutes || 5} min read
                </div>
              </div>
            </article>
          </div>
        </section>
      )}

      {/* Grid */}
      <section className="pb-16">
        <div className="mx-auto max-w-6xl px-6">
          {filtered.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => (
                <article
                  key={p.title}
                  className="group overflow-hidden rounded-3xl border border-navy/10 bg-card transition-all hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgba(27,42,74,0.35)]"
                >
                  <div className="aspect-[4/3]">
                    {p.featuredImage ? (
                      <img src={p.featuredImage} alt={p.title} className="w-full h-full object-cover" />
                    ) : (
                      <ThemedCover theme={p.theme || "navy"} kicker={p.kicker || (p.tags && p.tags[0]) || "Read"} tag={p.tag || "Insight"} />
                    )}
                  </div>
                  <div className="p-6">
                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-saffron-deep">
                      {p.tag || "Insight"}
                    </span>
                    <h3 className="mt-2 font-display text-xl font-bold text-navy">{p.title}</h3>
                    <p className="mt-3 line-clamp-3 text-sm text-ink">{p.excerpt || (p.content && p.content.substring(0, 100))}</p>
                    <div className="mt-5 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-ink/60">
                        <Clock size={14} />
                        {p.minutes || 5} min read
                      </div>
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-navy text-cream transition-colors group-hover:bg-saffron">
                        <ArrowUpRight size={16} />
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-navy/10 bg-card px-8 py-12 text-center">
              <p className="font-display text-lg font-bold text-navy">No articles found</p>
              <p className="mt-2 text-sm text-ink/70">
                Try a different search term, or{" "}
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="text-saffron underline hover:text-saffron-deep"
                >
                  clear the search
                </button>
                .
              </p>
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="border-t border-navy/10 py-20 md:py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-10 text-center">
            <span className="font-display text-xs font-bold uppercase tracking-[0.22em] text-saffron">
              Frequently Asked Questions
            </span>
            <h2 className="mt-3 font-display text-3xl font-black text-navy md:text-4xl">
              Common questions{" "}
              <span className="italic font-light text-navy/65">answered.</span>
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={faq.q}
                  className={`overflow-hidden rounded-2xl border transition-all duration-200 ${
                    isOpen
                      ? "border-saffron/30 bg-card shadow-sm"
                      : "border-navy/10 bg-card hover:border-navy/20"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between gap-4 p-5 text-left md:p-6"
                    aria-expanded={isOpen}
                  >
                    <span className="font-display text-base font-bold text-navy md:text-lg">
                      {faq.q}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`shrink-0 text-navy/50 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t border-navy/8 px-5 pb-5 pt-4 text-sm leading-relaxed text-ink md:px-6 md:pb-6">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-navy p-8 text-cream md:flex-row md:items-center md:p-10">
            <div>
              <h3 className="font-display text-2xl font-black md:text-3xl">
                Ready to start learning?
              </h3>
              <p className="mt-2 text-cream/80">
                Book a free demo class or explore our courses — no commitment needed.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/demo-class"
                className="inline-flex items-center gap-2 rounded-full bg-saffron px-6 py-3 text-sm font-semibold text-cream transition-transform hover:translate-x-1"
              >
                Book free demo <ArrowUpRight size={16} />
              </Link>
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 rounded-full border border-cream/30 px-6 py-3 text-sm font-semibold text-cream transition-colors hover:border-cream/60"
              >
                Browse courses
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
