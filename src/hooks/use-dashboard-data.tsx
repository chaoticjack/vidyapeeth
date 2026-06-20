import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Activity {
  id: string;
  text: string;
  time: string; // e.g. "2 hours ago"
  timestamp: string; // ISO string for sorting
  type?: string;
}

export interface CourseData {
  id: string;
  title: string;
  upcomingLiveClass?: {
    title: string;
    date: string; // e.g. "Today"
    time: string; // e.g. "5:00 PM - 6:00 PM"
  };
}

export interface ActiveCourse {
  id: string;
  courseId: string;
  title: string;
  progress: number;
  nextLesson: string;
  duration: string;
}

export function useDashboardData(userId?: string) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activeCourses, setActiveCourses] = useState<ActiveCourse[]>([]);
  const [liveClasses, setLiveClasses] = useState<CourseData[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [enrolledCount, setEnrolledCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Fetch static courses list mapping
    const coursesUnsub = onSnapshot(collection(db, "courses"), (snapshot) => {
      const coursesMap = new Map<string, CourseData>();
      snapshot.forEach(doc => {
        coursesMap.set(doc.id, { id: doc.id, ...doc.data() } as CourseData);
      });

      // Listen to progress
      const qProgress = query(collection(db, "progress"), where("userId", "==", userId));
      const progUnsub = onSnapshot(qProgress, (progSnap) => {
        let totalProgress = 0;
        const active: ActiveCourse[] = [];
        
        progSnap.forEach(doc => {
          const data = doc.data();
          totalProgress += data.percentage || 0;
          const course = coursesMap.get(data.courseId);
          if (course) {
            active.push({
              id: doc.id,
              courseId: data.courseId,
              title: course.title,
              progress: data.percentage || 0,
              nextLesson: data.nextLessonTitle || "Next Lesson",
              duration: data.nextLessonDuration || "45 mins",
            });
          }
        });
        
        setOverallProgress(progSnap.size > 0 ? Math.round(totalProgress / progSnap.size) : 0);
        setActiveCourses(active);
      });

      // Listen to enrollments (for live classes and count)
      const qEnrollments = query(collection(db, "enrollments"), where("userId", "==", userId), where("status", "==", "active"));
      const enrollUnsub = onSnapshot(qEnrollments, (enrollSnap) => {
        setEnrolledCount(enrollSnap.size);
        const upcoming: CourseData[] = [];
        enrollSnap.forEach(doc => {
          const data = doc.data();
          const course = coursesMap.get(data.courseId);
          if (course && course.upcomingLiveClass) {
            upcoming.push(course);
          }
        });
        setLiveClasses(upcoming);
      });

      // Listen to activities. We sort client-side to avoid requiring composite indexes initially.
      const qActivities = query(
        collection(db, "activities"), 
        where("userId", "==", userId)
      );
      
      const actUnsub = onSnapshot(qActivities, (actSnap) => {
        const acts: Activity[] = [];
        actSnap.forEach(doc => {
          acts.push({ id: doc.id, ...doc.data() } as Activity);
        });
        // Sort descending by timestamp
        acts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setActivities(acts.slice(0, 5));
        
        // Once everything is subscribed and initial data is loaded
        setLoading(false);
      }, (err) => {
         console.error("Failed to fetch activities:", err);
         setLoading(false);
      });

      return () => {
        progUnsub();
        enrollUnsub();
        actUnsub();
      };
    }, (err) => {
      console.error("Failed to fetch courses:", err);
      setLoading(false);
    });

    return () => coursesUnsub();
  }, [userId]);

  return { activities, activeCourses, liveClasses, overallProgress, enrolledCount, loading };
}
