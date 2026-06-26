import { collection, addDoc, setDoc, updateDoc, deleteDoc, doc, getDocs, getDoc, onSnapshot, query, where, orderBy, serverTimestamp, Unsubscribe } from "firebase/firestore";
import { db } from "./firebase";

// BLOGS
export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  author: string | {
    name: string;
    image?: string;
    bio?: string;
    role?: string;
  };
  category?: string;
  subcategory?: string;
  tags: string[];
  difficultyLevel?: string;
  targetClass?: string;
  subject?: string;
  featuredImage?: string;
  coverAlt?: string;
  coverCaption?: string;
  readingTime?: string;
  status: "draft" | "published" | "scheduled" | "archived";
  published: boolean;
  featured?: boolean;
  pinned?: boolean;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    focusKeyword?: string;
    canonicalUrl?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    twitterTitle?: string;
    twitterDescription?: string;
    robotsIndex?: boolean;
    robotsFollow?: boolean;
  };
  versions?: {
    updatedAt: any;
    updatedBy: string;
  }[];
  publishedAt?: any;
  scheduledAt?: any;
  createdAt?: any;
  updatedAt?: any;
}

export async function createBlog(data: Omit<Blog, "id" | "createdAt" | "updatedAt">) {
  const docRef = await addDoc(collection(db, "blogs"), {
    ...data,
    published: data.status === "published",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    publishedAt: data.status === "published" ? serverTimestamp() : null,
  });
  return { id: docRef.id, ...data };
}

export async function updateBlog(id: string, data: Partial<Blog>) {
  const updateData: any = { ...data, updatedAt: serverTimestamp() };
  if (data.status === "published") {
    updateData.published = true;
  }
  await updateDoc(doc(db, "blogs", id), updateData);
}

export async function deleteBlog(id: string) {
  await deleteDoc(doc(db, "blogs", id));
}

export function subscribeToBlogs(callback: (blogs: Blog[]) => void): Unsubscribe {
  const q = query(collection(db, "blogs"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const blogs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Blog[];
    callback(blogs);
  });
}

export async function fetchPublishedBlogs(): Promise<Blog[]> {
  const q = query(collection(db, "blogs"), where("published", "==", true));
  const snapshot = await getDocs(q);
  const blogs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Blog[];
  return blogs.sort((a, b) => {
    const aTime = a.publishedAt?.toMillis ? a.publishedAt.toMillis() : 0;
    const bTime = b.publishedAt?.toMillis ? b.publishedAt.toMillis() : 0;
    return bTime - aTime;
  });
}

export async function fetchBlogBySlug(slug: string): Promise<Blog | null> {
  const q = query(
    collection(db, "blogs"),
    where("slug", "==", slug),
    where("published", "==", true)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() } as Blog;
}

// COURSES
export interface Course {
  id: string;
  name: string;
  title?: string;
  slug?: string;
  shortDescription?: string;
  fullDescription?: string;
  description: string;
  categoryId?: string;
  classLevel: string;
  subject: string;
  language?: string;
  difficulty?: string;
  duration?: string;
  estimatedCompletionTime?: string;
  thumbnail?: string;
  bannerImage?: string;
  promoVideo?: string;
  price: number;
  salePrice?: number;
  currency?: string;
  featured?: boolean;
  homepage?: boolean;
  trending?: boolean;
  status?: "draft" | "published" | "archived" | "coming_soon";
  published: boolean;
  displayOrder?: number;
  certificateEnabled?: boolean;
  refundEligible?: boolean;
  enrollmentLimit?: number;
  startDate?: string;
  endDate?: string;
  teacherId?: string;
  seoTitle?: string;
  seoDescription?: string;
  focusKeyword?: string;
  canonicalUrl?: string;
  ogImage?: string;
  twitterCard?: string;
  hasLiveClasses?: boolean;
  liveClassSchedule?: { dayOfWeek: string; time: string; duration: string; zoomLink: string };
  upcomingLiveClass?: string;
  curriculum?: string;
  level?: string;
  migratedFrom?: string;
  createdAt?: any;
  updatedAt?: any;
}

