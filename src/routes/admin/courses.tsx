import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  collection, doc, onSnapshot, query, where, orderBy,
  serverTimestamp, addDoc, updateDoc, deleteDoc, writeBatch
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import {
  BookOpen, Layers, PlayCircle, FileText,
  ChevronDown, ChevronRight, MoreVertical,
  Plus, Trash2, Eye, EyeOff,
  Save, Loader2, CheckCircle2, Circle,
  ArrowLeft, Edit,
  LayoutGrid, DollarSign, Search as SearchIcon, ImageIcon, CheckSquare, GripVertical, Copy
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { AdminTable } from "@/components/admin/AdminTable";
import { YouTubeImportModal } from "@/components/admin/courses/YouTubeImportModal";
import { BulkActionBar } from "@/components/admin/courses/BulkActionBar";
import { GenerateDemoCourseButton } from "@/components/admin/courses/GenerateDemoCourseButton";
// ─── TYPES ───────────────────────────────────────────────────────────────────
export interface Course {
  id: string; name: string; title?: string; slug?: string;
  shortDescription?: string; fullDescription?: string; description: string;
  categoryId?: string; classLevel: string; subject: string;
  language?: string; difficulty?: string; duration?: string;
  thumbnail?: string; bannerImage?: string; promoVideo?: string;
  price: number; salePrice?: number; currency?: string;
  featured?: boolean; homepage?: boolean; trending?: boolean;
  status?: "draft"|"published"|"archived"|"coming_soon"; published: boolean;
  displayOrder?: number; teacherId?: string; isSequential?: boolean;
  seoTitle?: string; seoDescription?: string;
    aboutThisSubject?: string;
  whatYouWillLearn?: string[];
  topicsCovered?: string[];
  learningOutcomes?: string[];
  courseBenefits?: string[];
  requirements?: string[];
  whoIsThisFor?: string[];
  studyMaterials?: string[];
  faqs?: {question: string; answer: string}[];
  sidebarCta?: string;
  resources?: string[];
  downloads?: string[];
  courseHighlights?: string[];
  successMetrics?: string[];
  createdAt?: any; updatedAt?: any;
}
export interface Subject {
  id: string; courseId: string; title: string; slug: string;
  description?: string; icon?: string; color?: string;
  displayOrder: number; estimatedHours?: number; active: boolean;
  createdAt?: any; updatedAt?: any;
}
export interface Module {
  id: string; subjectId: string; courseId: string;
  title: string; slug?: string; description?: string;
  displayOrder: number; estimatedHours?: number; estimatedDuration?: string;
  difficulty?: string; thumbnail?: string;
  learningObjectives?: string[]; prerequisites?: string[];
  status?: "active"|"draft"|"archived";
  createdAt?: any; updatedAt?: any;
}
export interface Lesson {
  id: string; moduleId: string; subjectId: string; courseId: string;
  title: string; slug: string;
  lessonType?: "video"|"pdf"|"assignment"|"quiz"|"external";
  description?: string; videoUrl?: string; videoDuration?: string;
  thumbnail?: string; notesUrl?: string; worksheetUrl?: string;
  assignmentUrl?: string; externalLink?: string;
  duration?: string; estimatedDuration?: string;
  isPreview: boolean; isFree?: boolean;
  displayOrder: number; status?: "active"|"draft"|"archived";
  attachments?: { name: string; url: string; type: string }[];
  createdAt?: any; updatedAt?: any;
}

export const Route = createFileRoute("/admin/courses")({
  head: () => ({ meta: [{ title: "Course Builder — Admin Portal" }] }),
  component: AdminCourseBuilder,
});

// ─── ZOD SCHEMAS ─────────────────────────────────────────────────────────────
const courseSchema = z.object({
  title: z.string().min(2, "Title is required"),
  slug: z.string().min(2, "Slug is required"),
  shortDescription: z.string().optional(),
  fullDescription: z.string().optional(),
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
  featured: z.boolean().default(false),
  homepage: z.boolean().default(false),
  trending: z.boolean().default(false),
  status: z.enum(["draft", "published", "archived", "coming_soon"]),
  displayOrder: z.coerce.number(),
  isSequential: z.boolean().default(true),
  certificateEnabled: z.boolean().default(true),
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
  aboutThisSubject: z.string().optional(),
  whatYouWillLearn: z.any().optional(),
  topicsCovered: z.any().optional(),
  learningOutcomes: z.any().optional(),
  courseBenefits: z.any().optional(),
  requirements: z.any().optional(),
  whoIsThisFor: z.any().optional(),
  studyMaterials: z.any().optional(),
  faqs: z.any().optional(),
  sidebarCta: z.string().optional(),
  resources: z.any().optional(),
  downloads: z.any().optional(),
  courseHighlights: z.any().optional(),
  successMetrics: z.any().optional(),

});
const subjectSchema = z.object({
  title: z.string().min(2), slug: z.string(), description: z.string().optional(),
  icon: z.string().optional(), color: z.string().optional(), estimatedHours: z.coerce.number().optional(),
  active: z.boolean(), displayOrder: z.coerce.number()
});
const moduleSchema = z.object({
  title: z.string().min(2), slug: z.string().optional(), description: z.string().optional(),
  estimatedDuration: z.string().optional(), difficulty: z.string().optional(),
  thumbnail: z.string().optional(), status: z.enum(["active","draft","archived"]),
  displayOrder: z.coerce.number(), learningObjectives: z.string().optional(), prerequisites: z.string().optional()
});
const lessonSchema = z.object({
  title: z.string().min(2), slug: z.string(), lessonType: z.enum(["video","pdf","assignment","quiz","external"]),
  description: z.string().optional(), videoUrl: z.string().optional(), videoDuration: z.string().optional(),
  pdfUrl: z.string().optional(), assignmentUrl: z.string().optional(), quizUrl: z.string().optional(),
  externalLink: z.string().optional(), notesUrl: z.string().optional(), worksheetUrl: z.string().optional(),
  duration: z.string().optional(), estimatedDuration: z.string().optional(), thumbnail: z.string().optional(),
  isPreview: z.boolean(), isFree: z.boolean(), status: z.enum(["active","draft","archived"]), displayOrder: z.coerce.number()
});

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function AdminCourseBuilder() {
  const [viewMode, setViewMode] = useState<"list" | "builder">("list");
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);

  // List View State
  const [courses, setCourses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { register: regCourse, handleSubmit: handleCourseSubmit, reset: resetCourse, watch: watchCourse, setValue: setCourseVal, formState: { errors: errCourse, isSubmitting: isSubCourse, isDirty: isDirtyCourse } } = useForm<any>({
    resolver: zodResolver(courseSchema),
    defaultValues: { status: "draft", price: 0, currency: "INR", displayOrder: 0, classLevel: "10", featured: false, homepage: false, trending: false }
  });

  const titleVal = watchCourse("title");
  useEffect(() => {
    if (!editingId && titleVal && viewMode === "list") {
      setCourseVal("slug", titleVal.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""), { shouldValidate: true });
    }
  }, [titleVal, editingId, setCourseVal, viewMode]);

  useEffect(() => {
    if (viewMode !== "list") return;
    const unsubCourses = onSnapshot(query(collection(db, "courses"), orderBy("createdAt", "desc")), (snap) => {
      setCourses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      console.error("Courses fetch error:", err);
      toast.error("Failed to fetch courses (index might be missing)");
      setLoading(false);
    });
    const unsubCat = onSnapshot(query(collection(db, "courseCategories"), orderBy("order", "asc")), (snap) => {
      setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => console.error("Categories fetch error:", err));
    return () => { unsubCourses(); unsubCat(); };
  }, [viewMode]);

  const openCreate = () => {
    resetCourse({ status: "draft", price: 0, currency: "INR", displayOrder: courses.length + 1, classLevel: "10", title:"", slug:"", seoTitle:"", seoDescription:"", focusKeyword:"", canonicalUrl:"", ogImage:"", twitterCard:"", featured: false, homepage: false, trending: false });
    setEditingId(null); setActiveTab("basic"); setIsEditing(true);
  };
  const openEdit = (course: any) => {
    resetCourse({
      title: course.title || course.name || "", slug: course.slug || "", shortDescription: course.shortDescription || course.description || "",
      fullDescription: course.fullDescription || course.curriculum || "", categoryId: course.categoryId || "", classLevel: course.classLevel || "",
      subject: course.subject || "", language: course.language || "English", difficulty: course.difficulty || "Beginner",
      duration: course.duration || "", estimatedCompletionTime: course.estimatedCompletionTime || "", thumbnail: course.thumbnail || "",
      bannerImage: course.bannerImage || "", promoVideo: course.promoVideo || "", price: course.price || 0, salePrice: course.salePrice,
      currency: course.currency || "INR", featured: course.featured || false, homepage: course.homepage || false, trending: course.trending || false,
      status: course.status || (course.published ? "published" : "draft"), displayOrder: course.displayOrder || 0,
      certificateEnabled: course.certificateEnabled || false, refundEligible: course.refundEligible || false, enrollmentLimit: course.enrollmentLimit,
      startDate: course.startDate || "", endDate: course.endDate || "", teacherId: course.teacherId || "",
      seoTitle: course.seoTitle || "", seoDescription: course.seoDescription || "", focusKeyword: course.focusKeyword || "",
      canonicalUrl: course.canonicalUrl || "", ogImage: course.ogImage || "", twitterCard: course.twitterCard || ""
    });
    setEditingId(course.id); setActiveTab("basic"); setIsEditing(true);
  };
  const closeEditor = () => { setIsEditing(false); setEditingId(null); };

  const onCourseSubmit = async (data: z.infer<typeof courseSchema>) => {
    try {
      const fd = { ...data, name: data.title, description: data.shortDescription, published: data.status === "published" };
      if (editingId) {
        await updateDoc(doc(db, "courses", editingId), { ...fd, updatedAt: serverTimestamp() });
        toast.success("Course updated");
      } else {
        await addDoc(collection(db, "courses"), { ...fd, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        toast.success("Course created");
      }
      closeEditor();
    } catch (e) { console.error(e); toast.error("Failed to save course"); }
  };

  const filteredCourses = courses.filter(c => (c.title||c.name||"").toLowerCase().includes(searchTerm.toLowerCase()));

  // ─── LIST VIEW RENDER ──────────────────────────────────────────────────────
  if (viewMode === "list") {
    if (isEditing) {
      return (
        <div className="flex flex-col min-h-screen bg-gray-50 -m-4 sm:-m-6 md:-m-8">
          <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <button onClick={closeEditor} className="p-2 text-gray-400 hover:text-navy hover:bg-gray-100 rounded-full"><ArrowLeft size={20}/></button>
              <div><h1 className="text-xl font-bold text-navy">{editingId ? 'Edit Course' : 'New Course'}</h1></div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={closeEditor} className="px-4 py-2 text-sm font-semibold text-navy bg-white border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
              <button onClick={handleCourseSubmit(onCourseSubmit as any)} className="flex items-center gap-2 px-6 py-2 text-sm font-semibold text-white bg-navy rounded-xl hover:bg-saffron">
                {isSubCourse ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Course
              </button>
            </div>
          </div>
          <div className="flex-1 flex max-w-7xl mx-auto w-full">
            <div className="w-64 shrink-0 border-r border-gray-200 p-6 hidden md:block">
              <div className="space-y-1 sticky top-24">
                {[ {id:"basic",l:"Basic Info",i:LayoutGrid}, {id:"media",l:"Media Assets",i:ImageIcon}, {id:"pricing",l:"Pricing",i:DollarSign}, {id:"seo",l:"SEO",i:SearchIcon} ].map(t => (
                  <button key={t.id} onClick={()=>setActiveTab(t.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold ${activeTab===t.id?"bg-navy/5 text-navy":"text-gray-500 hover:bg-gray-100"}`}><t.i size={18}/> {t.l}</button>
                ))}
              </div>
            </div>
            <div className="flex-1 p-6 md:p-8 overflow-y-auto pb-32">
              <form className="max-w-4xl space-y-8">
                {activeTab === "basic" && (
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
                    <h2 className="text-lg font-bold text-navy border-b pb-4">Basic Info</h2>
                    <input {...regCourse("title")} placeholder="Course Title" className="w-full px-4 py-2 border rounded-xl" />
                    <input {...regCourse("slug")} placeholder="Slug" className="w-full px-4 py-2 border rounded-xl" />
                    <textarea {...regCourse("shortDescription")} placeholder="Short desc" className="w-full px-4 py-2 border rounded-xl" />
                  </div>
                )}
                {activeTab === "media" && (
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
                    <input {...regCourse("thumbnail")} placeholder="Thumbnail URL" className="w-full px-4 py-2 border rounded-xl" />
                  </div>
                )}
                {activeTab === "pricing" && (
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
                    <input type="number" {...regCourse("price")} placeholder="Price" className="w-full px-4 py-2 border rounded-xl" />
                  </div>
                )}
                {activeTab === "seo" && (
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
                    <input {...regCourse("seoTitle")} placeholder="SEO Title" className="w-full px-4 py-2 border rounded-xl" />
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-navy">Course Builder</h1>
          <div className="flex items-center gap-3">
            <GenerateDemoCourseButton onComplete={(id) => { setActiveCourseId(id); setViewMode("builder"); }} />
            <button onClick={openCreate} className="flex items-center gap-2 bg-navy text-white px-4 py-2.5 rounded-xl hover:bg-saffron"><Plus size={18} /> New Course</button>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between">
            <div className="relative max-w-sm w-full"><SearchIcon size={18} className="absolute left-3 top-2.5 text-gray-400" /><input value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} placeholder="Search courses..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-saffron" /></div>
          </div>
          <AdminTable columns={[
            { key: "title", label: "Course", render: (r:any) => <div className="font-semibold text-navy">{r.title||r.name}</div> },
            { key: "status", label: "Status", render: (r:any) => <span className="text-xs uppercase font-bold text-gray-500">{r.status||(r.published?'published':'draft')}</span> },
            { key: "actions", label: "Actions", render: (r:any) => (
              <div className="flex gap-2">
                <button onClick={() => { setActiveCourseId(r.id); setViewMode("builder"); }} className="flex items-center gap-1 bg-navy/5 text-navy px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-navy hover:text-white transition-colors">Open Builder &rarr;</button>
                <button onClick={() => openEdit(r)} className="p-1.5 text-navy hover:bg-gray-100 rounded"><Edit size={16}/></button>
                <button onClick={() => { setDeletingId(r.id); setIsConfirmOpen(true); }} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
              </div>
            )}
          ]} data={filteredCourses} loading={loading} />
        </div>
        <ConfirmDialog isOpen={isConfirmOpen} onCancel={()=>setIsConfirmOpen(false)} onConfirm={async()=>{
          if(!deletingId) return; await deleteDoc(doc(db,"courses",deletingId)); setIsConfirmOpen(false); toast.success("Deleted");
        }} title="Delete Course" description="Are you sure?" confirmText="Delete" />
      </div>
    );
  }

  // ─── BUILDER MODE ────────────────────────────────────────────────────────
  return <BuilderWorkspace courseId={activeCourseId!} onBack={() => { setActiveCourseId(null); setViewMode("list"); }} />;
}

// ─── BUILDER WORKSPACE ───────────────────────────────────────────────────────
function BuilderWorkspace({ courseId, onBack }: { courseId: string, onBack: () => void }) {
  const [course, setCourse] = useState<Course | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState("General");
  const [draftCourse, setDraftCourse] = useState<any>(null); // Memory state
  const [importModalData, setImportModalData] = useState<any>(null);

  useEffect(() => {
    const u1 = onSnapshot(doc(db, "courses", courseId), snap => { 
      const data = { id: snap.id, ...snap.data() } as Course;
      setCourse(data); 
      setDraftCourse((prev: any) => prev ? prev : data); // Initialize draft
    }, err => { console.error(err); setLoading(false); });
    const u2 = onSnapshot(query(collection(db, "subjects"), where("courseId", "==", courseId)), snap => { setSubjects(snap.docs.map(d => ({ id: d.id, ...d.data() } as Subject))); }, err => { console.error(err); setLoading(false); });
    const u3 = onSnapshot(query(collection(db, "modules"), where("courseId", "==", courseId)), snap => { setModules(snap.docs.map(d => ({ id: d.id, ...d.data() } as Module))); }, err => { console.error(err); setLoading(false); });
    const u4 = onSnapshot(query(collection(db, "lessons"), where("courseId", "==", courseId)), snap => { setLessons(snap.docs.map(d => ({ id: d.id, ...d.data() } as Lesson))); setLoading(false); }, err => { console.error(err); toast.error("Failed to load curriculum"); setLoading(false); });
    return () => { u1(); u2(); u3(); u4(); };
  }, [courseId]);

  const handleSaveDraft = async () => {
    if(!draftCourse) return;
    toast.info("Saving draft...");
    try {
      await updateDoc(doc(db, "courses", courseId), { ...draftCourse, status: "draft", updatedAt: serverTimestamp() });
      toast.success("Draft saved");
    } catch(e) {
      console.error(e);
      toast.error("Failed to save draft");
    }
  };

  const handlePublish = async () => {
    if(!draftCourse) return;
    try {
      await updateDoc(doc(db, "courses", courseId), { ...draftCourse, status: "published", published: true, updatedAt: serverTimestamp() });
      toast.success("Course Published! 🎉");
    } catch(e) {
      console.error(e);
      toast.error("Failed to publish");
    }
  };

  if (loading || !course) return <div className="flex h-screen items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-saffron w-8 h-8" /></div>;

  return (
    <div className="flex flex-col h-screen -m-4 sm:-m-6 md:-m-8 font-sans overflow-hidden bg-gray-50">
      {/* Top Header */}
      <div className="h-14 bg-[#0a1220] text-cream flex items-center justify-between px-6 shrink-0 z-10 shadow-sm border-b border-white/5">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="text-white/60 hover:text-white flex items-center gap-2 text-sm font-semibold transition-colors bg-white/5 px-3 py-1.5 rounded-lg">
            <ArrowLeft size={16} /> Courses
          </button>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-saffron tracking-wider">Course Builder</span>
            <span className="font-display font-bold text-sm">{course.title || course.name}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleSaveDraft} className="px-4 py-2 text-xs font-bold rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-2">
            <Save size={14}/> Save Draft
          </button>
          <button onClick={handlePublish} className="px-4 py-2 text-xs font-bold rounded-lg bg-saffron text-white hover:opacity-90 shadow-sm transition-opacity">
            Publish Live
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT PANEL - TABS */}
        <aside className="w-[200px] border-r border-navy/10 bg-white flex flex-col shrink-0 p-4 space-y-1">
          {["General", "Curriculum", "Course Page", "Pricing", "Teachers", "SEO"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${activeTab === tab ? 'bg-navy/5 text-navy' : 'text-gray-500 hover:bg-gray-50'}`}>
              {tab}
            </button>
          ))}
        </aside>

        {/* CENTER PANEL - EDITOR */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-8 custom-scrollbar relative">
          <div className="max-w-4xl mx-auto space-y-6 pb-20">
            
            {activeTab === "General" && draftCourse && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
                <h3 className="text-lg font-bold text-navy border-b pb-4">General Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Title</label>
                    <input value={draftCourse.title || ''} onChange={e => setDraftCourse({...draftCourse, title: e.target.value})} className="w-full border rounded-lg p-2 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Slug</label>
                    <input value={draftCourse.slug || ''} onChange={e => setDraftCourse({...draftCourse, slug: e.target.value})} className="w-full border rounded-lg p-2 text-sm font-mono" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Short Description</label>
                  <textarea value={draftCourse.shortDescription || ''} onChange={e => setDraftCourse({...draftCourse, shortDescription: e.target.value})} className="w-full border rounded-lg p-2 text-sm" rows={3}/>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Thumbnail URL</label>
                  <input value={draftCourse.thumbnail || ''} onChange={e => setDraftCourse({...draftCourse, thumbnail: e.target.value})} className="w-full border rounded-lg p-2 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Class Level</label>
                  <input value={draftCourse.classLevel || ''} onChange={e => setDraftCourse({...draftCourse, classLevel: e.target.value})} className="w-full border rounded-lg p-2 text-sm" />
                </div>
                
                <h3 className="text-lg font-bold text-navy border-b pb-4 mt-6">Course Settings</h3>
                <div className="flex items-center justify-between p-4 border rounded-xl bg-gray-50/50">
                  <div>
                    <h4 className="text-sm font-bold text-navy">Sequential Progress</h4>
                    <p className="text-xs text-gray-500 mt-1">Force students to complete lessons in order.</p>
                  </div>
                  <Switch 
                    checked={draftCourse.isSequential !== false} 
                    onCheckedChange={(checked) => setDraftCourse({...draftCourse, isSequential: checked})}
                  />
                </div>
              </div>
            )}

            {activeTab === "Curriculum" && (
              <CurriculumEditor 
                courseId={courseId} 
                subjects={subjects} 
                modules={modules} 
                lessons={lessons} 
                onImport={(sId: string, mId: string, o: number) => setImportModalData({subjectId: sId, moduleId: mId, order: o})}
              />
            )}

            {activeTab === "Course Page" && draftCourse && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-6">
                <h3 className="text-lg font-bold text-navy border-b pb-4">Course Landing Page Sections</h3>
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">About This Subject</label>
                  <textarea value={draftCourse.aboutThisSubject || ''} onChange={e => setDraftCourse({...draftCourse, aboutThisSubject: e.target.value})} className="w-full border rounded-lg p-2 text-sm min-h-[100px]" placeholder="Markdown supported..."/>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">What You Will Learn (comma separated)</label>
                  <textarea value={(draftCourse.whatYouWillLearn || []).join(', ')} onChange={e => setDraftCourse({...draftCourse, whatYouWillLearn: e.target.value.split(',').map((s:string)=>s.trim())})} className="w-full border rounded-lg p-2 text-sm" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Requirements (comma separated)</label>
                  <textarea value={(draftCourse.requirements || []).join(', ')} onChange={e => setDraftCourse({...draftCourse, requirements: e.target.value.split(',').map((s:string)=>s.trim())})} className="w-full border rounded-lg p-2 text-sm" />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Who is this for (comma separated)</label>
                  <textarea value={(draftCourse.whoIsThisFor || []).join(', ')} onChange={e => setDraftCourse({...draftCourse, whoIsThisFor: e.target.value.split(',').map((s:string)=>s.trim())})} className="w-full border rounded-lg p-2 text-sm" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Course Benefits (comma separated)</label>
                  <textarea value={(draftCourse.courseBenefits || []).join(', ')} onChange={e => setDraftCourse({...draftCourse, courseBenefits: e.target.value.split(',').map((s:string)=>s.trim())})} className="w-full border rounded-lg p-2 text-sm" />
                </div>
              </div>
            )}

            {activeTab === "Pricing" && draftCourse && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
                <h3 className="text-lg font-bold text-navy border-b pb-4">Pricing</h3>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Price (INR)</label>
                  <input type="number" value={draftCourse.price || 0} onChange={e => setDraftCourse({...draftCourse, price: parseFloat(e.target.value)})} className="w-full border rounded-lg p-2 text-sm" />
                </div>
              </div>
            )}

            {activeTab === "Teachers" && draftCourse && (
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
                  <h3 className="text-lg font-bold text-navy border-b pb-4">Teachers</h3>
                  <p className="text-sm text-gray-500">Teacher assignment feature coming soon.</p>
               </div>
            )}
            
            {activeTab === "SEO" && draftCourse && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
                <h3 className="text-lg font-bold text-navy border-b pb-4">SEO</h3>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">SEO Title</label>
                  <input value={draftCourse.seoTitle || ''} onChange={e => setDraftCourse({...draftCourse, seoTitle: e.target.value})} className="w-full border rounded-lg p-2 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">SEO Description</label>
                  <textarea value={draftCourse.seoDescription || ''} onChange={e => setDraftCourse({...draftCourse, seoDescription: e.target.value})} className="w-full border rounded-lg p-2 text-sm" />
                </div>
              </div>
            )}

          </div>
        </main>

        {/* RIGHT PANEL - PREVIEW */}
        <aside className="w-[400px] border-l border-navy/10 bg-white flex flex-col shrink-0 overflow-y-auto">
           <div className="p-4 bg-gray-50 border-b border-gray-200 sticky top-0 z-10 flex justify-between items-center">
             <span className="text-xs font-bold uppercase tracking-[0.2em] text-saffron">Live Draft Preview</span>
             <span className="text-[10px] bg-navy text-white px-2 py-0.5 rounded">Desktop</span>
           </div>
           
           <div className="p-6 space-y-6">
             {/* Mock Frontend Course Page */}
             {draftCourse && (
               <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                 <div className="w-full aspect-video bg-gray-100 flex items-center justify-center">
                   {draftCourse.thumbnail ? <img src={draftCourse.thumbnail} className="w-full h-full object-cover" /> : <ImageIcon className="text-gray-300 w-12 h-12"/>}
                 </div>
                 <div className="p-5 bg-white">
                   <div className="flex gap-2 mb-3">
                     <span className="px-2 py-1 bg-saffron/10 text-saffron text-[10px] font-bold rounded uppercase">Class {draftCourse.classLevel}</span>
                   </div>
                   <h1 className="text-xl font-black text-navy leading-tight">{draftCourse.title}</h1>
                   <p className="text-sm text-gray-600 mt-2">{draftCourse.shortDescription}</p>
                   
                   <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                     <span className="text-lg font-black text-navy">₹{draftCourse.price}</span>
                     <button className="bg-navy text-white text-xs font-bold px-4 py-2 rounded-lg">Enroll Now</button>
                   </div>
                 </div>
                 
                 {draftCourse.aboutThisSubject && (
                   <div className="p-5 bg-gray-50 border-t border-gray-200">
                     <h3 className="text-sm font-bold text-navy mb-2">About This Subject</h3>
                     <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">{draftCourse.aboutThisSubject}</p>
                   </div>
                 )}
                 
                 {draftCourse.whatYouWillLearn?.length > 0 && draftCourse.whatYouWillLearn[0] !== "" && (
                   <div className="p-5 bg-white border-t border-gray-200">
                     <h3 className="text-sm font-bold text-navy mb-3">What You Will Learn</h3>
                     <ul className="space-y-2">
                       {draftCourse.whatYouWillLearn.map((item:string, i:number) => item && (
                         <li key={i} className="flex gap-2 text-xs text-gray-600"><CheckCircle2 size={14} className="text-green-500 shrink-0"/> {item}</li>
                       ))}
                     </ul>
                   </div>
                 )}

                 {draftCourse.courseBenefits?.length > 0 && draftCourse.courseBenefits[0] !== "" && (
                   <div className="p-5 bg-gray-50 border-t border-gray-200">
                     <h3 className="text-sm font-bold text-navy mb-3">Course Benefits</h3>
                     <ul className="space-y-2">
                       {draftCourse.courseBenefits.map((item:string, i:number) => item && (
                         <li key={i} className="flex gap-2 text-xs text-gray-600"><CheckCircle2 size={14} className="text-saffron shrink-0"/> {item}</li>
                       ))}
                     </ul>
                   </div>
                 )}
                 
               </div>
             )}
           </div>
        </aside>
      </div>

      <YouTubeImportModal 
        isOpen={!!importModalData} 
        onClose={() => setImportModalData(null)}
        courseId={courseId}
        subjectId={importModalData?.subjectId || ""}
        moduleId={importModalData?.moduleId || ""}
        startingOrder={importModalData?.order || 0}
      />
    </div>
  );
}

// ─── CURRICULUM TREE COMPONENT ────────────────────────────────────────────────
function CurriculumEditor({ courseId, subjects, modules, lessons, onImport }: any) {
  
  const tree = useMemo(() => {
    const sortedSubjects = [...subjects].sort((a,b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    const sortedModules = [...modules].sort((a,b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    const sortedLessons = [...lessons].sort((a,b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    return sortedSubjects.map((s:any) => ({
      ...s,
      modules: sortedModules.filter((m:any) => m.subjectId === s.id).map((m:any) => ({
        ...m,
        lessons: sortedLessons.filter((l:any) => l.moduleId === m.id)
      }))
    }));
  }, [subjects, modules, lessons]);

  const [expanded, setExpanded] = useState<Set<string>>(new Set(subjects.map((s:any)=>s.id)));

  const handleAddSubject = async () => {
    await addDoc(collection(db, "subjects"), { courseId, title: "New Subject", slug: "new-subject", displayOrder: subjects.length, active: true, createdAt: serverTimestamp() });
  };
  const handleAddModule = async (subjectId: string) => {
    const o = modules.filter((m:any) => m.subjectId === subjectId).length;
    await addDoc(collection(db, "modules"), { courseId, subjectId, title: "New Module", status: "active", displayOrder: o, createdAt: serverTimestamp() });
    setExpanded(p => new Set(p).add(subjectId));
  };
  const handleAddLesson = async (moduleId: string, subjectId: string) => {
    const o = lessons.filter((l:any) => l.moduleId === moduleId).length;
    await addDoc(collection(db, "lessons"), { courseId, subjectId, moduleId, title: "New Lesson", slug: "new-lesson", lessonType: "video", isPreview: false, status: "active", displayOrder: o, createdAt: serverTimestamp() });
    setExpanded(p => new Set(p).add(moduleId));
  };

  const updateTitle = async (col: string, id: string, title: string) => {
    if(!title.trim()) return;
    await updateDoc(doc(db, col, id), { title, updatedAt: serverTimestamp() });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
      {/* Toolbar */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between rounded-t-2xl">
        <h3 className="font-bold text-navy">Curriculum Map</h3>
        <div className="flex items-center gap-2">
          <button onClick={() => onImport("", "", 0)} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors">
            <PlayCircle size={16}/> Import Playlist
          </button>
          <button onClick={handleAddSubject} className="flex items-center gap-2 px-4 py-2 bg-navy text-white rounded-lg text-sm font-bold hover:bg-saffron transition-colors">
            <Plus size={16}/> Add Subject
          </button>
        </div>
      </div>
      
      {/* Tree View */}
      <div className="p-2 space-y-2">
        {tree.length === 0 && <p className="p-8 text-center text-gray-500">No curriculum added yet.</p>}
        {tree.map((subject: any) => (
          <div key={subject.id} className="border border-gray-200 rounded-xl overflow-hidden">
            {/* Subject Row */}
            <div className="flex items-center gap-2 p-2 bg-gray-50 border-b border-gray-200 group">
              <button onClick={() => setExpanded(p => p.has(subject.id) ? new Set([...p].filter(x=>x!==subject.id)) : new Set(p).add(subject.id))} className="p-1 text-gray-500 hover:text-navy">
                {expanded.has(subject.id) ? <ChevronDown size={18}/> : <ChevronRight size={18}/>}
              </button>
              <GripVertical size={16} className="text-gray-300 cursor-grab" />
              <BookOpen size={18} className="text-navy" />
              <input 
                defaultValue={subject.title} 
                onBlur={(e) => updateTitle("subjects", subject.id, e.target.value)}
                className="flex-1 bg-transparent font-bold text-navy px-2 py-1 outline-none border border-transparent focus:border-gray-300 rounded focus:bg-white transition-colors"
              />
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleAddModule(subject.id)} className="flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-white border border-gray-200 text-navy hover:bg-gray-100 rounded" title="Add Module"><Plus size={14}/> Module</button>
                <button className="p-1.5 text-navy hover:bg-gray-200 rounded" title="Duplicate"><Copy size={16}/></button>
                <button onClick={() => deleteDoc(doc(db,"subjects",subject.id))} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Delete"><Trash2 size={16}/></button>
              </div>
            </div>
            
            {/* Modules */}
            {expanded.has(subject.id) && (
              <div className="pl-6 bg-white">
                {subject.modules.map((mod: any) => (
                  <div key={mod.id}>
                    {/* Module Row */}
                    <div className="flex items-center gap-2 p-2 border-b border-gray-100 group">
                      <button onClick={() => setExpanded(p => p.has(mod.id) ? new Set([...p].filter(x=>x!==mod.id)) : new Set(p).add(mod.id))} className="p-1 text-gray-400 hover:text-navy">
                        {expanded.has(mod.id) ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
                      </button>
                      <GripVertical size={14} className="text-gray-300 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />
                      <Layers size={16} className="text-navy/70" />
                      <input 
                        defaultValue={mod.title} 
                        onBlur={(e) => updateTitle("modules", mod.id, e.target.value)}
                        className="flex-1 bg-transparent font-semibold text-navy/90 px-2 py-1 text-sm outline-none border border-transparent focus:border-gray-300 rounded focus:bg-white transition-colors"
                      />
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                        <button onClick={() => handleAddLesson(mod.id, subject.id)} className="flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-gray-50 border border-gray-200 text-navy hover:bg-gray-100 rounded" title="Add Lesson"><Plus size={14}/> Lesson</button>
                        <button onClick={() => onImport(subject.id, mod.id, mod.lessons.length)} className="flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 rounded" title="Import YouTube Playlist"><PlayCircle size={14}/> Import</button>
                        <button className="p-1.5 text-navy hover:bg-gray-100 rounded" title="Duplicate"><Copy size={14}/></button>
                        <button onClick={() => deleteDoc(doc(db,"modules",mod.id))} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Delete"><Trash2 size={14}/></button>
                      </div>
                    </div>
                    
                    {/* Lessons */}
                    {expanded.has(mod.id) && (
                      <div className="pl-8 bg-gray-50/30">
                        {mod.lessons.map((lesson: any) => (
                          <div key={lesson.id} className="flex items-center gap-2 p-2 border-b border-gray-50 group">
                            <div className="w-6"></div>
                            <GripVertical size={14} className="text-gray-300 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />
                            {lesson.lessonType === 'video' ? <PlayCircle size={14} className="text-saffron"/> : <FileText size={14} className="text-blue-500"/>}
                            <input 
                              defaultValue={lesson.title} 
                              onBlur={(e) => updateTitle("lessons", lesson.id, e.target.value)}
                              className="flex-1 bg-transparent text-sm text-gray-700 px-2 py-1 outline-none border border-transparent focus:border-gray-300 rounded focus:bg-white transition-colors"
                            />
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                              <button className="p-1.5 text-navy hover:bg-gray-200 rounded" title="Duplicate"><Copy size={14}/></button>
                              <button onClick={() => deleteDoc(doc(db,"lessons",lesson.id))} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Delete"><Trash2 size={14}/></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
