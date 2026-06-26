import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AdminTable } from "@/components/admin/AdminTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Plus, Edit, Trash2, X, Loader2, ArrowLeft, Save, LayoutGrid, Video, Link as LinkIcon, Settings, Filter, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export const Route = createFileRoute("/admin/lessons")({
  head: () => ({ meta: [{ title: "Lesson Management — Admin Portal" }] }),
  component: AdminLessons,
});

const lessonSchema = z.object({
  courseId: z.string().min(1, "Course is required"),
  subjectId: z.string().min(1, "Subject is required"),
  moduleId: z.string().min(1, "Module is required"),
  title: z.string().min(2, "Title is required"),
  slug: z.string().min(2, "Slug is required"),
  lessonType: z.enum(["video", "pdf", "assignment", "quiz", "external"]),
  description: z.string().optional(),
  videoUrl: z.string().optional(),
  videoDuration: z.string().optional(),
  pdfUrl: z.string().optional(),
  quizUrl: z.string().optional(),
  thumbnail: z.string().optional(),
  notesUrl: z.string().optional(),
  worksheetUrl: z.string().optional(),
  assignmentUrl: z.string().optional(),
  externalLink: z.string().optional(),
  duration: z.string().optional(),
  estimatedDuration: z.string().optional(),
  isPreview: z.boolean().optional(),
  isFree: z.boolean().optional(),
  displayOrder: z.coerce.number(),
  status: z.enum(["active", "draft", "archived"]),
});
type LessonForm = z.infer<typeof lessonSchema>;

