export type SubjectDetails = {
  subjectSlug: string;
  name: string;
  shortDescription: string;
  detailedDescription: string;
  learningOutcomes: string[];
  topicsCovered: string[];
  studyMaterial: string[];
  requirements: string[];
  whoIsThisFor: string;
  benefits: string[];
  faqs: { question: string; answer: string }[];
};

export type CourseData = {
  slug: string;
  grade: string;
  title: string;
  blurb: string;
  curriculum: string;
  price: string;
  original: string;
  duration: string;
  batchSize: string;
  classLevel: string;
  subjectsSummary: string;
  img: string;
  keyTopics: string[];
  learningOutcomes: string[];
  theme: "navy" | "saffron";
  syllabus: SubjectDetails[];
};

export const COURSES_DATA: Record<string, CourseData> = {
  "class-6-foundation": {
    slug: "class-6-foundation",
    grade: "Class 6",
    title: "Foundation Track",
    blurb: "Build the bedrock for middle school. Concepts told as stories, not formulas — designed for curious 11-year-olds.",
    curriculum: "The Class 6 curriculum is fully aligned with the latest NCERT / CBSE syllabus and rebuilt around storytelling. Students move from concrete examples to abstract ideas at a gentle pace.",
    price: "₹4,999",
    original: "₹7,999",
    duration: "10 months · ~5 live hrs/week",
    batchSize: "Max 25 students per batch",
    classLevel: "Beginner",
    subjectsSummary: "Maths · Science · English",
    img: "https://vidyapeeth.org.in/wp-content/uploads/2024/08/Class-6.webp",
    keyTopics: [
      "Number system & fractions",
      "Living world & matter",
      "Reading comprehension & grammar",
      "Basic geometry & algebra primer",
    ],
    learningOutcomes: [
      "Build strong number sense and geometric intuition",
      "Develop curiosity-first scientific thinking",
      "Strengthen reading fluency and self-expression",
    ],
    theme: "saffron",
    syllabus: [
      {
        subjectSlug: "mathematics",
        name: "Mathematics",
        shortDescription: "Builds number sense and geometric intuition using visual models.",
        detailedDescription: "Our Class 6 Mathematics program is designed to transition students smoothly from elementary arithmetic to middle school conceptual thinking. We recognize that Class 6 is a critical pivot point where math begins to feel more abstract, so we focus heavily on visualizing numbers, fractions, and early geometry. Instead of rote memorization, students will engage in interactive problem-solving that connects math to the real world—from measuring real objects to understanding the mathematics of daily purchases. By breaking down complex equations into relatable stories, we completely eliminate 'math phobia' and replace it with a genuine curiosity for logical reasoning and number play.",
        learningOutcomes: [
          "Mastery of operations involving large numbers and decimals.",
          "Intuitive understanding of fractions and their applications.",
          "Ability to construct basic geometric shapes and measure angles accurately.",
          "Introduction to variables and basic algebraic expressions."
        ],
        topicsCovered: [
          "Knowing Our Numbers",
          "Whole Numbers",
          "Playing with Numbers",
          "Basic Geometrical Ideas",
          "Understanding Elementary Shapes",
          "Integers & Fractions",
          "Decimals",
          "Data Handling",
          "Mensuration",
          "Algebra Primer"
        ],
        studyMaterial: ["Chapter-wise Notes", "Weekly Practice Sheets", "Interactive Quizzes", "Recorded Lectures", "Doubt Clearing Sessions"],
        requirements: [
          "Basic understanding of addition, subtraction, multiplication, and division.",
          "A curious mind ready to explore mathematical patterns."
        ],
        whoIsThisFor: "Class 6 students aiming to build a rock-solid mathematical foundation for higher classes.",
        benefits: [
          "Eliminates math phobia through visual learning.",
          "Builds mental calculation speed.",
          "Prepares students for upcoming Olympiads and competitive exams."
        ],
        faqs: [
          { question: "Is this aligned with the CBSE syllabus?", answer: "Yes, the curriculum strictly follows the latest NCERT guidelines while adding conceptual depth." },
          { question: "Are there regular tests?", answer: "We conduct weekly quizzes and a comprehensive monthly test to track progress." }
        ]
      },
      {
        subjectSlug: "science",
        name: "Science",
        shortDescription: "Curiosity-first science. Each chapter starts with a real-world question.",
        detailedDescription: "Science for Class 6 is all about observation and asking 'why?'. We move away from dry textbook reading to a model of active discovery and inquiry. Students will deeply explore the living world, the chemical nature of matter, and fundamental physics concepts like motion, electricity, and light through engaging storytelling and simple, safe at-home experiments. Whether it's dissecting the parts of a flower or building a simple circuit with a battery and bulb, our curriculum ensures that science is experienced rather than just read. This approach builds a robust foundation for higher-level scientific thinking and creates lifelong learners who naturally question the world around them.",
        learningOutcomes: [
          "Identify and classify materials based on their properties.",
          "Understand the structure and functions of plant parts.",
          "Measure distances accurately and understand types of motion.",
          "Grasp the concepts of light, shadows, and reflection."
        ],
        topicsCovered: [
          "Food: Where does it come from?",
          "Components of Food",
          "Sorting Materials into Groups",
          "Separation of Substances",
          "Getting to Know Plants",
          "Body Movements",
          "The Living Organisms",
          "Motion and Measurement",
          "Light, Shadows and Reflections",
          "Electricity and Circuits"
        ],
        studyMaterial: ["Illustrated Concept Notes", "Experiment Activity Sheets", "Chapter Assignments", "Mock Tests", "Recorded Lectures"],
        requirements: ["No prior advanced knowledge required. Just observation skills."],
        whoIsThisFor: "Class 6 students looking to understand the 'why' behind everyday natural phenomena.",
        benefits: [
          "Encourages scientific inquiry and critical thinking.",
          "Hands-on learning makes concepts unforgettable.",
          "Lays the groundwork for Physics, Chemistry, and Biology in higher grades."
        ],
        faqs: [
          { question: "Do we need a lab kit?", answer: "No, all activities are designed to be safely performed using common household items." },
          { question: "How are doubts resolved?", answer: "Live doubt clearing sessions are held every week for specific questions." }
        ]
      },
      {
        subjectSlug: "english",
        name: "English",
        shortDescription: "Strengthens reading fluency and confident self-expression.",
        detailedDescription: "A comprehensive, immersive English course focusing on advanced reading comprehension, applied grammar, and dynamic creative writing. We aim to make students confident communicators who can articulate their thoughts clearly both in writing and speech. This course goes beyond just passing exams; it focuses on vocabulary building through classic literature, crafting compelling narratives, and mastering the nuances of formal grammar without the boredom. By participating in regular reading challenges and interactive writing workshops, students will develop a distinct voice and the ability to persuade, inform, and entertain through the English language.",
        learningOutcomes: [
          "Improved reading speed and comprehension of complex texts.",
          "Mastery of foundational grammar rules including tenses and parts of speech.",
          "Ability to write structured essays, letters, and creative stories."
        ],
        topicsCovered: [
          "Reading Comprehension Strategies",
          "Nouns, Pronouns & Adjectives",
          "Verbs and Tenses",
          "Prepositions and Conjunctions",
          "Active and Passive Voice",
          "Paragraph Writing",
          "Informal Letter Writing",
          "Story Writing"
        ],
        studyMaterial: ["Grammar Workbooks", "Reading Passages", "Vocabulary Flashcards", "Writing Templates", "Recorded Lectures"],
        requirements: ["Basic reading and writing ability in English."],
        whoIsThisFor: "Class 6 students looking to enhance their language skills for academic and personal growth.",
        benefits: [
          "Improves overall academic performance across all subjects.",
          "Builds confidence for public speaking and debates.",
          "Expands vocabulary significantly."
        ],
        faqs: [
          { question: "Does this cover the school literature textbook?", answer: "We focus primarily on grammar and writing skills, which supplement the literature syllabus of any board." }
        ]
      }
    ]
  },
  "class-7-core": {
    slug: "class-7-core",
    grade: "Class 7",
    title: "Core Mastery",
    blurb: "Bridge primary and middle school with focused weekly sprints and live problem-solving rooms.",
    curriculum: "Class 7 is where syllabus density doubles. We split each subject into 2-week sprints — concept week, then application week with mock questions and doubt sessions.",
    price: "₹5,499",
    original: "₹8,499",
    duration: "10 months · ~5 live hrs/week",
    batchSize: "Max 25 students per batch",
    classLevel: "Intermediate",
    subjectsSummary: "Maths · Science · SST",
    img: "https://vidyapeeth.org.in/wp-content/uploads/2024/08/Class-7.webp",
    keyTopics: [
      "Integers & rational numbers",
      "Nutrition, heat & weather",
      "Medieval India & civics",
      "Data handling & lines/angles",
    ],
    learningOutcomes: [
      "Master algebraic thinking and mental-maths speed",
      "Bridge middle-school science concepts to real life",
      "Connect history, geography and civics as stories",
    ],
    theme: "navy",
    syllabus: [
      {
        subjectSlug: "mathematics",
        name: "Mathematics",
        shortDescription: "Introduces integers, rational numbers and algebraic thinking.",
        detailedDescription: "Class 7 Math is the definitive bridge between basic arithmetic and advanced high school algebra. This intensive course focuses heavily on developing logical reasoning, mastering complex algebraic expressions, and proving geometric properties. We emphasize problem-solving speed and absolute accuracy, moving students from simply finding the answer to understanding the underlying mathematical laws. Through carefully designed daily sprints and live problem-solving rooms, students will learn to tackle multi-step problems with confidence, setting an unbreakable foundation for the rigorous demands of Class 8 and beyond.",
        learningOutcomes: [
          "Perform operations on integers and rational numbers seamlessly.",
          "Solve simple linear equations.",
          "Understand properties of triangles and congruence.",
          "Calculate perimeter and area of complex shapes."
        ],
        topicsCovered: [
          "Integers", "Fractions and Decimals", "Data Handling", "Simple Equations", "Lines and Angles", "The Triangle and its Properties", "Congruence of Triangles", "Comparing Quantities", "Rational Numbers", "Practical Geometry", "Perimeter and Area", "Algebraic Expressions", "Exponents and Powers"
        ],
        studyMaterial: ["Chapter Notes", "Practice Worksheets", "Formula Cheat Sheets", "Mock Tests", "Recorded Lectures"],
        requirements: ["Completion of Class 6 mathematics."],
        whoIsThisFor: "Class 7 students who want to build a strong analytical foundation.",
        benefits: ["Develops fast calculation skills", "Prepares for advanced algebra in Class 8", "Improves logical reasoning for competitive exams"],
        faqs: [{ question: "How many live classes per week?", answer: "There are 4 live mathematics classes per week." }]
      },
      {
        subjectSlug: "science",
        name: "Science",
        shortDescription: "Bridges middle-school biology, physics and chemistry.",
        detailedDescription: "Take a deeper dive into the fascinating natural phenomena that govern our planet. In this Class 7 Science track, students will comprehensively explore plant and animal nutrition, understand the thermodynamics of heat and physical changes, and investigate environmental science. The core focus is on linking theoretical textbook concepts directly to real-world applications, such as understanding local weather patterns or observing chemical reactions in the kitchen. By integrating physics, chemistry, and biology into a cohesive narrative, students will develop a holistic understanding of how the universe operates at both a microscopic and macroscopic level.",
        learningOutcomes: [
          "Understand modes of nutrition in living organisms.",
          "Explain the flow of heat and differentiate between acids and bases.",
          "Understand electric current and its effects.",
          "Grasp the basics of reproduction in plants."
        ],
        topicsCovered: [
          "Nutrition in Plants & Animals", "Heat", "Acids, Bases and Salts", "Physical and Chemical Changes", "Weather, Climate and Adaptations", "Winds, Storms and Cyclones", "Soil", "Respiration in Organisms", "Transportation in Animals and Plants", "Reproduction in Plants", "Motion and Time", "Electric Current and its Effects", "Light"
        ],
        studyMaterial: ["Illustrated Notes", "Experiment Videos", "Practice Sheets", "Mock Tests", "Recorded Lectures"],
        requirements: ["Completion of Class 6 science."],
        whoIsThisFor: "Class 7 students aiming to excel in school science exams.",
        benefits: ["Clear conceptual understanding", "Better retention through visual learning", "Strong foundation for Class 8"],
        faqs: [{ question: "Are experiments included?", answer: "Yes, we showcase virtual experiments and suggest safe home activities." }]
      }
    ]
  },
  "class-8-advance": {
    slug: "class-8-advance",
    grade: "Class 8",
    title: "Advance Builder",
    blurb: "Where school maths starts hurting — we make it sing instead. Conceptual depth with daily doubt rooms.",
    curriculum: "Class 8 is the launchpad to high school. We separate Physics, Chemistry and Biology into distinct streams while keeping the integrated NCERT flow.",
    price: "₹6,499",
    original: "₹9,999",
    duration: "10 months · ~6 live hrs/week",
    batchSize: "Max 25 students per batch",
    classLevel: "Intermediate-Advanced",
    subjectsSummary: "Algebra · Physics · Chemistry",
    img: "https://vidyapeeth.org.in/wp-content/uploads/2024/08/Class-8.webp",
    keyTopics: [
      "Linear equations & polynomials",
      "Force, pressure & sound",
      "Metals, combustion & petroleum",
      "Cell structure & microorganisms",
    ],
    learningOutcomes: [
      "Solve algebraic problems graphically and symbolically",
      "Build experimental intuition in physics and chemistry",
      "Prepare the conceptual bridge to Class 9 board-level depth",
    ],
    theme: "saffron",
    syllabus: [
      {
        subjectSlug: "physics",
        name: "Physics",
        shortDescription: "Build experimental intuition regarding force, pressure and sound.",
        detailedDescription: "Physics in Class 8 introduces students to the fundamental, invisible forces governing the universe. We comprehensively cover classical mechanics (force, friction, and pressure), acoustics (the physics of sound), and electricity. This course serves as the critical bridge between basic middle school science and the rigorous, mathematically-heavy physics of high school. By focusing on experimental intuition and visual problem-solving, we teach students how to mathematically describe physical events. They will leave this course not only knowing the formulas, but understanding exactly how to derive them and when to apply them to solve real-world engineering challenges.",
        learningOutcomes: [
          "Calculate and understand force and pressure.",
          "Explain the causes and effects of friction.",
          "Understand how sound is produced and propagates.",
          "Grasp the chemical effects of electric current."
        ],
        topicsCovered: [
          "Force and Pressure", "Friction", "Sound", "Chemical Effects of Electric Current", "Some Natural Phenomena", "Light", "Stars and the Solar System"
        ],
        studyMaterial: ["Physics Formula Book", "Concept Maps", "Numerical Practice Sheets", "Mock Tests", "Recorded Lectures"],
        requirements: ["Basic understanding of Class 7 science and maths."],
        whoIsThisFor: "Class 8 students preparing for a strong transition to high school science.",
        benefits: ["Develops strong problem-solving skills", "Builds a deep intuition for physical laws", "Prepares for NTSE and Olympiads"],
        faqs: [{ question: "Is physics taught separately from general science?", answer: "Yes, we teach physics, chemistry, and biology as distinct modules to provide specialized focus." }]
      },
      {
        subjectSlug: "algebra",
        name: "Algebra & Mathematics",
        shortDescription: "Solve algebraic problems graphically and symbolically.",
        detailedDescription: "This course completely transforms traditional mathematical thinking into advanced analytical logic. We focus heavily on solving linear equations in one variable, decoding the properties of complex quadrilaterals, manipulating algebraic expressions, and proving core identities. Class 8 is widely considered the critical 'make or break' year where students must absolutely master algebra to succeed in the upcoming board exams of Class 9 and 10. Through rigorous daily practice, advanced shortcut techniques, and personalized doubt resolution, we ensure that every student builds the mental muscle required to tackle the most intimidating algebraic puzzles with absolute ease.",
        learningOutcomes: [
          "Solve complex linear equations.",
          "Understand and construct various quadrilaterals.",
          "Master algebraic expressions, identities, and factorization.",
          "Solve problems involving direct and inverse proportions."
        ],
        topicsCovered: [
          "Rational Numbers", "Linear Equations in One Variable", "Understanding Quadrilaterals", "Practical Geometry", "Data Handling", "Squares and Square Roots", "Cubes and Cube Roots", "Comparing Quantities", "Algebraic Expressions and Identities", "Visualising Solid Shapes", "Mensuration", "Exponents and Powers", "Direct and Inverse Proportions", "Factorisation", "Introduction to Graphs"
        ],
        studyMaterial: ["Step-by-step Solution Guides", "Algebra Cheat Sheets", "Weekly Assignments", "Mock Tests", "Recorded Lectures"],
        requirements: ["Strong grasp of Class 7 mathematics, especially basic equations."],
        whoIsThisFor: "Class 8 students who want to eliminate math fear and master algebra.",
        benefits: ["Lays the ultimate foundation for Class 10 Boards", "Increases logical reasoning", "Interactive problem-solving builds confidence"],
        faqs: [{ question: "Are doubts cleared immediately?", answer: "Yes, we have a daily doubt room available post-classes." }]
      }
    ]
  },
  "class-9-pre-board": {
    slug: "class-9-pre-board",
    grade: "Class 9",
    title: "Pre-Board Sprint",
    blurb: "Build a strong foundation that directly feeds Class 10 prep. Cover the full NCERT syllabus with board-pattern practice.",
    curriculum: "Class 9 is where board preparation truly begins. We introduce rigorous testing, advanced science concepts, and detailed answer-writing techniques.",
    price: "₹8,499",
    original: "₹12,999",
    duration: "12 months · ~7 live hrs/week",
    batchSize: "Max 30 students per batch",
    classLevel: "Advanced",
    subjectsSummary: "All subjects + Test series",
    img: "https://vidyapeeth.org.in/wp-content/uploads/2024/08/Class-9.webp",
    keyTopics: [
      "Polynomials & coordinate geometry",
      "Atoms, molecules & motion",
      "French Revolution & constitutional design",
      "Statistics & probability",
    ],
    learningOutcomes: [
      "Cover the full NCERT syllabus with board-pattern practice",
      "Develop exam temperament through weekly mocks",
      "Build a strong foundation that directly feeds Class 10 prep",
    ],
    theme: "navy",
    syllabus: [
      {
        subjectSlug: "mathematics",
        name: "Mathematics",
        shortDescription: "Advanced algebra, coordinate geometry, and statistics.",
        detailedDescription: "Master the entire Class 9 mathematics syllabus with an intense focus on problem-solving speed, conceptual accuracy, and advanced theorem proofs. Because Class 9 serves as the direct stepping stone to the Class 10 Board Exams, this course is designed to be highly rigorous and academically challenging. Students will dive deep into coordinate geometry, complex polynomials, surface areas, and statistical probability. We supplement standard NCERT textbook learning with higher-order thinking skill (HOTS) questions and competitive exam-style mock tests, ensuring students are perfectly calibrated for board-level pressure a full year in advance.",
        learningOutcomes: ["Master polynomials", "Understand probability", "Solve complex geometry theorems"],
        topicsCovered: ["Number Systems", "Polynomials", "Coordinate Geometry", "Linear Equations", "Lines and Angles", "Triangles", "Quadrilaterals", "Circles", "Heron's Formula", "Surface Areas and Volumes", "Statistics", "Probability"],
        studyMaterial: ["Concept Maps", "Mock Tests"],
        requirements: ["Class 8 Mathematics"],
        whoIsThisFor: "Class 9 students preparing for boards.",
        benefits: ["Direct prep for Class 10", "NTSE foundation"],
        faqs: []
      }
    ]
  },
  "class-10-board-blitz": {
    slug: "class-10-board-blitz",
    grade: "Class 10",
    title: "Board Blitz 2026",
    blurb: "Achieve 95%+ board scores with structured revision and personalised mentoring.",
    curriculum: "The ultimate board exam preparation track. Features full-length mock papers, shortcut techniques, and 1-on-1 strategy sessions.",
    price: "₹11,999",
    original: "₹17,999",
    duration: "12 months · ~8 live hrs/week",
    batchSize: "Max 20 students per batch",
    classLevel: "Board Exam",
    subjectsSummary: "CBSE / ICSE · Mocks · 1-on-1",
    img: "https://vidyapeeth.org.in/wp-content/uploads/2024/08/Class-10.webp",
    keyTopics: [
      "Trigonometry & quadratic equations",
      "Chemical reactions & electricity",
      "Nationalism & resources development",
      "Full-length board mock papers",
    ],
    learningOutcomes: [
      "Achieve 95%+ board scores with structured revision",
      "Master shortcut techniques for competitive-level questions",
      "Get personalised 1-on-1 mentoring and exam-day strategy",
    ],
    theme: "saffron",
    syllabus: [
      {
        subjectSlug: "science",
        name: "Science",
        shortDescription: "Complete board syllabus for Physics, Chemistry, and Biology.",
        detailedDescription: "This is our most rigorous and comprehensive science preparation program, exclusively targeting a perfect 100/100 score in the Class 10 Board Exams. Covering Physics, Chemistry, and Biology in exhaustive detail, this course blends deep theoretical learning with practical, real-world application. Students will undergo intensive training that includes mastering complex chemical equations, solving high-level physics numericals, and understanding intricate biological processes. With a heavy emphasis on previous year questions (PYQs), extensive full-length mock testing, and personalized examiner-perspective feedback, we leave absolutely nothing to chance.",
        learningOutcomes: ["Master chemical equations", "Solve physics numericals", "Understand genetics"],
        topicsCovered: ["Chemical Reactions", "Acids, Bases, Salts", "Metals & Non-metals", "Carbon and its Compounds", "Life Processes", "Control and Coordination", "How do Organisms Reproduce?", "Heredity and Evolution", "Light - Reflection and Refraction", "Human Eye", "Electricity", "Magnetic Effects of Electric Current", "Our Environment"],
        studyMaterial: ["Previous Year Questions", "Mock Papers"],
        requirements: ["Class 9 Science"],
        whoIsThisFor: "Class 10 Board exam aspirants.",
        benefits: ["Top tier board scores", "Strong science foundation"],
        faqs: []
      },
      {
        subjectSlug: "mathematics",
        name: "Mathematics",
        shortDescription: "Complete board syllabus for Mathematics with advanced problem solving.",
        detailedDescription: "An uncompromising, rigorous Mathematics preparation track designed specifically for ambitious students targeting a flawless 100/100 in their board exams. This course places a massive premium on speed, accuracy, and mastering competitive-level questions using advanced mathematical shortcuts. Covering everything from advanced trigonometry and quadratic equations to complex coordinate geometry, it is the essential launchpad for students aiming for advanced secondary education. Through exhaustive mock tests and 1-on-1 strategy sessions, we forge elite mathematical thinkers.",
        learningOutcomes: ["Master Trigonometry and Geometry", "Solve complex algebraic equations instantly", "Understand Surface Areas and Volumes"],
        topicsCovered: ["Real Numbers", "Polynomials", "Pair of Linear Equations in Two Variables", "Quadratic Equations", "Arithmetic Progressions", "Triangles", "Coordinate Geometry", "Introduction to Trigonometry", "Some Applications of Trigonometry", "Circles", "Constructions", "Areas Related to Circles", "Surface Areas and Volumes", "Statistics", "Probability"],
        studyMaterial: ["Previous Year Questions", "Mock Papers", "Formula Cheat Sheets"],
        requirements: ["Class 9 Mathematics"],
        whoIsThisFor: "Class 10 students aiming for perfect board scores and future engineering aspirants.",
        benefits: ["Top tier board scores", "Strong JEE foundation"],
        faqs: []
      }
    ]
  }
};
