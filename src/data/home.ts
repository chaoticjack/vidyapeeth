export const navLinks = [
  { to: "/courses", label: "Courses" },
  { to: "/vsat", label: "VSAT" },
  { to: "/demo-class", label: "Demo Class" },
  { to: "/about", label: "About" },
  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact" },
] as const;

export const stats = [
  { icon: "Users", value: 52000, suffix: "+", label: "Students learning" },
  { icon: "GraduationCap", value: 96, suffix: "%", label: "Board pass rate" },
  { icon: "BookOpenCheck", value: 1240, suffix: "+", label: "Live classes / month" },
  { icon: "Trophy", value: 38, suffix: "", label: "VSAT toppers in 2025" },
] as const;

export const courses = [
  {
    slug: "class-6-foundation",
    classLevel: "Class 6",
    title: "Foundation Track",
    subjects: ["Maths", "Science", "English"],
    price: 4999,
    original: 7999,
    blurb: "Build the bedrock — concepts told as stories, not formulas.",
    accent: "saffron",
    span: "row-span-2",
  },
  {
    slug: "class-7-core",
    classLevel: "Class 7",
    title: "Core Mastery",
    subjects: ["Maths", "Science", "SST"],
    price: 5499,
    original: 8499,
    blurb: "Bridge primary and middle school with focused weekly sprints.",
    accent: "navy",
    span: "row-span-1",
  },
  {
    slug: "class-8-advance",
    classLevel: "Class 8",
    title: "Advance Builder",
    subjects: ["Algebra", "Physics", "Chemistry"],
    price: 6499,
    original: 9999,
    blurb: "Where school maths starts hurting — we make it sing instead.",
    accent: "saffron",
    span: "row-span-1",
  },
  {
    slug: "class-9-pre-board",
    classLevel: "Class 9",
    title: "Pre-Board Sprint",
    subjects: ["All subjects", "Test series"],
    price: 8499,
    original: 12999,
    blurb: "Doubt classes daily. Mock papers weekly. Calm parents always.",
    accent: "navy",
    span: "row-span-2",
  },
  {
    slug: "class-10-board-blitz",
    classLevel: "Class 10",
    title: "Board Blitz 2026",
    subjects: ["CBSE / ICSE", "Mocks", "1-on-1"],
    price: 11999,
    original: 17999,
    blurb: "The big one. Designed for 95%+ aspirants with weekly review.",
    accent: "saffron",
    span: "row-span-1",
  },
] as const;

export const testimonials = [
  {
    name: "Aanya Sharma",
    classLevel: "Class 10, Jaipur",
    quote: "I went from 71% in pre-boards to 94% in my actuals. My Vidyapeeth mentor stayed back after every doubt class until I genuinely understood. They didn't teach me to memorise — they taught me to think.",
  },
  {
    name: "Rehan Iqbal",
    classLevel: "Class 8, Hyderabad",
    quote: "Science suddenly felt like a story. My mom stopped shouting about my marks.",
  },
  {
    name: "Priya Menon",
    classLevel: "Mother of Class 7 student",
    quote: "Weekly reports, real teachers, and zero pressure tactics. Worth every rupee.",
  },
  {
    name: "Karan Verma",
    classLevel: "Class 12, Delhi",
    quote: "The mock test analysis was eye-opening. I realized I was losing points not on concepts, but on time management.",
  },
  {
    name: "Aditi Rao",
    classLevel: "Class 9, Bangalore",
    quote: "Math used to give me anxiety. Now it's my favorite subject. The visualizations and interactive problem solving are incredible.",
  },
  {
    name: "Siddharth N.",
    classLevel: "Class 11, Mumbai",
    quote: "I was struggling to keep up with the syllabus until I joined Vidyapeeth. The bite-sized lessons make everything so manageable.",
  },
  {
    name: "Meera Joshi",
    classLevel: "Class 6, Pune",
    quote: "I love the doubt rooms! Whenever I get stuck on a homework question, someone is always there to help within minutes.",
  },
  {
    name: "Rohan Bajaj",
    classLevel: "Father of Class 10 student",
    quote: "Seeing my son study without being reminded is a miracle. He actually looks forward to the live classes.",
  },
  {
    name: "Tara Nair",
    classLevel: "Class 8, Kochi",
    quote: "The teachers don't just read from slides. They draw, they demonstrate, and they make sure we're actually learning.",
  },
  {
    name: "Vikram Singh",
    classLevel: "Class 10, Chandigarh",
    quote: "Board exams felt terrifying until we started the final sprint batch. I felt completely prepared on the day of the exam.",
  },
  {
    name: "Neha Gupta",
    classLevel: "Class 7, Lucknow",
    quote: "I used to hate history because of the dates. Now I see it as a movie. The storytelling approach is amazing.",
  },
  {
    name: "Arjun P.",
    classLevel: "Class 9, Chennai",
    quote: "The physics experiments we did at home using the kit were so fun. It's so much better than just reading the textbook.",
  }
] as const;

export const successTickerTop = [
  "Aanya S. — 94% Class 10 CBSE",
  "Kabir M. — VSAT Rank 3, 2025",
  "Ishita R. — 98 in Maths",
  "Devansh P. — Sainik School selected",
  "Sara K. — Olympiad Gold",
  "Vihaan T. — JNV qualified",
  "Meera J. — 96% ICSE Class 10",
] as const;

export const successTickerBottom = [
  "Rohan B. — 100 in Science",
  "Ananya G. — NTSE Stage 2 cleared",
  "Aarav S. — Topper, district level",
  "Diya N. — 92% Class 9 finals",
  "Krish V. — Maths Olympiad Silver",
  "Tara M. — VSAT Top 50",
  "Yash L. — RMO qualified",
] as const;

export const howSteps = [
  {
    n: "01",
    title: "Book a free demo",
    body: "Pick a slot, meet your mentor, and try a live class — no card required.",
  },
  {
    n: "02",
    title: "Get a learning plan",
    body: "We map your child's strengths, gaps and pace into a weekly roadmap.",
  },
  {
    n: "03",
    title: "Learn, review, lead",
    body: "Live classes, doubt rooms, weekly tests — and parents get real reports.",
  },
] as const;