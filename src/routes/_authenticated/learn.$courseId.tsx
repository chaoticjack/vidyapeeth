import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo, useRef } from "react";
import { 
  collection, query, where, getDocs, doc, onSnapshot, 
  setDoc, updateDoc, serverTimestamp, arrayUnion 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { 
  CheckCircle2, Circle, PlayCircle, FileText, 
  ChevronLeft, ChevronRight, Menu, X, ArrowLeft, Trophy,
  Loader2, Download, Lock
} from "lucide-react";
import { toast } from "sonner";
import { YouTubePlayer } from "@/components/learn/YouTubePlayer";
import { computeUnlockedLessons } from "@/lib/lesson-lock";

export const Route = createFileRoute("/_authenticated/learn/$courseId")({
  validateSearch: (search: Record<string, unknown>) => ({
    lessonId: search.lessonId as string | undefined,
  }),
  component: LearnCoursePage,
});

function LearnCoursePage() {
  const { courseId } = Route.useParams();
  const { lessonId: searchLessonId } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Data states
  const [course, setCourse] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  
  // Progress states
  const [progressDocId, setProgressDocId] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [watchTimes, setWatchTimes] = useState<Record<string, number>>({});
  const [progressPercent, setProgressPercent] = useState(0);
  
  // Player states
  const lastSaveTimeRef = useRef(0);
  const completingRef = useRef(false);

  useEffect(() => {
    if (!user) return;
    
    let unsubCourse: any, unsubSubjects: any, unsubModules: any, unsubLessons: any, unsubProgress: any;

    const init = async () => {
      try {
        // 1. Verify Enrollment
        const qEnroll = query(collection(db, "enrollments"), where("userId", "==", user.id), where("courseId", "==", courseId), where("status", "==", "active"));
        const enrollSnap = await getDocs(qEnroll);
        if (enrollSnap.empty) {
          toast.error("You are not enrolled in this course.");
          // @ts-ignore
          navigate({ to: `/courses/${courseId}` });
          return;
        }
        setEnrolled(true);

        // 2. Fetch Curriculum
        unsubCourse = onSnapshot(doc(db, "courses", courseId), (snap) => setCourse({ id: snap.id, ...snap.data() }));
        unsubSubjects = onSnapshot(query(collection(db, "subjects"), where("courseId", "==", courseId)), (snap) => {
          setSubjects(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a:any,b:any) => a.displayOrder - b.displayOrder));
        });
        unsubModules = onSnapshot(query(collection(db, "modules"), where("courseId", "==", courseId)), (snap) => {
          setModules(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a:any,b:any) => a.displayOrder - b.displayOrder));
        });
        unsubLessons = onSnapshot(query(collection(db, "lessons"), where("courseId", "==", courseId)), (snap) => {
          setLessons(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a:any,b:any) => a.displayOrder - b.displayOrder));
        });

        // 3. Fetch/Create Progress
        const qProg = query(collection(db, "studentProgress"), where("studentId", "==", user.id), where("courseId", "==", courseId));
        unsubProgress = onSnapshot(qProg, async (snap) => {
          if (snap.empty) {
            const newDocRef = doc(collection(db, "studentProgress"));
            await setDoc(newDocRef, {
              studentId: user.id,
              courseId,
              completedLessons: [],
              watchTimes: {},
              progressPercentage: 0,
              lastLessonId: null,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
            setProgressDocId(newDocRef.id);
            setCompletedLessons([]);
            setWatchTimes({});
            setProgressPercent(0);
          } else {
            let bestDoc = snap.docs[0];
            let maxCount = bestDoc.data().completedLessons?.length || 0;
            
            for (let i = 1; i < snap.docs.length; i++) {
              const currentDoc = snap.docs[i];
              const count = currentDoc.data().completedLessons?.length || 0;
              if (count > maxCount) {
                bestDoc = currentDoc;
                maxCount = count;
              }
            }
            
            const data = bestDoc.data();
            setProgressDocId(bestDoc.id);
            setCompletedLessons(data.completedLessons || []);
            setWatchTimes(data.watchTimes || {});
            setProgressPercent(data.progressPercentage || 0);
          }
          setLoading(false);
        });

      } catch (err: any) {
        console.error(err);
        toast.error("Failed to load course player.");
      }
    };
    init();

    return () => {
      if(unsubCourse) unsubCourse();
      if(unsubSubjects) unsubSubjects();
      if(unsubModules) unsubModules();
      if(unsubLessons) unsubLessons();
      if(unsubProgress) unsubProgress();
    };
  }, [user, courseId, navigate]);

  // Derived Curriculum Tree (must be computed first to get the correct absolute order)
  const curriculumTree = useMemo(() => {
    return subjects.map(s => ({
      ...s,
      modules: modules.filter(m => m.subjectId === s.id).map(m => ({
        ...m,
        lessons: lessons.filter(l => l.moduleId === m.id)
      }))
    }));
  }, [subjects, modules, lessons]);

  // The true ordered list of lessons, flattened from the tree
  const flatLessons = useMemo(() => {
    const arr: any[] = [];
    curriculumTree.forEach(s => {
      s.modules.forEach((m: any) => {
        m.lessons.forEach((l: any) => arr.push(l));
      });
    });
    return arr;
  }, [curriculumTree]);
  
  // Compute unlocked status using shared utility
  const isSequential = course?.isSequential !== false;
  const unlockedLessonIds = useMemo(() => {
    const orderedIds = flatLessons.map(l => l.id);
    return computeUnlockedLessons(isSequential, orderedIds, completedLessons);
  }, [flatLessons, completedLessons, isSequential]);

  // Add isUnlocked to the tree for the sidebar
  const sidebarTree = useMemo(() => {
    return curriculumTree.map(s => ({
      ...s,
      modules: s.modules.map((m: any) => ({
        ...m,
        lessons: m.lessons.map((l: any) => ({
          ...l,
          isUnlocked: unlockedLessonIds.has(l.id)
        }))
      }))
    }));
  }, [curriculumTree, unlockedLessonIds]);

  // Determine active lesson — with URL protection for locked lessons
  const activeLesson = useMemo(() => {
    if (flatLessons.length === 0) return null;
    if (searchLessonId) {
      const found = flatLessons.find(l => l.id === searchLessonId);
      // URL PROTECTION: If the requested lesson exists but is locked, redirect to first unlocked
      if (found && !unlockedLessonIds.has(found.id)) {
        // Don't return the locked lesson — fall through to find first unlocked
      } else if (found) {
        return found;
      }
    }
    // First unlocked and uncompleted lesson
    const firstUncompleted = flatLessons.find(l => unlockedLessonIds.has(l.id) && !completedLessons.includes(l.id));
    return firstUncompleted || flatLessons[0];
  }, [flatLessons, searchLessonId, completedLessons, unlockedLessonIds]);

  // URL PROTECTION: Show toast and fix URL when user tried to access a locked lesson directly
  useEffect(() => {
    if (!searchLessonId || flatLessons.length === 0) return;
    if (!unlockedLessonIds.has(searchLessonId) && activeLesson && activeLesson.id !== searchLessonId) {
      toast.error("🔒 Complete previous lessons first.");
      navigate({ search: { lessonId: activeLesson.id }, replace: true });
    }
  }, [searchLessonId, unlockedLessonIds, activeLesson, flatLessons, navigate]);

  const activeLessonIndex = activeLesson ? flatLessons.findIndex(l => l.id === activeLesson.id) : -1;
  const previousLesson = activeLessonIndex > 0 ? flatLessons[activeLessonIndex - 1] : null;
  const nextLesson = activeLessonIndex < flatLessons.length - 1 ? flatLessons[activeLessonIndex + 1] : null;

  // Auto-Save Last Lesson on Change
  useEffect(() => {
    if (activeLesson && progressDocId) {
      updateDoc(doc(db, "studentProgress", progressDocId), {
        lastLessonId: activeLesson.id,
        updatedAt: serverTimestamp()
      }).catch(console.error);
    }
    completingRef.current = false;
  }, [activeLesson?.id, progressDocId]);

  const navigateToLesson = (lessonId: string) => {
    if (!unlockedLessonIds.has(lessonId)) {
      toast.error("Complete the previous lesson to unlock this lesson.");
      return;
    }
    navigate({ search: { lessonId }, replace: true });
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const handleMarkComplete = async () => {
    if (!progressDocId || !activeLesson || completingRef.current) return;
    completingRef.current = true;
    
    const newCompleted = [...new Set([...completedLessons, activeLesson.id])];
    const percentage = Math.round((newCompleted.length / flatLessons.length) * 100);
    
    try {
      await updateDoc(doc(db, "studentProgress", progressDocId), {
        completedLessons: arrayUnion(activeLesson.id),
        progressPercentage: percentage,
        lastLessonId: nextLesson ? nextLesson.id : activeLesson.id,
        updatedAt: serverTimestamp()
      });
      
      toast.success("Lesson Completed! ✅");
      
      if (!nextLesson) {
        toast.success("Course fully completed! You can now download your certificate.", { duration: 5000 });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save progress.");
      completingRef.current = false;
    }
  };

  const handleVideoProgress = (info: { currentTime: number, percent: number }) => {
    if (!activeLesson || !progressDocId) return;
    
    // Save watch time every 15 seconds
    const now = Date.now();
    if (now - lastSaveTimeRef.current > 15000) {
      lastSaveTimeRef.current = now;
      updateDoc(doc(db, "studentProgress", progressDocId), {
        [`watchTimes.${activeLesson.id}`]: info.currentTime,
        updatedAt: serverTimestamp()
      }).catch(console.error);
    }

    const isCompleted = completedLessons.includes(activeLesson.id);
    if (!isCompleted && info.percent >= 90 && !completingRef.current) {
      handleMarkComplete();
    }
  };

  if (loading || !enrolled) {
    return <div className="flex h-screen items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-saffron w-10 h-10" /></div>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white text-navy font-sans">
      
      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-80 bg-gray-50 border-r border-gray-200 transform transition-transform duration-300 ease-in-out flex flex-col lg:relative lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-4 border-b border-gray-200 bg-white flex flex-col gap-3">
          <Link 
            to="/dashboard"
            className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-navy transition-colors text-left"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
          <div>
            <h2 className="font-display font-black text-lg text-navy leading-tight">{course?.title || "Course"}</h2>
            <div className="mt-3">
              <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                <span>{progressPercent}% Complete</span>
                <span>{completedLessons.length}/{flatLessons.length}</span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-saffron transition-all duration-500" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">
          {sidebarTree.map((subject, sIdx) => (
            <div key={subject.id}>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 px-2">
                {subject.title}
              </h3>
              <div className="space-y-3">
                {subject.modules.map((mod: any, mIdx: number) => (
                  <div key={mod.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                    <div className="px-3 py-2.5 bg-gray-50/50 border-b border-gray-100">
                      <h4 className="text-[13px] font-bold text-navy">Module {mIdx + 1}: {mod.title}</h4>
                    </div>
                    <div className="flex flex-col">
                      {mod.lessons.map((lesson: any) => {
                        const isCompleted = completedLessons.includes(lesson.id);
                        const isActive = activeLesson?.id === lesson.id;
                        const isUnlocked = lesson.isUnlocked;
                        
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => navigateToLesson(lesson.id)}
                            disabled={!isUnlocked}
                            title={!isUnlocked ? "Complete the previous lesson to unlock this lesson." : ""}
                            className={`flex items-start gap-3 p-3 text-left transition-colors border-l-4 ${isActive ? 'bg-saffron/5 border-saffron' : 'border-transparent hover:bg-gray-50'} ${!isUnlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <div className="mt-0.5 shrink-0">
                              {!isUnlocked ? (
                                <Lock size={16} className="text-gray-400" />
                              ) : isCompleted ? (
                                <CheckCircle2 size={16} className="text-green-500" />
                              ) : isActive ? (
                                <PlayCircle size={16} className="text-saffron fill-saffron/20" />
                              ) : (
                                <Circle size={16} className="text-gray-300" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-semibold truncate ${isActive ? 'text-navy' : isCompleted ? 'text-gray-600' : 'text-gray-500'}`}>
                                {lesson.title}
                              </p>
                              {lesson.videoDuration && (
                                <p className="text-xs font-medium text-gray-400 mt-0.5">{lesson.videoDuration}</p>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* MAIN PLAYER AREA */}
      <main className="flex-1 flex flex-col min-w-0 bg-white relative">
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200 bg-white shrink-0">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-navy hover:bg-gray-100 rounded-lg">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span className="font-bold text-sm truncate max-w-[200px]">{course?.title}</span>
          <div className="w-8" />
        </header>

        {activeLesson ? (
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="w-full bg-black aspect-video max-h-[70vh]">
              {activeLesson.youtubeVideoId ? (
                <YouTubePlayer 
                  videoId={activeLesson.youtubeVideoId}
                  initialTime={watchTimes[activeLesson.id] || 0}
                  onProgress={handleVideoProgress}
                />
              ) : activeLesson.videoUrl && activeLesson.videoUrl.includes("youtube.com/embed/") ? (
                 <iframe
                    src={activeLesson.videoUrl}
                    className="w-full h-full border-0"
                    allowFullScreen
                 />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white/50 bg-gray-900">
                  <FileText size={48} className="mb-4 opacity-20" />
                  <p>Text/PDF Lesson</p>
                </div>
              )}
            </div>

            <div className="max-w-4xl mx-auto p-6 md:p-10">
              
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 pb-8 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-saffron bg-saffron/10 px-2 py-1 rounded">
                      Lesson {activeLessonIndex + 1}
                    </span>
                    {completedLessons.includes(activeLesson.id) && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-50 px-2 py-1 rounded flex items-center gap-1">
                        <CheckCircle2 size={12} /> Completed
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-display font-black text-navy">{activeLesson.title}</h1>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => previousLesson && navigateToLesson(previousLesson.id)}
                    disabled={!previousLesson}
                    className="p-2 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  
                  {!completedLessons.includes(activeLesson.id) ? (
                    <button
                      onClick={handleMarkComplete}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-navy text-white text-sm font-bold hover:bg-saffron transition-colors"
                    >
                      <CheckCircle2 size={16} /> Mark Complete
                    </button>
                  ) : nextLesson ? (
                     <button
                        onClick={() => navigateToLesson(nextLesson.id)}
                        disabled={!unlockedLessonIds.has(nextLesson.id)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-saffron text-white text-sm font-bold hover:bg-[#d65f08] transition-colors disabled:opacity-50"
                      >
                        Next Lesson <ChevronRight size={16} />
                      </button>
                  ) : null}
                  
                </div>
              </div>

              {activeLesson.description && (
                <div className="prose prose-sm max-w-none prose-p:text-gray-600 prose-headings:text-navy mb-10">
                  <div dangerouslySetInnerHTML={{ __html: activeLesson.description }} />
                </div>
              )}

              {/* Attachments / Downloads */}
              {activeLesson.attachments && activeLesson.attachments.length > 0 && (
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <h3 className="text-sm font-bold text-navy mb-4 flex items-center gap-2">
                    <Download size={16} /> Lesson Resources
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {activeLesson.attachments.map((att: any, i: number) => (
                      <a 
                        key={i} 
                        href={att.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:border-saffron hover:shadow-sm transition-all group"
                      >
                        <div className="h-10 w-10 bg-saffron/10 text-saffron rounded-lg flex items-center justify-center shrink-0">
                          <FileText size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-navy truncate group-hover:text-saffron transition-colors">{att.name}</p>
                          <p className="text-[10px] uppercase tracking-wider text-gray-400 mt-0.5">{att.type || 'Document'}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select a lesson to begin
          </div>
        )}
      </main>
      
    </div>
  );
}