function AdminLessons() {
  const [lessons, setLessons] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
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
  const [courseFilter, setCourseFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [moduleFilter, setModuleFilter] = useState("all");

  const togglePreview = async (id: string, currentVal: boolean) => {
    try {
      await updateDoc(doc(db, "lessons", id), { isPreview: !currentVal, updatedAt: serverTimestamp() });
      toast.success("Preview status updated");
    } catch (e) {
      toast.error("Failed to update preview status");
    }
  };

  const toggleStatus = async (id: string, currentVal: string) => {
    try {
      const newStatus = currentVal === 'active' ? 'draft' : 'active';
      await updateDoc(doc(db, "lessons", id), { status: newStatus, updatedAt: serverTimestamp() });
      toast.success("Status updated to " + newStatus);
    } catch (e) {
      toast.error("Failed to update status");
    }
  };

  const cycleLessonType = async (id: string, currentVal: string) => {
    try {
      const types = ["video", "pdf", "assignment", "quiz", "external"];
      const currentIndex = types.indexOf(currentVal || "video");
      const nextType = types[(currentIndex + 1) % types.length];
      await updateDoc(doc(db, "lessons", id), { lessonType: nextType, updatedAt: serverTimestamp() });
      toast.success("Type updated to " + nextType.toUpperCase());
    } catch (e) {
      toast.error("Failed to update type");
    }
  };

  const updateOrder = async (id: string, newOrder: number) => {
    try {
      await updateDoc(doc(db, "lessons", id), { displayOrder: newOrder, updatedAt: serverTimestamp() });
      toast.success("Order updated");
    } catch (e) {
      toast.error("Failed to update order");
    }
  };

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting, isDirty } } = useForm<LessonForm>({
    resolver: zodResolver(lessonSchema),
    defaultValues: { status: "active", displayOrder: 0, lessonType: "video", isPreview: false, isFree: false }
  });

  const selectedCourseId = watch("courseId");
  const selectedSubjectId = watch("subjectId");
  const filteredSubjectsForDropdown = subjects.filter(s => s.courseId === selectedCourseId);
  const filteredModulesForDropdown = modules.filter(m => m.subjectId === selectedSubjectId);
  const selectedLessonType = watch("lessonType");

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
    });

    // Fetch subjects
    const unsubscribeSubjects = onSnapshot(query(collection(db, "subjects"), orderBy("displayOrder", "asc")), (snapshot) => {
      setSubjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Fetch modules
    const unsubscribeModules = onSnapshot(query(collection(db, "modules"), orderBy("displayOrder", "asc")), (snapshot) => {
      setModules(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Fetch lessons
    const unsubscribeLessons = onSnapshot(query(collection(db, "lessons"), orderBy("displayOrder", "asc")), (snapshot) => {
      setLessons(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => {
      console.error(err);
      toast.error("Failed to load lessons");
      setLoading(false);
    });

    return () => {
      unsubscribeCourses();
      unsubscribeSubjects();
      unsubscribeModules();
      unsubscribeLessons();
    };
  }, []);

  const openCreate = () => {
    reset({
      courseId: courseFilter !== "all" ? courseFilter : "",
      subjectId: subjectFilter !== "all" ? subjectFilter : "",
      moduleId: moduleFilter !== "all" ? moduleFilter : "",
      title: "", slug: "", lessonType: "video", description: "", 
      videoUrl: "", videoDuration: "", pdfUrl: "", quizUrl: "", thumbnail: "", notesUrl: "", worksheetUrl: "", assignmentUrl: "", externalLink: "",
      duration: "", estimatedDuration: "", isPreview: false, isFree: false,
      displayOrder: lessons.length + 1, status: "active"
    });
    setEditingId(null);
    setActiveTab("basic");
    setIsEditing(true);
  };

  const openEdit = (lesson: any) => {
    reset({
      courseId: lesson.courseId || "",
      subjectId: lesson.subjectId || "",
      moduleId: lesson.moduleId || "",
      title: lesson.title || lesson.name || "",
      slug: lesson.slug || "",
      lessonType: lesson.lessonType || "video",
      description: lesson.description || "",
      videoUrl: lesson.videoUrl || "",
      videoDuration: lesson.videoDuration || "",
      pdfUrl: lesson.pdfUrl || "",
      quizUrl: lesson.quizUrl || "",
      thumbnail: lesson.thumbnail || "",
      notesUrl: lesson.notesUrl || "",
      worksheetUrl: lesson.worksheetUrl || "",
      assignmentUrl: lesson.assignmentUrl || "",
      externalLink: lesson.externalLink || "",
      duration: lesson.duration || "",
      estimatedDuration: lesson.estimatedDuration || "",
      isPreview: lesson.isPreview || false,
      isFree: lesson.isFree || false,
      displayOrder: lesson.displayOrder || lesson.order || 0,
      status: lesson.status || "active",
    });
    setEditingId(lesson.id);
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

  const onSubmit = async (data: LessonForm) => {
    try {
      if (editingId) {
        await updateDoc(doc(db, "lessons", editingId), { ...data, updatedAt: serverTimestamp() });
        toast.success("Lesson updated successfully");
      } else {
        await addDoc(collection(db, "lessons"), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        toast.success("Lesson created successfully");
      }
      setIsEditing(false);
      setEditingId(null);
      reset();
    } catch (err) {
      console.error(err);
      toast.error(editingId ? "Failed to update lesson" : "Failed to create lesson");
    }
  };

  const onError = (errors: any) => {
    toast.error("Please check the form for errors. Some required fields might be empty or invalid.");
    console.error("Form errors:", errors);
    // Auto-switch to the first tab that has an error
    if (errors.courseId || errors.subjectId || errors.moduleId || errors.title || errors.slug) {
      setActiveTab("basic");
    } else if (errors.lessonType || errors.videoUrl || errors.pdfUrl || errors.quizUrl) {
      setActiveTab("content");
    } else if (errors.status || errors.displayOrder) {
      setActiveTab("settings");
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
      await deleteDoc(doc(db, "lessons", deletingId));
      toast.success("Lesson deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete lesson");
    } finally {
      setIsDeleting(false);
      setIsConfirmOpen(false);
      setDeletingId(null);
    }
  };

  const filteredLessons = lessons.filter(l => 
    (courseFilter === "all" || l.courseId === courseFilter) &&
    (subjectFilter === "all" || l.subjectId === subjectFilter) &&
    (moduleFilter === "all" || l.moduleId === moduleFilter) &&
    ((l.title || l.name || "")?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.slug?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const columns = [
    { key: "type", label: "Type", render: (row: any) => {
      const type = row.lessonType || 'video';
      const colors: any = {
        video: "bg-blue-100 text-blue-700 hover:bg-blue-200",
        pdf: "bg-red-100 text-red-700 hover:bg-red-200",
        quiz: "bg-purple-100 text-purple-700 hover:bg-purple-200",
        assignment: "bg-orange-100 text-orange-700 hover:bg-orange-200",
        external: "bg-gray-100 text-gray-700 hover:bg-gray-200"
      };
      return (
        <button 
          onClick={() => cycleLessonType(row.id, type)}
          className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide transition-colors ${colors[type] || colors.video}`}
          title="Click to change type"
        >
          {type}
        </button>
      );
    }},
    { key: "title", label: "Lesson Name", render: (row: any) => <span className="font-semibold text-navy">{row.title || row.name}</span> },
    { key: "module", label: "Module", render: (row: any) => {
      const module = modules.find(m => m.id === row.moduleId);
      return <span className="text-sm">{module ? module.title || module.name : '-'}</span>;
    }},
    { key: "preview", label: "Preview", render: (row: any) => (
      <button onClick={() => togglePreview(row.id, row.isPreview)} className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${row.isPreview ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
        {row.isPreview ? '✅ Yes' : 'No'}
      </button>
    )},
    { key: "displayOrder", label: "Order", render: (row: any) => (
      <input 
        type="number" 
        defaultValue={row.displayOrder} 
        onBlur={(e) => {
          if (e.target.value !== String(row.displayOrder)) {
            updateOrder(row.id, parseInt(e.target.value) || 0);
          }
        }}
        className="w-16 px-2 py-1 text-sm border border-gray-200 rounded outline-none focus:border-saffron focus:ring-1 focus:ring-saffron bg-white"
      />
    )},
    { key: "status", label: "Status", render: (row: any) => (
      <button onClick={() => toggleStatus(row.id, row.status)} className={`px-2 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold transition-colors ${row.status === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
        {row.status || 'Active'}
      </button>
    )},
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
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button type="button" onClick={closeEditor} className="p-2 text-gray-400 hover:text-navy hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-navy">{editingId ? 'Edit Lesson' : 'New Lesson'}</h1>
              {isDirty && <p className="text-xs text-saffron font-medium">Unsaved changes</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={closeEditor} className="px-4 py-2 text-sm font-semibold text-navy bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" form="lessonEditorForm" disabled={isSubmitting} className="flex items-center gap-2 px-6 py-2 text-sm font-semibold text-white bg-navy rounded-xl hover:bg-saffron transition-colors disabled:opacity-70">
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {editingId ? 'Save Changes' : 'Publish Lesson'}
            </button>
          </div>
        </div>

        <div className="flex-1 flex max-w-7xl mx-auto w-full">
          <div className="w-64 shrink-0 border-r border-gray-200 p-6 hidden md:block">
            <div className="space-y-1 sticky top-24">
              <button type="button" onClick={() => setActiveTab("basic")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === "basic" ? "bg-navy/5 text-navy" : "text-gray-500 hover:bg-gray-100 hover:text-navy"}`}>
                <LayoutGrid size={18} /> Basic Info
              </button>
              <button type="button" onClick={() => setActiveTab("content")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === "content" ? "bg-navy/5 text-navy" : "text-gray-500 hover:bg-gray-100 hover:text-navy"}`}>
                <Video size={18} /> Media & Content
              </button>
              <button type="button" onClick={() => setActiveTab("resources")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === "resources" ? "bg-navy/5 text-navy" : "text-gray-500 hover:bg-gray-100 hover:text-navy"}`}>
                <LinkIcon size={18} /> Resources & Links
              </button>
              <button type="button" onClick={() => setActiveTab("settings")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === "settings" ? "bg-navy/5 text-navy" : "text-gray-500 hover:bg-gray-100 hover:text-navy"}`}>
                <Settings size={18} /> Settings
              </button>
            </div>
          </div>

          <div className="flex-1 p-6 md:p-8 overflow-y-auto pb-32">
            <form id="lessonEditorForm" onSubmit={handleSubmit(onSubmit, onError)} className="max-w-3xl space-y-8">
              
              <div className={activeTab === "basic" ? "block" : "hidden"}>
                <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 space-y-6">
                  <h2 className="text-lg font-bold text-navy mb-4 border-b border-gray-100 pb-4">Basic Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Course <span className="text-red-500">*</span></label>
                      <select {...register("courseId")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors">
                        <option value="">Select course</option>
                        {courses.map(c => (
                          <option key={c.id} value={c.id}>{c.title || c.name}</option>
                        ))}
                      </select>
                      {errors.courseId && <p className="text-xs text-red-500">{errors.courseId.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Subject <span className="text-red-500">*</span></label>
                      <select {...register("subjectId")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" disabled={!selectedCourseId}>
                        <option value="">Select subject</option>
                        {filteredSubjectsForDropdown.map(s => (
                          <option key={s.id} value={s.id}>{s.title || s.name}</option>
                        ))}
                      </select>
                      {errors.subjectId && <p className="text-xs text-red-500">{errors.subjectId.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Module <span className="text-red-500">*</span></label>
                      <select {...register("moduleId")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" disabled={!selectedSubjectId}>
                        <option value="">Select module</option>
                        {filteredModulesForDropdown.map(m => (
                          <option key={m.id} value={m.id}>{m.title || m.name}</option>
                        ))}
                      </select>
                      {errors.moduleId && <p className="text-xs text-red-500">{errors.moduleId.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Lesson Title <span className="text-red-500">*</span></label>
                      <input {...register("title")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="e.g. Introduction to Algebra" />
                      {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Slug <span className="text-red-500">*</span></label>
                      <input {...register("slug")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="e.g. intro-to-algebra" />
                      {errors.slug && <p className="text-xs text-red-500">{errors.slug.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-navy">Description</label>
                    <textarea {...register("description")} rows={4} className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors resize-y" placeholder="Brief overview of the lesson..." />
                  </div>
                </div>
              </div>

              <div className={activeTab === "content" ? "block" : "hidden"}>
                <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 space-y-6">
                  <h2 className="text-lg font-bold text-navy mb-4 border-b border-gray-100 pb-4">Media & Content</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Lesson Type</label>
                      <select {...register("lessonType")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors">
                        <option value="video">Video</option>
                        <option value="pdf">PDF / Document</option>
                        <option value="assignment">Assignment</option>
                        <option value="quiz">Quiz</option>
                        <option value="external">External Link</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Thumbnail URL</label>
                      <input {...register("thumbnail")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="https://..." />
                    </div>
                  </div>

                  {(selectedLessonType === "video" || selectedLessonType === "external") && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 border border-gray-100 rounded-xl mt-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-navy">Video / External URL</label>
                        <input {...register("videoUrl")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-white transition-colors" placeholder="https://youtube.com/watch?v=..." />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-navy">Video Duration</label>
                        <input {...register("videoDuration")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-white transition-colors" placeholder="e.g. 15:30 or 15 mins" />
                      </div>
                    </div>
                  )}

                  {selectedLessonType === "pdf" && (
                    <div className="grid grid-cols-1 gap-6 p-4 bg-gray-50 border border-gray-100 rounded-xl mt-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-navy">PDF Document URL</label>
                        <input {...register("pdfUrl")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-white transition-colors" placeholder="https://.../document.pdf" />
                      </div>
                    </div>
                  )}

                  {selectedLessonType === "quiz" && (
                    <div className="grid grid-cols-1 gap-6 p-4 bg-gray-50 border border-gray-100 rounded-xl mt-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-navy">Quiz URL (Forms / App Link)</label>
                        <input {...register("quizUrl")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-white transition-colors" placeholder="https://..." />
                      </div>
                    </div>
                  )}

                  {selectedLessonType === "assignment" && (
                    <div className="grid grid-cols-1 gap-6 p-4 bg-gray-50 border border-gray-100 rounded-xl mt-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-navy">Assignment URL</label>
                        <input {...register("assignmentUrl")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-white transition-colors" placeholder="https://..." />
                        <p className="text-xs text-gray-500 mt-1">This will be the primary content for this assignment lesson.</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Total Duration</label>
                      <input {...register("duration")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="e.g. 45 mins" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Estimated Duration</label>
                      <input {...register("estimatedDuration")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="e.g. 1 hour" />
                    </div>
                  </div>
                </div>
              </div>

              <div className={activeTab === "resources" ? "block" : "hidden"}>
                <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 space-y-6">
                  <h2 className="text-lg font-bold text-navy mb-4 border-b border-gray-100 pb-4">Resources & Links</h2>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Class Notes URL</label>
                      <input {...register("notesUrl")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="Link to PDF or Google Doc..." />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Worksheet URL</label>
                      <input {...register("worksheetUrl")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="Link to worksheet..." />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Assignment URL</label>
                      <input {...register("assignmentUrl")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="Link to assignment..." />
                    </div>
                  </div>
                </div>
              </div>

              <div className={activeTab === "settings" ? "block" : "hidden"}>
                <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 space-y-6">
                  <h2 className="text-lg font-bold text-navy mb-4 border-b border-gray-100 pb-4">Settings & Visibility</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Status</label>
                      <select {...register("status")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors">
                        <option value="active">Active</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Display Order</label>
                      <input type="number" {...register("displayOrder")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="0" />
                    </div>
                  </div>

                  <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-navy/30 transition-colors bg-blue-50/50">
                      <input type="checkbox" {...register("isPreview")} className="mt-1 w-4 h-4 rounded border-gray-300 text-saffron focus:ring-saffron" />
                      <div>
                        <span className="text-sm font-bold text-navy block">Free Preview Lesson</span>
                        <span className="text-xs text-gray-500 block">Available to users without purchasing the course.</span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-navy/30 transition-colors">
                      <input type="checkbox" {...register("isFree")} className="mt-1 w-4 h-4 rounded border-gray-300 text-saffron focus:ring-saffron" />
                      <div>
                        <span className="text-sm font-bold text-navy block">Free Lesson</span>
                        <span className="text-xs text-gray-500 block">A completely free resource.</span>
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
          <h1 className="text-2xl font-black text-navy font-display">Lesson Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage individual videos, pdfs, and resources within modules.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Filters */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-xl shrink-0">
            <Filter size={16} className="text-gray-400" />
            <select 
              value={courseFilter} 
              onChange={(e) => { setCourseFilter(e.target.value); setSubjectFilter("all"); setModuleFilter("all"); }}
              className="bg-transparent border-none outline-none text-sm font-semibold text-navy max-w-[120px] truncate"
            >
              <option value="all">All Courses</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title || c.name}</option>)}
            </select>
          </div>
          
          <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-xl shrink-0">
            <Filter size={16} className="text-gray-400" />
            <select 
              value={subjectFilter} 
              onChange={(e) => { setSubjectFilter(e.target.value); setModuleFilter("all"); }}
              className="bg-transparent border-none outline-none text-sm font-semibold text-navy max-w-[120px] truncate cursor-pointer"
            >
              <option value="all">All Subjects</option>
              {subjects.filter(s => courseFilter === "all" || s.courseId === courseFilter).map(s => <option key={s.id} value={s.id}>{s.title || s.name}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-xl shrink-0">
            <Filter size={16} className="text-gray-400" />
            <select 
              value={moduleFilter} 
              onChange={(e) => setModuleFilter(e.target.value)}
              className="bg-transparent border-none outline-none text-sm font-semibold text-navy max-w-[120px] truncate cursor-pointer"
            >
              <option value="all">All Modules</option>
              {modules.filter(m => subjectFilter === "all" || m.subjectId === subjectFilter).map(m => <option key={m.id} value={m.id}>{m.title || m.name}</option>)}
            </select>
          </div>

          <a href="/admin/fix-lessons" className="flex items-center gap-2 bg-white text-navy border border-gray-200 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm shrink-0">
            <Sparkles size={16} className="text-saffron" /> Auto-Fix Lessons
          </a>
          <button onClick={openCreate} className="flex items-center gap-2 bg-navy text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-saffron transition-colors shadow-sm shrink-0">
            <Plus size={16} /> New Lesson
          </button>
        </div>
      </div>

      <AdminTable 
        columns={columns} 
        data={filteredLessons} 
        loading={loading}
        searchPlaceholder="Search lessons by title..."
        onSearch={setSearchTerm}
      />

      <ConfirmDialog 
        isOpen={isConfirmOpen}
        title="Delete Lesson"
        description="Are you sure you want to delete this lesson? This action cannot be undone."
        confirmText="Delete Lesson"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
