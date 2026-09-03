/**
 * INSTRUCTIFY KENYA PODCAST — DATA ENGINE v1.0
 * Modular, extensible repository of podcast episodes, host details, guest directory,
 * categories, streaming links, transcripts, and course tie-ins.
 */

const PODCAST_INFO = {
  name: "The Instructify Kenya Podcast",
  tagline: "Conversations for a Smarter Future",
  alternativeTagline: "Learn. Connect. Innovate. Transform.",
  description: "Where education, technology, innovation and human potential come together. Discover practical insights, inspiring stories and meaningful conversations shaping the future of learning and work.",
  host: {
    name: "Alex Nderitu",
    title: "Lead Educator & EdTech Strategist, Instructify Kenya",
    bio: "Passionate about transforming education across East Africa through digital pedagogical innovations, teacher empowerment, and future-fit competency frameworks. Alex hosts industry leaders, researchers, and grassroot educators to uncover practical solutions for tomorrow's learners.",
    image: "assets/images/founder_alex.jpg",
    linkedin: "https://www.linkedin.com/",
    twitter: "https://twitter.com/",
    email: "podcast@instructify.co.ke"
  },
  streamingLinks: [
    { name: "Spotify", icon: "spotify", url: "#", badge: "Listen on Spotify" },
    { name: "Apple Podcasts", icon: "apple", url: "#", badge: "Apple Podcasts" },
    { name: "YouTube", icon: "youtube", url: "#", badge: "Watch on YouTube" },
    { name: "Google Podcasts", icon: "google", url: "#", badge: "Google Podcasts" },
    { name: "Amazon Music", icon: "amazon", url: "#", badge: "Amazon Music" }
  ],
  categories: [
    "All",
    "Education",
    "Technology",
    "AI & Innovation",
    "Leadership",
    "Digital Skills",
    "Entrepreneurship",
    "Career & Future Skills",
    "CBE & Curriculum",
    "EdTech"
  ]
};

