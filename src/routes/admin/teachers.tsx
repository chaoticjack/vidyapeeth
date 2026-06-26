import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AdminTable } from "@/components/admin/AdminTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Plus, Edit, Trash2, X, Loader2, ArrowLeft, Save, User, FileText, Link as LinkIcon, Settings } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export const Route = createFileRoute("/admin/teachers")({
  head: () => ({ meta: [{ title: "Teacher Management — Admin Portal" }] }),
  component: AdminTeachers,
});

const teacherSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  photo: z.string().optional(),
  qualification: z.string().optional(),
  experience: z.string().optional(),
  designation: z.string().optional(),
  biography: z.string().optional(),
  specialization: z.string().optional(),
  subjectsText: z.string().optional(),
  linkedin: z.string().optional(),
  youtube: z.string().optional(),
  instagram: z.string().optional(),
  website: z.string().optional(),
  status: z.enum(["active", "inactive"]),
});
type TeacherForm = z.infer<typeof teacherSchema>;

function AdminTeachers() {
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

  const { register, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } = useForm<TeacherForm>({
    resolver: zodResolver(teacherSchema),
    defaultValues: { status: "active" }
  });

  useEffect(() => {
    // Fetch teachers
    const unsubscribeTeachers = onSnapshot(query(collection(db, "teachers"), orderBy("createdAt", "desc")), (snapshot) => {
      setTeachers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => {
      console.error(err);
      toast.error("Failed to load teachers");
      setLoading(false);
    });

    return () => unsubscribeTeachers();
  }, []);

  const openCreate = () => {
    reset({
      name: "", email: "", phone: "", photo: "", qualification: "", experience: "", designation: "",
      biography: "", specialization: "", subjectsText: "",
      linkedin: "", youtube: "", instagram: "", website: "", status: "active"
    });
    setEditingId(null);
    setActiveTab("basic");
    setIsEditing(true);
  };

  const openEdit = (teacher: any) => {
    reset({
      name: teacher.name || "",
      email: teacher.email || "",
      phone: teacher.phone || "",
      photo: teacher.photo || "",
      qualification: teacher.qualification || "",
      experience: teacher.experience || "",
      designation: teacher.designation || "",
      biography: teacher.biography || "",
      specialization: teacher.specialization || "",
      subjectsText: teacher.subjects ? teacher.subjects.join(", ") : "",
      linkedin: teacher.socialLinks?.linkedin || "",
      youtube: teacher.socialLinks?.youtube || "",
      instagram: teacher.socialLinks?.instagram || "",
      website: teacher.socialLinks?.website || "",
      status: teacher.status || "active",
    });
    setEditingId(teacher.id);
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

  const onSubmit = async (data: TeacherForm) => {
    try {
      const firestoreData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        photo: data.photo,
        qualification: data.qualification,
        experience: data.experience,
        designation: data.designation,
        biography: data.biography,
        specialization: data.specialization,
        subjects: data.subjectsText ? data.subjectsText.split(",").map(s => s.trim()).filter(Boolean) : [],
        socialLinks: {
          linkedin: data.linkedin,
          youtube: data.youtube,
          instagram: data.instagram,
          website: data.website,
        },
        status: data.status,
      };

      if (editingId) {
        await updateDoc(doc(db, "teachers", editingId), { ...firestoreData, updatedAt: serverTimestamp() });
        toast.success("Teacher updated successfully");
      } else {
        await addDoc(collection(db, "teachers"), { ...firestoreData, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        toast.success("Teacher created successfully");
      }
      setIsEditing(false);
      setEditingId(null);
      reset();
    } catch (err) {
      console.error(err);
      toast.error(editingId ? "Failed to update teacher" : "Failed to create teacher");
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
      await deleteDoc(doc(db, "teachers", deletingId));
      toast.success("Teacher deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete teacher");
    } finally {
      setIsDeleting(false);
      setIsConfirmOpen(false);
      setDeletingId(null);
    }
  };

  const filteredTeachers = teachers.filter(t => 
    (t.name || "")?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (t.email || "")?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: "photo", label: "Photo", render: (row: any) => (
      row.photo ? 
        <img src={row.photo} alt={row.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" /> :
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
          <User size={20} />
        </div>
    )},
    { key: "name", label: "Teacher Name", render: (row: any) => (
      <div className="flex flex-col">
        <span className="font-semibold text-navy">{row.name}</span>
        <span className="text-xs text-gray-500">{row.email}</span>
      </div>
    )},
    { key: "specialization", label: "Specialization", render: (row: any) => <span className="text-sm">{row.specialization || row.designation || '-'}</span> },
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
              <h1 className="text-xl font-bold text-navy">{editingId ? 'Edit Teacher' : 'Add New Teacher'}</h1>
              {isDirty && <p className="text-xs text-saffron font-medium">Unsaved changes</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={closeEditor} className="px-4 py-2 text-sm font-semibold text-navy bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" form="teacherEditorForm" disabled={isSubmitting} className="flex items-center gap-2 px-6 py-2 text-sm font-semibold text-white bg-navy rounded-xl hover:bg-saffron transition-colors disabled:opacity-70">
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {editingId ? 'Save Changes' : 'Publish Teacher'}
            </button>
          </div>
        </div>

        <div className="flex-1 flex max-w-7xl mx-auto w-full">
          <div className="w-64 shrink-0 border-r border-gray-200 p-6 hidden md:block">
            <div className="space-y-1 sticky top-24">
              <button type="button" onClick={() => setActiveTab("basic")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === "basic" ? "bg-navy/5 text-navy" : "text-gray-500 hover:bg-gray-100 hover:text-navy"}`}>
                <User size={18} /> Profile & Contact
              </button>
              <button type="button" onClick={() => setActiveTab("bio")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === "bio" ? "bg-navy/5 text-navy" : "text-gray-500 hover:bg-gray-100 hover:text-navy"}`}>
                <FileText size={18} /> Background & Bio
              </button>
              <button type="button" onClick={() => setActiveTab("social")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === "social" ? "bg-navy/5 text-navy" : "text-gray-500 hover:bg-gray-100 hover:text-navy"}`}>
                <LinkIcon size={18} /> Social Links
              </button>
              <button type="button" onClick={() => setActiveTab("settings")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === "settings" ? "bg-navy/5 text-navy" : "text-gray-500 hover:bg-gray-100 hover:text-navy"}`}>
                <Settings size={18} /> Status
              </button>
            </div>
          </div>

          <div className="flex-1 p-6 md:p-8 overflow-y-auto pb-32">
            <form id="teacherEditorForm" onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-8">
              
              {/* BASIC INFO */}
              <div className={activeTab === "basic" ? "block" : "hidden"}>
                <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 space-y-6">
                  <h2 className="text-lg font-bold text-navy mb-4 border-b border-gray-100 pb-4">Profile & Contact Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Full Name <span className="text-red-500">*</span></label>
                      <input {...register("name")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="e.g. Dr. Rajesh Kumar" />
                      {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Email Address <span className="text-red-500">*</span></label>
                      <input type="email" {...register("email")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="e.g. rajesh@example.com" />
                      {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Phone Number</label>
                      <input {...register("phone")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="e.g. +91 98765 43210" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Profile Photo URL</label>
                      <input {...register("photo")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="https://..." />
                    </div>
                  </div>
                </div>
              </div>

              {/* BIO & BACKGROUND */}
              <div className={activeTab === "bio" ? "block" : "hidden"}>
                <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 space-y-6">
                  <h2 className="text-lg font-bold text-navy mb-4 border-b border-gray-100 pb-4">Background & Qualifications</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Designation / Role</label>
                      <input {...register("designation")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="e.g. Senior Faculty - Mathematics" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Specialization</label>
                      <input {...register("specialization")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="e.g. Advanced Calculus" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Qualifications</label>
                      <input {...register("qualification")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="e.g. Ph.D., M.Sc." />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Years of Experience</label>
                      <input {...register("experience")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="e.g. 10+ Years" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-navy">Subjects Taught (Comma Separated)</label>
                    <input {...register("subjectsText")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="e.g. Mathematics, Physics, Chemistry" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-navy">Biography</label>
                    <textarea {...register("biography")} rows={5} className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors resize-y" placeholder="A comprehensive bio detailing the teacher's background, achievements, and teaching style..." />
                  </div>
                </div>
              </div>

              {/* SOCIAL LINKS */}
              <div className={activeTab === "social" ? "block" : "hidden"}>
                <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 space-y-6">
                  <h2 className="text-lg font-bold text-navy mb-4 border-b border-gray-100 pb-4">Social & Web Links</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">LinkedIn URL</label>
                      <input {...register("linkedin")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="https://linkedin.com/in/..." />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">YouTube URL</label>
                      <input {...register("youtube")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="https://youtube.com/..." />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Instagram URL</label>
                      <input {...register("instagram")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="https://instagram.com/..." />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Personal Website</label>
                      <input {...register("website")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="https://..." />
                    </div>
                  </div>
                </div>
              </div>

              {/* SETTINGS */}
              <div className={activeTab === "settings" ? "block" : "hidden"}>
                <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 space-y-6">
                  <h2 className="text-lg font-bold text-navy mb-4 border-b border-gray-100 pb-4">Status & Visibility</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Status</label>
                      <select {...register("status")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors">
                        <option value="active">Active (Visible)</option>
                        <option value="inactive">Inactive (Hidden)</option>
                      </select>
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
          <h1 className="text-2xl font-black text-navy font-display">Teacher Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage instructor profiles and their credentials.</p>
        </div>
        
        <button onClick={openCreate} className="flex items-center gap-2 bg-navy text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-saffron transition-colors shadow-sm">
          <Plus size={16} /> Add Teacher
        </button>
      </div>

      <AdminTable 
        columns={columns} 
        data={filteredTeachers} 
        loading={loading}
        searchPlaceholder="Search teachers by name or email..."
        onSearch={setSearchTerm}
      />

      <ConfirmDialog 
        isOpen={isConfirmOpen}
        title="Delete Teacher"
        description="Are you sure you want to remove this teacher? This action cannot be undone."
        confirmText="Delete Teacher"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
