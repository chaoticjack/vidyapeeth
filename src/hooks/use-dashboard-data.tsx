import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
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
  time: string; // e.g. "2 hours ago"
  timestamp: string; // ISO string for sorting
  type?: string;
}

export interface UpcomingLiveClassData {
  id: string;
  title: string;
  date: string;
  time: string;
  zoomLink?: string;
}

export interface CourseData {
  id: string;
  title: string;
  upcomingLiveClass?: any;
  liveClassSchedule?: any;
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
  const [liveClasses, setLiveClasses] = useState<UpcomingLiveClassData[]>([]);
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
        const data = doc.data();
        coursesMap.set(doc.id, { id: doc.id, title: data.name || data.title, ...data } as CourseData);
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

      let liveClassesUnsub: any = null;

      // Listen to enrollments (for live classes and count)
      const qEnrollments = query(collection(db, "enrollments"), where("userId", "==", userId), where("status", "==", "active"));
      const enrollUnsub = onSnapshot(qEnrollments, (enrollSnap) => {
        setEnrolledCount(enrollSnap.size);
        
        const enrolledCourseIds: string[] = [];
        enrollSnap.forEach(doc => {
          enrolledCourseIds.push(doc.data().courseId);
        });

        if (liveClassesUnsub) {
          liveClassesUnsub();
          liveClassesUnsub = null;
        }

        if (enrolledCourseIds.length > 0) {
          const qLive = query(collection(db, "liveClasses"), where("status", "==", "upcoming"));
          liveClassesUnsub = onSnapshot(qLive, (liveSnap) => {
            const upcoming: UpcomingLiveClassData[] = [];
            liveSnap.forEach(doc => {
              const data = doc.data();
              if (enrolledCourseIds.includes(data.courseId)) {
                const course = coursesMap.get(data.courseId);
                
                let dateStr = "Scheduled";
                let timeStr = data.startTime || "";
                
                if (data.date) {
                  const dateObj = new Date(data.date);
                  const today = new Date();
                  if (dateObj.getDate() === today.getDate() && dateObj.getMonth() === today.getMonth() && dateObj.getFullYear() === today.getFullYear()) {
                    dateStr = "Today";
                  } else {
                    dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                  }
                }
                
                if (data.endTime) {
                  timeStr += ` - ${data.endTime}`;
                }
                
                upcoming.push({
                  id: doc.id,
                  title: `${course?.title || 'Course'}: ${data.title}`,
                  date: dateStr,
                  time: timeStr,
                  zoomLink: data.meetingLink || ""
                });
              }
            });
            // Sort by date (you might want to convert date back to Date object for robust sorting, but strings might be fine for now)
            setLiveClasses(upcoming);
          });
        } else {
          setLiveClasses([]);
        }
      });

      // Listen to activities. We sort client-side to avoid requiring composite indexes initially.
      const qActivities = query(
        collection(db, "activities"), 
        where("userId", "==", userId)
      );
      
      const actUnsub = onSnapshot(qActivities, (actSnap) => {
        const acts: Activity[] = [];
        actSnap.forEach(doc => {
          const data = doc.data();
          let dateObj = new Date();
          if (data.timestamp && typeof data.timestamp.toDate === 'function') {
            dateObj = data.timestamp.toDate();
          } else if (typeof data.timestamp === 'string') {
            dateObj = new Date(data.timestamp);
          } else if (typeof data.timestamp === 'number') {
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
        if (liveClassesUnsub) liveClassesUnsub();
      };
    }, (err) => {
      console.error("Failed to fetch courses:", err);
      setLoading(false);
    });

    return () => coursesUnsub();
  }, [userId]);

  return { activities, activeCourses, liveClasses, overallProgress, enrolledCount, loading };
}