const PODCAST_EPISODES = [
  {
    id: "ep-01",
    slug: "ai-in-education-preparing-learners",
    number: "Episode 01",
    episodeNum: 1,
    title: "AI in Education: Preparing Learners for the Future of Work",
    subtitle: "How generative AI, ethical adoption, and personalized tutoring are reshaping African classrooms.",
    description: "In this premiere episode, we sit down with Dr. Angela Mutua to unpack how Artificial Intelligence is moving from tech buzzword to essential classroom tool. We explore practical strategies teachers can use today, data privacy in schools, and the specific skillsets Kenyan learners need to thrive in an AI-powered economy.",
    category: "AI & Innovation",
    tags: ["Artificial Intelligence", "Future of Work", "EdTech", "Digital Skills"],
    date: "August 28, 2026",
    isoDate: "2026-08-28",
    duration: "42 min",
    durationSeconds: 2520,
    audioUrl: "https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg", // Sample audio placeholder
    featured: true,
    coverColor: "linear-gradient(135deg, #091929 0%, #1E3A8A 60%, #2145E6 100%)",
    themeColor: "#2145E6",
    guest: {
      name: "Dr. Angela Mutua",
      title: "Senior AI Researcher & EdTech Advisor",
      organization: "African Institute for Future Intelligence",
      bio: "Dr. Mutua is a leading voice on ethical AI deployment in emerging markets, advising national education ministries and UNESCO on digital literacy frameworks.",
      avatarBg: "linear-gradient(135deg, #EEF2FF 0%, #DBEAFE 100%)",
      initials: "AM"
    },
    takeaways: [
      "AI is an amplifier for human teachers, not a replacement — the focus must remain on critical thinking and pedagogical guidance.",
      "Basic AI literacy is now as crucial as foundational digital literacy for both primary and secondary educators.",
      "Schools must develop clear ethical AI policies focusing on academic integrity, data privacy, and inclusive access.",
      "Prompts engineering and problem decomposition are emerging as the most valuable meta-skills for students entering tertiary education."
    ],
    transcript: [
      { time: "00:00", timestampSeconds: 0, speaker: "Alex Nderitu (Host)", text: "Welcome to the very first episode of The Instructify Kenya Podcast. Today we are addressing the elephant in every staff room and boardroom: Artificial Intelligence." },
      { time: "02:15", timestampSeconds: 135, speaker: "Alex Nderitu (Host)", text: "Dr. Mutua, when educators hear 'AI in education', many worry about cheating or dehumanized learning. What is the reality on the ground?" },
      { time: "04:30", timestampSeconds: 270, speaker: "Dr. Angela Mutua", text: "Thank you, Alex. The reality is that AI is democratizing access to high-quality explanations and adaptive learning. A student in Machakos can now interact with a tailored tutor at their own pace." },
      { time: "09:45", timestampSeconds: 585, speaker: "Dr. Angela Mutua", text: "The real risk is not AI replacing teachers, but teachers who leverage AI replacing teachers who do not. We must invest heavily in Teacher Professional Development." },
      { time: "18:20", timestampSeconds: 1100, speaker: "Alex Nderitu (Host)", text: "Let's talk about the Competency-Based Curriculum (CBC) alignment. Where does AI fit into experiential, hands-on learning?" },
      { time: "24:10", timestampSeconds: 1450, speaker: "Dr. Angela Mutua", text: "CBC is fundamentally about core competencies like digital literacy, critical thinking, and creativity. Generative AI allows students to prototype concepts rapidly and analyze real-world community challenges." },
      { time: "35:50", timestampSeconds: 2150, speaker: "Alex Nderitu (Host)", text: "To close out, what is one tangible action a school principal can take this term to prepare their staff?" },
      { time: "38:15", timestampSeconds: 2295, speaker: "Dr. Angela Mutua", text: "Start with structured staff workshops. Demystify the tools, create a safe sandbox for experimentation, and formulate clear guidelines on transparent AI use." }
    ],
    relatedCourse: {
      title: "AI in Education: Teacher's Masterclass",
      category: "Professional Development",
      link: "courses.html"
    }
  },
  {
    id: "ep-02",
    slug: "future-of-competency-based-learning",
    number: "Episode 02",
    episodeNum: 2,
    title: "The Future of Competency-Based Learning in Africa",
    subtitle: "Transitioning from rote memorization to practical, skill-centered education systems.",
    description: "Curriculum specialist Michael Otieno breaks down the transformative shift happening across Kenya's schools under the Competency-Based Curriculum (CBC). Discover how authentic assessments, community service learning, and digital portfolios measure real human growth.",
    category: "CBE & Curriculum",
    tags: ["CBC", "Curriculum", "Pedagogy", "Education Reform"],
    date: "August 21, 2026",
    isoDate: "2026-08-21",
    duration: "38 min",
    durationSeconds: 2280,
    audioUrl: "https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg",
    featured: true,
    coverColor: "linear-gradient(135deg, #064E3B 0%, #183AD6 60%, #3C3DDC 100%)",
    themeColor: "#183AD6",
    guest: {
      name: "Michael Otieno",
      title: "Curriculum Innovation Specialist & Former KICD Consultant",
      organization: "Center for Educational Transformation",
      bio: "Michael has spent 18 years designing learning frameworks, training headteachers, and evaluating instructional materials across Kenya and East Africa.",
      avatarBg: "linear-gradient(135deg, #CCFBF1 0%, #99F6E4 100%)",
      initials: "MO"
    },
    takeaways: [
      "Competency-based education shifts the measure of success from memorization exams to demonstrable problem-solving capabilities.",
      "Community Service Learning (CSL) bridges the gap between academic theory and local community development.",
      "Formative assessment through digital portfolios provides richer longitudinal data on student talents than single summative tests.",
      "Parental engagement is the cornerstone of sustainable competency-based learning transitions."
    ],
    transcript: [
      { time: "00:00", timestampSeconds: 0, speaker: "Alex Nderitu (Host)", text: "Welcome back. Today we dive deep into the philosophy and practice of Competency-Based Education with Michael Otieno." },
      { time: "03:10", timestampSeconds: 190, speaker: "Michael Otieno", text: "The greatest gift of CBC is that it recognizes multiple pathways. Not every child is a pure academic theorist; some are innovators, artists, engineers, and social leaders." },
      { time: "12:40", timestampSeconds: 760, speaker: "Michael Otieno", text: "Teachers are moving from 'sage on the stage' to 'facilitator on the side'. That requires unlearning decades of traditional teaching habits." }
    ],
    relatedCourse: {
      title: "CBC Alignment & Formative Assessment Mastery",
      category: "Curriculum Design",
      link: "courses.html"
    }
  },
  {
    id: "ep-03",
    slug: "skills-employers-will-need-tomorrow",
    number: "Episode 03",
    episodeNum: 3,
    title: "From Classroom to Boardroom: The Skills Employers Will Need Tomorrow",
    subtitle: "Closing the gap between graduate capabilities and high-growth industry demands.",
    description: "Corporate talent leader Sarah Wanjiku joins us to discuss what top employers, tech startups, and multinationals actually look for in modern recruits. From emotional intelligence to agile problem solving, discover the hybrid skill stack required for modern career longevity.",
    category: "Career & Future Skills",
    tags: ["Leadership", "Career", "Workplace Skills", "Talent Development"],
    date: "August 14, 2026",
    isoDate: "2026-08-14",
    duration: "45 min",
    durationSeconds: 2700,
    audioUrl: "https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg",
    featured: true,
    coverColor: "linear-gradient(135deg, #3B0764 0%, #CC3E00 60%, #FF4D00 100%)",
    themeColor: "#FF4D00",
    guest: {
      name: "Sarah Wanjiku",
      title: "Chief People & Talent Officer",
      organization: "FinTech Horizons Africa",
      bio: "Sarah oversees talent acquisition and leadership development across Kenya, Nigeria, and South Africa, focusing on emerging tech careers.",
      avatarBg: "linear-gradient(135deg, #F3EEFF 0%, #DDD6FE 100%)",
      initials: "SW"
    },
    takeaways: [
      "Technical skills get you in the door; adaptability, emotional intelligence, and cross-functional communication determine leadership trajectory.",
      "The half-life of technical skills is now under 3 years, making 'learning agility' the number one skill for the modern workforce.",
      "Collaborative problem-solving in hybrid and remote teams is an indispensable workplace competency.",
      "Internships and practical project-based learning must begin early in secondary and tertiary schooling."
    ],
    transcript: [
      { time: "00:00", timestampSeconds: 0, speaker: "Alex Nderitu (Host)", text: "Today on Instructify Kenya Podcast, we bridge the classroom and the corporate boardroom with Sarah Wanjiku." },
      { time: "04:00", timestampSeconds: 240, speaker: "Sarah Wanjiku", text: "When we review hundreds of applications, top degrees alone do not differentiate candidates. We look for evidence of self-directed projects and curiosity." }
    ],
    relatedCourse: {
      title: "Leadership & Future-Proof Career Capabilities",
      category: "Executive Learning",
      link: "consultancy.html"
    }
  },
  {
    id: "ep-04",
    slug: "digital-literacy-and-smart-schools",
    number: "Episode 04",
    episodeNum: 4,
    title: "Digital Literacy & Smart Schools: Overcoming the Infrastructure Divide",
    subtitle: "Practical, cost-effective strategies to build high-impact digital learning environments.",
    description: "Eng. David Kiprono shares real-world case studies of schools that transformed their learning outcomes with low-cost offline servers, solar-powered labs, and interactive smart displays.",
    category: "EdTech",
    tags: ["Smart Classrooms", "Infrastructure", "Digital Inclusion", "Hardware"],
    date: "August 07, 2026",
    isoDate: "2026-08-07",
    duration: "36 min",
    durationSeconds: 2160,
    audioUrl: "https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg",
    featured: false,
    coverColor: "linear-gradient(135deg, #78350F 0%, #D97706 60%, #F59E0B 100%)",
    themeColor: "#D97706",
    guest: {
      name: "Eng. David Kiprono",
      title: "EdTech Infrastructure Architect & Smart Lab Pioneer",
      organization: "Digital Schools Africa",
      bio: "David has spearheaded the deployment of over 120 smart classrooms and localized LMS nodes in rural and urban schools across Kenya.",
      avatarBg: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)",
      initials: "DK"
    },
    takeaways: [
      "Hardware without pedagogical training creates expensive paperweights; teacher enablement must receive 60% of EdTech budgets.",
      "Offline content caching (Kolibri, localized LMS) solves 80% of rural connectivity limitations.",
      "Interactive displays increase classroom engagement metrics by up to 300% when paired with CBC content."
    ],
    transcript: [
      { time: "00:00", timestampSeconds: 0, speaker: "Alex Nderitu (Host)", text: "Welcome to Episode 04. Today we discuss pragmatic digital infrastructure in Kenyan schools." },
      { time: "05:15", timestampSeconds: 315, speaker: "Eng. David Kiprono", text: "You don't need fiber optic internet to run a world-class smart classroom. We are caching thousands of interactive modules on local Raspberry Pi servers." }
    ],
    relatedCourse: {
      title: "Smart Classroom Deployment & Digital Lab Setup",
      category: "Institutional Advisory",
      link: "schools.html"
    }
  },
  {
    id: "ep-05",
    slug: "entrepreneurship-technology-and-youth-opportunity",
    number: "Episode 05",
    episodeNum: 5,
    title: "Entrepreneurship, Technology and Youth Opportunity in Kenya",
    subtitle: "Empowering the next generation of builders, problem-solvers, and venture creators.",
    description: "Startup founder and youth mentor Brenda Achieng discusses why entrepreneurial thinking must be cultivated in secondary schools. Learn how hackathons, student enterprises, and tech incubators ignite lifelong economic resilience.",
    category: "Entrepreneurship",
    tags: ["Youth Empowerment", "Startups", "Innovation", "Venture Building"],
    date: "July 31, 2026",
    isoDate: "2026-07-31",
    duration: "40 min",
    durationSeconds: 2400,
    audioUrl: "https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg",
    featured: false,
    coverColor: "linear-gradient(135deg, #0F172A 0%, #0369A1 60%, #0284C7 100%)",
    themeColor: "#0284C7",
    guest: {
      name: "Brenda Achieng",
      title: "Founder & Ecosystem Builder",
      organization: "KaziLab Youth Innovation Hub",
      bio: "Brenda has mentored over 5,000 young entrepreneurs across Nairobi, Kisumu, and Mombasa, helping youth launch viable digital ventures.",
      avatarBg: "linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)",
      initials: "BA"
    },
    takeaways: [
      "Entrepreneurship is not just about starting businesses; it is an attitude of value creation and grit.",
      "Youth need safe spaces to fail fast, prototype solutions, and receive constructive feedback from industry mentors.",
      "Combining coding or digital skills with business literacy creates immediate monetization opportunities for youth."
    ],
    transcript: [
      { time: "00:00", timestampSeconds: 0, speaker: "Alex Nderitu (Host)", text: "Welcome to Episode 05 with the remarkable Brenda Achieng, exploring youth entrepreneurship." },
      { time: "06:30", timestampSeconds: 390, speaker: "Brenda Achieng", text: "When young people realize that community challenges are actually business opportunities in disguise, everything changes." }
    ],
    relatedCourse: {
      title: "Youth Digital Entrepreneurship & Startup Foundations",
      category: "Innovation Lab",
      link: "community.html"
    }
  },
  {
    id: "ep-06",
    slug: "what-does-the-classroom-of-tomorrow-look-like",
    number: "Episode 06",
    episodeNum: 6,
    title: "What Does the Classroom of Tomorrow Look Like?",
    subtitle: "VR headsets, AI co-pilots, hybrid spaces, and the human heart of pedagogy.",
    description: "Prof. Julius Kariuki paints a compelling, practical vision of African learning spaces over the next 15 years. How will immersive virtual realities, global collaborative projects, and automated assessment tools reshape the student journey?",
    category: "Education",
    tags: ["Future of Learning", "VR in Education", "Hybrid Pedagogy", "EdTech"],
    date: "July 24, 2026",
    isoDate: "2026-07-24",
    duration: "48 min",
    durationSeconds: 2880,
    audioUrl: "https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg",
    featured: false,
    coverColor: "linear-gradient(135deg, #1E1B4B 0%, #4338CA 60%, #2145E6 100%)",
    themeColor: "#4F46E5",
    guest: {
      name: "Prof. Julius Kariuki",
      title: "Dean of Educational Technology & Future Pedagogy",
      organization: "East African University of Technology",
      bio: "Prof. Kariuki is an internationally published author on educational paradigms and the architect of numerous cross-border hybrid learning pilots.",
      avatarBg: "linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)",
      initials: "JK"
    },
    takeaways: [
      "Classrooms of the future are collaborative studios rather than lecture halls with fixed forward-facing desks.",
      "Immersive technologies like ClassVR allow biology and geography students to experience virtual field trips at near zero cost.",
      "Teachers become chief learning experience designers, orchestrating individualized learning journeys."
    ],
    transcript: [
      { time: "00:00", timestampSeconds: 0, speaker: "Alex Nderitu (Host)", text: "Welcome to Episode 06. Today we look forward 10 to 15 years with Prof. Julius Kariuki." },
      { time: "08:15", timestampSeconds: 495, speaker: "Prof. Julius Kariuki", text: "Technology is not an end in itself. The classroom of tomorrow is hyper-connected digitally, but deeply human and relational at its core." }
    ],
    relatedCourse: {
      title: "Interactive Content & ClassVR Pedagogy",
      category: "Smart Classrooms",
      link: "schools.html"
    }
  }
];

