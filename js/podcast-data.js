/**
 * INSTRUCTIFY KENYA — PODCAST & INSIGHTS DATA ENGINE v2.0
 * Theme: CONVERSATIONS FOR A SMARTER FUTURE
 * Mantra: Learn · Connect · Innovate · Transform
 * 
 * Comprehensive dataset covering 10 initial episodes, featured episode,
 * guest profiles, practical classroom action frameworks, transcripts, and filtering.
 */

const PODCAST_INFO = {
  name: "The Instructify Kenya Podcast",
  mainTitle: "Conversations for a Smarter Future",
  mantra: "Learn · Connect · Innovate · Transform",
  heroSubtitle: "Where educators connect, ideas grow, and the future of learning takes shape.",
  description: "A premium educator-focused media and knowledge platform bridging classroom practice, emerging technology, curriculum leadership, and the future of African education.",
  host: {
    name: "Alex Nderitu",
    title: "Lead Educator & EdTech Strategist",
    organization: "Instructify Kenya",
    bio: "Passionate about transforming education across East Africa through digital pedagogical innovations, teacher empowerment, and future-fit competency frameworks. Alex hosts senior policymakers, researchers, master teachers, and changemakers to uncover actionable solutions for tomorrow's classrooms.",
    image: "assets/images/founder_alex.jpg",
    linkedin: "https://www.linkedin.com/company/instructify-kenya",
    twitter: "https://twitter.com/instructifyke",
    email: "podcast@instructify.co.ke"
  },
  streamingLinks: [
    { name: "Spotify", icon: "spotify", url: "https://open.spotify.com", badge: "Listen on Spotify" },
    { name: "Apple Podcasts", icon: "apple", url: "https://podcasts.apple.com", badge: "Apple Podcasts" },
    { name: "YouTube", icon: "youtube", url: "https://www.youtube.com/@instructifykenya", badge: "Watch on YouTube" },
    { name: "Google Podcasts", icon: "google", url: "https://podcasts.google.com", badge: "Google Podcasts" },
    { name: "Amazon Music", icon: "amazon", url: "https://music.amazon.com", badge: "Amazon Music" }
  ],
  categories: [
    "All",
    "Pedagogy",
    "Technology",
    "AI",
    "Curriculum",
    "Leadership",
    "Innovation",
    "ICT"
  ]
};

