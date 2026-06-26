import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AdminTable } from "@/components/admin/AdminTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Plus, Edit, Trash2, X, Loader2, ArrowLeft, Save, LayoutGrid, Image as ImageIcon, Settings, Filter } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export const Route = createFileRoute("/admin/subjects")({
  head: () => ({ meta: [{ title: "Subject Management — Admin Portal" }] }),
  component: AdminSubjects,
});

const subjectSchema = z.object({
  courseId: z.string().min(1, "Course is required"),
  title: z.string().min(2, "Title is required"),
  slug: z.string().min(2, "Slug is required"),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  displayOrder: z.coerce.number(),
  estimatedHours: z.coerce.number().optional(),
  active: z.boolean(),
});
type SubjectForm = z.infer<typeof subjectSchema>;

function AdminSubjects() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
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

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting, isDirty } } = useForm<SubjectForm>({
    resolver: zodResolver(subjectSchema),
    defaultValues: { active: true, displayOrder: 0 }
  });

  const titleValue = watch("title");
  useEffect(() => {
    if (!editingId && titleValue) {
      setValue("slug", titleValue.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""), { shouldValidate: true });
    }
  }, [titleValue, editingId, setValue]);

  useEffect(() => {
    // Fetch courses for dropdowns and filtering
    const unsubscribeCourses = onSnapshot(query(collection(db, "courses"), orderBy("createdAt", "desc")), (snapshot) => {
      setCourses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Fetch subjects
    const unsubscribeSubjects = onSnapshot(query(collection(db, "subjects"), orderBy("displayOrder", "asc")), (snapshot) => {
      setSubjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => {
      console.error(err);
      toast.error("Failed to load subjects");
      setLoading(false);
    });

    return () => {
      unsubscribeCourses();
      unsubscribeSubjects();
    };
  }, []);

  const openCreate = () => {
    reset({
      courseId: courseFilter !== "all" ? courseFilter : "",
      title: "", slug: "", description: "", icon: "", color: "#1B2A4A",
      displayOrder: subjects.length + 1, estimatedHours: undefined, active: true
    });
    setEditingId(null);
    setActiveTab("basic");
    setIsEditing(true);
  };

  const openEdit = (subject: any) => {
    reset({
      courseId: subject.courseId || "",
      title: subject.title || subject.name || "",
      slug: subject.slug || "",
      description: subject.description || "",
      icon: subject.icon || "",
      color: subject.color || "#1B2A4A",
      displayOrder: subject.displayOrder || subject.order || 0,
      estimatedHours: subject.estimatedHours,
      active: subject.active ?? subject.published ?? true,
    });
    setEditingId(subject.id);
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

  const onSubmit = async (data: SubjectForm) => {
    try {
      if (editingId) {
        await updateDoc(doc(db, "subjects", editingId), { ...data, updatedAt: serverTimestamp() });
        toast.success("Subject updated successfully");
      } else {
        await addDoc(collection(db, "subjects"), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        toast.success("Subject created successfully");
      }
      setIsEditing(false);
      setEditingId(null);
      reset();
    } catch (err) {
      console.error(err);
      toast.error(editingId ? "Failed to update subject" : "Failed to create subject");
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
      await deleteDoc(doc(db, "subjects", deletingId));
      toast.success("Subject deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete subject");
    } finally {
      setIsDeleting(false);
      setIsConfirmOpen(false);
      setDeletingId(null);
    }
  };

  const filteredSubjects = subjects.filter(s => 
    (courseFilter === "all" || s.courseId === courseFilter) &&
    ((s.title || s.name || "")?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.slug?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const columns = [
    { key: "icon", label: "Icon", render: (row: any) => (
      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: row.color ? `${row.color}15` : '#1B2A4A15', color: row.color || '#1B2A4A' }}>
        {row.icon || <LayoutGrid size={18} />}
      </div>
    )},
    { key: "title", label: "Subject Name", render: (row: any) => <span className="font-semibold text-navy">{row.title || row.name}</span> },
    { key: "course", label: "Course", render: (row: any) => {
      const course = courses.find(c => c.id === row.courseId);
      return <span className="text-sm">{course ? course.title || course.name : '-'}</span>;
    }},
    { key: "displayOrder", label: "Order", render: (row: any) => <span className="text-sm">{row.displayOrder}</span> },
    { key: "active", label: "Status", render: (row: any) => (
      <span className={`px-2 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold ${row.active ?? row.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
        {row.active ?? row.published ? 'Active' : 'Inactive'}
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
              <h1 className="text-xl font-bold text-navy">{editingId ? 'Edit Subject' : 'New Subject'}</h1>
              {isDirty && <p className="text-xs text-saffron font-medium">Unsaved changes</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={closeEditor} className="px-4 py-2 text-sm font-semibold text-navy bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" form="subjectEditorForm" disabled={isSubmitting} className="flex items-center gap-2 px-6 py-2 text-sm font-semibold text-white bg-navy rounded-xl hover:bg-saffron transition-colors disabled:opacity-70">
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {editingId ? 'Save Changes' : 'Publish Subject'}
            </button>
          </div>
        </div>

        <div className="flex-1 flex max-w-7xl mx-auto w-full">
          <div className="w-64 shrink-0 border-r border-gray-200 p-6 hidden md:block">
            <div className="space-y-1 sticky top-24">
              <button type="button" onClick={() => setActiveTab("basic")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === "basic" ? "bg-navy/5 text-navy" : "text-gray-500 hover:bg-gray-100 hover:text-navy"}`}>
                <LayoutGrid size={18} /> Basic Info
              </button>
              <button type="button" onClick={() => setActiveTab("design")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === "design" ? "bg-navy/5 text-navy" : "text-gray-500 hover:bg-gray-100 hover:text-navy"}`}>
                <ImageIcon size={18} /> Design & Layout
              </button>
              <button type="button" onClick={() => setActiveTab("settings")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === "settings" ? "bg-navy/5 text-navy" : "text-gray-500 hover:bg-gray-100 hover:text-navy"}`}>
                <Settings size={18} /> Visibility
              </button>
            </div>
          </div>

          <div className="flex-1 p-6 md:p-8 overflow-y-auto pb-32">
            <form id="subjectEditorForm" onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-8">
              
              <div className={activeTab === "basic" ? "block" : "hidden"}>
                <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 space-y-6">
                  <h2 className="text-lg font-bold text-navy mb-4 border-b border-gray-100 pb-4">Basic Information</h2>
                  
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Subject Name <span className="text-red-500">*</span></label>
                      <input {...register("title")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="e.g. Mathematics" />
                      {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Slug <span className="text-red-500">*</span></label>
                      <input {...register("slug")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="e.g. mathematics" />
                      {errors.slug && <p className="text-xs text-red-500">{errors.slug.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-navy">Description</label>
                    <textarea {...register("description")} rows={4} className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors resize-y" placeholder="Detailed description of the subject..." />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Estimated Hours</label>
                      <input type="number" {...register("estimatedHours")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="e.g. 40" />
                    </div>
                  </div>
                </div>
              </div>

              <div className={activeTab === "design" ? "block" : "hidden"}>
                <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 space-y-6">
                  <h2 className="text-lg font-bold text-navy mb-4 border-b border-gray-100 pb-4">Design & Layout</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Icon (Emoji or URL)</label>
                      <input {...register("icon")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="e.g. 📐" />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Theme Color (HEX)</label>
                      <div className="flex items-center gap-3">
                        <input type="color" {...register("color")} className="h-10 w-10 rounded cursor-pointer border-0 p-0" />
                        <input {...register("color")} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors uppercase" placeholder="#1B2A4A" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={activeTab === "settings" ? "block" : "hidden"}>
                <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 space-y-6">
                  <h2 className="text-lg font-bold text-navy mb-4 border-b border-gray-100 pb-4">Visibility & Settings</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Display Order</label>
                      <input type="number" {...register("displayOrder")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="0" />
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" {...register("active")} className="w-5 h-5 rounded border-gray-300 text-saffron focus:ring-saffron" />
                      <div>
                        <span className="text-sm font-bold text-navy block">Subject is Active</span>
                        <span className="text-xs text-gray-500 block mt-0.5">Inactive subjects will be hidden from students.</span>
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
          <h1 className="text-2xl font-black text-navy font-display">Subject Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage subjects within your courses.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-xl">
            <Filter size={16} className="text-gray-400" />
            <select 
              value={courseFilter} 
              onChange={(e) => setCourseFilter(e.target.value)}
              className="bg-transparent border-none outline-none text-sm font-semibold text-navy"
            >
              <option value="all">All Courses</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.title || c.name}</option>
              ))}
            </select>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 bg-navy text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-saffron transition-colors shadow-sm">
            <Plus size={16} /> New Subject
          </button>
        </div>
      </div>

      <AdminTable 
        columns={columns} 
        data={filteredSubjects} 
        loading={loading}
        searchPlaceholder="Search subjects by name..."
        onSearch={setSearchTerm}
      />

      <ConfirmDialog 
        isOpen={isConfirmOpen}
        title="Delete Subject"
        description="Are you sure you want to delete this subject? This will remove all nested modules. This action cannot be undone."
        confirmText="Delete Subject"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
