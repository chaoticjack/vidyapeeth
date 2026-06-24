import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { collection, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AdminTable } from "@/components/admin/AdminTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Edit, Trash2, X, Loader2, Eye } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export const Route = createFileRoute("/admin/students")({
  head: () => ({ meta: [{ title: "Student Management — Admin Portal" }] }),
  component: AdminStudents,
});

const studentSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  classLevel: z.string().min(1, "Class is required"),
});
type StudentForm = z.infer<typeof studentSchema>;

function AdminStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  
  // Confirm Delete
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("all");

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<StudentForm>({
    resolver: zodResolver(studentSchema)
  });

  useEffect(() => {
    // Fetch all users (students)
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Optionally filter out those who are admins or missing a classLevel, but let's show all for now
      setStudents(data);
      setLoading(false);
    }, (err) => {
      console.error(err);
      toast.error("Failed to load students");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const openViewModal = (student: any) => {
    setSelectedStudent(student);
    setIsViewModalOpen(true);
  };

  const openEditModal = (student: any) => {
    setSelectedStudent(student);
    reset({
      fullName: student.fullName || "",
      phone: student.phone || "",
      classLevel: student.classLevel || "10",
    });
    setIsEditModalOpen(true);
  };

  const onSubmit = async (data: StudentForm) => {
    if (!selectedStudent) return;
    try {
      await updateDoc(doc(db, "users", selectedStudent.id), {
        ...data,
      });
      toast.success("Student profile updated successfully");
      setIsEditModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update student");
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
      await deleteDoc(doc(db, "users", deletingId));
      toast.success("Student deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete student. Note: Firebase Auth user may still exist unless deleted via Admin SDK.");
    } finally {
      setIsDeleting(false);
      setIsConfirmOpen(false);
      setDeletingId(null);
    }
  };

  let filteredStudents = students.filter(s => 
    (s.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     s.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  if (classFilter !== "all") {
    filteredStudents = filteredStudents.filter(s => s.classLevel === classFilter);
  }

  const columns = [
    { key: "fullName", label: "Name", render: (row: any) => (
      <div>
        <p className="font-semibold text-navy">{row.fullName || "No Name"}</p>
        <p className="text-xs text-gray-500">{row.email}</p>
      </div>
    )},
    { key: "classLevel", label: "Class", render: (row: any) => row.classLevel ? `Class ${row.classLevel}` : "N/A" },
    { key: "phone", label: "Phone", render: (row: any) => row.phone || "N/A" },
    { key: "createdAt", label: "Joined", render: (row: any) => (
      <span className="text-gray-500 text-xs">
        {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'Unknown'}
      </span>
    )},
    { key: "actions", label: "Actions", render: (row: any) => (
      <div className="flex items-center gap-2">
        <button onClick={() => openViewModal(row)} className="p-1.5 text-navy hover:bg-navy/5 rounded-md transition-colors"><Eye size={16} /></button>
        <button onClick={() => openEditModal(row)} className="p-1.5 text-navy hover:bg-navy/5 rounded-md transition-colors"><Edit size={16} /></button>
        <button onClick={() => confirmDelete(row.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"><Trash2 size={16} /></button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy font-display">Student Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage users, their profiles, and enrollments.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-2">
        <div className="flex-1">
           {/* AdminTable has its own search, but we will rely on AdminTable's built in search feature via onSearch prop */}
        </div>
        <select 
          value={classFilter} 
          onChange={(e) => setClassFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-saffron bg-white shadow-sm"
        >
          <option value="all">All Classes</option>
          {[6,7,8,9,10,11,12].map(c => <option key={c} value={c.toString()}>Class {c}</option>)}
        </select>
      </div>

      <AdminTable 
        columns={columns} 
        data={filteredStudents} 
        loading={loading}
        searchPlaceholder="Search students by name or email..."
        onSearch={setSearchTerm}
      />

      <ConfirmDialog 
        isOpen={isConfirmOpen}
        title="Delete Student Profile"
        description="Are you sure you want to delete this student's profile? This will not delete their Firebase Authentication login, but will wipe their progress and settings."
        confirmText="Delete Profile"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
          <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-navy font-display">Edit Student</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-navy transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6">
              <form id="studentForm" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-navy">Full Name</label>
                  <input {...register("fullName")} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-saffron text-sm" />
                  {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-navy">Class Level</label>
                  <select {...register("classLevel")} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-saffron text-sm bg-white">
                    {[6,7,8,9,10,11,12].map(c => <option key={c} value={c.toString()}>Class {c}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-navy">Phone Number</label>
                  <input {...register("phone")} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-saffron text-sm" />
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
              <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-navy bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" form="studentForm" disabled={isSubmitting} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-navy rounded-xl hover:bg-saffron transition-colors disabled:opacity-70">
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {isViewModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm" onClick={() => setIsViewModalOpen(false)}></div>
          <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-navy font-display">Student Profile</h2>
              <button onClick={() => setIsViewModalOpen(false)} className="text-gray-400 hover:text-navy transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-navy text-white flex items-center justify-center text-2xl font-bold">
                  {selectedStudent.fullName?.substring(0,2).toUpperCase() || "ST"}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-navy">{selectedStudent.fullName || "No Name"}</h3>
                  <p className="text-sm text-gray-500">{selectedStudent.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Class Level</p>
                  <p className="text-sm font-medium text-navy">{selectedStudent.classLevel ? `Class ${selectedStudent.classLevel}` : "Not Set"}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Phone</p>
                  <p className="text-sm font-medium text-navy">{selectedStudent.phone || "Not provided"}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Reward Points</p>
                  <p className="text-sm font-medium text-navy">{selectedStudent.rewardPoints || 0}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Joined</p>
                  <p className="text-sm font-medium text-navy">
                    {selectedStudent.createdAt ? new Date(selectedStudent.createdAt).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end shrink-0">
              <button onClick={() => setIsViewModalOpen(false)} className="px-5 py-2.5 text-sm font-semibold text-white bg-navy rounded-xl hover:bg-saffron transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