const PODCAST_EPISODES = [
  {
    id: "ep-01",
    slug: "is-the-classroom-ready-for-the-future",
    number: "Episode 01",
    episodeNum: 1,
    title: "Is the Classroom Ready for the Future?",
    subtitle: "Rethinking physical, psychological, and digital spaces for tomorrow's learners.",
    description: "In our flagship premiere, Dr. Angela Mutua explores whether our current classroom architecture, pedagogical mindset, and curriculum pacing are genuinely prepared for the accelerating future of work, automation, and global interconnectedness.",
    category: "Innovation",
    tags: ["Innovation", "Pedagogy", "Future of Work", "EdTech"],
    date: "August 28, 2026",
    isoDate: "2026-08-28",
    duration: "44 min",
    durationSeconds: 2640,
    audioUrl: "https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg",
    videoEmbedUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    videoThumbnail: "assets/images/founder_alex.jpg",
    featured: true,
    themeColor: "#2145E6",
    coverGradient: "linear-gradient(135deg, #091929 0%, #17326B 50%, #2145E6 100%)",
    guest: {
      id: "guest-angela-mutua",
      name: "Dr. Angela Mutua",
      title: "Senior AI Researcher & EdTech Advisor",
      organization: "African Institute for Future Intelligence",
      bio: "Leading advisor on digital literacy frameworks to national ministries across East Africa and UNESCO consultant for ethical emerging tech integration.",
      avatarBg: "linear-gradient(135deg, #EEF2FF 0%, #DBEAFE 100%)",
      accentColor: "#2145E6",
      initials: "AM",
      expertise: ["AI Ethics", "Learning Design", "Curriculum Strategy"],
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com"
    },
    takeaways: [
      "Future-ready classrooms prioritize self-directed problem-solving over passive content absorption.",
      "Digital tools must reduce teacher administrative friction to allow more 1-on-1 pedagogical mentorship.",
      "Competency-based education requires authentic, real-time feedback loops rather than high-stakes term-end assessments.",
      "Infrastructure constraints can be turned into collaborative strengths through smart asynchronous learning stations."
    ],
    classroomActions: {
      tryIt: "Audit your current week's lesson plan: replace 20 minutes of teacher monologue with an inquiry-driven challenge where students formulate three testable questions.",
      adaptIt: "For low-connectivity schools, use peer discussion circles with role cards (Researcher, Synthesizer, Presenter) before consulting any digital or printed reference.",
      transformIt: "Form a departmental Future of Learning task force to draft an institutional digital learning manifesto aligned with Competency-Based Curriculum guidelines."
    },
    transcript: [
      { time: "00:00", timestampSeconds: 0, speaker: "Alex Nderitu (Host)", text: "Welcome to Conversations for a Smarter Future by Instructify Kenya. Today we ask a fundamental question: Is the classroom ready for the future?" },
      { time: "03:15", timestampSeconds: 195, speaker: "Dr. Angela Mutua", text: "When we look at modern classrooms, we still see physical layouts and schedules designed during the industrial era. Yet the world outside demands creativity, agility, and continuous unlearning." },
      { time: "09:40", timestampSeconds: 580, speaker: "Alex Nderitu (Host)", text: "How do teachers make that shift when national exams and syllabi feel rigid?" },
      { time: "14:20", timestampSeconds: 860, speaker: "Dr. Angela Mutua", text: "It begins with agency. When learners own their inquiries, mastery follows naturally. Technology isn't about replacing the teacher; it's about amplifying authentic human connection." },
      { time: "25:30", timestampSeconds: 1530, speaker: "Dr. Angela Mutua", text: "Our research shows that schools investing in collaborative problem-solving see a 34% increase in student engagement across STEM and humanities alike." },
      { time: "38:45", timestampSeconds: 2325, speaker: "Alex Nderitu (Host)", text: "What is your final advice for educators listening across Kenya and East Africa today?" },
      { time: "41:10", timestampSeconds: 2470, speaker: "Dr. Angela Mutua", text: "Don't wait for a central directive to innovate in your classroom. Start small, experiment with curiosity, and empower your learners to lead." }
    ],
    relatedCourse: {
      title: "AI in Education: Teacher's Masterclass",
      category: "Professional Development",
      link: "courses.html"
    }
  },
  {
    id: "ep-02",
    slug: "from-teacher-to-learning-facilitator",
    number: "Episode 02",
    episodeNum: 2,
    title: "From Teacher to Learning Facilitator",
    subtitle: "Shifting the pedagogical paradigm from 'sage on the stage' to dynamic learning coach.",
    description: "Curriculum specialist Michael Otieno breaks down how modern educators can gracefully transition from traditional lectures to interactive, student-centered facilitation that sparks active curiosity.",
    category: "Pedagogy",
    tags: ["Pedagogy", "Curriculum", "Teacher Professional Development", "CBC"],
    date: "September 02, 2026",
    isoDate: "2026-09-02",
    duration: "38 min",
    durationSeconds: 2280,
    audioUrl: "https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg",
    videoEmbedUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    videoThumbnail: "assets/images/founder_alex.jpg",
    featured: false,
    themeColor: "#183AD6",
    coverGradient: "linear-gradient(135deg, #091929 0%, #064E3B 50%, #183AD6 100%)",
    guest: {
      id: "guest-michael-otieno",
      name: "Michael Otieno",
      title: "Curriculum Innovation Specialist & Master Trainer",
      organization: "Center for Educational Transformation",
      bio: "Over 18 years preparing senior educators for CBC transition, specializing in student autonomy, questioning techniques, and collaborative rubric design.",
      avatarBg: "linear-gradient(135deg, #CCFBF1 0%, #99F6E4 100%)",
      accentColor: "#183AD6",
      initials: "MO",
      expertise: ["Facilitation Skills", "CBC Alignment", "Active Learning"],
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com"
    },
    takeaways: [
      "Facilitation requires mastering the art of asking provocative questions rather than supplying immediate answers.",
      "Scaffolding student peer review transforms assessment into a collaborative learning event.",
      "A learning facilitator designs the environment and sets guardrails, allowing learners to navigate productive struggle."
    ],
    classroomActions: {
      tryIt: "Implement 'Think-Pair-Share' with a 3-minute timer during your next introduction to a complex concept.",
      adaptIt: "In multi-grade or crowded classrooms, assign student squad leads who guide small group discussions.",
      transformIt: "Institutionalize peer classroom observations focused on facilitator talk time versus student talk time."
    },
    transcript: [
      { time: "00:00", timestampSeconds: 0, speaker: "Alex Nderitu (Host)", text: "Today on Conversations for a Smarter Future, we delve into the heart of pedagogical transformation with Michael Otieno." },
      { time: "05:10", timestampSeconds: 310, speaker: "Michael Otieno", text: "The moment a teacher stops feeling the burden of having all the answers, classroom energy completely transforms." },
      { time: "18:40", timestampSeconds: 1120, speaker: "Michael Otieno", text: "When you facilitate, you are designing experiences. You become the architect of intellectual discovery." }
    ],
    relatedCourse: {
      title: "Pedagogy & Active Learning Strategies",
      category: "Teaching Mastery",
      link: "courses.html"
    }
  },
  {
    id: "ep-03",
    slug: "ai-in-education-opportunity-or-threat",
    number: "Episode 03",
    episodeNum: 3,
    title: "AI in Education: Opportunity or Threat?",
    subtitle: "Navigating ethics, academic integrity, automated feedback, and genuine student mastery.",
    description: "Brenda Mwangi dives deep into generative AI tools like ChatGPT, Claude, and specialized tutoring engines, discussing how schools can embrace their power without compromising deep cognitive learning.",
    category: "AI",
    tags: ["AI", "Technology", "Ethics", "EdTech"],
    date: "September 05, 2026",
    isoDate: "2026-09-05",
    duration: "47 min",
    durationSeconds: 2820,
    audioUrl: "https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg",
    videoEmbedUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    videoThumbnail: "assets/images/founder_alex.jpg",
    featured: false,
    themeColor: "#FF4D00",
    coverGradient: "linear-gradient(135deg, #091929 0%, #581C87 50%, #FF4D00 100%)",
    guest: {
      id: "guest-brenda-mwangi",
      name: "Brenda Mwangi",
      title: "Lead AI Ethics Fellow & Educational Policy Advisor",
      organization: "Kenya EdTech Alliance",
      bio: "Pioneering researcher on generative AI adoption across Sub-Saharan Africa and author of guidelines for transparent academic integrity in schools.",
      avatarBg: "linear-gradient(135deg, #F3EEFF 0%, #DDD6FE 100%)",
      accentColor: "#FF4D00",
      initials: "BM",
      expertise: ["Generative AI", "Academic Integrity", "Algorithmic Equity"],
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com"
    },
    takeaways: [
      "Banning AI tools is futile; our duty is teaching transparent citation, critical skepticism, and prompt literacy.",
      "AI provides unprecedented individualized tutoring for concept reinforcement when students study independently.",
      "Evaluating students on their critique and synthesis of AI-generated responses builds higher-order Bloom's taxonomy skills."
    ],
    classroomActions: {
      tryIt: "Have students run an AI prompt on a historical event, print the output, and highlight inaccuracies or missing African perspectives.",
      adaptIt: "Use offline AI models or mobile SMS-based learning chatbots for students without continuous home internet.",
      transformIt: "Create a school-wide AI Acceptable Use Policy co-drafted by educators, students, and parent representatives."
    },
    transcript: [
      { time: "00:00", timestampSeconds: 0, speaker: "Alex Nderitu (Host)", text: "Is Artificial Intelligence an existential threat to authentic homework or the greatest educational democratizer of our time?" },
      { time: "04:12", timestampSeconds: 252, speaker: "Brenda Mwangi", text: "If homework can be solved by a single prompt, the assignment was testing memory retrieval, not understanding." },
      { time: "22:30", timestampSeconds: 1350, speaker: "Brenda Mwangi", text: "We must train students to be editors, evaluators, and creative directors of intelligent systems, not passive consumers." }
    ],
    relatedCourse: {
      title: "Generative AI for Educators Masterclass",
      category: "Emerging Tech",
      link: "courses.html"
    }
  },
  {
    id: "ep-04",
    slug: "beyond-the-textbook",
    number: "Episode 04",
    episodeNum: 4,
    title: "Beyond the Textbook",
    subtitle: "Curating real-world problem sets, open educational resources, and multi-format learning media.",
    description: "James Kamau shares practical blueprints for decoupling curriculum delivery from static textbooks and grounding daily lessons in rich local case studies, podcasts, community projects, and interactive simulations.",
    category: "Curriculum",
    tags: ["Curriculum", "Pedagogy", "Open Education", "Multimedia"],
    date: "September 08, 2026",
    isoDate: "2026-09-08",
    duration: "36 min",
    durationSeconds: 2160,
    audioUrl: "https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg",
    videoEmbedUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    videoThumbnail: "assets/images/founder_alex.jpg",
    featured: false,
    themeColor: "#D97706",
    coverGradient: "linear-gradient(135deg, #091929 0%, #78350F 50%, #D97706 100%)",
    guest: {
      id: "guest-james-kamau",
      name: "James Kamau",
      title: "Head of Instructional Media",
      organization: "East African Digital Publishers",
      bio: "Over 15 years modernizing publishing pipelines, spearheading interactive digital science kits and localized storytelling across regional school networks.",
      avatarBg: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)",
      accentColor: "#D97706",
      initials: "JK",
      expertise: ["Digital Publishing", "OER Design", "Content Localization"],
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com"
    },
    takeaways: [
      "Textbooks provide structural scope, but community reality provides emotional and cognitive relevance.",
      "Open Educational Resources (OER) allow teachers to remix high-quality simulations without subscription fees.",
      "Student-created multimedia artifacts (infographics, short audio summaries) demonstrate far deeper mastery than fill-in-the-blank worksheets."
    ],
    classroomActions: {
      tryIt: "Replace one chapter summary with a 2-minute student-recorded voice memo explaining the core lesson to a younger sibling.",
      adaptIt: "Gather local newspapers and trade publications to extract real Kenyan economic data for mathematics lessons.",
      transformIt: "Build a shared cloud repository where teachers across your school deposit localized case studies and project briefs."
    },
    transcript: [
      { time: "00:00", timestampSeconds: 0, speaker: "Alex Nderitu (Host)", text: "Welcome to Episode 04. Today we break through the boundaries of static textbook instruction with James Kamau." },
      { time: "06:15", timestampSeconds: 375, speaker: "James Kamau", text: "When a child in Nakuru reads a word problem about snow in Vermont, cognitive load is wasted on cultural translation. We need localized relevance." }
    ],
    relatedCourse: {
      title: "Instructional Design & Content Creation",
      category: "Content Mastery",
      link: "courses.html"
    }
  },
  {
    id: "ep-05",
    slug: "making-competency-based-learning-work",
    number: "Episode 05",
    episodeNum: 5,
    title: "Making Competency-Based Learning Work",
    subtitle: "Operationalizing rubrics, formative feedback, and community service learning in Kenyan schools.",
    description: "Grace Nyambura offers deep practical clarity on CBC implementation hurdles, assessment portfolios, parental communication, and ensuring that core competencies are genuinely built rather than just checked off on forms.",
    category: "Curriculum",
    tags: ["Curriculum", "CBC", "Pedagogy", "Assessment"],
    date: "September 11, 2026",
    isoDate: "2026-09-11",
    duration: "41 min",
    durationSeconds: 2460,
    audioUrl: "https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg",
    videoEmbedUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    videoThumbnail: "assets/images/founder_alex.jpg",
    featured: false,
    themeColor: "#2563EB",
    coverGradient: "linear-gradient(135deg, #091929 0%, #1E3A8A 50%, #2563EB 100%)",
    guest: {
      id: "guest-grace-nyambura",
      name: "Grace Nyambura",
      title: "CBC Lead Facilitator & Senior Assessor",
      organization: "National Institute of Curriculum Excellence",
      bio: "Architect of teacher professional development modules for junior school transitions across 12 counties with emphasis on holistic competencies.",
      avatarBg: "linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)",
      accentColor: "#2563EB",
      initials: "GN",
      expertise: ["CBC Rubrics", "Formative Portfolios", "Parent Engagement"],
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com"
    },
    takeaways: [
      "Competency rubrics should be co-constructed with learners so expectations are transparent from day one.",
      "Community Service Learning (CSL) projects are the gold standard for measuring communication and problem-solving in context.",
      "Formative feedback must be forward-looking: tell the student what step to take next, not just what score was achieved."
    ],
    classroomActions: {
      tryIt: "Display a 4-level rubric on your blackboard before starting a project: Developing, Approaching, Meeting, and Exceeding expectations.",
      adaptIt: "Translate assessment criteria into student-friendly 'I Can' statements for junior learners.",
      transformIt: "Shift termly report meetings from teacher-parent conferences to student-led portfolio exhibitions."
    },
    transcript: [
      { time: "00:00", timestampSeconds: 0, speaker: "Alex Nderitu (Host)", text: "CBC has sparked debates across every living room in Kenya. Grace Nyambura joins us to demystify what makes competency learning truly sing." },
      { time: "08:30", timestampSeconds: 510, speaker: "Grace Nyambura", text: "CBC is not about expensive materials. It's about mindset. An authentic conversation with a local artisan can teach more physics than a bought kit." }
    ],
    relatedCourse: {
      title: "CBC Assessment & Rubric Mastery",
      category: "Curriculum Excellence",
      link: "courses.html"
    }
  },
  {
    id: "ep-06",
    slug: "the-digital-teacher",
    number: "Episode 06",
    episodeNum: 6,
    title: "The Digital Teacher",
    subtitle: "Everyday productivity hacks, cloud workflows, and digital storytelling for educators.",
    description: "Emmanuel Kiprop shares his inspiring journey transforming into a digitally empowered educator, demonstrating how simple free cloud suites, screen recorders, and digital flashcards save hours of grading each week.",
    category: "Technology",
    tags: ["Technology", "ICT", "Teacher Productivity", "Digital Skills"],
    date: "September 14, 2026",
    isoDate: "2026-09-14",
    duration: "35 min",
    durationSeconds: 2100,
    audioUrl: "https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg",
    videoEmbedUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    videoThumbnail: "assets/images/founder_alex.jpg",
    featured: false,
    themeColor: "#059669",
    coverGradient: "linear-gradient(135deg, #091929 0%, #064E3B 50%, #059669 100%)",
    guest: {
      id: "guest-emmanuel-kiprop",
      name: "Emmanuel Kiprop",
      title: "EdTech Teacher Leader & MIE Fellow",
      organization: "Rift Valley Academy & Kenya Teacher Tech Network",
      bio: "Trained over 4,000 public school teachers on mobile-first classroom automation, digital grading, and Google Workspace for Education.",
      avatarBg: "linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)",
      accentColor: "#059669",
      initials: "EK",
      expertise: ["Cloud Classrooms", "Teacher Productivity", "Mobile Learning"],
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com"
    },
    takeaways: [
      "A smartphone is a full production studio: voice notes, PDF scanning, and quiz forms streamline 60% of administrative overhead.",
      "Batching digital quiz feedback saves 5+ hours weekly while delivering immediate insights to students.",
      "Digital confidence is built through micro-habits, not one-off high-stress IT certificates."
    ],
    classroomActions: {
      tryIt: "Create a 5-question Google or Microsoft Form exit ticket for tomorrow's class to instantly diagnose concept grasp.",
      adaptIt: "Use offline spreadsheets on school desktop terminals to track student competency milestones.",
      transformIt: "Establish a weekly 30-minute 'Tech Coffee Break' in the staff room where teachers showcase one digital trick they used."
    },
    transcript: [
      { time: "00:00", timestampSeconds: 0, speaker: "Alex Nderitu (Host)", text: "How does a teacher go from tech-anxious to tech-thriving? Emmanuel Kiprop shares his playbook on The Digital Teacher." },
      { time: "04:50", timestampSeconds: 290, speaker: "Emmanuel Kiprop", text: "When I automated my multiple-choice grading, I gained back my Sunday afternoons. That recharged me to be a far better mentor in the classroom." }
    ],
    relatedCourse: {
      title: "Digital Productivity for Modern Teachers",
      category: "Digital Skills",
      link: "courses.html"
    }
  },
  {
    id: "ep-07",
    slug: "teaching-with-technology-when-resources-are-limited",
    number: "Episode 07",
    episodeNum: 7,
    title: "Teaching with Technology When Resources Are Limited",
    subtitle: "Low-bandwidth solutions, solar power, Raspberry Pi servers, and offline open digital libraries.",
    description: "Faith Chebet shares ingenious, battle-tested solutions for bringing 21st-century digital learning into rural and under-resourced schools where electricity is intermittent and data is scarce.",
    category: "ICT",
    tags: ["ICT", "Innovation", "Equity", "Hardware", "Offline Learning"],
    date: "September 17, 2026",
    isoDate: "2026-09-17",
    duration: "39 min",
    durationSeconds: 2340,
    audioUrl: "https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg",
    videoEmbedUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    videoThumbnail: "assets/images/founder_alex.jpg",
    featured: false,
    themeColor: "#0284C7",
    coverGradient: "linear-gradient(135deg, #091929 0%, #0C4A6E 50%, #0284C7 100%)",
    guest: {
      id: "guest-faith-chebet",
      name: "Faith Chebet",
      title: "Founder, Offline Learning Labs",
      organization: "Rural Schools Digital Access Initiative",
      bio: "Pioneered deployment of low-power Kolibri offline content servers across 45 off-grid schools in Turkana, Kitui, and Samburu counties.",
      avatarBg: "linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)",
      accentColor: "#0284C7",
      initials: "FC",
      expertise: ["Offline EdTech", "Frugal Innovation", "Rural Infrastructure"],
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com"
    },
    takeaways: [
      "Offline server boxes (like Kolibri on Raspberry Pi) deliver Khan Academy, Wikipedia, and simulations with zero ongoing data charges.",
      "Teacher collaboration models allow one connected device to seed learning across an entire school via local Wi-Fi hotspots.",
      "Equity in education requires designing for the lowest-spec device in the most remote setting first."
    ],
    classroomActions: {
      tryIt: "Download one offline interactive PhET science simulation to your phone or laptop and run it on a classroom projector or shared screen.",
      adaptIt: "Print QR codes linking to offline video lectures stored on a local school flash drive or router.",
      transformIt: "Partner with county education boards and community solar providers to establish a solar-powered offline digital hub in your cluster."
    },
    transcript: [
      { time: "00:00", timestampSeconds: 0, speaker: "Alex Nderitu (Host)", text: "Can technology thrive in a classroom with no internet? Faith Chebet proves that resource limits breed incredible educational ingenuity." },
      { time: "07:15", timestampSeconds: 435, speaker: "Faith Chebet", text: "We don't need fiber optic cables to give a child in Lodwar access to world-class interactive mathematics. We need thoughtful offline caching." }
    ],
    relatedCourse: {
      title: "Low-Bandwidth & Offline Classroom Tech",
      category: "EdTech Infrastructure",
      link: "courses.html"
    }
  },
  {
    id: "ep-08",
    slug: "can-robotics-change-how-children-learn",
    number: "Episode 08",
    episodeNum: 8,
    title: "Can Robotics Change How Children Learn?",
    subtitle: "Hands-on coding, maker spaces, problem formulation, and spatial intelligence through robotics.",
    description: "Dr. Dennis Omondi discusses how introducing basic robotics kits, microcontrollers, and cardboard prototypes demystifies computational thinking and sparks genuine love for engineering in boys and girls alike.",
    category: "Technology",
    tags: ["Technology", "Innovation", "Robotics", "STEM", "Coding"],
    date: "September 20, 2026",
    isoDate: "2026-09-20",
    duration: "43 min",
    durationSeconds: 2580,
    audioUrl: "https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg",
    videoEmbedUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    videoThumbnail: "assets/images/founder_alex.jpg",
    featured: false,
    themeColor: "#EA580C",
    coverGradient: "linear-gradient(135deg, #091929 0%, #7C2D12 50%, #EA580C 100%)",
    guest: {
      id: "guest-dennis-omondi",
      name: "Dr. Dennis Omondi",
      title: "Director of STEM Innovation & Robotics Education",
      organization: "AfroBotics Kenya",
      bio: "Mechanical engineer and educator who has coached Kenya's national youth robotics teams to international titles, designing affordable kits made from e-waste.",
      avatarBg: "linear-gradient(135deg, #FFEDD5 0%, #FED7AA 100%)",
      accentColor: "#EA580C",
      initials: "DO",
      expertise: ["Robotics & IoT", "Maker Pedagogy", "Girls in STEM"],
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com"
    },
    takeaways: [
      "Robotics teaches failure resilience: when code fails, students re-examine logic rather than feeling personally judged.",
      "Cardboard, rubber bands, and $3 micro:bit boards teach fundamental physics better than passive textbook diagrams.",
      "Early robotics programs close gender divides in STEM when framed around community problem-solving (e.g. automated plant watering)."
    ],
    classroomActions: {
      tryIt: "Introduce a 'paper circuitry' challenge using copper tape and coin cell batteries to light up an LED in student art projects.",
      adaptIt: "Use block-based Scratch or MakeCode simulators on any web browser before buying physical hardware.",
      transformIt: "Inaugurate an annual inter-school Maker Fair where students present working physical models solving local community problems."
    },
    transcript: [
      { time: "00:00", timestampSeconds: 0, speaker: "Alex Nderitu (Host)", text: "Robotics in primary and secondary schools is no longer science fiction. Dr. Dennis Omondi joins us to unpack the transformative power of robotics." },
      { time: "06:40", timestampSeconds: 400, speaker: "Dr. Dennis Omondi", text: "When a 12-year-old programs a tiny motor to rotate when humidity drops, they aren't just learning code. They are learning that they can alter reality." }
    ],
    relatedCourse: {
      title: "Robotics & Computational Thinking in CBC",
      category: "STEM Innovation",
      link: "courses.html"
    }
  },
  {
    id: "ep-09",
    slug: "assessment-beyond-the-exam",
    number: "Episode 09",
    episodeNum: 9,
    title: "Assessment Beyond the Exam",
    subtitle: "Authentic evaluation, self-reflection, psychometric tracking, and portfolio-based validation.",
    description: "Prof. Beatrice Achieng examines why terminal standardized examinations fail to capture human capability and how progressive schools are pioneering continuous, holistic assessment that honors diverse talents.",
    category: "Leadership",
    tags: ["Leadership", "Curriculum", "Assessment", "Education Policy"],
    date: "September 23, 2026",
    isoDate: "2026-09-23",
    duration: "40 min",
    durationSeconds: 2400,
    audioUrl: "https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg",
    videoEmbedUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    videoThumbnail: "assets/images/founder_alex.jpg",
    featured: false,
    themeColor: "#7C3AED",
    coverGradient: "linear-gradient(135deg, #091929 0%, #4C1D95 50%, #7C3AED 100%)",
    guest: {
      id: "guest-beatrice-achieng",
      name: "Prof. Beatrice Achieng",
      title: "Dean of Educational Measurement",
      organization: "Strathmore Institute of Education",
      bio: "Global authority on authentic assessment, psychometric modeling, and alternative credentialing systems for African secondary and tertiary institutions.",
      avatarBg: "linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)",
      accentColor: "#7C3AED",
      initials: "BA",
      expertise: ["Authentic Assessment", "Psychometrics", "Institutional Leadership"],
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com"
    },
    takeaways: [
      "Standardized exams measure test-taking speed and rote memorization, often obscuring creative and leadership competencies.",
      "Digital portfolios capture multi-year growth, showing not just finished products but revisions and reflections.",
      "Educational leadership must align institutional rewards with holistic learner growth rather than single exam mean scores."
    ],
    classroomActions: {
      tryIt: "Dedicate the final 5 minutes of each project to student self-evaluation: 'What was hardest, and how did I overcome it?'",
      adaptIt: "Use visual progress tracking boards where learners move badges as they master micro-skills.",
      transformIt: "Implement a digital portfolio requirement for graduation that students present to a community panel."
    },
    transcript: [
      { time: "00:00", timestampSeconds: 0, speaker: "Alex Nderitu (Host)", text: "What happens when we measure what truly matters instead of just what is easy to grade? Prof. Beatrice Achieng explores Assessment Beyond the Exam." },
      { time: "11:25", timestampSeconds: 685, speaker: "Prof. Beatrice Achieng", text: "An exam gives you a snapshot. A portfolio gives you a documentary film of intellectual growth. Which would you hire on?" }
    ],
    relatedCourse: {
      title: "Educational Assessment & Leadership",
      category: "Institutional Advisory",
      link: "courses.html"
    }
  },
  {
    id: "ep-10",
    slug: "what-will-the-teacher-of-2035-look-like",
    number: "Episode 10",
    episodeNum: 10,
    title: "What Will the Teacher of 2035 Look Like?",
    subtitle: "Synthesizing AI co-pilots, human empathy, continuous micro-credentialing, and lifelong mentorship.",
    description: "In this visionary capstone conversation, Prof. Julius Kariuki maps out the evolving role of the educator over the next decade—dispelling fear of obsolescence and showcasing why compassionate human educators will be more vital than ever.",
    category: "Leadership",
    tags: ["Leadership", "Innovation", "Future of Work", "Pedagogy"],
    date: "September 26, 2026",
    isoDate: "2026-09-26",
    duration: "46 min",
    durationSeconds: 2760,
    audioUrl: "https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg",
    videoEmbedUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    videoThumbnail: "assets/images/founder_alex.jpg",
    featured: false,
    themeColor: "#E11D48",
    coverGradient: "linear-gradient(135deg, #091929 0%, #881337 50%, #E11D48 100%)",
    guest: {
      id: "guest-julius-kariuki",
      name: "Prof. Julius Kariuki",
      title: "Author & Future of Learning Strategist",
      organization: "African Education Futures Think Tank",
      bio: "Distinguished researcher and author on 21st-century educational paradigms, advising governments across Africa on long-term human capital roadmaps.",
      avatarBg: "linear-gradient(135deg, #FFE4E6 0%, #FECDD3 100%)",
      accentColor: "#E11D48",
      initials: "JK",
      expertise: ["Future Foresight", "Teacher Transformation", "Strategic Policy"],
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com"
    },
    takeaways: [
      "The educator of 2035 will be an empathy anchor, community connector, and personal learning curator.",
      "Routine knowledge delivery will be automated, elevating teachers to ethical guides and meta-cognition mentors.",
      "Continuous micro-credentialing will replace static one-off degree milestones for teacher career advancement."
    ],
    classroomActions: {
      tryIt: "Spend 10 minutes this Friday doing a one-on-one check-in with two students focused entirely on their passions rather than academic grades.",
      adaptIt: "Incorporate emotional intelligence and active listening exercises into your regular morning homeroom routines.",
      transformIt: "Create an institutional learning roadmap investing 5% of your professional development budget in future-readiness foresight."
    },
    transcript: [
      { time: "00:00", timestampSeconds: 0, speaker: "Alex Nderitu (Host)", text: "Welcome to Episode 10 of Conversations for a Smarter Future. We close this series by casting our gaze forward to 2035 with Prof. Julius Kariuki." },
      { time: "05:40", timestampSeconds: 340, speaker: "Prof. Julius Kariuki", text: "Machines calculate; humans care. The more technology permeates the classroom, the more precious and irreplaceable the teacher's empathy becomes." },
      { time: "24:15", timestampSeconds: 1455, speaker: "Prof. Julius Kariuki", text: "The teacher of 2035 is not obsolete. They are elevated to the highest calling in society: helping human beings discover who they are." }
    ],
    relatedCourse: {
      title: "Future of Education Strategic Leadership",
      category: "Executive Strategy",
      link: "courses.html"
    }
  }
];

