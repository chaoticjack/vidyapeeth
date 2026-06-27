import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { doc, getDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { createBlog, updateBlog, Blog } from "@/lib/firestore";
import { sendBlogPublishedNotification } from "@/lib/server-actions";
import { ArrowLeft, Save, Send, Loader2, Image as ImageIcon, History, Monitor, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { MarkdownRenderer } from "@/components/blog/MarkdownRenderer";

// Zod Schema
const seoSchema = z.object({
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  focusKeyword: z.string().optional(),
  canonicalUrl: z.string().optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().optional(),
  twitterTitle: z.string().optional(),
  twitterDescription: z.string().optional(),
  robotsIndex: z.boolean().optional(),
  robotsFollow: z.boolean().optional(),
});

const authorSchema = z.object({
  name: z.string().min(2, "Author name is required"),
  image: z.string().optional(),
  bio: z.string().optional(),
  role: z.string().optional(),
});

const blogSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters").regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
  excerpt: z.string().optional(),
  content: z.string().min(50, "Content must be at least 50 characters"),
  
  author: authorSchema,
  
  category: z.string().optional(),
  subcategory: z.string().optional(),
  tags: z.string(), 
  difficultyLevel: z.string().optional(),
  targetClass: z.string().optional(),
  subject: z.string().optional(),
  
  featuredImage: z.string().optional(),
  coverAlt: z.string().optional(),
  coverCaption: z.string().optional(),
  
  readingTime: z.string().optional(),
  
  status: z.enum(["draft", "published", "scheduled", "archived"]),
  featured: z.boolean().optional(),
  pinned: z.boolean().optional(),
  
  seo: seoSchema.optional(),
});

type BlogForm = z.infer<typeof blogSchema>;

export const Route = createFileRoute("/admin/blogs/editor")({
  component: BlogEditor,
});

