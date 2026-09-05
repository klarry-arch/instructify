/**
 * INSTRUCTIFY KENYA KNOWLEDGE HUB — DATA REPOSITORY v1.0
 * Modular, extensible repository of blog articles, authors, categories,
 * reading times, key takeaways, downloadable resources, and podcast cross-links.
 */

const BLOG_INFO = {
  name: "The Instructify Kenya Knowledge Hub",
  tagline: "Ideas, Insights & Knowledge for a Changing World",
  subtitle: "Explore practical insights, expert perspectives and emerging ideas across education, technology, innovation, digital skills, leadership and the future of work.",
  categories: [
    "All",
    "Education",
    "Technology",
    "Artificial Intelligence",
    "Digital Skills",
    "EdTech",
    "CBE & Curriculum",
    "Innovation",
    "Leadership",
    "Entrepreneurship",
    "Career & Future Skills",
    "ICT",
    "Research & Insights"
  ],
  authors: {
    "alex-nderitu": {
      name: "Alex Nderitu",
      title: "Lead Educator & EdTech Strategist",
      organization: "Instructify Kenya",
      bio: "Alex is an educational innovator with over 12 years of experience designing teacher CPD programs, digital learning labs, and future-fit competency frameworks across East Africa.",
      avatar: "assets/images/founder_alex.jpg",
      initials: "AN",
      linkedin: "https://www.linkedin.com/"
    },
    "dr-angela-mutua": {
      name: "Dr. Angela Mutua",
      title: "Senior AI Researcher & EdTech Advisor",
      organization: "African Institute for Future Intelligence",
      bio: "Dr. Mutua advises education ministries and international organizations on ethical AI deployment, curriculum data governance, and scalable digital literacy in emerging economies.",
      avatar: "",
      initials: "AM",
      linkedin: "https://www.linkedin.com/"
    },
    "michael-otieno": {
      name: "Michael Otieno",
      title: "Curriculum Innovation Specialist",
      organization: "Center for Educational Transformation",
      bio: "Michael specializes in Competency-Based Curriculum (CBC) evaluation, formative assessment design, and teacher capacity building.",
      avatar: "",
      initials: "MO",
      linkedin: "https://www.linkedin.com/"
    },
    "sarah-wanjiku": {
      name: "Sarah Wanjiku",
      title: "Chief Talent & Leadership Officer",
      organization: "FinTech Horizons Africa",
      bio: "Sarah writes on organizational culture, hybrid leadership, and the critical meta-skills required to thrive in modern African knowledge economies.",
      avatar: "",
      initials: "SW",
      linkedin: "https://www.linkedin.com/"
    },
    "eng-david-kiprono": {
      name: "Eng. David Kiprono",
      title: "Smart Lab Architect & Digital Inclusion Pioneer",
      organization: "Digital Schools Africa",
      bio: "David has spearheaded the rollout of over 120 smart classroom labs and offline server meshes across rural and peri-urban Kenya.",
      avatar: "",
      initials: "DK",
      linkedin: "https://www.linkedin.com/"
    }
  }
};

