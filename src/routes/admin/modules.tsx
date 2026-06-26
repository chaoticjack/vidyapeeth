import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AdminTable } from "@/components/admin/AdminTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Plus, Edit, Trash2, X, Loader2, ArrowLeft, Save, LayoutGrid, ImageIcon, Settings, Filter } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export const Route = createFileRoute("/admin/modules")({
  head: () => ({ meta: [{ title: "Module Management — Admin Portal" }] }),
  component: AdminModules,
});

const moduleSchema = z.object({
  courseId: z.string().min(1, "Course is required"),
  subjectId: z.string().min(1, "Subject is required"),
  title: z.string().min(2, "Title is required"),
  slug: z.string().optional(),
  description: z.string().optional(),
  displayOrder: z.coerce.number(),
  estimatedHours: z.coerce.number().optional(),
  estimatedDuration: z.string().optional(),
  difficulty: z.string().optional(),
  thumbnail: z.string().optional(),
  learningObjectives: z.string().optional(), // we'll split by newline
  prerequisites: z.string().optional(), // we'll split by newline
  status: z.enum(["active", "draft", "archived"]),
});
type ModuleForm = z.infer<typeof moduleSchema>;

function AdminModules() {
  const [modules, setModules] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
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

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting, isDirty } } = useForm<ModuleForm>({
    resolver: zodResolver(moduleSchema),
    defaultValues: { status: "active", displayOrder: 0, difficulty: "Beginner" }
  });

  const selectedCourseId = watch("courseId");
  const filteredSubjectsForDropdown = subjects.filter(s => s.courseId === selectedCourseId);

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
      setLoading(false);
    }, (err) => {
      console.error(err);
      toast.error("Failed to load modules");
      setLoading(false);
    });

    return () => {
      unsubscribeCourses();
      unsubscribeSubjects();
      unsubscribeModules();
    };
  }, []);

  const openCreate = () => {
    reset({
      courseId: courseFilter !== "all" ? courseFilter : "",
      subjectId: subjectFilter !== "all" ? subjectFilter : "",
      title: "", slug: "", description: "", 
      displayOrder: modules.length + 1, estimatedHours: undefined, estimatedDuration: "",
      difficulty: "Beginner", thumbnail: "", learningObjectives: "", prerequisites: "", status: "active"
    });
    setEditingId(null);
    setActiveTab("basic");
    setIsEditing(true);
  };

  const openEdit = (mod: any) => {
    reset({
      courseId: mod.courseId || "",
      subjectId: mod.subjectId || "",
      title: mod.title || mod.name || "",
      slug: mod.slug || "",
      description: mod.description || "",
      displayOrder: mod.displayOrder || mod.order || 0,
      estimatedHours: mod.estimatedHours,
      estimatedDuration: mod.estimatedDuration || "",
      difficulty: mod.difficulty || "Beginner",
      thumbnail: mod.thumbnail || "",
      learningObjectives: mod.learningObjectives ? mod.learningObjectives.join("\n") : "",
      prerequisites: mod.prerequisites ? mod.prerequisites.join("\n") : "",
      status: mod.status || "active",
    });
    setEditingId(mod.id);
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

  const onSubmit = async (data: ModuleForm) => {
    try {
      const firestoreData = {
        ...data,
        learningObjectives: data.learningObjectives ? data.learningObjectives.split("\n").filter(s => s.trim() !== "") : [],
        prerequisites: data.prerequisites ? data.prerequisites.split("\n").filter(s => s.trim() !== "") : [],
      };

      if (editingId) {
        await updateDoc(doc(db, "modules", editingId), { ...firestoreData, updatedAt: serverTimestamp() });
        toast.success("Module updated successfully");
      } else {
        await addDoc(collection(db, "modules"), { ...firestoreData, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        toast.success("Module created successfully");
      }
      setIsEditing(false);
      setEditingId(null);
      reset();
    } catch (err) {
      console.error(err);
      toast.error(editingId ? "Failed to update module" : "Failed to create module");
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
      await deleteDoc(doc(db, "modules", deletingId));
      toast.success("Module deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete module");
    } finally {
      setIsDeleting(false);
      setIsConfirmOpen(false);
      setDeletingId(null);
    }
  };

  const filteredModules = modules.filter(m => 
    (courseFilter === "all" || m.courseId === courseFilter) &&
    (subjectFilter === "all" || m.subjectId === subjectFilter) &&
    ((m.title || m.name || "")?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.slug?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const columns = [
    { key: "title", label: "Module Name", render: (row: any) => <span className="font-semibold text-navy">{row.title || row.name}</span> },
    { key: "subject", label: "Subject", render: (row: any) => {
      const subject = subjects.find(s => s.id === row.subjectId);
      return <span className="text-sm">{subject ? subject.title || subject.name : '-'}</span>;
    }},
    { key: "course", label: "Course", render: (row: any) => {
      const course = courses.find(c => c.id === row.courseId);
      return <span className="text-sm">{course ? course.title || course.name : '-'}</span>;
    }},
    { key: "displayOrder", label: "Order", render: (row: any) => <span className="text-sm">{row.displayOrder}</span> },
    { key: "status", label: "Status", render: (row: any) => (
      <span className={`px-2 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold ${row.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
        {row.status || 'Active'}
      </span>
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
              <h1 className="text-xl font-bold text-navy">{editingId ? 'Edit Module' : 'New Module'}</h1>
              {isDirty && <p className="text-xs text-saffron font-medium">Unsaved changes</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={closeEditor} className="px-4 py-2 text-sm font-semibold text-navy bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" form="moduleEditorForm" disabled={isSubmitting} className="flex items-center gap-2 px-6 py-2 text-sm font-semibold text-white bg-navy rounded-xl hover:bg-saffron transition-colors disabled:opacity-70">
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {editingId ? 'Save Changes' : 'Publish Module'}
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
                <ImageIcon size={18} /> Content Details
              </button>
              <button type="button" onClick={() => setActiveTab("settings")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === "settings" ? "bg-navy/5 text-navy" : "text-gray-500 hover:bg-gray-100 hover:text-navy"}`}>
                <Settings size={18} /> Visibility
              </button>
            </div>
          </div>

          <div className="flex-1 p-6 md:p-8 overflow-y-auto pb-32">
            <form id="moduleEditorForm" onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-8">
              
              <div className={activeTab === "basic" ? "block" : "hidden"}>
                <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 space-y-6">
                  <h2 className="text-lg font-bold text-navy mb-4 border-b border-gray-100 pb-4">Basic Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Associated Course <span className="text-red-500">*</span></label>
                      <select {...register("courseId")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors">
                        <option value="">Select a course</option>
                        {courses.map(c => (
                          <option key={c.id} value={c.id}>{c.title || c.name}</option>
                        ))}
                      </select>
                      {errors.courseId && <p className="text-xs text-red-500">{errors.courseId.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Associated Subject <span className="text-red-500">*</span></label>
                      <select {...register("subjectId")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" disabled={!selectedCourseId}>
                        <option value="">Select a subject</option>
                        {filteredSubjectsForDropdown.map(s => (
                          <option key={s.id} value={s.id}>{s.title || s.name}</option>
                        ))}
                      </select>
                      {errors.subjectId && <p className="text-xs text-red-500">{errors.subjectId.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Module Name <span className="text-red-500">*</span></label>
                      <input {...register("title")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="e.g. Chapter 1: Foundations" />
                      {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Slug</label>
                      <input {...register("slug")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="e.g. chap-1-foundations" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-navy">Description</label>
                    <textarea {...register("description")} rows={4} className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors resize-y" placeholder="Brief overview of what this module covers..." />
                  </div>
                </div>
              </div>

              <div className={activeTab === "content" ? "block" : "hidden"}>
                <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 space-y-6">
                  <h2 className="text-lg font-bold text-navy mb-4 border-b border-gray-100 pb-4">Content Details</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Estimated Hours</label>
                      <input type="number" {...register("estimatedHours")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="e.g. 10" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Duration (Text)</label>
                      <input {...register("estimatedDuration")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="e.g. 2 Weeks" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Difficulty</label>
                      <select {...register("difficulty")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors">
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-navy">Thumbnail URL</label>
                    <input {...register("thumbnail")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="https://..." />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-navy">Learning Objectives (One per line)</label>
                    <textarea {...register("learningObjectives")} rows={4} className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors resize-y" placeholder="Understand basic algebra&#10;Solve linear equations..." />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-navy">Prerequisites (One per line)</label>
                    <textarea {...register("prerequisites")} rows={4} className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors resize-y" placeholder="Basic arithmetic..." />
                  </div>
                </div>
              </div>

              <div className={activeTab === "settings" ? "block" : "hidden"}>
                <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 space-y-6">
                  <h2 className="text-lg font-bold text-navy mb-4 border-b border-gray-100 pb-4">Visibility & Settings</h2>
                  
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
          <h1 className="text-2xl font-black text-navy font-display">Module Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage chapters/modules within your subjects.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-xl">
            <Filter size={16} className="text-gray-400" />
            <select 
              value={courseFilter} 
              onChange={(e) => { setCourseFilter(e.target.value); setSubjectFilter("all"); }}
              className="bg-transparent border-none outline-none text-sm font-semibold text-navy"
            >
              <option value="all">All Courses</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.title || c.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-xl">
            <Filter size={16} className="text-gray-400" />
            <select 
              value={subjectFilter} 
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="bg-transparent border-none outline-none text-sm font-semibold text-navy max-w-[150px] truncate cursor-pointer"
            >
              <option value="all">All Subjects</option>
              {subjects.filter(s => courseFilter === "all" || s.courseId === courseFilter).map(s => (
                <option key={s.id} value={s.id}>{s.title || s.name}</option>
              ))}
            </select>
          </div>

          <button onClick={openCreate} className="flex items-center gap-2 bg-navy text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-saffron transition-colors shadow-sm shrink-0">
            <Plus size={16} /> New Module
          </button>
        </div>
      </div>

      <AdminTable 
        columns={columns} 
        data={filteredModules} 
        loading={loading}
        searchPlaceholder="Search modules by name..."
        onSearch={setSearchTerm}
      />

      <ConfirmDialog 
        isOpen={isConfirmOpen}
        title="Delete Module"
        description="Are you sure you want to delete this module? This will remove all nested lessons. This action cannot be undone."
        confirmText="Delete Module"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
