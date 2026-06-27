import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, getDocs, getCountFromServer } from "firebase/firestore";
import { db } from "@/lib/firebase";

function formatTimeAgo(date: Date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} min${diffInMinutes > 1 ? 's' : ''} ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hr${diffInHours > 1 ? 's' : ''} ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export interface Activity {
  id: string;
  text: string;
  time: string;
  timestamp: string;
  type?: string;
}

export interface DemoBooking {
  id: string;
  date: string;
  time: string;
  teacher: string;
  classLevel?: string;
  studentName?: string;
  status: "pending" | "completed" | "cancelled";
  meetingLink?: string;
  timestamp: number;
}

export interface ActiveCourse {
  id: string;
  courseId: string;
  title: string;
  thumbnail: string;
  subjectClass: string;
  enrollmentDate: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  nextLesson: string;
}

const totalLessonsCache: Record<string, number> = {};

export function useDashboardData(userId?: string) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activeCourses, setActiveCourses] = useState<ActiveCourse[]>([]);
  const [demoBookings, setDemoBookings] = useState<DemoBooking[]>([]);
  
  const [stats, setStats] = useState({
    enrolledCount: 0,
    demoClassesTaken: 0,
    topicsMastered: 0,
  });
  
  const [loading, setLoading] = useState(true);

  // New state variables to decouple data fetching from computation
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [coursesMap, setCoursesMap] = useState<Record<string, any>>({});
  const [progressMap, setProgressMap] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    let unsubs: Array<() => void> = [];

    // 1. Fetch Demo Bookings
    const qDemo = query(collection(db, "demoRegistrations"), where("userId", "==", userId));
    const unsubDemo = onSnapshot(qDemo, (snap) => {
      let completedCount = 0;
      const bookings: DemoBooking[] = [];
      snap.forEach(doc => {
        const data = doc.data();
        if (data.status === "completed") completedCount++;
        bookings.push({
          id: doc.id,
          date: data.date || "TBD",
          time: data.time || "TBD",
          teacher: data.teacher || "TBD",
          classLevel: data.classLevel || "N/A",
          studentName: data.studentName || "Unknown",
          status: data.status || "pending",
          meetingLink: data.meetingLink,
          timestamp: data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now(),
        });
      });
      bookings.sort((a, b) => b.timestamp - a.timestamp);
      setDemoBookings(bookings);
      setStats(s => ({ ...s, demoClassesTaken: completedCount }));
    });
    unsubs.push(unsubDemo);

    // 2. Fetch Activities
    const qActivities = query(collection(db, "activities"), where("userId", "==", userId));
    const unsubAct = onSnapshot(qActivities, (actSnap) => {
      const acts: Activity[] = [];
      actSnap.forEach(doc => {
        const data = doc.data();
        let dateObj = new Date();
        if (data.timestamp && typeof data.timestamp.toDate === 'function') {
          dateObj = data.timestamp.toDate();
        } else if (data.timestamp) {
          dateObj = new Date(data.timestamp);
        }

        acts.push({ 
          id: doc.id, 
          text: data.title || data.text || "Unknown Activity",
          time: data.time || formatTimeAgo(dateObj),
          timestamp: dateObj.toISOString(),
          type: data.type
        });
      });
      acts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setActivities(acts.slice(0, 10)); // Top 10 activities
    });
    unsubs.push(unsubAct);

    // 3. Centralized Store for Progress, Enrollments, and Courses
    const unsubCourses = onSnapshot(collection(db, "courses"), (snap) => {
      const map: Record<string, any> = {};
      snap.forEach(doc => { map[doc.id] = { id: doc.id, ...doc.data() }; });
      setCoursesMap(map);
    });
    unsubs.push(unsubCourses);

    const qEnrollments = query(collection(db, "enrollments"), where("userId", "==", userId), where("status", "==", "active"));
    const unsubEnroll = onSnapshot(qEnrollments, (snap) => {
      const list: any[] = [];
      snap.forEach(doc => {
        const data = doc.data();
        list.push({
          id: doc.id,
          courseId: data.courseId,
          enrolledAt: data.enrolledAt?.toDate ? data.enrolledAt.toDate() : new Date(),
        });
      });
      setEnrollments(list);
    });
    unsubs.push(unsubEnroll);

    const qProgress = query(collection(db, "studentProgress"), where("studentId", "==", userId));
    const unsubProgress = onSnapshot(qProgress, (snap) => {
      const map: Record<string, any> = {};
      snap.forEach(doc => {
        const data = doc.data();
        const existing = map[data.courseId];
        const existingCount = existing?.completedLessons?.length || 0;
        const newCount = data.completedLessons?.length || 0;
        
        if (!existing || newCount > existingCount) {
          map[data.courseId] = data;
        }
      });
      setProgressMap(map);
    });
    unsubs.push(unsubProgress);

    return () => {
      unsubs.forEach(u => u());
    };
  }, [userId]);

  useEffect(() => {
    let isMounted = true;
    const recomputeActiveCourses = async () => {
      if (!enrollments.length || Object.keys(coursesMap).length === 0) {
        if (isMounted) {
          setActiveCourses([]);
          setStats(s => ({ ...s, enrolledCount: 0, topicsMastered: 0 }));
          setLoading(false);
        }
        return;
      }
      
      let mastered = 0;
      const merged: ActiveCourse[] = [];
      
      for (const enr of enrollments) {
        const course = coursesMap[enr.courseId];
        if (!course) continue;

        const prog = progressMap[enr.courseId] || { completedLessons: [], lastLessonId: "" };
        const completedCount = Array.isArray(prog.completedLessons) ? prog.completedLessons.length : 0;
        mastered += completedCount;

        // Get total lessons efficiently
        let totalCount = totalLessonsCache[enr.courseId];
        if (totalCount === undefined) {
           try {
             const coll = collection(db, "lessons");
             const q = query(coll, where("courseId", "==", enr.courseId));
             const snapshot = await getCountFromServer(q);
             totalCount = snapshot.data().count;
             totalLessonsCache[enr.courseId] = totalCount;
           } catch (err) {
             totalCount = 0;
             totalLessonsCache[enr.courseId] = 0;
           }
        }

        const calculatedProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        let dateStr = "Recently";
        if (enr.enrolledAt) {
          dateStr = enr.enrolledAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }

        merged.push({
          id: enr.id,
          courseId: enr.courseId,
          title: course.title || course.name || "Untitled Course",
          thumbnail: course.thumbnail || course.image || "",
          subjectClass: course.subject || course.classLevel || "General",
          enrollmentDate: dateStr,
          progress: calculatedProgress,
          completedLessons: completedCount,
          totalLessons: totalCount,
          nextLesson: JSON.stringify(prog),
        });
      }

      const uniqueMerged = merged.filter((v, i, a) => a.findIndex(t => (t.courseId === v.courseId)) === i);

      if (isMounted) {
        setStats(s => ({ ...s, enrolledCount: uniqueMerged.length, topicsMastered: mastered }));
        setActiveCourses(uniqueMerged);
        setLoading(false);
      }
    };

    recomputeActiveCourses();
    return () => { isMounted = false; };
  }, [enrollments, coursesMap, progressMap]);

  return { activities, activeCourses, demoBookings, stats, loading };
}