/**
 * Guest directory for the "Meet Our Guests" section
 */
const PODCAST_GUESTS = [
  {
    id: "guest-angela-mutua",
    name: "Dr. Angela Mutua",
    title: "Senior AI Researcher & EdTech Advisor",
    organization: "African Institute for Future Intelligence",
    bio: "Advising national education ministries and UNESCO on ethical AI frameworks and inclusive digital learning design across East Africa.",
    avatarBg: "linear-gradient(135deg, #EEF2FF 0%, #DBEAFE 100%)",
    accentColor: "#2145E6",
    initials: "AM",
    expertise: ["AI Ethics", "Learning Design", "Curriculum Strategy"],
    featuredEpisodes: ["Episode 01: Is the Classroom Ready for the Future?"],
    featuredEpisodeId: "ep-01",
    linkedin: "https://www.linkedin.com",
    twitter: "https://twitter.com"
  },
  {
    id: "guest-michael-otieno",
    name: "Michael Otieno",
    title: "Curriculum Innovation Specialist & Master Trainer",
    organization: "Center for Educational Transformation",
    bio: "Over 18 years preparing senior educators for CBC transition, specializing in student autonomy, questioning techniques, and rubric design.",
    avatarBg: "linear-gradient(135deg, #CCFBF1 0%, #99F6E4 100%)",
    accentColor: "#183AD6",
    initials: "MO",
    expertise: ["Facilitation Skills", "CBC Alignment", "Active Learning"],
    featuredEpisodes: ["Episode 02: From Teacher to Learning Facilitator"],
    featuredEpisodeId: "ep-02",
    linkedin: "https://www.linkedin.com",
    twitter: "https://twitter.com"
  },
  {
    id: "guest-brenda-mwangi",
    name: "Brenda Mwangi",
    title: "Lead AI Ethics Fellow & Educational Policy Advisor",
    organization: "Kenya EdTech Alliance",
    bio: "Pioneering researcher on generative AI adoption and transparent academic integrity standards for primary, secondary, and tertiary institutions.",
    avatarBg: "linear-gradient(135deg, #F3EEFF 0%, #DDD6FE 100%)",
    accentColor: "#FF4D00",
    initials: "BM",
    expertise: ["Generative AI", "Academic Integrity", "Algorithmic Equity"],
    featuredEpisodes: ["Episode 03: AI in Education: Opportunity or Threat?"],
    featuredEpisodeId: "ep-03",
    linkedin: "https://www.linkedin.com",
    twitter: "https://twitter.com"
  },
  {
    id: "guest-james-kamau",
    name: "James Kamau",
    title: "Head of Instructional Media",
    organization: "East African Digital Publishers",
    bio: "Over 15 years modernizing publishing pipelines, spearheading interactive digital science kits, and localized storytelling across regional school networks.",
    avatarBg: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)",
    accentColor: "#D97706",
    initials: "JK",
    expertise: ["Digital Publishing", "OER Design", "Content Localization"],
    featuredEpisodes: ["Episode 04: Beyond the Textbook"],
    featuredEpisodeId: "ep-04",
    linkedin: "https://www.linkedin.com",
    twitter: "https://twitter.com"
  },
  {
    id: "guest-grace-nyambura",
    name: "Grace Nyambura",
    title: "CBC Lead Facilitator & Senior Assessor",
    organization: "National Institute of Curriculum Excellence",
    bio: "Architect of teacher professional development modules for junior school transitions across 12 counties with emphasis on holistic competencies.",
    avatarBg: "linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)",
    accentColor: "#2563EB",
    initials: "GN",
    expertise: ["CBC Rubrics", "Formative Portfolios", "Parent Engagement"],
    featuredEpisodes: ["Episode 05: Making Competency-Based Learning Work"],
    featuredEpisodeId: "ep-05",
    linkedin: "https://www.linkedin.com",
    twitter: "https://twitter.com"
  },
  {
    id: "guest-emmanuel-kiprop",
    name: "Emmanuel Kiprop",
    title: "EdTech Teacher Leader & MIE Fellow",
    organization: "Rift Valley Academy & Kenya Teacher Tech Network",
    bio: "Trained over 4,000 public school teachers on mobile-first classroom automation, digital grading, and Google Workspace for Education.",
    avatarBg: "linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)",
    accentColor: "#059669",
    initials: "EK",
    expertise: ["Cloud Classrooms", "Teacher Productivity", "Mobile Learning"],
    featuredEpisodes: ["Episode 06: The Digital Teacher"],
    featuredEpisodeId: "ep-06",
    linkedin: "https://www.linkedin.com",
    twitter: "https://twitter.com"
  },
  {
    id: "guest-faith-chebet",
    name: "Faith Chebet",
    title: "Founder, Offline Learning Labs",
    organization: "Rural Schools Digital Access Initiative",
    bio: "Pioneered deployment of low-power Kolibri offline content servers across 45 off-grid schools in Turkana, Kitui, and Samburu counties.",
    avatarBg: "linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)",
    accentColor: "#0284C7",
    initials: "FC",
    expertise: ["Offline EdTech", "Frugal Innovation", "Rural Infrastructure"],
    featuredEpisodes: ["Episode 07: Teaching with Technology When Resources Are Limited"],
    featuredEpisodeId: "ep-07",
    linkedin: "https://www.linkedin.com",
    twitter: "https://twitter.com"
  },
  {
    id: "guest-dennis-omondi",
    name: "Dr. Dennis Omondi",
    title: "Director of STEM Innovation & Robotics Education",
    organization: "AfroBotics Kenya",
    bio: "Mechanical engineer and educator who has coached Kenya's national youth robotics teams to international titles, designing affordable kits made from e-waste.",
    avatarBg: "linear-gradient(135deg, #FFEDD5 0%, #FED7AA 100%)",
    accentColor: "#EA580C",
    initials: "DO",
    expertise: ["Robotics & IoT", "Maker Pedagogy", "Girls in STEM"],
    featuredEpisodes: ["Episode 08: Can Robotics Change How Children Learn?"],
    featuredEpisodeId: "ep-08",
    linkedin: "https://www.linkedin.com",
    twitter: "https://twitter.com"
  },
  {
    id: "guest-beatrice-achieng",
    name: "Prof. Beatrice Achieng",
    title: "Dean of Educational Measurement",
    organization: "Strathmore Institute of Education",
    bio: "Global authority on authentic assessment, psychometric modeling, and alternative credentialing systems for African secondary and tertiary institutions.",
    avatarBg: "linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)",
    accentColor: "#7C3AED",
    initials: "BA",
    expertise: ["Authentic Assessment", "Psychometrics", "Institutional Leadership"],
    featuredEpisodes: ["Episode 09: Assessment Beyond the Exam"],
    featuredEpisodeId: "ep-09",
    linkedin: "https://www.linkedin.com",
    twitter: "https://twitter.com"
  },
  {
    id: "guest-julius-kariuki",
    name: "Prof. Julius Kariuki",
    title: "Author & Future of Learning Strategist",
    organization: "African Education Futures Think Tank",
    bio: "Distinguished researcher and author on 21st-century educational paradigms, advising governments across Africa on long-term human capital roadmaps.",
    avatarBg: "linear-gradient(135deg, #FFE4E6 0%, #FECDD3 100%)",
    accentColor: "#E11D48",
    initials: "JK",
    expertise: ["Future Foresight", "Teacher Transformation", "Strategic Policy"],
    featuredEpisodes: ["Episode 10: What Will the Teacher of 2035 Look Like?"],
    featuredEpisodeId: "ep-10",
    linkedin: "https://www.linkedin.com",
    twitter: "https://twitter.com"
  }
];
