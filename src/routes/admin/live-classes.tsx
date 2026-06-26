import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AdminTable } from "@/components/admin/AdminTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Plus, Edit, Trash2, X, Loader2, ArrowLeft, Save, LayoutGrid, Calendar, Video, Settings, Filter } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export const Route = createFileRoute("/admin/live-classes")({
  head: () => ({ meta: [{ title: "Live Classes — Admin Portal" }] }),
  component: AdminLiveClasses,
});

const liveClassSchema = z.object({
  courseId: z.string().min(1, "Course is required"),
  subjectId: z.string().optional(),
  teacherId: z.string().optional(),
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  meetingProvider: z.enum(["google_meet", "zoom", "teams", "custom"]),
  meetingLink: z.string().url("Must be a valid URL").or(z.string().length(0)),
  meetingId: z.string().optional(),
  meetingPassword: z.string().optional(),
  date: z.string().optional(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().optional(),
  timezone: z.string(),
  maxParticipants: z.coerce.number().optional(),
  recordingUrl: z.string().optional(),
  isRecurring: z.boolean().optional(),
  reminderEnabled: z.boolean().optional(),
  status: z.enum(["upcoming", "live", "completed", "cancelled"]),
});
type LiveClassForm = z.infer<typeof liveClassSchema>;

function AdminLiveClasses() {
  const [liveClasses, setLiveClasses] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
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
  const [courseFilter, setCourseFilter] = useState("all");

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting, isDirty } } = useForm<LiveClassForm>({
    resolver: zodResolver(liveClassSchema),
    defaultValues: { status: "upcoming", meetingProvider: "zoom", timezone: "Asia/Kolkata", reminderEnabled: true, isRecurring: false }
  });

  const selectedCourseId = watch("courseId");
  const filteredSubjectsForDropdown = subjects.filter(s => s.courseId === selectedCourseId);

  useEffect(() => {
    // Fetch courses
    const unsubscribeCourses = onSnapshot(query(collection(db, "courses"), orderBy("createdAt", "desc")), (snapshot) => {
      setCourses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Fetch subjects
    const unsubscribeSubjects = onSnapshot(query(collection(db, "subjects"), orderBy("displayOrder", "asc")), (snapshot) => {
      setSubjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Fetch teachers
    const unsubscribeTeachers = onSnapshot(collection(db, "teachers"), (snapshot) => {
      setTeachers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Fetch live classes
    const unsubscribeLiveClasses = onSnapshot(query(collection(db, "liveClasses"), orderBy("createdAt", "desc")), (snapshot) => {
      setLiveClasses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => {
      console.error(err);
      toast.error("Failed to load live classes");
      setLoading(false);
    });

    return () => {
      unsubscribeCourses();
      unsubscribeSubjects();
      unsubscribeTeachers();
      unsubscribeLiveClasses();
    };
  }, []);

  const openCreate = () => {
    reset({
      courseId: courseFilter !== "all" ? courseFilter : "",
      subjectId: "", teacherId: "", title: "", description: "", 
      meetingProvider: "zoom", meetingLink: "", meetingId: "", meetingPassword: "",
      date: new Date().toISOString().split('T')[0], startTime: "10:00", endTime: "11:00", timezone: "Asia/Kolkata",
      maxParticipants: undefined, recordingUrl: "", isRecurring: false, reminderEnabled: true, status: "upcoming"
    });
    setEditingId(null);
    setActiveTab("basic");
    setIsEditing(true);
  };

  const openEdit = (cls: any) => {
    reset({
      courseId: cls.courseId || "",
      subjectId: cls.subjectId || "",
      teacherId: cls.teacherId || "",
      title: cls.title || cls.name || "",
      description: cls.description || "",
      meetingProvider: cls.meetingProvider || "zoom",
      meetingLink: cls.meetingLink || "",
      meetingId: cls.meetingId || "",
      meetingPassword: cls.meetingPassword || "",
      date: cls.date || "",
      startTime: cls.startTime || "",
      endTime: cls.endTime || "",
      timezone: cls.timezone || "Asia/Kolkata",
      maxParticipants: cls.maxParticipants,
      recordingUrl: cls.recordingUrl || "",
      isRecurring: cls.isRecurring || false,
      reminderEnabled: cls.reminderEnabled ?? true,
      status: cls.status || "upcoming",
    });
    setEditingId(cls.id);
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

  const onSubmit = async (data: LiveClassForm) => {
    try {
      if (editingId) {
        await updateDoc(doc(db, "liveClasses", editingId), { ...data, updatedAt: serverTimestamp() });
        toast.success("Live class updated successfully");
      } else {
        await addDoc(collection(db, "liveClasses"), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        toast.success("Live class created successfully");
      }
      setIsEditing(false);
      setEditingId(null);
      reset();
    } catch (err) {
      console.error(err);
      toast.error(editingId ? "Failed to update live class" : "Failed to create live class");
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
      await deleteDoc(doc(db, "liveClasses", deletingId));
      toast.success("Live class deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete live class");
    } finally {
      setIsDeleting(false);
      setIsConfirmOpen(false);
      setDeletingId(null);
    }
  };

  const filteredLiveClasses = liveClasses.filter(c => 
    (courseFilter === "all" || c.courseId === courseFilter) &&
    ((c.title || c.name || "")?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const columns = [
    { key: "title", label: "Class Title", render: (row: any) => <span className="font-semibold text-navy">{row.title || row.name}</span> },
    { key: "course", label: "Course", render: (row: any) => {
      const course = courses.find(c => c.id === row.courseId);
      return <span className="text-sm">{course ? course.title || course.name : '-'}</span>;
    }},
    { key: "teacher", label: "Teacher", render: (row: any) => {
      const teacher = teachers.find(t => t.id === row.teacherId);
      return <span className="text-sm">{teacher ? teacher.name : '-'}</span>;
    }},
    { key: "time", label: "Timing", render: (row: any) => (
      <div className="flex flex-col text-sm">
        <span>{row.date ? new Date(row.date).toLocaleDateString() : 'No date'}</span>
        <span className="text-gray-500 text-xs">{row.startTime} {row.endTime ? `- ${row.endTime}` : ''}</span>
      </div>
    )},
    { key: "status", label: "Status", render: (row: any) => (
      <span className={`px-2 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold ${
        row.status === 'live' ? 'bg-red-100 text-red-700 animate-pulse' : 
        row.status === 'completed' ? 'bg-green-100 text-green-700' : 
        row.status === 'cancelled' ? 'bg-gray-100 text-gray-700' :
        'bg-blue-100 text-blue-700'
      }`}>
        {row.status || 'Upcoming'}
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
              <h1 className="text-xl font-bold text-navy">{editingId ? 'Edit Live Class' : 'Schedule Live Class'}</h1>
              {isDirty && <p className="text-xs text-saffron font-medium">Unsaved changes</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={closeEditor} className="px-4 py-2 text-sm font-semibold text-navy bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" form="liveClassEditorForm" disabled={isSubmitting} className="flex items-center gap-2 px-6 py-2 text-sm font-semibold text-white bg-navy rounded-xl hover:bg-saffron transition-colors disabled:opacity-70">
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {editingId ? 'Save Changes' : 'Schedule Class'}
            </button>
          </div>
        </div>

        <div className="flex-1 flex max-w-7xl mx-auto w-full">
          <div className="w-64 shrink-0 border-r border-gray-200 p-6 hidden md:block">
            <div className="space-y-1 sticky top-24">
              <button type="button" onClick={() => setActiveTab("basic")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === "basic" ? "bg-navy/5 text-navy" : "text-gray-500 hover:bg-gray-100 hover:text-navy"}`}>
                <LayoutGrid size={18} /> Basic Info
              </button>
              <button type="button" onClick={() => setActiveTab("schedule")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === "schedule" ? "bg-navy/5 text-navy" : "text-gray-500 hover:bg-gray-100 hover:text-navy"}`}>
                <Calendar size={18} /> Scheduling
              </button>
              <button type="button" onClick={() => setActiveTab("meeting")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === "meeting" ? "bg-navy/5 text-navy" : "text-gray-500 hover:bg-gray-100 hover:text-navy"}`}>
                <Video size={18} /> Meeting Details
              </button>
              <button type="button" onClick={() => setActiveTab("settings")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === "settings" ? "bg-navy/5 text-navy" : "text-gray-500 hover:bg-gray-100 hover:text-navy"}`}>
                <Settings size={18} /> Status
              </button>
            </div>
          </div>

          <div className="flex-1 p-6 md:p-8 overflow-y-auto pb-32">
            <form id="liveClassEditorForm" onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-8">
              
              {/* BASIC INFO */}
              <div className={activeTab === "basic" ? "block" : "hidden"}>
                <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 space-y-6">
                  <h2 className="text-lg font-bold text-navy mb-4 border-b border-gray-100 pb-4">Basic Information</h2>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-navy">Class Title <span className="text-red-500">*</span></label>
                    <input {...register("title")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="e.g. Doubt Clearing Session - Algebra" />
                    {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Associated Course <span className="text-red-500">*</span></label>
                      <select {...register("courseId")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors">
                        <option value="">Select course</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.title || c.name}</option>)}
                      </select>
                      {errors.courseId && <p className="text-xs text-red-500">{errors.courseId.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Associated Subject</label>
                      <select {...register("subjectId")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" disabled={!selectedCourseId}>
                        <option value="">No specific subject</option>
                        {filteredSubjectsForDropdown.map(s => <option key={s.id} value={s.id}>{s.title || s.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-navy">Teacher / Host</label>
                    <select {...register("teacherId")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors">
                      <option value="">Select a teacher</option>
                      {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-navy">Description / Agenda</label>
                    <textarea {...register("description")} rows={4} className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors resize-y" placeholder="What will be covered in this session..." />
                  </div>
                </div>
              </div>

              {/* SCHEDULING */}
              <div className={activeTab === "schedule" ? "block" : "hidden"}>
                <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 space-y-6">
                  <h2 className="text-lg font-bold text-navy mb-4 border-b border-gray-100 pb-4">Date & Time</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Date</label>
                      <input type="date" {...register("date")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Timezone</label>
                      <select {...register("timezone")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors">
                        <option value="Asia/Kolkata">IST (Asia/Kolkata)</option>
                        <option value="UTC">UTC</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Start Time <span className="text-red-500">*</span></label>
                      <input type="time" {...register("startTime")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" />
                      {errors.startTime && <p className="text-xs text-red-500">{errors.startTime.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">End Time</label>
                      <input type="time" {...register("endTime")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" />
                    </div>
                  </div>

                  <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-navy/30 transition-colors">
                      <input type="checkbox" {...register("isRecurring")} className="mt-1 w-4 h-4 rounded border-gray-300 text-saffron focus:ring-saffron" />
                      <div>
                        <span className="text-sm font-bold text-navy block">Recurring Class</span>
                        <span className="text-xs text-gray-500 block">Happens on a regular schedule.</span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-navy/30 transition-colors">
                      <input type="checkbox" {...register("reminderEnabled")} className="mt-1 w-4 h-4 rounded border-gray-300 text-saffron focus:ring-saffron" />
                      <div>
                        <span className="text-sm font-bold text-navy block">Send Reminders</span>
                        <span className="text-xs text-gray-500 block">Notify enrolled students before class.</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* MEETING DETAILS */}
              <div className={activeTab === "meeting" ? "block" : "hidden"}>
                <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 space-y-6">
                  <h2 className="text-lg font-bold text-navy mb-4 border-b border-gray-100 pb-4">Meeting Details</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Provider</label>
                      <select {...register("meetingProvider")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors">
                        <option value="zoom">Zoom</option>
                        <option value="google_meet">Google Meet</option>
                        <option value="teams">Microsoft Teams</option>
                        <option value="custom">Custom Platform</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Max Participants</label>
                      <input type="number" {...register("maxParticipants")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="Unlimited" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-navy">Meeting Join Link (URL) <span className="text-red-500">*</span></label>
                    <input {...register("meetingLink")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="https://zoom.us/j/..." />
                    {errors.meetingLink && <p className="text-xs text-red-500">{errors.meetingLink.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Meeting ID (Optional)</label>
                      <input {...register("meetingId")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="e.g. 123 456 7890" />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Password / Passcode (Optional)</label>
                      <input {...register("meetingPassword")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" />
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-gray-100">
                    <label className="text-sm font-semibold text-navy">Recording Link (Post-class)</label>
                    <input {...register("recordingUrl")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors" placeholder="https://..." />
                  </div>
                </div>
              </div>

              {/* SETTINGS */}
              <div className={activeTab === "settings" ? "block" : "hidden"}>
                <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 space-y-6">
                  <h2 className="text-lg font-bold text-navy mb-4 border-b border-gray-100 pb-4">Status & Settings</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-navy">Current Status</label>
                      <select {...register("status")} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-saffron text-sm bg-gray-50 focus:bg-white transition-colors">
                        <option value="upcoming">Upcoming</option>
                        <option value="live">Live Now</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
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
          <h1 className="text-2xl font-black text-navy font-display">Live Classes</h1>
          <p className="text-sm text-gray-500 mt-1">Schedule and manage live sessions for your courses.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-xl shrink-0">
            <Filter size={16} className="text-gray-400" />
            <select 
              value={courseFilter} 
              onChange={(e) => setCourseFilter(e.target.value)}
              className="bg-transparent border-none outline-none text-sm font-semibold text-navy max-w-[150px] truncate"
            >
              <option value="all">All Courses</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title || c.name}</option>)}
            </select>
          </div>
          
          <button onClick={openCreate} className="flex items-center gap-2 bg-navy text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-saffron transition-colors shadow-sm shrink-0">
            <Plus size={16} /> Schedule Class
          </button>
        </div>
      </div>

      <AdminTable 
        columns={columns} 
        data={filteredLiveClasses} 
        loading={loading}
        searchPlaceholder="Search classes by title..."
        onSearch={setSearchTerm}
      />

      <ConfirmDialog 
        isOpen={isConfirmOpen}
        title="Cancel/Delete Live Class"
        description="Are you sure you want to remove this scheduled class? This action cannot be undone."
        confirmText="Delete Class"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
