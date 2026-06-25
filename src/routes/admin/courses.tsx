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

export const Route = createFileRoute("/admin/courses")({
  head: () => ({ meta: [{ title: "Course Management — Admin Portal" }] }),
  component: AdminCourses,
});

const courseSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  classLevel: z.string().min(1, "Class is required"),
  subject: z.string().min(2, "Subject is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  curriculum: z.string().optional(),
  teacherId: z.string().optional(),
  thumbnail: z.string().optional(),
  status: z.enum(["draft", "published"]).default("published"),
  hasLiveClasses: z.boolean().default(false),
  liveClassSchedule: z.object({
    dayOfWeek: z.string().optional(),
    time: z.string().optional(),
    duration: z.string().optional(),
    zoomLink: z.string().optional()
  }).optional(),
});
type CourseForm = z.infer<typeof courseSchema>;

function AdminCourses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Delete confirm state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<CourseForm>({
    resolver: zodResolver(courseSchema),
    defaultValues: { classLevel: "10", price: 0, status: "published", hasLiveClasses: false }
  });

  const hasLiveClasses = watch("hasLiveClasses");

  useEffect(() => {
    // Fetch courses
    const q = query(collection(db, "courses"), orderBy("createdAt", "desc"));
    const unsubscribeCourses = onSnapshot(q, (snapshot) => {
      setCourses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => {
      console.error(err);
      toast.error("Failed to load courses");
      setLoading(false);
    });

    // Fetch teachers for dropdown
    const unsubscribeTeachers = onSnapshot(collection(db, "teachers"), (snapshot) => {
      setTeachers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeCourses();
      unsubscribeTeachers();
    };
  }, []);

  const openCreateModal = () => {
    reset({ name: "", classLevel: "10", subject: "", description: "", price: 0, curriculum: "", teacherId: "", thumbnail: "", hasLiveClasses: false, liveClassSchedule: { dayOfWeek: "1", time: "17:00", duration: "60", zoomLink: "" } });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (course: any) => {
    reset({
      name: course.name,
      classLevel: course.classLevel,
      subject: course.subject,
      description: course.description,
      price: course.price,
      curriculum: course.curriculum || "",
      teacherId: course.teacherId || "",
      thumbnail: course.thumbnail || "",
      status: course.status || "published",
      hasLiveClasses: course.hasLiveClasses || false,
      liveClassSchedule: course.liveClassSchedule || { dayOfWeek: "1", time: "17:00", duration: "60", zoomLink: "" },
    });
    setEditingId(course.id);
    setIsModalOpen(true);
  };

  const onSubmit = async (data: CourseForm) => {
    try {
      const isPublished = data.status === "published";
      
      let upcomingLiveClass = null;
      if (data.hasLiveClasses && data.liveClassSchedule?.dayOfWeek && data.liveClassSchedule?.time) {
        const today = new Date();
        const currentDay = today.getDay();
        const targetDay = parseInt(data.liveClassSchedule.dayOfWeek);
        let daysUntil = targetDay - currentDay;
        if (daysUntil < 0) daysUntil += 7;
        
        const [hours, minutes] = data.liveClassSchedule.time.split(':').map(Number);
        if (daysUntil === 0) {
            if (today.getHours() > hours || (today.getHours() === hours && today.getMinutes() > minutes)) {
                daysUntil = 7;
            }
        }
        const nextClassDate = new Date(today);
        nextClassDate.setDate(today.getDate() + daysUntil);
        nextClassDate.setHours(hours, minutes, 0, 0);
        upcomingLiveClass = nextClassDate.toISOString();
      }

      const payload: any = {
        ...data,
        published: isPublished,
        upcomingLiveClass
      };

      if (editingId) {
        if (isPublished) payload.publishedAt = serverTimestamp();
        await updateDoc(doc(db, "courses", editingId), {
          ...payload,
          updatedAt: serverTimestamp(),
        });
        toast.success("Course updated successfully");
      } else {
        if (isPublished) payload.publishedAt = serverTimestamp();
        await addDoc(collection(db, "courses"), {
          ...payload,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast.success("Course created successfully");
      }
      setIsModalOpen(false);
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
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTeacherName = (id: string) => {
    if (!id) return "Unassigned";
    const t = teachers.find(t => t.id === id);
    return t ? t.name : "Unknown";
  };

  const columns = [
    { key: "name", label: "Course Name", render: (row: any) => <span className="font-semibold">{row.name}</span> },
    { key: "classLevel", label: "Class", render: (row: any) => `Class ${row.classLevel}` },
    { key: "subject", label: "Subject" },
    { key: "price", label: "Price", render: (row: any) => row.price === 0 ? "Free" : `₹${row.price}` },
    { key: "teacherId", label: "Teacher", render: (row: any) => getTeacherName(row.teacherId) },
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
          <h1 className="text-2xl font-black text-navy font-display">Course Management</h1>
          <p className="text-sm text-gray-500 mt-1">Create and assign courses for students.</p>
        </div>
        <button onClick={openCreateModal} className="flex items-center gap-2 bg-navy text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-saffron transition-colors shadow-sm">
          <Plus size={16} /> New Course
        </button>
      </div>

      <AdminTable 
        columns={columns} 
        data={filteredCourses} 
        loading={loading}
        searchPlaceholder="Search courses by name or subject..."
        onSearch={setSearchTerm}
      />

      <ConfirmDialog 
        isOpen={isConfirmOpen}
        title="Delete Course"
        description="Are you sure you want to delete this course? Existing enrollments will lose access."
        confirmText="Delete Course"
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
              <h2 className="text-xl font-bold text-navy font-display">{editingId ? 'Edit Course' : 'Create Course'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-navy transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6">
              <form id="courseForm" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-navy">Course Name</label>
                  <input {...register("name")} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-saffron text-sm" placeholder="e.g. Master Class in Algebra" />
                  {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-navy">Class Level</label>
                    <select {...register("classLevel")} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-saffron text-sm bg-white">
                      {[6,7,8,9,10,11,12].map(c => <option key={c} value={c.toString()}>Class {c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-navy">Subject</label>
                    <input {...register("subject")} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-saffron text-sm" placeholder="e.g. Mathematics" />
                    {errors.subject && <p className="text-xs text-red-500">{errors.subject.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-navy">Price (₹)</label>
                    <input type="number" {...register("price")} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-saffron text-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-navy">Assign Teacher</label>
                    <select {...register("teacherId")} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-saffron text-sm bg-white">
                      <option value="">Unassigned</option>
                      {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-navy">Thumbnail URL</label>
                    <input {...register("thumbnail")} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-saffron text-sm" placeholder="https://..." />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-navy">Status</label>
                    <select {...register("status")} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-saffron text-sm bg-white">
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4 rounded-xl border border-navy/10 bg-navy/5 p-4">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="hasLiveClasses" {...register("hasLiveClasses")} className="w-4 h-4 rounded border-gray-300 text-saffron focus:ring-saffron" />
                    <label htmlFor="hasLiveClasses" className="text-sm font-bold text-navy">Enable Weekly Live Classes</label>
                  </div>
                  
                  {hasLiveClasses && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-navy">Day of Week</label>
                        <select {...register("liveClassSchedule.dayOfWeek")} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-saffron text-sm bg-white">
                          <option value="1">Monday</option>
                          <option value="2">Tuesday</option>
                          <option value="3">Wednesday</option>
                          <option value="4">Thursday</option>
                          <option value="5">Friday</option>
                          <option value="6">Saturday</option>
                          <option value="0">Sunday</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-navy">Time</label>
                        <input type="time" {...register("liveClassSchedule.time")} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-saffron text-sm" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-navy">Duration (mins)</label>
                        <input type="number" {...register("liveClassSchedule.duration")} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-saffron text-sm" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-navy">Meeting Link</label>
                        <input type="url" {...register("liveClassSchedule.zoomLink")} placeholder="https://zoom.us/..." className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-saffron text-sm" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-navy">Short Description</label>
                  <textarea {...register("description")} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-saffron text-sm resize-y" placeholder="Brief summary of the course..." />
                  {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-navy">Curriculum Overview</label>
                  <textarea {...register("curriculum")} rows={5} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-saffron text-sm resize-y" placeholder="Module 1: ...\nModule 2: ..." />
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-navy bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" form="courseForm" disabled={isSubmitting} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-navy rounded-xl hover:bg-saffron transition-colors disabled:opacity-70">
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                {editingId ? 'Save Changes' : 'Create Course'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
