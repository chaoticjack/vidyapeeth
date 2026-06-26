import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AdminTable } from "@/components/admin/AdminTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Plus, Edit, Trash2, X, Loader2, ArrowLeft, Save, LayoutGrid, ImageIcon, DollarSign, Users, Search, Settings, Video } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export const Route = createFileRoute("/admin/courses")({
  head: () => ({ meta: [{ title: "Course Management — Admin Portal" }] }),
  component: AdminCourses,
});

const courseSchema = z.object({
  title: z.string().min(2, "Title is required"),
  slug: z.string().min(2, "Slug is required"),
  shortDescription: z.string().optional(),
  fullDescription: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  classLevel: z.string().optional(),
  subject: z.string().optional(),
  language: z.string().optional(),
  difficulty: z.string().optional(),
  duration: z.string().optional(),
  estimatedCompletionTime: z.string().optional(),
  thumbnail: z.string().optional(),
  bannerImage: z.string().optional(),
  promoVideo: z.string().optional(),
  price: z.coerce.number(),
  salePrice: z.coerce.number().optional(),
  currency: z.string(),
  featured: z.boolean(),
  homepage: z.boolean(),
  trending: z.boolean(),
  status: z.enum(["draft", "published", "archived", "coming_soon"]),
  displayOrder: z.coerce.number(),
  certificateEnabled: z.boolean().optional(),
  refundEligible: z.boolean().optional(),
  enrollmentLimit: z.coerce.number().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  teacherId: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  focusKeyword: z.string().optional(),
  canonicalUrl: z.string().optional(),
  ogImage: z.string().optional(),
  twitterCard: z.string().optional(),
});
type CourseForm = z.infer<typeof courseSchema>;

