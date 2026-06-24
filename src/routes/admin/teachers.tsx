import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AdminTable } from "@/components/admin/AdminTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Plus, Edit, Trash2, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export const Route = createFileRoute("/admin/teachers")({
  head: () => ({ meta: [{ title: "Teacher Management — Admin Portal" }] }),
  component: AdminTeachers,
});

const teacherSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  qualifications: z.string().min(2, "Qualifications are required"),
  bio: z.string().optional(),
});
type TeacherForm = z.infer<typeof teacherSchema>;

function AdminTeachers() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Delete confirm state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<TeacherForm>({
    resolver: zodResolver(teacherSchema)
  });

  useEffect(() => {
    // Fetch teachers
    const q = query(collection(db, "teachers"), orderBy("createdAt", "desc"));
    const unsubscribeTeachers = onSnapshot(q, (snapshot) => {
      setTeachers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => {
      console.error(err);
      toast.error("Failed to load teachers");
      setLoading(false);
    });

    // Fetch courses to show assigned courses
    const unsubscribeCourses = onSnapshot(collection(db, "courses"), (snapshot) => {
      setCourses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeTeachers();
      unsubscribeCourses();
    };
  }, []);

  const openCreateModal = () => {
    reset({ name: "", email: "", phone: "", qualifications: "", bio: "" });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (teacher: any) => {
    reset({
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone,
      qualifications: teacher.qualifications,
      bio: teacher.bio || "",
    });
    setEditingId(teacher.id);
    setIsModalOpen(true);
  };

  const onSubmit = async (data: TeacherForm) => {
    try {
      if (editingId) {
        await updateDoc(doc(db, "teachers", editingId), {
          ...data,
          updatedAt: serverTimestamp(),
        });
        toast.success("Teacher updated successfully");
      } else {
        await addDoc(collection(db, "teachers"), {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast.success("Teacher created successfully");
      }
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Teacher mutation error:", err);
      toast.error(editingId ? `Failed to update teacher: ${err?.message || "Unknown error"}` : `Failed to create teacher: ${err?.message || "Unknown error"}`);
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
    t.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.qualifications?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAssignedCourses = (teacherId: string) => {
    const assigned = courses.filter(c => c.teacherId === teacherId);
    if (assigned.length === 0) return <span className="text-gray-400 italic">None</span>;
    return (
      <div className="flex flex-col gap-1">
        {assigned.map(c => (
          <span key={c.id} className="inline-flex px-2 py-0.5 bg-saffron/10 text-saffron rounded text-xs font-semibold">
            {c.name}
          </span>
        ))}
      </div>
    );
  };

  const columns = [
    { key: "name", label: "Name", render: (row: any) => (
      <div>
        <p className="font-semibold text-navy">{row.name}</p>
        <p className="text-xs text-gray-500">{row.email}</p>
      </div>
    )},
    { key: "phone", label: "Phone" },
    { key: "qualifications", label: "Qualifications" },
    { key: "courses", label: "Assigned Courses", render: (row: any) => getAssignedCourses(row.id) },
    { key: "actions", label: "Actions", render: (row: any) => (
      <div className="flex items-center gap-2">
        <button onClick={() => openEditModal(row)} className="p-1.5 text-navy hover:bg-navy/5 rounded-md transition-colors"><Edit size={16} /></button>
        <button onClick={() => confirmDelete(row.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"><Trash2 size={16} /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy font-display">Teacher Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage teaching staff and their details.</p>
        </div>
        <button onClick={openCreateModal} className="flex items-center gap-2 bg-navy text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-saffron transition-colors shadow-sm">
          <Plus size={16} /> Add Teacher
        </button>
      </div>

      <AdminTable 
        columns={columns} 
        data={filteredTeachers} 
        loading={loading}
        searchPlaceholder="Search teachers by name, email, or qualification..."
        onSearch={setSearchTerm}
      />

      <ConfirmDialog 
        isOpen={isConfirmOpen}
        title="Delete Teacher"
        description="Are you sure you want to delete this teacher? They will be unassigned from any active courses."
        confirmText="Delete Teacher"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl shadow-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-navy font-display">{editingId ? 'Edit Teacher' : 'Add Teacher'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-navy transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6">
              <form id="teacherForm" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-navy">Full Name</label>
                    <input {...register("name")} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-saffron text-sm" placeholder="Teacher's name" />
                    {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-navy">Email</label>
                    <input type="email" {...register("email")} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-saffron text-sm" placeholder="teacher@vidyapeeth.com" />
                    {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-navy">Phone Number</label>
                    <input {...register("phone")} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-saffron text-sm" placeholder="+91..." />
                    {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-navy">Qualifications</label>
                    <input {...register("qualifications")} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-saffron text-sm" placeholder="e.g. M.Sc Mathematics, B.Ed" />
                    {errors.qualifications && <p className="text-xs text-red-500">{errors.qualifications.message}</p>}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-navy">Biography (Optional)</label>
                  <textarea {...register("bio")} rows={4} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-saffron text-sm resize-y" placeholder="Short bio..." />
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-navy bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" form="teacherForm" disabled={isSubmitting} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-navy rounded-xl hover:bg-saffron transition-colors disabled:opacity-70">
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                {editingId ? 'Save Changes' : 'Add Teacher'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