function BlogEditor() {
  const navigate = useNavigate();
  const search = Route.useSearch() as { id?: string };
  const blogId = search.id;
  
  const [loading, setLoading] = useState(blogId ? true : false);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [versions, setVersions] = useState<any[]>([]);
  
  const { register, handleSubmit, control, watch, setValue, formState: { errors, isSubmitting, isDirty } } = useForm<BlogForm>({
    resolver: zodResolver(blogSchema),
    defaultValues: { 
      status: "draft",
      author: { name: "", image: "", bio: "", role: "" },
      seo: { robotsIndex: true, robotsFollow: true }
    }
  });

  const watchContent = watch("content") || "";
  const watchTitle = watch("title") || "";

  // Auto-generate slug from title if empty
  useEffect(() => {
    if (watchTitle && !blogId && !watch("slug")) {
      const generated = watchTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      setValue("slug", generated, { shouldValidate: true });
    }
  }, [watchTitle, blogId, setValue, watch]);

  // Load existing data
  useEffect(() => {
    async function load() {
      if (!blogId) return;
      try {
        const docRef = doc(db, "blogs", blogId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data() as Blog;
          
          let authorObj = { name: "", image: "", bio: "", role: "" };
          if (typeof data.author === "string") {
            authorObj.name = data.author;
          } else if (data.author) {
            authorObj = { ...authorObj, ...data.author };
          }

          resetForm({
            title: data.title || "",
            slug: data.slug || "",
            excerpt: data.excerpt || "",
            content: data.content || "",
            author: authorObj,
            category: data.category || "",
            subcategory: data.subcategory || "",
            tags: data.tags?.join(", ") || "",
            difficultyLevel: data.difficultyLevel || "",
            targetClass: data.targetClass || "",
            subject: data.subject || "",
            featuredImage: data.featuredImage || "",
            coverAlt: data.coverAlt || "",
            coverCaption: data.coverCaption || "",
            readingTime: data.readingTime || "",
            status: data.status || "draft",
            featured: data.featured || false,
            pinned: data.pinned || false,
            seo: {
              metaTitle: data.seo?.metaTitle || "",
              metaDescription: data.seo?.metaDescription || "",
              focusKeyword: data.seo?.focusKeyword || "",
              canonicalUrl: data.seo?.canonicalUrl || "",
              ogTitle: data.seo?.ogTitle || "",
              ogDescription: data.seo?.ogDescription || "",
              ogImage: data.seo?.ogImage || "",
              twitterTitle: data.seo?.twitterTitle || "",
              twitterDescription: data.seo?.twitterDescription || "",
              robotsIndex: data.seo?.robotsIndex !== false,
              robotsFollow: data.seo?.robotsFollow !== false,
            }
          });
          setVersions(data.versions || []);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load blog post");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [blogId]);

  const resetForm = (data: BlogForm) => {
    Object.keys(data).forEach(key => {
      setValue(key as keyof BlogForm, data[key as keyof BlogForm]);
    });
  };

  const onSubmit = async (data: BlogForm, isPublishing = false) => {
    try {
      const tagsArray = data.tags.split(",").map(t => t.trim()).filter(Boolean);
      
      const payload: Partial<Blog> = {
        ...data,
        tags: tagsArray,
        status: isPublishing ? "published" : data.status,
        published: isPublishing || data.status === "published"
      };

      if (!payload.readingTime) {
        payload.readingTime = Math.max(1, Math.ceil((data.content.split(" ").length) / 200)) + " min read";
      }

      if (blogId) {
        const newVersion = {
          updatedAt: new Date().toISOString(),
          updatedBy: "Admin", // Would be actual user ID in a real app
        };
        payload.versions = [...versions, newVersion];
        await updateBlog(blogId, payload);
        setVersions(payload.versions);
        toast.success(isPublishing ? "Blog published!" : "Blog updated!");
        
        if (isPublishing && data.status !== "published") {
          sendBlogPublishedNotification({
            data: {
              blogId: blogId,
              title: payload.title as string,
              excerpt: payload.excerpt as string || "",
              slug: payload.slug as string,
              imageUrl: payload.featuredImage as string
            }
          }).catch(console.error);
        }
      } else {
        const newBlog = await createBlog(payload as any);
        toast.success("Blog created!");
        
        if (isPublishing) {
          sendBlogPublishedNotification({
            data: {
              blogId: newBlog.id,
              title: newBlog.title,
              excerpt: newBlog.excerpt || "",
              slug: newBlog.slug,
              imageUrl: newBlog.featuredImage
            }
          }).catch(console.error);
        }

        navigate({ to: "/admin/blogs/editor", search: { id: newBlog.id } });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save blog post");
    }
  };

  // Keyboard shortcut for save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSubmit((data) => onSubmit(data))();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSubmit]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-saffron" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-50 -m-6 p-6">
      <form id="editorForm" onSubmit={handleSubmit((data) => onSubmit(data))} className="mx-auto max-w-7xl pb-24">
        
        {/* Header Action Bar */}
        <div className="sticky top-0 z-50 mb-8 flex items-center justify-between rounded-2xl bg-white/80 p-4 shadow-sm backdrop-blur-md border border-navy/10">
          <div className="flex items-center gap-4">
            <Link to="/admin/blogs" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 text-navy transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-navy">{blogId ? "Edit Article" : "Create Article"}</h1>
              {isDirty && <p className="text-xs text-saffron font-medium">Unsaved changes</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select {...register("status")} className="h-10 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm font-semibold outline-none focus:border-saffron">
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="archived">Archived</option>
              <option value="published">Published</option>
            </select>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex h-10 items-center gap-2 rounded-xl bg-white border border-gray-200 px-4 text-sm font-semibold text-navy hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Draft
            </button>
            <button 
              type="button" 
              onClick={handleSubmit((data) => onSubmit(data, true))}
              disabled={isSubmitting}
              className="flex h-10 items-center gap-2 rounded-xl bg-navy px-5 text-sm font-semibold text-white hover:bg-saffron transition-colors shadow-sm disabled:opacity-50"
            >
              <Send size={16} />
              Publish Now
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Column */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Section 1: Basic Info */}
            <SectionCard title="1. Basic Information">
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-navy">Title *</label>
                  <input {...register("title")} className="w-full rounded-xl border border-gray-200 bg-white p-3 text-base outline-none focus:border-saffron focus:ring-1 focus:ring-saffron transition-all" placeholder="Enter an engaging title" />
                  {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-navy">Slug (URL) *</label>
                  <input {...register("slug")} className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none focus:border-saffron transition-all font-mono" placeholder="article-url-slug" />
                  {errors.slug && <p className="mt-1 text-xs text-red-500">{errors.slug.message}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-navy">Excerpt</label>
                  <textarea {...register("excerpt")} rows={3} className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none focus:border-saffron transition-all" placeholder="A short summary for blog cards and previews..." />
                </div>
              </div>
            </SectionCard>

            {/* Section 3 & 8: Content Editor & Preview */}
            <SectionCard title="3. Rich Content Editor">
              <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-4">
                <p className="text-xs text-gray-500">Use Markdown syntax (`##`, `{'>'} `, `TIP:`, `NOTE:`). Changes preview in real-time below.</p>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button type="button" onClick={() => setPreviewMode("desktop")} className={`p-1.5 rounded-md transition-colors ${previewMode === "desktop" ? "bg-white shadow-sm text-navy" : "text-gray-400 hover:text-navy"}`}><Monitor size={16} /></button>
                  <button type="button" onClick={() => setPreviewMode("mobile")} className={`p-1.5 rounded-md transition-colors ${previewMode === "mobile" ? "bg-white shadow-sm text-navy" : "text-gray-400 hover:text-navy"}`}><Smartphone size={16} /></button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div>
                  <textarea 
                    {...register("content")} 
                    className="h-[600px] w-full resize-none rounded-xl border border-gray-200 bg-gray-50/50 p-4 text-sm font-mono leading-relaxed outline-none focus:border-saffron focus:bg-white transition-all shadow-inner" 
                    placeholder="Write your amazing article here..." 
                  />
                  {errors.content && <p className="mt-1 text-xs text-red-500">{errors.content.message}</p>}
                </div>
                
                <div className="h-[600px] rounded-xl border border-gray-200 bg-white overflow-hidden flex justify-center shadow-sm">
                  <div className={`h-full overflow-y-auto bg-cream p-6 w-full ${previewMode === "mobile" ? "max-w-[375px] border-x border-gray-200 shadow-xl" : ""}`}>
                    {watchContent ? <MarkdownRenderer content={watchContent} /> : <p className="text-gray-400 italic text-sm text-center mt-10">Start typing to see preview...</p>}
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Section 5: SEO */}
            <SectionCard title="5. SEO Optimization">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 flex justify-between text-sm font-semibold text-navy">
                      Meta Title <span className="text-xs text-gray-400">{watch("seo.metaTitle")?.length || 0}/60</span>
                    </label>
                    <input {...register("seo.metaTitle")} className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-saffron" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-navy">Focus Keyword</label>
                    <input {...register("seo.focusKeyword")} className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-saffron" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 flex justify-between text-sm font-semibold text-navy">
                    Meta Description <span className="text-xs text-gray-400">{watch("seo.metaDescription")?.length || 0}/160</span>
                  </label>
                  <textarea {...register("seo.metaDescription")} rows={2} className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-saffron" />
                </div>
                
                {/* Search Preview */}
                <div className="mt-4 p-4 rounded-xl border border-gray-200 bg-gray-50">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Google Search Preview</p>
                  <div className="text-sm text-[#1a0dab] truncate font-medium text-lg">{watch("seo.metaTitle") || watch("title") || "Blog Post Title"} - Vidyapeeth</div>
                  <div className="text-xs text-[#006621] truncate mt-0.5">https://vidyapeeth.com/blog/{watch("slug") || "url-slug"}</div>
                  <div className="text-sm text-[#545454] mt-1 line-clamp-2">{watch("seo.metaDescription") || watch("excerpt") || "Provide a meta description or excerpt to see how this will look in search results."}</div>
                </div>
                
                <div className="pt-4 border-t border-gray-100 flex gap-6">
                  <label className="flex items-center gap-2 text-sm text-navy cursor-pointer">
                    <input type="checkbox" {...register("seo.robotsIndex")} className="rounded text-saffron focus:ring-saffron" />
                    Allow search engines to index this page (Index)
                  </label>
                  <label className="flex items-center gap-2 text-sm text-navy cursor-pointer">
                    <input type="checkbox" {...register("seo.robotsFollow")} className="rounded text-saffron focus:ring-saffron" />
                    Allow search engines to follow links (Follow)
                  </label>
                </div>
              </div>
            </SectionCard>

            {/* Section 2: Cover Media */}
            <SectionCard title="2. Cover Media">
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-navy">Featured Image URL</label>
                  <div className="flex gap-4">
                    <input {...register("featuredImage")} className="flex-1 rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-saffron" placeholder="https://..." />
                    {watch("featuredImage") && (
                      <div className="h-12 w-20 rounded border border-gray-200 overflow-hidden shrink-0">
                        <img src={watch("featuredImage")} alt="Preview" className="h-full w-full object-cover" />
                      </div>
                    )}
                  </div>
                  {errors.featuredImage && <p className="mt-1 text-xs text-red-500">{errors.featuredImage.message}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-navy">Image Alt Text (SEO)</label>
                    <input {...register("coverAlt")} className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-saffron" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-navy">Image Caption</label>
                    <input {...register("coverCaption")} className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-saffron" />
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>
          
          {/* Sidebar Column */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Section 7: Publishing */}
            <SectionCard title="7. Publishing Options">
              <div className="space-y-4">
                <label className="flex items-center gap-3 text-sm font-medium text-navy cursor-pointer">
                  <input type="checkbox" {...register("featured")} className="h-4 w-4 rounded text-saffron focus:ring-saffron" />
                  Feature on Homepage
                </label>
                <label className="flex items-center gap-3 text-sm font-medium text-navy cursor-pointer">
                  <input type="checkbox" {...register("pinned")} className="h-4 w-4 rounded text-saffron focus:ring-saffron" />
                  Pin to top of Blog
                </label>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-navy">Estimated Reading Time</label>
                  <input {...register("readingTime")} className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-saffron" placeholder="e.g. 5 min read" />
                  <p className="mt-1 text-xs text-gray-400">Leave blank to auto-calculate</p>
                </div>
              </div>
            </SectionCard>

            {/* Section 6: Organization */}
            <SectionCard title="6. Organization">
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-navy">Category</label>
                  <input {...register("category")} className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-saffron" placeholder="e.g. Exam Tips" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-navy">Tags (comma separated)</label>
                  <input {...register("tags")} className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-saffron" placeholder="math, physics, cbse" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-navy">Target Class</label>
                  <select {...register("targetClass")} className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-saffron bg-white">
                    <option value="">Any</option>
                    <option value="class-10">Class 10</option>
                    <option value="class-11">Class 11</option>
                    <option value="class-12">Class 12</option>
                  </select>
                </div>
              </div>
            </SectionCard>

            {/* Section 4: Author */}
            <SectionCard title="4. Author">
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-navy">Author Name *</label>
                  <input {...register("author.name")} className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-saffron" />
                  {errors.author?.name && <p className="mt-1 text-xs text-red-500">{errors.author.name.message}</p>}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-navy">Author Image URL</label>
                  <input {...register("author.image")} className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-saffron" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-navy">Role</label>
                  <input {...register("author.role")} className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-saffron" placeholder="e.g. Mentor at Vidyapeeth" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-navy">Bio</label>
                  <textarea {...register("author.bio")} rows={3} className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-saffron" />
                </div>
              </div>
            </SectionCard>

            {/* Section 9: Version History */}
            {blogId && (
              <SectionCard title="9. Version History">
                <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                  {versions.length > 0 ? (
                    [...versions].reverse().map((v, i) => (
                      <div key={i} className="flex items-start gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                        <History size={16} className="mt-0.5 text-gray-400 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-navy">Updated by {v.updatedBy}</p>
                          <p className="text-[10px] text-gray-500">
                            {v.updatedAt?.toDate 
                              ? v.updatedAt.toDate().toLocaleString() 
                              : (typeof v.updatedAt === 'string' ? new Date(v.updatedAt).toLocaleString() : 'Just now')}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500 text-center py-4">No version history available.</p>
                  )}
                </div>
              </SectionCard>
            )}
            
          </div>
        </div>
      </form>
    </div>
  );
}

// Reusable card container for sections
function SectionCard({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-lg font-black font-display text-navy border-b border-gray-100 pb-3">{title}</h2>
      {children}
    </div>
  );
}

