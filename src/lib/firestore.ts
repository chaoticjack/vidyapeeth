import { collection, addDoc, setDoc, updateDoc, deleteDoc, doc, getDocs, getDoc, onSnapshot, query, where, orderBy, serverTimestamp, Unsubscribe } from "firebase/firestore";
import { db } from "./firebase";

// BLOGS
export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  author: string;
  tags: string[];
  featuredImage?: string;
  status: "draft" | "published";
  published: boolean;
  publishedAt?: any;
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
  await updateDoc(doc(db, "blogs", id), { ...data, updatedAt: serverTimestamp() });
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

// COURSES
export interface Course {
  id: string;
  name: string;
  slug?: string;
  classLevel: string;
  subject: string;
  description: string;
  price: number;
  curriculum?: string;
  status?: "draft" | "published";
  published: boolean;
  teacherId?: string;
  thumbnail?: string;
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
  id?: string;
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