function AdminCourses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Editor View State
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("basic");
  
  // Delete confirm state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");

  const { register, handleSubmit, reset, watch, setValue, control, formState: { errors, isSubmitting, isDirty } } = useForm<CourseForm>({
    resolver: zodResolver(courseSchema),
    defaultValues: { status: "draft", price: 0, currency: "INR", displayOrder: 0, classLevel: "10" }
  });

  const titleValue = watch("title");
  useEffect(() => {
    if (!editingId && titleValue) {
      setValue("slug", titleValue.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""), { shouldValidate: true });
    }
  }, [titleValue, editingId, setValue]);

  useEffect(() => {
    // Fetch courses
    const unsubscribeCourses = onSnapshot(query(collection(db, "courses"), orderBy("createdAt", "desc")), (snapshot) => {
      setCourses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => {
      console.error(err);
      toast.error("Failed to load courses");
      setLoading(false);
    });

    // Fetch categories
    const unsubscribeCategories = onSnapshot(query(collection(db, "courseCategories"), orderBy("order", "asc")), (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Fetch teachers
    const unsubscribeTeachers = onSnapshot(collection(db, "teachers"), (snapshot) => {
      setTeachers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeCourses();
      unsubscribeCategories();
      unsubscribeTeachers();
    };
  }, []);

  const openCreate = () => {
    reset({
      title: "", slug: "", shortDescription: "", fullDescription: "", description: "",
      categoryId: "", classLevel: "10", subject: "", language: "English", difficulty: "Beginner",
      duration: "", estimatedCompletionTime: "", thumbnail: "", bannerImage: "", promoVideo: "",
      price: 0, salePrice: undefined, currency: "INR", featured: false, homepage: false, trending: false,
      status: "draft", displayOrder: courses.length + 1, certificateEnabled: false, refundEligible: false,
      enrollmentLimit: undefined, startDate: "", endDate: "", teacherId: "",
      seoTitle: "", seoDescription: "", focusKeyword: "", canonicalUrl: "", ogImage: "", twitterCard: ""
    });
    setEditingId(null);
    setActiveTab("basic");
    setIsEditing(true);
  };

  const openEdit = (course: any) => {
    reset({
      title: course.title || course.name || "",
      slug: course.slug || "",
      shortDescription: course.shortDescription || course.description || "",
      fullDescription: course.fullDescription || course.curriculum || "",
      description: course.description || "",
      categoryId: course.categoryId || "",
      classLevel: course.classLevel || "",
      subject: course.subject || "",
      language: course.language || "English",
      difficulty: course.difficulty || "Beginner",
      duration: course.duration || "",
      estimatedCompletionTime: course.estimatedCompletionTime || "",
      thumbnail: course.thumbnail || "",
      bannerImage: course.bannerImage || "",
      promoVideo: course.promoVideo || "",
      price: course.price || 0,
      salePrice: course.salePrice,
      currency: course.currency || "INR",
      featured: course.featured || false,
      homepage: course.homepage || false,
      trending: course.trending || false,
      status: course.status || (course.published ? "published" : "draft"),
      displayOrder: course.displayOrder || 0,
      certificateEnabled: course.certificateEnabled || false,
      refundEligible: course.refundEligible || false,
      enrollmentLimit: course.enrollmentLimit,
      startDate: course.startDate || "",
      endDate: course.endDate || "",
      teacherId: course.teacherId || "",
      seoTitle: course.seoTitle || "",
      seoDescription: course.seoDescription || "",
      focusKeyword: course.focusKeyword || "",
      canonicalUrl: course.canonicalUrl || "",
      ogImage: course.ogImage || "",
      twitterCard: course.twitterCard || ""
    });
    setEditingId(course.id);
    setActiveTab("basic");
    setIsEditing(true);
  };

  const closeEditor = () => {
    if (isDirty) {
      if (!window.confirm("You have unsaved changes. Are you sure you want to discard them?")) return;
    }
    setIsEditing(false);
    setEditingId(null);
  };

  const onSubmit = async (data: CourseForm) => {
    try {
      // Ensure legacy fields are synced for backward compatibility
      const firestoreData = {
        ...data,
        name: data.title, // legacy support
        description: data.shortDescription, // legacy support
        published: data.status === "published",
      };

      if (editingId) {
        await updateDoc(doc(db, "courses", editingId), { ...firestoreData, updatedAt: serverTimestamp() });
        toast.success("Course updated successfully");
      } else {
        await addDoc(collection(db, "courses"), { ...firestoreData, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        toast.success("Course created successfully");
      }
      setIsEditing(false);
      setEditingId(null);
      reset();
    } catch (err) {
      console.error(err);
      toast.error(editingId ? "Failed to update course" : "Failed to create course");
    }
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "courses", deletingId));
      toast.success("Course deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete course");
    } finally {
      setIsDeleting(false);
      setIsConfirmOpen(false);
      setDeletingId(null);
    }
  };

  const filteredCourses = courses.filter(c => 
    (c.title || c.name || "")?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.slug?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: "title", label: "Course Title", render: (row: any) => (
      <div className="flex items-center gap-3">
        {row.thumbnail ? (
          <img src={row.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0" />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 text-gray-400">
            <ImageIcon size={16} />
          </div>
        )}
        <div className="flex flex-col">
          <span className="font-semibold text-navy">{row.title || row.name}</span>
          <span className="text-xs text-gray-500">{row.classLevel ? `Class ${row.classLevel}` : 'No class'}</span>
        </div>
      </div>
    )},
    { key: "category", label: "Category", render: (row: any) => {
      const cat = categories.find(c => c.id === row.categoryId);
      return <span className="text-sm">{cat ? cat.title : '-'}</span>;
    }},
    { key: "price", label: "Price", render: (row: any) => <span className="text-sm font-medium">₹{row.price?.toLocaleString()}</span> },
    { key: "status", label: "Status", render: (row: any) => {
      const status = row.status || (row.published ? "published" : "draft");
      return (
        <span className={`px-2 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold ${
          status === 'published' ? 'bg-green-100 text-green-700' : 
          status === 'archived' ? 'bg-red-100 text-red-700' :
          status === 'coming_soon' ? 'bg-blue-100 text-blue-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {status.replace('_', ' ')}
        </span>
      );
    }},
    { key: "actions", label: "Actions", render: (row: any) => (
      <div className="flex items-center gap-2">
        <button onClick={() => openEdit(row)} className="p-1.5 text-navy hover:bg-navy/5 rounded-md transition-colors"><Edit size={16} /></button>
        <button onClick={() => confirmDelete(row.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"><Trash2 size={16} /></button>
      </div>
    )},
  ];

  if (isEditing) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 -m-4 sm:-m-6 md:-m-8">
        {/* Sticky Header */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button type="button" onClick={closeEditor} className="p-2 text-gray-400 hover:text-navy hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-navy">{editingId ? 'Edit Course' : 'New Course'}</h1>
              {isDirty && <p className="text-xs text-saffron font-medium">Unsaved changes</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={closeEditor} className="px-4 py-2 text-sm font-semibold text-navy bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" form="courseEditorForm" disabled={isSubmitting} className="flex items-center gap-2 px-6 py-2 text-sm font-semibold text-white bg-navy rounded-xl hover:bg-saffron transition-colors disabled:opacity-70">
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {editingId ? 'Save Changes' : 'Save Course'}
            </button>
          </div>
        </div>

        <div className="flex-1 flex max-w-7xl mx-auto w-full">
          {/* Sidebar Tabs */}
          <div className="w-64 shrink-0 border-r border-gray-200 p-6 hidden md:block">
            <div className="space-y-1 sticky top-24">
              {[
                { id: "basic", label: "Basic Info", icon: LayoutGrid },
                { id: "media", label: "Media Assets", icon: ImageIcon },
                { id: "pricing", label: "Pricing", icon: DollarSign },
                { id: "enrollment", label: "Enrollment & Teachers", icon: Users },
                { id: "seo", label: "SEO Settings", icon: Search },
                { id: "settings", label: "Visibility", icon: Settings },
              ].map(tab => (
                <button 
                  key={tab.id}
                  type="button" 
                  onClick={() => setActiveTab(tab.id)} 
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === tab.id ? "bg-navy/5 text-navy" : "text-gray-500 hover:bg-gray-100 hover:text-navy"}`}
                >
                  <tab.icon size={18} /> {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 p-6 md:p-8 overflow-y-auto pb-32">
            <form id="courseEditorForm" onSubmit={handleSubmit(onSubmit)} className="max-w-4xl space-y-8">
              
              {/* BASIC INFO */}
              <div className={activeTab === "basic" ? "block" : "hidden"}>
                <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 space-y-6">
                  <h2 className="text-lg font-bold text-navy mb-4 border-b border-gray-100 pb-4">Basic Information</h2>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-navy">Course Title <span className="text-red-500">*</span></label>
                    <input {...register("title")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="e.g. Masterclass: Physics for Class 10" />
                    {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Slug <span className="text-red-500">*</span></label>
                      <input {...register("slug")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="e.g. physics-class-10" />
                      {errors.slug && <p className="text-xs text-red-500">{errors.slug.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Category</label>
                      <select {...register("categoryId")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors">
                        <option value="">Select a category</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.title || c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Class Level</label>
                      <input {...register("classLevel")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="e.g. 10" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Subjects Summary</label>
                      <input {...register("subject")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="e.g. Physics, Math" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Language</label>
                      <input {...register("language")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="e.g. English" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-navy">Short Description</label>
                    <textarea {...register("shortDescription")} rows={3} className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors resize-y" placeholder="Brief summary of the course..." />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-navy">Full Curriculum / Description</label>
                    <textarea {...register("fullDescription")} rows={6} className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors resize-y font-mono" placeholder="Detailed HTML or Markdown description..." />
                  </div>
                </div>
              </div>

              {/* MEDIA ASSETS */}
              <div className={activeTab === "media" ? "block" : "hidden"}>
                <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 space-y-6">
                  <h2 className="text-lg font-bold text-navy mb-4 border-b border-gray-100 pb-4">Media Assets</h2>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-navy">Thumbnail Image URL</label>
                    <input {...register("thumbnail")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="https://..." />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-navy">Banner Image URL</label>
                    <input {...register("bannerImage")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="https://..." />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-navy">Promo Video URL (YouTube/Vimeo)</label>
                    <div className="flex relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Video size={16} /></div>
                      <input {...register("promoVideo")} className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="https://youtube.com/watch?v=..." />
                    </div>
                  </div>
                </div>
              </div>

              {/* PRICING */}
              <div className={activeTab === "pricing" ? "block" : "hidden"}>
                <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 space-y-6">
                  <h2 className="text-lg font-bold text-navy mb-4 border-b border-gray-100 pb-4">Pricing Strategy</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Selling Price <span className="text-red-500">*</span></label>
                      <input type="number" {...register("price")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Original/Discount Price</label>
                      <input type="number" {...register("salePrice")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="e.g. 1999" />
                      <p className="text-[10px] text-gray-500">Strikethrough price shown to user</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Currency</label>
                      <select {...register("currency")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors">
                        <option value="INR">INR (₹)</option>
                        <option value="USD">USD ($)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* ENROLLMENT & TEACHERS */}
              <div className={activeTab === "enrollment" ? "block" : "hidden"}>
                <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 space-y-6">
                  <h2 className="text-lg font-bold text-navy mb-4 border-b border-gray-100 pb-4">Enrollment & Instructors</h2>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-navy">Primary Teacher</label>
                    <select {...register("teacherId")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors">
                      <option value="">No primary teacher assigned</option>
                      {teachers.map(t => (
                        <option key={t.id} value={t.id}>{t.name} {t.specialization ? `— ${t.specialization}` : ''}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Enrollment Limit</label>
                      <input type="number" {...register("enrollmentLimit")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="Leave blank for unlimited" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Course Start Date</label>
                      <input type="date" {...register("startDate")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Course End Date</label>
                      <input type="date" {...register("endDate")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" />
                    </div>
                  </div>
                  
                  <div className="pt-4 space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" {...register("certificateEnabled")} className="w-5 h-5 rounded border-gray-300 text-saffron focus:ring-saffron" />
                      <span className="text-sm font-semibold text-navy">Enable Completion Certificate</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" {...register("refundEligible")} className="w-5 h-5 rounded border-gray-300 text-saffron focus:ring-saffron" />
                      <span className="text-sm font-semibold text-navy">Course is eligible for refund</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* SEO SETTINGS */}
              <div className={activeTab === "seo" ? "block" : "hidden"}>
                <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 space-y-6">
                  <h2 className="text-lg font-bold text-navy mb-4 border-b border-gray-100 pb-4">SEO Optimization</h2>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-navy">Meta Title</label>
                    <input {...register("seoTitle")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="SEO optimized title..." />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-navy">Meta Description</label>
                    <textarea {...register("seoDescription")} rows={3} className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors resize-y" placeholder="Brief summary for search engines..." />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Focus Keyword</label>
                      <input {...register("focusKeyword")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="e.g. class 10 math" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Canonical URL</label>
                      <input {...register("canonicalUrl")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="https://..." />
                    </div>
                  </div>
                </div>
              </div>

              {/* SETTINGS */}
              <div className={activeTab === "settings" ? "block" : "hidden"}>
                <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 space-y-6">
                  <h2 className="text-lg font-bold text-navy mb-4 border-b border-gray-100 pb-4">Visibility & Settings</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Status</label>
                      <select {...register("status")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors">
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="coming_soon">Coming Soon</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Display Order</label>
                      <input type="number" {...register("displayOrder")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" />
                    </div>
                  </div>

                  <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-navy/30 transition-colors">
                      <input type="checkbox" {...register("featured")} className="mt-1 w-4 h-4 rounded border-gray-300 text-saffron focus:ring-saffron" />
                      <div>
                        <span className="text-sm font-bold text-navy block">Featured Course</span>
                        <span className="text-xs text-gray-500 block">Show in featured sections across the site.</span>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-navy/30 transition-colors">
                      <input type="checkbox" {...register("trending")} className="mt-1 w-4 h-4 rounded border-gray-300 text-saffron focus:ring-saffron" />
                      <div>
                        <span className="text-sm font-bold text-navy block">Trending Badge</span>
                        <span className="text-xs text-gray-500 block">Add a 'Trending' badge on course cards.</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy font-display">Course Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all your courses and their configurations.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-navy text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-saffron transition-colors shadow-sm">
          <Plus size={16} /> New Course
        </button>
      </div>

      <AdminTable 
        columns={columns} 
        data={filteredCourses} 
        loading={loading}
        searchPlaceholder="Search courses by title or slug..."
        onSearch={setSearchTerm}
      />

      <ConfirmDialog 
        isOpen={isConfirmOpen}
        title="Delete Course"
        description="Are you sure you want to delete this course? This will remove all nested subjects and modules. This action cannot be undone."
        confirmText="Delete Course"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