export async function createCourse(data: Omit<Course, "id" | "createdAt" | "updatedAt">) {
  const docRef = await addDoc(collection(db, "courses"), {
    ...data,
    published: data.status === "published",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return { id: docRef.id, ...data };
}

export async function updateCourse(id: string, data: Partial<Course>) {
  await updateDoc(doc(db, "courses", id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteCourse(id: string) {
  await deleteDoc(doc(db, "courses", id));
}

export function subscribeToCourses(callback: (courses: Course[]) => void): Unsubscribe {
  const q = query(collection(db, "courses"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const courses = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Course[];
    callback(courses);
  });
}

export async function fetchPublishedCourses(): Promise<Course[]> {
  const q = query(collection(db, "courses"), where("published", "==", true));
  const snapshot = await getDocs(q);
  const courses = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Course[];
  return courses.sort((a, b) => {
    const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
    const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
    return bTime - aTime;
  });
}

// ENROLLMENTS & PROGRESS
export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  studentName: string;
  classLevel: string;
  status: "active" | "completed" | "dropped";
  enrolledAt: any;
  paymentId?: string;
  batchTiming: "morning" | "evening";
  notes?: string;
}

export function subscribeToEnrollments(callback: (enrollments: Enrollment[]) => void): Unsubscribe {
  const q = query(collection(db, "enrollments"), orderBy("enrolledAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const enrollments = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Enrollment[];
    callback(enrollments);
  });
}

export interface Progress {
  id?: string;
  userId: string;
  courseId: string;
  percentage: number;
  lessonsCompleted: number;
  nextLessonTitle: string;
  nextLessonDuration: string;
  lastActivityAt: any;
}

export async function checkIsEnrolled(userId: string, courseId: string): Promise<boolean> {
  const q = query(
    collection(db, "enrollments"),
    where("userId", "==", userId),
    where("courseId", "==", courseId),
    where("status", "==", "active")
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

export async function enrollCourse(
  userId: string,
  courseId: string,
  studentName: string,
  classLevel: string,
  batchTiming: "morning" | "evening",
  notes: string = "",
  paymentId?: string
) {
  // Check if already enrolled
  const q = query(
    collection(db, "enrollments"),
    where("userId", "==", userId),
    where("courseId", "==", courseId),
    where("status", "==", "active")
  );
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    throw new Error("Already enrolled in this course.");
  }

  // Create enrollment
  const enrollmentRef = await addDoc(collection(db, "enrollments"), {
    userId,
    courseId,
    studentName,
    classLevel,
    status: "active",
    enrolledAt: serverTimestamp(),
    batchTiming,
    notes,
    paymentId: paymentId || null,
  });

  // Create progress entry
  await addDoc(collection(db, "progress"), {
    userId,
    courseId,
    percentage: 0,
    lessonsCompleted: 0,
    nextLessonTitle: "Chapter 1 - Introduction",
    nextLessonDuration: "45 mins",
    lastActivityAt: serverTimestamp(),
  });

  return enrollmentRef.id;
}

// ─── COURSE CATEGORIES ───────────────────────────────────────────

export interface CourseCategory {
  id: string;
  title: string;
  slug: string;
  description?: string;
  bannerImage?: string;
  thumbnail?: string;
  order: number;
  themeColor?: string;
  icon?: string;
  seoTitle?: string;
  seoDescription?: string;
  active: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export async function fetchActiveCategories(): Promise<CourseCategory[]> {
  const q = query(collection(db, "courseCategories"), where("active", "==", true));
  const snap = await getDocs(q);
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }) as CourseCategory)
    .sort((a, b) => a.order - b.order);
}

export function subscribeToCategories(cb: (cats: CourseCategory[]) => void) {
  const q = query(collection(db, "courseCategories"), orderBy("order", "asc"));
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }) as CourseCategory)));
}

export async function createCategory(data: Omit<CourseCategory, "id">) {
  return addDoc(collection(db, "courseCategories"), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
}
export async function updateCategory(id: string, data: Partial<CourseCategory>) {
  return updateDoc(doc(db, "courseCategories", id), { ...data, updatedAt: serverTimestamp() });
}
export async function deleteCategory(id: string) {
  return deleteDoc(doc(db, "courseCategories", id));
}

// ─── SUBJECTS ────────────────────────────────────────────────────

export interface Subject {
  id: string;
  courseId: string;
  title: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  displayOrder: number;
  estimatedHours?: number;
  active: boolean;
  learningOutcomes?: string[];
  requirements?: string[];
  whoIsThisFor?: string[];
  benefits?: string[];
  faqs?: any[];
  migratedFrom?: string;
  createdAt?: any;
  updatedAt?: any;
}

export async function fetchSubjectsByCourse(courseId: string): Promise<Subject[]> {
  const q = query(collection(db, "subjects"), where("courseId", "==", courseId), where("active", "==", true));
  const snap = await getDocs(q);
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }) as Subject)
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export function subscribeToSubjects(cb: (subjects: Subject[]) => void) {
  const q = query(collection(db, "subjects"), orderBy("displayOrder", "asc"));
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }) as Subject)));
}

