import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getAdminDb } from "@/lib/firebase-admin";
import { getSeoMeta, getCanonicalLink, siteUrl } from "@/lib/seo";
import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import {
  ArrowLeft, ChevronDown, ExternalLink,
  Link2, Loader2, Twitter, Linkedin, MessageCircle, Share2, ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { fetchBlogBySlug, fetchPublishedBlogs, type Blog } from "@/lib/firestore";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { MarkdownRenderer } from "@/components/blog/MarkdownRenderer";

const fetchBlogSeo = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    try {
      const adminDb = getAdminDb();
      const snap = await adminDb.collection("blogs").where("slug", "==", slug).limit(1).get();
      if (snap.empty) return null;
      const data = snap.docs[0].data();
      return { 
        title: data.title, 
        excerpt: data.excerpt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : undefined,
        author: data.authorName || "Vidyapeeth Team",
        image: data.coverImage
      };
    } catch (e) {
      return null;
    }
  });

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    return await fetchBlogSeo({ data: params.slug });
  },
  head: ({ loaderData, params }) => {
    const slug = params.slug;
    const urlPath = `/blog/${slug}`;
    if (!loaderData) {
      return {
        meta: getSeoMeta("Blog Not Found", "This article could not be found.", urlPath),
        links: [getCanonicalLink(urlPath)],
      };
    }
    const { title, excerpt, updatedAt, author, image } = loaderData;
    const meta = getSeoMeta(title, excerpt || `Read ${title} on Vidyapeeth Blog.`, urlPath);
    if (image) {
      meta.push({ property: "og:image", content: image });
      meta.push({ name: "twitter:image", content: image });
    }
    return {
      meta,
      links: [getCanonicalLink(urlPath)],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: title,
            image: image ? [image] : [],
            datePublished: updatedAt,
            dateModified: updatedAt,
            author: [{
              "@type": "Person",
              name: author,
            }],
            publisher: {
              "@type": "Organization",
              name: "Vidyapeeth",
              url: siteUrl,
            },
          }),
        },
      ],
    };
  },
  component: BlogPostPage,
});

function BlogPostPage() {
  const { slug } = Route.useParams();
  const [post, setPost] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState<Blog[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchBlogBySlug(slug);
        setPost(data);
        if (data) {
          const all = await fetchPublishedBlogs();
          const others = all.filter((b) => b.slug !== slug);
          const sameTag = others.filter((b) => b.tags?.some((t) => data.tags?.includes(t)));
          const fill = others.filter((b) => !sameTag.find((s) => s.id === b.id));
          setRelated([...sameTag, ...fill].slice(0, 3));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="grain bg-cream flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-navy" size={32} />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="grain bg-cream flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <h1 className="font-display text-5xl font-black text-navy">Article not found</h1>
        <p className="mt-4 text-lg text-ink">This article doesn't exist or may have been removed.</p>
        <Link to="/blog" className="mt-8 inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-cream hover:bg-saffron transition-colors">
          <ArrowLeft size={16} /> Back to Blog
        </Link>
      </div>
    );
  }

  const headings = extractHeadings(post.content || "");

  // Update title dynamically
  if (typeof document !== "undefined") {
    document.title = `${post.title} — Vidyapeeth Blog`;
  }

  return (
    <>
      <ReadingProgressBar />
      
      <div className="grain bg-cream min-h-screen pb-32">
        <EditorialHeader post={post} />
        <FeaturedImage post={post} />
        
        <div className="mx-auto mt-16 max-w-[1100px] px-6">
          <div className="flex gap-12 lg:gap-16">
            <aside className="hidden lg:block w-[260px] shrink-0">
              <StickyTOC headings={headings} />
            </aside>
            
            <div className="min-w-0 flex-1 max-w-[740px]">
              <MobileTOC headings={headings} />
              <MarkdownRenderer content={post.content || ""} />
              <AuthorBlock post={post} />
            </div>
          </div>
        </div>
        
        {related.length > 0 && (
          <ScrollReveal>
            <div className="mx-auto mt-24 max-w-[1100px] px-6">
              <h3 className="mb-8 font-display text-2xl font-bold text-navy">Keep Reading</h3>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.map(r => <RelatedArticleCard key={r.id} r={r} />)}
              </div>
            </div>
          </ScrollReveal>
        )}
        
        <div className="mx-auto max-w-[1100px] px-6">
          <NewsletterSection />
        </div>
      </div>
    </>
  );
}

function extractHeadings(content: string) {
  // Simple slugifier that closely matches github-slugger used by rehype-slug
  const slugify = (text: string) => text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
  return content.split("\n").reduce<{ id: string; text: string; level: 2 | 3 }[]>((acc, line) => {
    if (line.startsWith("## ")) {
      const text = line.replace("## ", "").trim();
      acc.push({ id: slugify(text), text, level: 2 });
    } else if (line.startsWith("### ")) {
      const text = line.replace("### ", "").trim();
      acc.push({ id: slugify(text), text, level: 3 });
    }
    return acc;
  }, []);
}

function ReadingProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] bg-saffron origin-left z-[9999]"
      style={{ scaleX }}
    />
  );
}

function EditorialHeader({ post }: { post: Blog }) {
  const readingTime = Math.max(1, Math.ceil((post.content?.split(" ").length ?? 0) / 200));
  const dateStr = post.publishedAt?.toDate().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) || "Just now";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-3xl px-6 pt-32 pb-8 text-center"
    >
      <div className="mb-8 flex items-center justify-center gap-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-saffron/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-saffron">
          {post.tags?.[0] ?? "Article"}
        </span>
        <span className="text-sm font-semibold text-ink/60">
          {readingTime} min read · {dateStr}
        </span>
      </div>
      
      <h1 className="mb-6 font-display text-5xl sm:text-6xl font-black leading-[1.06] text-navy">
        {post.title}
      </h1>
      
      <p className="mx-auto mb-10 max-w-2xl text-xl text-ink/70">
        {post.content?.split("\n\n").find(p => p.length > 20 && !p.startsWith("#") && !p.startsWith(">"))?.slice(0, 150)}...
      </p>
      
      <div className="flex items-center justify-center gap-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-cream text-xs font-bold overflow-hidden">
          {typeof post.author === 'object' && post.author.image ? (
            <img src={post.author.image} alt={post.author.name} className="h-full w-full object-cover" />
          ) : (
            (typeof post.author === 'string' ? post.author : post.author?.name)?.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase() || "V"
          )}
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-navy">
          <span>{typeof post.author === 'string' ? post.author : (post.author?.name || "Vidyapeeth Team")}</span>
          <span className="text-ink/30">·</span>
          <span className="text-ink/60">{dateStr}</span>
        </div>
      </div>
    </motion.div>
  );
}

function FeaturedImage({ post }: { post: Blog }) {
  if (!post.featuredImage) return null;
  return (
    <div className="mx-auto mt-10 max-w-[1100px] px-6">
      <motion.div
        className="overflow-hidden rounded-2xl shadow-[0_20px_60px_-20px_rgba(27,42,74,0.25)]"
        style={{ aspectRatio: "16/9" }}
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.4 }}
      >
        <img
          src={post.featuredImage}
          alt={post.title}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </motion.div>
    </div>
  );
}

