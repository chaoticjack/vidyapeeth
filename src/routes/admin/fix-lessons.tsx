import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { collection, getDocs, updateDoc, doc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/fix-lessons")({
  component: FixLessons,
});

function FixLessons() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");

  const handleFix = async () => {
    setLoading(true);
    setProgress("Fetching lessons...");
    try {
      const snapshot = await getDocs(collection(db, "lessons"));
      const lessons = snapshot.docs.map(d => ({ id: d.id, ...d.data() as any }));
      setProgress(`Found ${lessons.length} lessons. Organizing...`);

      const batch = writeBatch(db);
      let updates = 0;

      // Group by module
      const byModule: Record<string, any[]> = {};
      for (const l of lessons) {
        if (!byModule[l.moduleId]) byModule[l.moduleId] = [];
        byModule[l.moduleId].push(l);
      }

      for (const moduleId in byModule) {
        const moduleLessons = byModule[moduleId];
        
        // Sort
        moduleLessons.sort((a, b) => {
          if (a.displayOrder !== b.displayOrder) return (a.displayOrder || 0) - (b.displayOrder || 0);
          if (a.createdAt?.toMillis && b.createdAt?.toMillis) return a.createdAt.toMillis() - b.createdAt.toMillis();
          return (a.title || "").localeCompare(b.title || "");
        });

        for (let i = 0; i < moduleLessons.length; i++) {
          const lesson = moduleLessons[i];
          let newType = lesson.lessonType || "video";
          const title = (lesson.title || "").toLowerCase();

          if (title.includes("test") || title.includes("quiz") || title.includes("mock") || title.includes("exam")) {
            newType = "quiz";
          } else if (title.includes("pdf") || title.includes("note") || title.includes("worksheet") || title.includes("study material")) {
            newType = "pdf";
          } else if (title.includes("assignment") || title.includes("homework")) {
            newType = "assignment";
          } else if (!lesson.lessonType || lesson.lessonType === "video") {
            newType = "video";
          }

          const newOrder = i + 1;

          if (lesson.lessonType !== newType || lesson.displayOrder !== newOrder) {
            batch.update(doc(db, "lessons", lesson.id), {
              lessonType: newType,
              displayOrder: newOrder
            });
            updates++;
          }
        }
      }

      if (updates > 0) {
        setProgress(`Committing ${updates} updates...`);
        await batch.commit();
        toast.success(`Successfully updated ${updates} lessons!`);
      } else {
        toast.info("All lessons are already ordered and categorized correctly.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to fix lessons: " + err.message);
    } finally {
      setLoading(false);
      setProgress("");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-navy mb-4">Fix Lessons Order & Category</h1>
      <p className="text-ink/80 mb-6 max-w-2xl">
        This tool will automatically loop through every single lesson in your database. 
        It will properly order them sequentially (1, 2, 3...) within their respective modules, 
        and it will intelligently guess the category (Video, PDF, Quiz, Assignment) based on the lesson's title.
      </p>
      
      <button 
        onClick={handleFix} 
        disabled={loading}
        className="flex items-center gap-2 bg-saffron text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-500 transition-colors disabled:opacity-50"
      >
        {loading ? <Loader2 className="animate-spin" /> : null}
        {loading ? "Processing..." : "Run Fix Script"}
      </button>

      {progress && (
        <p className="mt-4 text-sm font-medium text-navy">{progress}</p>
      )}
    </div>
  );
}