export async function createSubject(data: Omit<Subject, "id">) {
  return addDoc(collection(db, "subjects"), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
}
export async function updateSubject(id: string, data: Partial<Subject>) {
  return updateDoc(doc(db, "subjects", id), { ...data, updatedAt: serverTimestamp() });
}
export async function deleteSubject(id: string) {
  return deleteDoc(doc(db, "subjects", id));
}

// ─── MODULES ─────────────────────────────────────────────────────

export interface Module {
  id: string;
  subjectId: string;
  courseId: string;
  title: string;
  slug?: string;
  description?: string;
  displayOrder: number;
  estimatedHours?: number;
  estimatedDuration?: string;
  difficulty?: string;
  thumbnail?: string;
  learningObjectives?: string[];
  prerequisites?: string[];
  status?: "active" | "draft" | "archived";
  migratedFrom?: string;
  createdAt?: any;
  updatedAt?: any;
}

export async function fetchModulesBySubject(subjectId: string): Promise<Module[]> {
  const q = query(collection(db, "modules"), where("subjectId", "==", subjectId));
  const snap = await getDocs(q);
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }) as Module)
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export function subscribeToModules(cb: (modules: Module[]) => void) {
  const q = query(collection(db, "modules"), orderBy("displayOrder", "asc"));
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }) as Module)));
}

export async function createModule(data: Omit<Module, "id">) {
  return addDoc(collection(db, "modules"), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
}
export async function updateModule(id: string, data: Partial<Module>) {
  return updateDoc(doc(db, "modules", id), { ...data, updatedAt: serverTimestamp() });
}
export async function deleteModule(id: string) {
  return deleteDoc(doc(db, "modules", id));
}

// ─── LESSONS ─────────────────────────────────────────────────────

export interface Lesson {
  id: string;
  moduleId: string;
  subjectId: string;
  courseId: string;
  title: string;
  slug: string;
  lessonType?: "video" | "pdf" | "assignment" | "quiz" | "external";
  description?: string;
  videoUrl?: string;
  videoDuration?: string;
  thumbnail?: string;
  notesUrl?: string;
  worksheetUrl?: string;
  assignmentUrl?: string;
  externalLink?: string;
  duration?: string;
  estimatedDuration?: string;
  isPreview: boolean;
  isFree?: boolean;
  displayOrder: number;
  attachments?: { name: string; url: string; type: string }[];
  status?: "active" | "draft" | "archived";
  migratedFrom?: string;
  createdAt?: any;
  updatedAt?: any;
}

export async function fetchLessonsByModule(moduleId: string): Promise<Lesson[]> {
  const q = query(collection(db, "lessons"), where("moduleId", "==", moduleId));
  const snap = await getDocs(q);
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }) as Lesson)
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function fetchLessonsBySubject(subjectId: string): Promise<Lesson[]> {
  const q = query(collection(db, "lessons"), where("subjectId", "==", subjectId));
  const snap = await getDocs(q);
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }) as Lesson)
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export async function createLesson(data: Omit<Lesson, "id">) {
  return addDoc(collection(db, "lessons"), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
}
export async function updateLesson(id: string, data: Partial<Lesson>) {
  return updateDoc(doc(db, "lessons", id), { ...data, updatedAt: serverTimestamp() });
}
export async function deleteLesson(id: string) {
  return deleteDoc(doc(db, "lessons", id));
}

// ─── LIVE CLASSES ─────────────────────────────────────────────────

export interface LiveClass {
  id: string;
  courseId: string;
  subjectId?: string;
  teacherId?: string;
  title: string;
  description?: string;
  meetingProvider?: "google_meet" | "zoom" | "teams" | "custom";
  meetingLink: string;
  meetingId?: string;
  meetingPassword?: string;
  date?: string;
  startTime: string;
  endTime?: string;
  timezone: string;
  maxParticipants?: number;
  recordingUrl?: string;
  isRecurring?: boolean;
  reminderEnabled?: boolean;
  status: "upcoming" | "live" | "completed" | "cancelled";
  createdAt?: any;
  updatedAt?: any;
}

export async function fetchUpcomingLiveClasses(courseId: string): Promise<LiveClass[]> {
  const q = query(
    collection(db, "liveClasses"),
    where("courseId", "==", courseId),
    where("status", "in", ["upcoming", "live"])
  );
  const snap = await getDocs(q);
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }) as LiveClass)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
}

