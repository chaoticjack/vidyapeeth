import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface LessonUnlockStatus {
  lessonId: string;
  isUnlocked: boolean;
  isCompleted: boolean;
}

export interface CourseProgressData {
  isEnrolled: boolean;
  isSequential: boolean;
  completedLessons: string[];
  watchTimes: Record<string, number>;
  progressDocId: string | null;
  progressPercentage: number;
  lastLessonId: string | null;
  orderedLessonIds: string[];
  unlockedLessonIds: Set<string>;
}

/**
 * Fetches all lesson IDs for a course in their absolute sequential order.
 * This MUST traverse the curriculum tree: Subject -> Module -> Lesson.
 */
export async function fetchOrderedLessonIds(courseId: string): Promise<string[]> {
  // Fetch everything in parallel
  const [subjectsSnap, modulesSnap, lessonsSnap] = await Promise.all([
    getDocs(query(collection(db, "subjects"), where("courseId", "==", courseId))),
    getDocs(query(collection(db, "modules"), where("courseId", "==", courseId))),
    getDocs(query(collection(db, "lessons"), where("courseId", "==", courseId)))
  ]);

  const subjects = subjectsSnap.docs.map(d => ({ id: d.id, ...d.data() } as any)).sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  const modules = modulesSnap.docs.map(d => ({ id: d.id, ...d.data() } as any)).sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  const lessons = lessonsSnap.docs.map(d => ({ id: d.id, ...d.data() } as any)).sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

  const orderedIds: string[] = [];
  
  for (const subject of subjects) {
    const subjectModules = modules.filter(m => m.subjectId === subject.id);
    for (const module of subjectModules) {
      const moduleLessons = lessons.filter(l => l.moduleId === module.id);
      for (const lesson of moduleLessons) {
        orderedIds.push(lesson.id);
      }
    }
  }

  return orderedIds;
}

/**
 * Computes which lessons are unlocked given the course's sequential setting,
 * the ordered list of lesson IDs, and the student's completed lessons.
 */
export function computeUnlockedLessons(
  isSequential: boolean,
  orderedLessonIds: string[],
  completedLessons: string[]
): Set<string> {
  const unlocked = new Set<string>();

  if (!isSequential) {
    orderedLessonIds.forEach((id) => unlocked.add(id));
    return unlocked;
  }

  for (let i = 0; i < orderedLessonIds.length; i++) {
    const lessonId = orderedLessonIds[i];
    if (i === 0) {
      unlocked.add(lessonId);
    } else {
      const prevLessonId = orderedLessonIds[i - 1];
      if (completedLessons.includes(prevLessonId)) {
        unlocked.add(lessonId);
      } else {
        break;
      }
    }
  }

  return unlocked;
}

/**
 * Fetches the full course progress data for a given user and course.
 * This is the SINGLE SOURCE OF TRUTH for lesson unlock status.
 */
export async function fetchCourseProgress(
  userId: string,
  courseId: string
): Promise<CourseProgressData> {
  // 1. Check enrollment
  const enrollSnap = await getDocs(
    query(
      collection(db, "enrollments"),
      where("userId", "==", userId),
      where("courseId", "==", courseId),
      where("status", "==", "active")
    )
  );

  if (enrollSnap.empty) {
    return {
      isEnrolled: false,
      isSequential: true,
      completedLessons: [],
      watchTimes: {},
      progressDocId: null,
      progressPercentage: 0,
      lastLessonId: null,
      orderedLessonIds: [],
      unlockedLessonIds: new Set(),
    };
  }

  // 2. Get course settings
  const courseDocSnap = await getDoc(doc(db, "courses", courseId));
  let isSequential = true;
  if (courseDocSnap.exists()) {
    const courseData = courseDocSnap.data();
    isSequential = courseData.isSequential !== false;
  }

  // 3. Get ordered lesson IDs
  const orderedLessonIds = await fetchOrderedLessonIds(courseId);

  // 4. Get student progress
  const progressSnap = await getDocs(
    query(
      collection(db, "studentProgress"),
      where("studentId", "==", userId),
      where("courseId", "==", courseId)
    )
  );

  let completedLessons: string[] = [];
  let watchTimes: Record<string, number> = {};
  let progressDocId: string | null = null;
  let progressPercentage = 0;
  let lastLessonId: string | null = null;

  if (!progressSnap.empty) {
    const data = progressSnap.docs[0].data();
    progressDocId = progressSnap.docs[0].id;
    completedLessons = data.completedLessons || [];
    watchTimes = data.watchTimes || {};
    progressPercentage = data.progressPercentage || 0;
    lastLessonId = data.lastLessonId || null;
  }

  // 5. Compute unlocked lessons
  const unlockedLessonIds = computeUnlockedLessons(
    isSequential,
    orderedLessonIds,
    completedLessons
  );

  return {
    isEnrolled: true,
    isSequential,
    completedLessons,
    watchTimes,
    progressDocId,
    progressPercentage,
    lastLessonId,
    orderedLessonIds,
    unlockedLessonIds,
  };
}

/**
 * Checks if a specific lesson can be opened by the user.
 * Returns { allowed, reason }.
 */
export async function canOpenLesson(
  userId: string | undefined,
  courseId: string,
  lessonId: string
): Promise<{ allowed: boolean; reason: string; firstUnlockedLessonId?: string }> {
  if (!userId) {
    return { allowed: false, reason: "You must be logged in to access this lesson." };
  }

  const progress = await fetchCourseProgress(userId, courseId);

  if (!progress.isEnrolled) {
    return { allowed: false, reason: "You must be enrolled in this course to access this lesson." };
  }

  if (!progress.orderedLessonIds.includes(lessonId)) {
    return { allowed: false, reason: "This lesson does not belong to this course." };
  }

  if (!progress.unlockedLessonIds.has(lessonId)) {
    // Find first unlocked lesson for redirect
    const firstUnlocked = progress.orderedLessonIds.find((id) =>
      progress.unlockedLessonIds.has(id) && !progress.completedLessons.includes(id)
    ) || progress.orderedLessonIds[0];

    return {
      allowed: false,
      reason: "🔒 Complete previous lessons first.",
      firstUnlockedLessonId: firstUnlocked,
    };
  }

  return { allowed: true, reason: "" };
}