const BLOG_ARTICLES = [
  {
    id: "ai-transforming-education",
    slug: "how-artificial-intelligence-is-transforming-education-in-africa",
    title: "How Artificial Intelligence Is Transforming Education in Africa",
    subtitle: "AI is changing how we teach, learn and work. Explore the opportunities, challenges and practical strategies educators and institutions can use to prepare learners for an AI-powered future.",
    category: "Artificial Intelligence",
    tags: ["Artificial Intelligence", "EdTech", "Future of Work", "Pedagogy"],
    authorId: "dr-angela-mutua",
    publishDate: "August 29, 2026",
    lastUpdated: "August 31, 2026",
    readTime: "7 min read",
    featured: true,
    trending: true,
    views: "3,420",
    coverImage: "assets/images/course-ai.png",
    coverGradient: "linear-gradient(135deg, #091929 0%, #1E3A8A 60%, #2145E6 100%)",
    themeColor: "#2145E6",
    excerpt: "Artificial Intelligence is no longer a distant theoretical concept in African education. From adaptive tutoring tools to localized assessment helpers, discover how educators are leveraging AI ethically to personalize learning.",
    keyTakeaways: [
      "AI serves as an intelligent pedagogical assistant, liberating teachers from repetitive administrative tasks to focus on mentorship.",
      "Early AI literacy must focus on critical evaluation, prompt decomposition, and ethical data privacy rather than blind tool usage.",
      "Low-bandwidth and offline AI model distillation can bridge equity gaps between elite urban academies and remote rural schools.",
      "Institutional leaders need clear, written ethical AI adoption guidelines for staff and learners."
    ],
    downloadableResource: {
      title: "Institutional AI Adoption Checklist & Policy Framework (PDF)",
      description: "A comprehensive 12-point guide for school principals and academic directors to implement AI safely and productively.",
      filename: "Instructify_Kenya_AI_Adoption_Framework_2026.pdf"
    },
    podcastEpisodeId: "ep-01",
    relatedCourse: {
      title: "AI in Education: Teacher's Masterclass",
      category: "Professional Development",
      link: "courses.html"
    },
    content: `
      <h2>The Shift From Novelty to Necessity</h2>
      <p>Across Nairobi, Kigali, Lagos, and Johannesburg, the conversation around Artificial Intelligence in education has pivoted decisively. Two years ago, discussions were dominated by fears of academic dishonesty. Today, forward-thinking educators and policymakers recognize that preparing students for the 21st-century workforce without AI literacy is akin to teaching accounting without spreadsheets.</p>
      
      <p>The true promise of AI in the African context lies in its ability to address systemic educational challenges: large class sizes, uneven teacher distribution, and the scarcity of personalized learning support. When deployed thoughtfully, generative AI models can act as on-demand tutors, providing tailored explanations at a pace calibrated to each individual learner.</p>

      <blockquote>
        “The objective of AI in education is not to automate the sacred bond between teacher and student, but to amplify the human educator's capacity for individualized mentorship.”
      </blockquote>

      <h2>Four Core Pillars of Ethical AI in African Classrooms</h2>
      <p>To ensure that technology deepens learning rather than creates a facade of comprehension, institutions must ground their strategy in four practical pillars:</p>

      <h3>1. Human-Centered Pedagogical Integration</h3>
      <p>AI tools should never replace foundational critical thinking. Rather than asking AI to write an essay, students should use it to debate alternate viewpoints, brainstorm historical counterfactuals, or identify logical fallacies in complex arguments.</p>

      <h3>2. Foundational AI & Data Literacy</h3>
      <p>Students and teachers must understand that large language models are probabilistic text predictors, not omniscient knowledge oracles. Training must emphasize source verification, hallucination detection, and intellectual honesty.</p>

      <h3>3. Contextual and Linguistic Localization</h3>
      <p>Western-centric datasets often overlook African history, languages, and local socio-economic nuances. Progressive EdTech initiatives in Kenya are building fine-tuned models fluent in Swahili and aligned directly with the Competency-Based Curriculum (CBC).</p>

      <h3>4. Equitable Access and Offline Capabilities</h3>
      <p>The digital divide remains Africa's most urgent educational bottleneck. The future of equitable AI relies on compressed, quantized models running locally on low-cost edge servers or low-bandwidth mobile devices.</p>

      <h2>Practical Next Steps for School Administrators</h2>
      <p>Educational leaders looking to future-proof their institutions should take the following tangible actions this term:</p>
      <ul>
        <li><strong>Host safe experimentation sandboxes:</strong> Provide teachers with paid or vetted AI tool access and structured CPD time to explore lesson planning prompts.</li>
        <li><strong>Draft a transparent AI Honor Code:</strong> Define acceptable use for research, coding assistance, and homework collaboration with explicit attribution rules.</li>
        <li><strong>Engage parents:</strong> Demystify the tools for parents to ensure a consistent, supportive learning environment at home.</li>
      </ul>

      <h2>Conclusion</h2>
      <p>Artificial Intelligence will not replace great teachers, but teachers who master AI will inevitably replace those who do not. By embracing a proactive, culturally grounded, and ethically sound approach, Kenya can lead the continent in cultivating a generation of learners who do not merely consume AI, but actively build the intelligent systems of tomorrow.</p>
    `
  },
  {
    id: "rethinking-learning-digital-generation",
    slug: "rethinking-learning-for-the-digital-generation",
    title: "Rethinking Learning for the Digital Generation",
    subtitle: "Moving beyond passive rote memorization toward inquiry-driven, experiential pedagogy.",
    category: "Education",
    tags: ["Pedagogy", "Inquiry Learning", "Teacher CPD", "Active Learning"],
    authorId: "alex-nderitu",
    publishDate: "August 24, 2026",
    lastUpdated: "August 26, 2026",
    readTime: "6 min read",
    featured: false,
    trending: true,
    views: "2,890",
    coverImage: "assets/images/home_interactive_teaching.jpg",
    coverGradient: "linear-gradient(135deg, #064E3B 0%, #183AD6 60%, #3C3DDC 100%)",
    themeColor: "#183AD6",
    excerpt: "Today's learners have the world's knowledge in their pockets. How must our teaching methodologies evolve from transmitting information to cultivating deep inquiry, discernment, and creative synthesis?",
    keyTakeaways: [
      "Information scarcity is dead; the new educational imperative is information discernment and critical curation.",
      "Project-Based Learning (PBL) anchors abstract theoretical concepts in tangible community challenges.",
      "The teacher transitions from primary content provider to chief architect of active learning experiences.",
      "Formative micro-assessments provide immediate feedback loops that accelerate student mastery."
    ],
    downloadableResource: {
      title: "Inquiry-Based Lesson Design Template (PDF & DOCX)",
      description: "A ready-to-use lesson planning template designed for CBC-aligned inquiry sessions.",
      filename: "Instructify_Inquiry_Lesson_Template.pdf"
    },
    podcastEpisodeId: "ep-06",
    relatedCourse: {
      title: "Active Learning & Modern Pedagogical Frameworks",
      category: "Teacher Excellence",
      link: "courses.html"
    },
    content: `
      <h2>The Information Abundance Paradox</h2>
      <p>For centuries, the fundamental role of a school was to serve as a physical repository of scarce information, and the teacher as the authoritative conduit of knowledge. Today, a 12-year-old in Eldoret with a budget smartphone has instantaneous access to more raw data, video lectures, and historical archives than the Library of Alexandria ever contained.</p>

      <p>Yet, access to information is not equivalent to the possession of wisdom. In an era of rampant algorithmic distortion, deepfakes, and attention fragmentation, the traditional lecture-memorize-regurgitate paradigm has become thoroughly obsolete.</p>

      <h2>The Three Pillars of Modern Inquiry</h2>
      <p>To cultivate true intellectual agency, educators must redesign classroom experiences around three foundational shifts:</p>

      <h3>1. From Answers to Powerful Questions</h3>
      <p>Instead of grading students solely on memorized answers, assess their ability to formulate rigorous, nuanced questions. Great inquiry begins with provocative real-world prompts.</p>

      <h3>2. Authentic Project-Based Learning</h3>
      <p>When students apply scientific principles to test local water purity or utilize mathematical modeling to optimize a school garden yield, learning becomes intrinsically meaningful.</p>

      <h3>3. Collaborative Knowledge Construction</h3>
      <p>The workplace of tomorrow demands seamless cross-disciplinary collaboration. Group retrospectives and peer critique cultivate empathy and communication alongside academic rigor.</p>
    `
  },
  {
    id: "7-core-digital-skills-future-work",
    slug: "the-digital-skills-every-learner-needs-for-the-future-of-work",
    title: "The 7 Core Digital Skills Every African Learner Needs for the Future of Work",
    subtitle: "A roadmap of high-leverage technical and cognitive competencies for the 2030 knowledge economy.",
    category: "Digital Skills",
    tags: ["Future of Work", "Employability", "Coding", "Data Literacy"],
    authorId: "sarah-wanjiku",
    publishDate: "August 18, 2026",
    lastUpdated: "August 20, 2026",
    readTime: "8 min read",
    featured: false,
    trending: true,
    views: "4,150",
    coverImage: "assets/images/course_ict_integration.jpg",
    coverGradient: "linear-gradient(135deg, #3B0764 0%, #CC3E00 60%, #FF4D00 100%)",
    themeColor: "#FF4D00",
    excerpt: "From data fluency and cybersecurity hygiene to computational thinking and prompt engineering, explore the exact competencies that differentiate top graduates in today's dynamic global job market.",
    keyTakeaways: [
      "Digital literacy has evolved far beyond basic typing or word processing into algorithmic problem solving.",
      "Data literacy is now a baseline requirement across finance, agriculture, healthcare, and education.",
      "Cyber hygiene and personal data security protect both individual identity and organizational infrastructure.",
      "Hybrid communication and asynchronous collaboration are indispensable for global remote employment."
    ],
    downloadableResource: {
      title: "Digital Skills Career Matrix & Self-Assessment Guide (PDF)",
      description: "A benchmark rubric mapping digital capabilities to entry-level and leadership roles.",
      filename: "Instructify_Digital_Skills_Matrix_2026.pdf"
    },
    podcastEpisodeId: "ep-03",
    relatedCourse: {
      title: "Digital Skills & Workforce Readiness Certification",
      category: "Career Acceleration",
      link: "courses.html"
    },
    content: `
      <h2>Beyond Basic Computer Literacy</h2>
      <p>For over two decades, school computer syllabi were dominated by the mechanics of office suites: formatting paragraphs, calculating basic sums, and creating simple slide decks. While these remain useful hygiene skills, they no longer confer any competitive advantage in the modern employment ecosystem.</p>

      <h2>The 7 Essential Future Capabilities</h2>
      <ol>
        <li><strong>Computational Thinking & Algorithmic Logic:</strong> Decomposing complex socio-economic problems into structured, solvable steps.</li>
        <li><strong>Data Fluency & Visualization:</strong> Cleaning, analyzing, and communicating insights from messy datasets.</li>
        <li><strong>Generative AI & Prompt Engineering:</strong> Directing AI co-pilots to accelerate research, coding, and content drafting.</li>
        <li><strong>Cybersecurity Awareness & Digital Hygiene:</strong> Defending against social engineering, phishing, and data breaches.</li>
        <li><strong>Cloud & Collaborative Workspace Agility:</strong> Working frictionlessly in Git, cloud suites, and asynchronous platforms.</li>
        <li><strong>Digital Content Creation & Media Literacy:</strong> Communicating complex ideas compellingly through multimedia storytelling.</li>
        <li><strong>Continuous Learning Agility:</strong> The metacognitive ability to unlearn outdated software and master new platforms independently.</li>
      </ol>
    `
  },
  {
    id: "making-cbc-practical-through-technology",
    slug: "making-competency-based-learning-practical-through-technology",
    title: "Making Competency-Based Learning Practical Through Low-Cost Technology",
    subtitle: "How smart digital tools streamline continuous assessment and Community Service Learning.",
    category: "CBE & Curriculum",
    tags: ["CBC", "Formative Assessment", "Digital Portfolios", "Education Reform"],
    authorId: "michael-otieno",
    publishDate: "August 12, 2026",
    lastUpdated: "August 15, 2026",
    readTime: "6 min read",
    featured: false,
    trending: false,
    views: "2,190",
    coverImage: "assets/images/course_assessment_mastery.jpg",
    coverGradient: "linear-gradient(135deg, #78350F 0%, #D97706 60%, #F59E0B 100%)",
    themeColor: "#D97706",
    excerpt: "Teachers often struggle with the administrative burden of CBC formative tracking. Learn how lightweight digital portfolio tools and mobile rubrics simplify authentic student assessments.",
    keyTakeaways: [
      "Digital learner portfolios turn evidence of learning into longitudinal growth visualizers.",
      "Mobile-based scoring rubrics save teachers up to 6 hours per week in formative grade logging.",
      "Community Service Learning (CSL) documentation is enhanced through audio-visual student reflections.",
      "Parental engagement increases significantly when learning artifacts are shared transparently."
    ],
    downloadableResource: {
      title: "CBC Formative Assessment Digital Rubric Pack (Excel & PDF)",
      description: "Standardized rubric templates aligned with national core competencies.",
      filename: "Instructify_CBC_Digital_Rubrics.xlsx"
    },
    podcastEpisodeId: "ep-02",
    relatedCourse: {
      title: "CBC Alignment & Formative Assessment Mastery",
      category: "Curriculum Design",
      link: "courses.html"
    },
    content: `
      <h2>The Formative Assessment Bottleneck</h2>
      <p>The philosophical shift from the 8-4-4 system to the Competency-Based Curriculum (CBC) is widely applauded for centering learner talents, values, and practical application. However, the operational reality on the ground has imposed a colossal documentation burden on educators.</p>

      <p>When a teacher with 50 students in a classroom is asked to track seven core competencies across multiple strands using paper files, burnout is inevitable. Technology is the indispensable pressure valve.</p>
    `
  },
  {
    id: "how-smart-classrooms-transform-learning",
    slug: "how-technology-can-transform-the-modern-classroom",
    title: "How Technology Can Transform the Modern Classroom: From Chalk to Click",
    subtitle: "Interactive panels, ClassVR, and localized servers bringing abstract concepts to life.",
    category: "EdTech",
    tags: ["Smart Classrooms", "Interactive Displays", "ClassVR", "Hardware"],
    authorId: "eng-david-kiprono",
    publishDate: "August 05, 2026",
    lastUpdated: "August 08, 2026",
    readTime: "7 min read",
    featured: false,
    trending: false,
    views: "1,940",
    coverImage: "assets/images/course_smart_vr_classroom.jpg",
    coverGradient: "linear-gradient(135deg, #0F172A 0%, #1E3A8A 60%, #2145E6 100%)",
    themeColor: "#2563EB",
    excerpt: "Experience the transition from traditional blackboards to interactive digital teaching stations. Discover cost-effective hardware configurations and pedagogical workflows that ignite classroom curiosity.",
    keyTakeaways: [
      "Smart boards without interactive software are simply expensive chalkboards; teacher training is paramount.",
      "ClassVR headsets allow learners to visit the human bloodstream or ancient Egypt at zero travel cost.",
      "Offline content servers ensure rural schools maintain 100% curriculum availability regardless of grid connectivity."
    ],
    downloadableResource: {
      title: "Smart Classroom Setup & Budgeting Guide (PDF)",
      description: "Detailed hardware, networking, and software specifications for modern schools.",
      filename: "Instructify_Smart_Classroom_Guide.pdf"
    },
    podcastEpisodeId: "ep-04",
    relatedCourse: {
      title: "Digital Teaching & Smart Classroom Mastery",
      category: "Smart Classrooms",
      link: "schools.html"
    },
    content: `
      <h2>The Interactive Revolution</h2>
      <p>Classrooms are fundamentally sensory environments. When a biology teacher can rotate a 3D beating heart on an interactive display or take students on a virtual field trip through the Rift Valley using VR headsets, abstract concepts transform into visceral memories.</p>
    `
  },
  {
    id: "leading-schools-digital-transformation",
    slug: "leading-schools-and-organisations-through-digital-transformation",
    title: "Leading Schools and Organisations Through Digital Transformation",
    subtitle: "Strategic leadership principles for headteachers, directors, and institutional changemakers.",
    category: "Leadership",
    tags: ["Leadership", "Institutional Change", "Strategy", "School Management"],
    authorId: "alex-nderitu",
    publishDate: "July 28, 2026",
    lastUpdated: "July 30, 2026",
    readTime: "9 min read",
    featured: false,
    trending: false,
    views: "3,110",
    coverImage: "assets/images/home_digital_leadership.jpg",
    coverGradient: "linear-gradient(135deg, #1E1B4B 0%, #4338CA 60%, #2145E6 100%)",
    themeColor: "#4F46E5",
    excerpt: "Digital transformation is 20% about technology and 80% about culture, psychology, and leadership. Learn how visionary headteachers overcome staff resistance and build sustainable innovation cultures.",
    keyTakeaways: [
      "Top-down technology mandates fail; successful leaders empower internal teacher champions.",
      "Budget allocation must prioritize professional development over raw hardware acquisition.",
      "Transparent metric dashboards prove EdTech ROI to boards, parents, and donors."
    ],
    downloadableResource: {
      title: "School Digital Transformation Roadmap & Maturity Audit (PDF)",
      description: "A self-assessment tool to evaluate your institution's digital readiness.",
      filename: "Instructify_Digital_Maturity_Audit.pdf"
    },
    podcastEpisodeId: "ep-03",
    relatedCourse: {
      title: "Institutional Leadership & Digital Transformation Advisory",
      category: "Consultancy",
      link: "consultancy.html"
    },
    content: `
      <h2>The Leadership Dilemma</h2>
      <p>Many educational institutions invest millions of shillings in hardware, laptops, and internet lines only to find them gathering dust inside locked cabinets six months later. Technology procurement without a cultural transformation strategy is a recipe for fiscal and operational disillusionment.</p>
    `
  },
  {
    id: "nurturing-youth-innovation-entrepreneurship",
    slug: "from-ideas-to-enterprise-nurturing-youth-innovation",
    title: "From Ideas to Enterprise: Nurturing Youth Innovation & Tech Entrepreneurship",
    subtitle: "How schools and community hubs can spark real venture creation among young Africans.",
    category: "Entrepreneurship",
    tags: ["Youth", "Startups", "Innovation", "Venture Building"],
    authorId: "sarah-wanjiku",
    publishDate: "July 20, 2026",
    lastUpdated: "July 22, 2026",
    readTime: "7 min read",
    featured: false,
    trending: false,
    views: "2,460",
    coverImage: "assets/images/home_stem_collaboration.jpg",
    coverGradient: "linear-gradient(135deg, #0F172A 0%, #0369A1 60%, #0284C7 100%)",
    themeColor: "#0284C7",
    excerpt: "Africa's demographic dividend will only yield prosperity if we teach young people how to create value, not just seek employment. Discover how student hackathons, venture labs, and pitch days ignite enterprise.",
    keyTakeaways: [
      "Entrepreneurial mindset can and must be taught through structured problem-solving sprints.",
      "Youth need low-stakes environments to prototype solutions and experience constructive failure.",
      "Mentorship from active entrepreneurs accelerates student venture viability by 5x."
    ],
    downloadableResource: {
      title: "School Innovation Sprint & Hackathon Playbook (PDF)",
      description: "A step-by-step guide to hosting a 2-day student innovation sprint.",
      filename: "Instructify_Youth_Hackathon_Playbook.pdf"
    },
    podcastEpisodeId: "ep-05",
    relatedCourse: {
      title: "Youth Digital Entrepreneurship & Startup Foundations",
      category: "Innovation Lab",
      link: "community.html"
    },
    content: `
      <h2>Africa's Greatest Asset</h2>
      <p>With a median age of under 19 years, Africa possesses the youngest, most vibrant demographic base on the planet. Yet, conventional educational curricula too often train students to become passive CV-writers waiting for scarce corporate openings.</p>
    `
  },
  {
    id: "bridging-infrastructure-divide-offline-solutions",
    slug: "bridging-the-infrastructure-divide-offline-learning-solutions",
    title: "Bridging the Infrastructure Divide: Offline Learning Solutions That Actually Work",
    subtitle: "Delivering high-definition digital curricula without relying on expensive fiber internet.",
    category: "Research & Insights",
    tags: ["Digital Inclusion", "Offline Tech", "Rural Education", "Infrastructure"],
    authorId: "eng-david-kiprono",
    publishDate: "July 14, 2026",
    lastUpdated: "July 16, 2026",
    readTime: "8 min read",
    featured: false,
    trending: false,
    views: "2,050",
    coverImage: "assets/images/course-ict.png",
    coverGradient: "linear-gradient(135deg, #134E4A 0%, #183AD6 60%, #3C3DDC 100%)",
    themeColor: "#183AD6",
    excerpt: "We cannot afford to wait for universal fiber optic rollout before providing rural learners with world-class educational tools. Discover how edge caching, micro-servers, and solar battery rigs deliver equity today.",
    keyTakeaways: [
      "Offline server meshes (Kolibri, Raspberry Pi) store thousands of hours of video and interactive modules locally.",
      "Solar DC direct-power setups reduce operating costs by 70% compared to fossil fuel generators.",
      "Sync-and-go architectures update school servers periodically via mobile data hotspots."
    ],
    downloadableResource: {
      title: "Offline Learning Node Blueprint & Architecture Guide (PDF)",
      description: "Technical schematics and open-source software stack for remote classrooms.",
      filename: "Instructify_Offline_Node_Blueprint.pdf"
    },
    podcastEpisodeId: "ep-04",
    relatedCourse: {
      title: "Digital Infrastructure & Smart Lab Consultancy",
      category: "Institutional Advisory",
      link: "schools.html"
    },
    content: `
      <h2>The Realities of the African Grid</h2>
      <p>While urban centers in Kenya enjoy 5G connectivity and high-speed fiber, hundreds of schools across rural counties continue to grapple with intermittent power, high data costs, and zero fixed-line broadband.</p>
      <p>Waiting for national infrastructure equalization before digitizing classrooms is unacceptable. The engineering community has developed pragmatic, locally resilient edge architectures that bring world-class learning directly to where learners are.</p>
    `
  }
];