const PODCAST_VOICES = [
  {
    name: "Dr. Angela Mutua",
    role: "Senior AI Researcher",
    org: "African Institute for Future Intelligence",
    tag: "Technology & AI",
    avatarBg: "linear-gradient(135deg, #EEF2FF 0%, #DBEAFE 100%)",
    accentColor: "#2145E6",
    initials: "AM",
    episodeId: "ep-01"
  },
  {
    name: "Michael Otieno",
    role: "Curriculum Innovation Specialist",
    org: "Center for Educational Transformation",
    tag: "CBE & Curriculum",
    avatarBg: "linear-gradient(135deg, #CCFBF1 0%, #99F6E4 100%)",
    accentColor: "#183AD6",
    initials: "MO",
    episodeId: "ep-02"
  },
  {
    name: "Sarah Wanjiku",
    role: "Chief Talent Officer",
    org: "FinTech Horizons Africa",
    tag: "Leadership & Skills",
    avatarBg: "linear-gradient(135deg, #F3EEFF 0%, #DDD6FE 100%)",
    accentColor: "#FF4D00",
    initials: "SW",
    episodeId: "ep-03"
  },
  {
    name: "Eng. David Kiprono",
    role: "Smart Lab Architect",
    org: "Digital Schools Africa",
    tag: "EdTech & Infrastructure",
    avatarBg: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)",
    accentColor: "#D97706",
    initials: "DK",
    episodeId: "ep-04"
  }
];