export function subscribeToLiveClasses(cb: (classes: LiveClass[]) => void) {
  const q = query(collection(db, "liveClasses"), orderBy("startTime", "desc"));
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }) as LiveClass)));
}

export async function createLiveClass(data: Omit<LiveClass, "id">) {
  return addDoc(collection(db, "liveClasses"), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
}
export async function updateLiveClass(id: string, data: Partial<LiveClass>) {
  return updateDoc(doc(db, "liveClasses", id), { ...data, updatedAt: serverTimestamp() });
}
export async function deleteLiveClass(id: string) {
  return deleteDoc(doc(db, "liveClasses", id));
}

// ─── FETCH COURSE BY SLUG ────────────────────────────────────────

export async function fetchCourseBySlug(slug: string): Promise<Course | null> {
  const q = query(collection(db, "courses"), where("slug", "==", slug), where("published", "==", true));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as Course;
}

// ─── MIGRATION UTILITY ───────────────────────────────────────────

import { COURSES_DATA } from "@/data/courses";

export interface MigrationResult {
  imported: number;
  skipped: number;
  failed: number;
  details: { slug: string; status: "imported" | "skipped" | "failed"; reason?: string }[];
}

export async function migrateCoursesToFirestore(): Promise<MigrationResult> {
  const result: MigrationResult = { imported: 0, skipped: 0, failed: 0, details: [] };

  const categoryMap = new Map<string, string>();

  const categoryDefs = [
    { title: "Class 6", slug: "class-6", order: 1 },
    { title: "Class 7", slug: "class-7", order: 2 },
    { title: "Class 8", slug: "class-8", order: 3 },
    { title: "Class 9", slug: "class-9", order: 4 },
    { title: "Class 10", slug: "class-10", order: 5 },
  ];

  for (const cat of categoryDefs) {
    const q = query(collection(db, "courseCategories"), where("slug", "==", cat.slug));
    const existing = await getDocs(q);
    if (!existing.empty) {
      categoryMap.set(cat.title, existing.docs[0].id);
    } else {
      const ref = await addDoc(collection(db, "courseCategories"), {
        ...cat,
        active: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      categoryMap.set(cat.title, ref.id);
    }
  }

  for (const [, courseData] of Object.entries(COURSES_DATA)) {
    try {
      const existingQ = query(collection(db, "courses"), where("slug", "==", courseData.slug));
      const existingSnap = await getDocs(existingQ);
      if (!existingSnap.empty) {
        result.skipped++;
        result.details.push({ slug: courseData.slug, status: "skipped", reason: "Already exists in Firestore" });
        continue;
      }

      const categoryId = categoryMap.get(courseData.grade) ?? "";

      const parsePrice = (s: string) => parseInt(s.replace(/[^\d]/g, ""), 10) || 0;

      const courseRef = await addDoc(collection(db, "courses"), {
        name: `${courseData.grade} — ${courseData.title}`,
        slug: courseData.slug,
        classLevel: courseData.classLevel.replace("Class ", "").trim() || courseData.grade.replace("Class ", "").trim(),
        subject: courseData.subjectsSummary,
        description: courseData.blurb,
        fullDescription: courseData.curriculum,
        thumbnail: courseData.img,
        price: parsePrice(courseData.price),
        salePrice: parsePrice(courseData.original),
        duration: courseData.duration,
        level: courseData.classLevel,
        categoryId,
        featured: true,
        displayOrder: parseInt(courseData.slug.match(/\\d+/)?.[0] ?? "99", 10),
        status: "published",
        published: true,
        language: "Hindi + English",
        seoTitle: `${courseData.grade} ${courseData.title} — Vidyapeeth`,
        seoDescription: courseData.blurb,
        migratedFrom: "COURSES_DATA",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const courseId = courseRef.id;

      for (let si = 0; si < courseData.syllabus.length; si++) {
        const sub = courseData.syllabus[si];

        const subjectRef = await addDoc(collection(db, "subjects"), {
          courseId,
          title: sub.name,
          slug: sub.subjectSlug,
          description: sub.detailedDescription || sub.shortDescription,
          icon: sub.subjectSlug === "mathematics" ? "📐"
              : sub.subjectSlug === "science" ? "🔬"
              : sub.subjectSlug === "english" ? "📖"
              : sub.subjectSlug === "physics" ? "⚡"
              : sub.subjectSlug === "algebra" ? "🧮"
              : "📚",
          color: si % 2 === 0 ? "#1B2A4A" : "#F4700B",
          displayOrder: si + 1,
          active: true,
          learningOutcomes: sub.learningOutcomes,
          requirements: sub.requirements,
          whoIsThisFor: sub.whoIsThisFor,
          benefits: sub.benefits,
          faqs: sub.faqs,
          migratedFrom: "COURSES_DATA",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        const subjectId = subjectRef.id;

        const topics = sub.topicsCovered ?? [];
        const chunkSize = Math.ceil(topics.length / Math.ceil(topics.length / 5)) || 5;
        const topicChunks: string[][] = [];
        for (let i = 0; i < topics.length; i += chunkSize) {
          topicChunks.push(topics.slice(i, i + chunkSize));
        }

        for (let mi = 0; mi < topicChunks.length; mi++) {
          const chunkTopics = topicChunks[mi];
          const moduleTitle = mi === 0
            ? `${sub.name} — Foundations`
            : mi === topicChunks.length - 1
            ? `${sub.name} — Advanced Topics`
            : `${sub.name} — Part ${mi + 1}`;

          const moduleRef = await addDoc(collection(db, "modules"), {
            courseId,
            subjectId,
            title: moduleTitle,
            description: chunkTopics.join(", "),
            displayOrder: mi + 1,
            estimatedHours: Math.ceil(chunkTopics.length * 1.5),
            migratedFrom: "COURSES_DATA",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });

          const moduleId = moduleRef.id;

          for (let li = 0; li < chunkTopics.length; li++) {
            const topicTitle = chunkTopics[li];
            const lessonSlug = topicTitle.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

            await addDoc(collection(db, "lessons"), {
              courseId,
              subjectId,
              moduleId,
              title: topicTitle,
              slug: lessonSlug,
              description: `Lesson covering: ${topicTitle}`,
              isPreview: li === 0,
              displayOrder: li + 1,
              duration: "45 mins",
              migratedFrom: "COURSES_DATA",
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
        }

        if (sub.studyMaterial?.length) {
          const resourceModuleRef = await addDoc(collection(db, "modules"), {
            courseId,
            subjectId,
            title: `${sub.name} — Study Materials`,
            description: "Downloadable notes, worksheets and practice resources",
            displayOrder: topicChunks.length + 1,
            estimatedHours: 0,
            migratedFrom: "COURSES_DATA",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });

          for (let ri = 0; ri < sub.studyMaterial.length; ri++) {
            const material = sub.studyMaterial[ri];
            await addDoc(collection(db, "lessons"), {
              courseId,
              subjectId,
              moduleId: resourceModuleRef.id,
              title: material,
              slug: material.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
              description: `Resource: ${material}`,
              isPreview: false,
              displayOrder: ri + 1,
              duration: "",
              migratedFrom: "COURSES_DATA",
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          }
        }
      }

      result.imported++;
      result.details.push({ slug: courseData.slug, status: "imported" });

    } catch (err: any) {
      result.failed++;
      result.details.push({ slug: courseData.slug, status: "failed", reason: err?.message ?? "Unknown error" });
    }
  }

  return result;
}

// ─── TEACHERS ───────────────────────────────────────────────────

export interface Teacher {
  id: string;
  photo?: string;
  name: string;
  email: string;
  phone?: string;
  qualification?: string;
  experience?: string;
  designation?: string;
  biography?: string;
  specialization?: string;
  subjects?: string[];
  courses?: string[];
  socialLinks?: {
    linkedin?: string;
    youtube?: string;
    instagram?: string;
    website?: string;
  };
  status?: "active" | "inactive";
  createdAt?: any;
  updatedAt?: any;
}

export async function fetchTeachers(): Promise<Teacher[]> {
  const q = query(collection(db, "teachers"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Teacher);
}
