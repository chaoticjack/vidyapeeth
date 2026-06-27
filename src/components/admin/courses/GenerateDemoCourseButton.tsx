import React, { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, doc, writeBatch, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";
import { Loader2, Wand2 } from "lucide-react";

export function GenerateDemoCourseButton({ onComplete }: { onComplete?: (courseId: string) => void }) {
  const [loading, setLoading] = useState(false);

  const generateDemoCourse = async () => {
    setLoading(true);
    toast.info("Generating Demo Course... Please wait.");
    try {
      const batch = writeBatch(db);
      
      // 1. Create Course
      const courseRef = doc(collection(db, "courses"));
      const courseId = courseRef.id;
      
      batch.set(courseRef, {
        title: "Science Mastery Bootcamp (Demo)",
        name: "Science Mastery Bootcamp (Demo)",
        slug: `science-mastery-demo-${Date.now()}`,
        shortDescription: "A complete demonstration course featuring Physics, Chemistry, and Biology modules with full curriculum.",
        aboutThisSubject: "This is a comprehensive demo course automatically generated to test the Vidyapeeth LMS. It contains rich metadata, realistic pricing, and a full curriculum tree.",
        whatYouWillLearn: ["Master core scientific principles", "Apply concepts to real-world problems", "Ace your board examinations", "Build a strong foundation for competitive exams"],
        topicsCovered: ["Mechanics", "Organic Chemistry", "Human Anatomy", "Thermodynamics"],
        learningOutcomes: ["Solve complex equations faster", "Understand chemical reactions intuitively", "Draw accurate biological diagrams"],
        courseBenefits: ["24/7 Doubt solving", "Weekly live sessions", "Printable study material", "Mock tests with analytics"],
        requirements: ["Basic understanding of Class 10 Science", "Stable internet connection", "Dedication to study 2 hours daily"],
        whoIsThisFor: ["Class 11 & 12 students", "NEET Aspirants", "JEE Aspirants"],
        studyMaterials: ["Detailed PDF Notes", "Formula Cheat Sheets", "Previous Year Questions"],
        faqs: [
          { question: "Is this course completely free?", answer: "This is a generated demo course for testing purposes." },
          { question: "Can I download the videos?", answer: "Yes, offline viewing is supported in the mobile app." },
          { question: "Are there any prerequisites?", answer: "Just high school level mathematics." }
        ],
        sidebarCta: "Join 10,000+ students today!",
        resources: ["Scientific Calculator Guide", "Periodic Table PDF"],
        downloads: ["Introductory Booklet.pdf"],
        courseHighlights: ["100+ Hours of Video Content", "50+ Mock Tests", "1-on-1 Mentorship"],
        successMetrics: ["95% students scored above 90%", "Top 100 AIR in JEE"],
        thumbnail: "https://images.unsplash.com/photo-1596496050827-8299e0220de1?q=80&w=800&auto=format&fit=crop",
        classLevel: "12",
        status: "published",
        published: true,
        price: 4999,
        currency: "INR",
        seoTitle: "Science Mastery Bootcamp | Best Online Coaching",
        seoDescription: "Enroll in the ultimate Science Mastery Bootcamp. Cover Physics, Chemistry, and Biology with top educators.",
        displayOrder: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // 2. Create Subjects
      const subjects = ["Physics", "Chemistry", "Biology"];
      const moduleTopics: Record<string, string[]> = {
        "Physics": ["Kinematics & Mechanics", "Thermodynamics", "Electromagnetism", "Modern Physics"],
        "Chemistry": ["Physical Chemistry", "Organic Chemistry - I", "Inorganic Chemistry", "Organic Chemistry - II"],
        "Biology": ["Cell Biology & Genetics", "Plant Physiology", "Human Anatomy", "Ecology & Environment"]
      };

      subjects.forEach((subjectName, sIdx) => {
        const subjectRef = doc(collection(db, "subjects"));
        batch.set(subjectRef, {
          courseId,
          title: subjectName,
          slug: subjectName.toLowerCase(),
          displayOrder: sIdx,
          active: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        // 3. Create Modules
        const topics = moduleTopics[subjectName] || ["Module 1", "Module 2"];
        topics.forEach((moduleName, mIdx) => {
          const moduleRef = doc(collection(db, "modules"));
          batch.set(moduleRef, {
            courseId,
            subjectId: subjectRef.id,
            title: moduleName,
            status: "active",
            displayOrder: mIdx,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });

          // 4. Create Lessons
          for (let lIdx = 0; lIdx < 5; lIdx++) {
            const lessonRef = doc(collection(db, "lessons"));
            const isPreview = lIdx === 0 && mIdx === 0; // Make first lesson free
            
            // Generate some random variation in lesson types occasionally
            const typeChance = Math.random();
            let lessonType = "video";
            if (typeChance > 0.8) lessonType = "pdf";
            else if (typeChance > 0.9) lessonType = "quiz";

            batch.set(lessonRef, {
              courseId,
              subjectId: subjectRef.id,
              moduleId: moduleRef.id,
              title: `${moduleName} - Concept ${lIdx + 1}`,
              slug: `lesson-${Date.now()}-${sIdx}-${mIdx}-${lIdx}`,
              lessonType: lessonType,
              isPreview: isPreview,
              status: "active",
              displayOrder: lIdx,
              
              // Dummy YouTube video for everything (Big Buck Bunny or Elephants Dream for variety)
              videoUrl: "https://www.youtube.com/watch?v=aqz-KE-bpKQ", 
              youtubeVideoId: "aqz-KE-bpKQ",
              duration: "12:34",
              thumbnail: "https://img.youtube.com/vi/aqz-KE-bpKQ/maxresdefault.jpg",
              
              description: `In this detailed lesson, we will cover the fundamental concepts of ${moduleName} Concept ${lIdx + 1}. Pay close attention to the derivations.`,
              
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
          }
        });
      });

      // Commit the batch
      await batch.commit();
      
      toast.success("Demo Course Generated Successfully! 🎉");
      
      if (onComplete) {
        onComplete(courseId);
      }
      
    } catch (err) {
      console.error("Error generating demo course:", err);
      toast.error("Failed to generate demo course.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={generateDemoCourse}
      disabled={loading}
      className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity font-bold text-sm shadow-sm"
    >
      {loading ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
      {loading ? "Generating..." : "Generate Demo Course"}
    </button>
  );
}
