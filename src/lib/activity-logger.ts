import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export type ActivityType = 
  | "enrollment" 
  | "progress_update" 
  | "demo_booked" 
  | "lesson_completed" 
  | "live_class_joined"
  | "course_completed";

export interface LogActivityParams {
  userId: string;
  type: ActivityType;
  title: string;
  description: string;
  courseId?: string;
  metadata?: Record<string, any>;
}

export async function logActivity(params: LogActivityParams) {
  try {
    const docRef = await addDoc(collection(db, "activities"), {
      ...params,
      timestamp: serverTimestamp(),
      read: false,
    });
    return docRef.id;
  } catch (error) {
    console.error("Failed to log activity:", error);
    // We don't want activity logging failures to crash the main user flows,
    // so we catch and log the error silently.
  }
}