function StickyTOC({ headings }: { headings: ReturnType<typeof extractHeadings> }) {
  const [activeId, setActiveId] = useState("");
  useEffect(() => {
    if (headings.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => { if (entry.isIntersecting) setActiveId(entry.target.id); });
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    headings.forEach((h) => { const el = document.getElementById(h.id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;
  return (
    <div className="sticky top-28 space-y-1">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-navy/40">Contents</p>
      {headings.map((h) => (
        <a
          key={h.id}
          href={`#${h.id}`}
          onClick={(e) => { e.preventDefault(); document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth" }); }}
          className={`block truncate py-1 text-sm transition-all duration-200 ${
            h.level === 3 ? "pl-4" : "pl-0"
          } ${
            activeId === h.id
              ? "font-semibold text-saffron border-l-2 border-saffron pl-3"
              : "text-ink/60 hover:text-navy border-l-2 border-transparent hover:border-navy/20"
          }`}
        >
          {h.text}
        </a>
      ))}
    </div>
  );
}

function MobileTOC({ headings }: { headings: ReturnType<typeof extractHeadings> }) {
  const [open, setOpen] = useState(false);
  if (headings.length === 0) return null;
  return (
    <div className="mb-8 lg:hidden rounded-xl border border-navy/10 bg-white overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-navy"
      >
        Contents <ChevronDown size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="border-t border-navy/10 px-4 py-3 space-y-2">
          {headings.map((h) => (
            <a
              key={h.id}
              href={`#${h.id}`}
              onClick={(e) => { e.preventDefault(); setOpen(false); document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth" }); }}
              className={`block text-sm text-ink/70 hover:text-saffron ${h.level === 3 ? "pl-3" : ""}`}
            >
              {h.text}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}



function AuthorBlock({ post }: { post: Blog }) {
  if (!post.author) return null;
  const authorName = typeof post.author === 'string' ? post.author : post.author.name;
  const authorImage = typeof post.author === 'object' ? post.author.image : null;
  const authorBio = typeof post.author === 'object' && post.author.bio ? post.author.bio : "Mentor at Vidyapeeth · Helping students learn smarter through practical study techniques and exam strategies.";
  const authorRole = typeof post.author === 'object' && post.author.role ? post.author.role : "ECE Student • Mentor at Vidyapeeth";

  const { whatsappUrl, linkedinUrl, twitterUrl } = getShareLinks(post);
  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied!");
  };
  const handleNativeShare = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: post.title, url: window.location.href }).catch(console.error);
    }
  };

  return (
    <div className="mt-20">
      {/* Share Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-b border-navy/5 py-6 mb-8 gap-4">
        <p className="font-semibold text-navy text-sm uppercase tracking-wider text-center sm:text-left">Share this article</p>
        <div className="flex items-center justify-center sm:justify-start gap-2">
          {typeof navigator !== "undefined" && navigator.share && (
            <button onClick={handleNativeShare} className="flex h-10 w-10 items-center justify-center rounded-full bg-navy/5 text-navy hover:bg-saffron hover:text-white transition-colors" title="Share via Device">
               <Share2 size={18} />
            </button>
          )}
          <button onClick={handleCopy} className="flex h-10 w-10 items-center justify-center rounded-full bg-navy/5 text-navy hover:bg-saffron hover:text-white transition-colors" title="Copy Link">
            <Link2 size={18} />
          </button>
          <a href={twitterUrl} target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-navy/5 text-navy hover:bg-saffron hover:text-white transition-colors" title="Share on X">
            <Twitter size={18} />
          </a>
          <a href={linkedinUrl} target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-navy/5 text-navy hover:bg-saffron hover:text-white transition-colors" title="Share on LinkedIn">
            <Linkedin size={18} />
          </a>
          <a href={whatsappUrl} target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-navy/5 text-navy hover:bg-saffron hover:text-white transition-colors" title="Share on WhatsApp">
            <MessageCircle size={18} />
          </a>
        </div>
      </div>

      {/* Author Section */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row items-center sm:items-start gap-5 rounded-2xl border border-navy/5 bg-cream/30 px-6 py-6"
      >
        <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-navy text-cream text-2xl font-bold font-display overflow-hidden shadow-sm">
          {authorImage ? (
            <img src={authorImage} alt={authorName} className="h-full w-full object-cover" />
          ) : (
            authorName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
          )}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1">
            <h4 className="font-display text-xl font-bold text-navy">{authorName}</h4>
            <Link to="/blog" className="text-xs font-semibold text-saffron hover:text-navy transition-colors mt-2 sm:mt-0 flex items-center justify-center sm:justify-start gap-1">
              View all posts <ArrowRight size={14} />
            </Link>
          </div>
          <p className="text-xs font-semibold text-ink/60 mb-2">{authorRole}</p>
          <p className="text-sm text-ink/80 leading-relaxed mb-3 max-w-[90%] mx-auto sm:mx-0">{authorBio}</p>
          <p className="text-xs font-bold text-navy/40">27 Articles Published</p>
        </div>
      </motion.div>
    </div>
  );
}

function RelatedArticleCard({ r }: { r: Blog }) {
  return (
    <Link
      to="/blog/$slug"
      params={{ slug: r.slug }}
      className="group block rounded-2xl border border-navy/10 bg-white overflow-hidden hover:-translate-y-1 transition-transform duration-300"
    >
      {r.featuredImage ? (
        <div className="aspect-[16/9] overflow-hidden">
          <img src={r.featuredImage} alt={r.title} loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        </div>
      ) : (
        <div className="aspect-[16/9] bg-navy flex items-center justify-center">
          <span className="font-display text-3xl font-black text-cream/30">{r.tags?.[0] ?? "Blog"}</span>
        </div>
      )}
      <div className="p-5">
        <span className="text-xs font-bold uppercase tracking-[0.16em] text-saffron">{r.tags?.[0]}</span>
        <h4 className="mt-2 font-display text-base font-bold text-navy line-clamp-2">{r.title}</h4>
        <p className="mt-2 text-xs text-ink/60">
          {Math.max(1, Math.ceil((r.content?.split(" ").length ?? 0) / 200))} min read
        </p>
      </div>
    </Link>
  );
}

function NewsletterSection() {
  return (
    <ScrollReveal>
      <section className="mt-20 rounded-3xl bg-navy grain px-8 py-12 text-center text-cream">
        <span className="text-xs font-bold uppercase tracking-[0.22em] text-saffron">Stay sharp</span>
        <h3 className="mt-3 font-display text-3xl font-black">Enjoyed this article?</h3>
        <p className="mt-3 text-cream/70 max-w-lg mx-auto">Get weekly study tips, exam strategies, and latest educational updates directly in your inbox.</p>
        <div className="mx-auto mt-6 flex max-w-sm flex-col gap-3 sm:flex-row">
          <form className="flex w-full flex-col sm:flex-row gap-3" onSubmit={(e) => { e.preventDefault(); toast.success("You're subscribed! 🎉"); }}>
            <input
              type="email"
              required
              placeholder="your@email.com"
              className="flex-1 rounded-full bg-white/10 border border-white/20 px-5 py-3 text-sm text-cream placeholder:text-cream/40 outline-none focus:border-saffron"
            />
            <button type="submit" className="rounded-full bg-saffron px-6 py-3 text-sm font-semibold text-cream hover:opacity-90 transition-colors">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </ScrollReveal>
  );
}

function getShareLinks(post: Blog) {
  const pageUrl = typeof window !== "undefined" ? window.location.href : "";
  return {
    whatsappUrl: `https://wa.me/?text=${encodeURIComponent(post.title + " " + pageUrl)}`,
    linkedinUrl: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`,
    twitterUrl: `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(pageUrl)}`,
  };
}

