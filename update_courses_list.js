const fs = require('fs');
const path = require('path');

const filePath = path.join('c:\\instructify', 'js', 'courses.js');
let content = fs.readFileSync(filePath, 'utf8');

const newCoursesCode = `window.COURSES = [
  {
    id: 'crs_001', slug: 'digital-literacy-skills',
    title: 'Digital Literacy Skills',
    category: 'Digital Skills', tag: 'badge-cpd',
    description: 'Build a solid foundation in essential digital skills. This course covers everything from basic computer navigation to internet safety, empowering you to thrive in today’s digital-first world.',
    instructor: 'Mr. Kamau Njoroge', instructorTitle: 'Digital Skills Trainer', instructorAvatar: 'KN',
    duration: '6 weeks', level: 'Beginner', format: 'Online',
    price: 8500, originalPrice: 14000,
    rating: 4.9, reviewCount: 523, enrollments: 3204,
    image: 'assets/images/course-digital.png',
    badge: 'badge-cpd', badgeText: 'CPD',
    cpd: true, cpdHours: 30,
    outcomes: [
      'Navigate operating systems and basic software with confidence.',
      'Practice safe and responsible internet usage.',
      'Manage digital communications and basic file organization.',
      'Utilize fundamental productivity tools for daily tasks.'
    ],
    modules: 8, assignments: 4, quizzes: 3, certificate: true,
    schedule: '2026-09-15', tags: ['Digital Literacy', 'ICT', 'Beginner', 'Teachers', 'Parents'],
    featured: true, popular: true
  },
  {
    id: 'crs_002', slug: 'ict-integration-teaching-learning',
    title: 'ICT Integration in Teaching and Learning',
    category: 'ICT', tag: 'badge-ict',
    description: 'Transform your classroom by seamlessly blending technology with pedagogy. Learn to use digital tools, interactive software, and online resources to create engaging and effective learning experiences.',
    instructor: 'Dr. Wanjiku Kamau', instructorTitle: 'ICT Education Specialist', instructorAvatar: 'WK',
    duration: '8 weeks', level: 'Intermediate', format: 'Online + Blended',
    price: 15000, originalPrice: 22000,
    rating: 4.8, reviewCount: 312, enrollments: 1847,
    image: 'assets/images/course-ict.png',
    badge: 'badge-ict', badgeText: 'ICT',
    cpd: true, cpdHours: 40,
    outcomes: [
      'Align digital tools with curriculum objectives.',
      'Design interactive, technology-enhanced lesson plans.',
      'Evaluate and select appropriate educational software.',
      'Improve learner engagement through multimedia resources.'
    ],
    modules: 12, assignments: 6, quizzes: 4, certificate: true,
    schedule: '2026-09-01', tags: ['ICT', 'CBC', 'Technology', 'Teachers'],
    featured: true, popular: true
  },
  {
    id: 'crs_003', slug: 'cpd-for-teachers',
    title: 'CPD for Teachers',
    category: 'CPD', tag: 'badge-cpd',
    description: 'A structured Continuous Professional Development program designed to help you meet teaching standards, engage in reflective practice, and map out your professional growth.',
    instructor: 'Mrs. Rahel Tesfaye', instructorTitle: 'CPD Facilitator', instructorAvatar: 'RT',
    duration: '4 weeks', level: 'Beginner', format: 'Online',
    price: 6500, originalPrice: 10000,
    rating: 4.5, reviewCount: 612, enrollments: 4231,
    image: 'assets/images/about.png',
    badge: 'badge-cpd', badgeText: 'CPD',
    cpd: true, cpdHours: 20,
    outcomes: [
      'Build a comprehensive professional teaching portfolio.',
      'Meet national CPD and certification requirements.',
      'Develop a habit of reflective and adaptive teaching practice.',
      'Chart a clear pathway for ongoing career advancement.'
    ],
    modules: 6, assignments: 3, quizzes: 2, certificate: true,
    schedule: '2026-09-08', tags: ['CPD', 'Professional', 'Teachers'],
    featured: false, popular: true
  },
  {
    id: 'crs_004', slug: 'coding-and-ai-skills',
    title: 'Coding and AI Skills',
    category: 'AI & Tech', tag: 'badge-ai',
    description: 'Demystify the languages of the future. This course introduces the fundamentals of coding and Artificial Intelligence, teaching you how to apply these concepts to solve real-world problems.',
    instructor: 'Dr. Muthoni Kariuki', instructorTitle: 'AI in Education Researcher', instructorAvatar: 'MK',
    duration: '8 weeks', level: 'Intermediate', format: 'Online',
    price: 22000, originalPrice: 35000,
    rating: 4.9, reviewCount: 178, enrollments: 896,
    image: 'assets/images/course-ai.png',
    badge: 'badge-ai', badgeText: 'AI',
    cpd: true, cpdHours: 40,
    outcomes: [
      'Understand fundamental programming concepts and logic.',
      'Explore basic Artificial Intelligence models and their applications.',
      'Develop problem-solving skills through hands-on coding projects.',
      'Prepare learners for future technological advancements.'
    ],
    modules: 10, assignments: 5, quizzes: 4, certificate: true,
    schedule: '2026-09-08', tags: ['AI', 'Coding', 'Teachers', 'Parents'],
    featured: true, popular: true, new: true
  },
  {
    id: 'crs_005', slug: 'nurturing-creativity-children',
    title: 'Nurturing Creativity in Children',
    category: 'Pedagogy', tag: 'badge-cbe',
    description: 'Unlock the creative potential of the next generation. Learn practical strategies to encourage imagination, divergent thinking, and artistic expression in young minds.',
    instructor: 'Ms. Grace Wahu', instructorTitle: 'Early Childhood Specialist', instructorAvatar: 'GW',
    duration: '6 weeks', level: 'Beginner', format: 'Online',
    price: 12000, originalPrice: 18000,
    rating: 4.8, reviewCount: 215, enrollments: 1102,
    image: 'assets/images/course-cbe.png',
    badge: 'badge-cbe', badgeText: 'CBE',
    cpd: true, cpdHours: 30,
    outcomes: [
      'Identify the key stages of creative development in children.',
      'Design environments that foster open-ended exploration.',
      'Use play-based activities to stimulate imagination.',
      'Support and guide divergent problem-solving.'
    ],
    modules: 8, assignments: 4, quizzes: 3, certificate: true,
    schedule: '2026-10-05', tags: ['Creativity', 'Parents', 'Teachers', 'Early Childhood'],
    featured: false, popular: false
  },
  {
    id: 'crs_006', slug: 'digital-storytelling-education',
    title: 'Digital Storytelling in Education',
    category: 'Digital Skills', tag: 'badge-cpd',
    description: 'Bring lessons to life through the power of narrative. Learn how to combine traditional storytelling techniques with modern multimedia tools to create compelling educational content.',
    instructor: 'Mr. David Ochieng', instructorTitle: 'Multimedia Educator', instructorAvatar: 'DO',
    duration: '5 weeks', level: 'Intermediate', format: 'Online + Blended',
    price: 14000, originalPrice: 20000,
    rating: 4.7, reviewCount: 198, enrollments: 856,
    image: 'assets/images/course-digital.png',
    badge: 'badge-cpd', badgeText: 'CPD',
    cpd: true, cpdHours: 25,
    outcomes: [
      'Understand the core elements of a compelling narrative.',
      'Utilize video, audio, and graphic tools to construct stories.',
      'Enhance student comprehension and retention through storytelling.',
      'Guide students in creating their own digital narratives.'
    ],
    modules: 7, assignments: 3, quizzes: 2, certificate: true,
    schedule: '2026-10-12', tags: ['Storytelling', 'Multimedia', 'Teachers'],
    featured: true, popular: false
  },
  {
    id: 'crs_007', slug: 'tech-higher-order-thinking',
    title: 'Using Technology to Promote Higher Order Thinking',
    category: 'Pedagogy', tag: 'badge-ict',
    description: 'Move beyond rote memorization. Discover how to leverage technology to foster critical thinking, analysis, evaluation, and creation in your students.',
    instructor: 'Prof. Achieng Ouma', instructorTitle: 'Curriculum Expert', instructorAvatar: 'AO',
    duration: '8 weeks', level: 'Advanced', format: 'Blended',
    price: 18500, originalPrice: 28000,
    rating: 4.8, reviewCount: 345, enrollments: 1205,
    image: 'assets/images/course-ict.png',
    badge: 'badge-ict', badgeText: 'ICT',
    cpd: true, cpdHours: 40,
    outcomes: [
      'Map digital tools to Bloom’s Taxonomy.',
      'Design technology-based assignments that require analytical thinking.',
      'Use collaborative platforms for peer evaluation and synthesis.',
      'Assess higher-order thinking through digital portfolios and projects.'
    ],
    modules: 10, assignments: 6, quizzes: 4, certificate: true,
    schedule: '2026-10-20', tags: ['Pedagogy', 'Critical Thinking', 'Teachers'],
    featured: false, popular: true
  },
  {
    id: 'crs_008', slug: 'mentorship-coaching-teachers',
    title: 'Mentorship and Coaching for Teachers',
    category: 'Leadership', tag: 'badge-cpd',
    description: 'Elevate the teaching profession through effective peer support. This program equips experienced educators with the skills to mentor, coach, and inspire their colleagues.',
    instructor: 'Prof. Samuel Maina', instructorTitle: 'Educational Leadership Expert', instructorAvatar: 'SM',
    duration: '10 weeks', level: 'Advanced', format: 'Blended',
    price: 25000, originalPrice: 40000,
    rating: 4.9, reviewCount: 412, enrollments: 1568,
    image: 'assets/images/about.png',
    badge: 'badge-cpd', badgeText: 'CPD',
    cpd: true, cpdHours: 50,
    outcomes: [
      'Differentiate between mentoring and coaching frameworks.',
      'Develop active listening and constructive feedback skills.',
      'Guide peers in setting and achieving professional goals.',
      'Foster a collaborative and supportive school culture.'
    ],
    modules: 12, assignments: 8, quizzes: 5, certificate: true,
    schedule: '2026-11-01', tags: ['Leadership', 'Mentorship', 'Teachers'],
    featured: true, popular: false
  },
  {
    id: 'crs_009', slug: 'teach-computers-young-children',
    title: 'How to Teach Computers to Young Children',
    category: 'Digital Skills', tag: 'badge-cbe',
    description: 'Introduce early learners to the digital world safely and effectively. Learn age-appropriate methods to teach basic computer literacy, hardware interaction, and foundational tech concepts.',
    instructor: 'Mrs. Jane Wamalwa', instructorTitle: 'Early Years Tech Educator', instructorAvatar: 'JW',
    duration: '5 weeks', level: 'Beginner', format: 'Online',
    price: 9000, originalPrice: 15000,
    rating: 4.7, reviewCount: 150, enrollments: 680,
    image: 'assets/images/course-digital.png',
    badge: 'badge-cbe', badgeText: 'CBE',
    cpd: true, cpdHours: 25,
    outcomes: [
      'Select age-appropriate hardware and software for young learners.',
      'Teach basic mouse and keyboard skills through interactive play.',
      'Establish foundational screen-time and digital safety rules.',
      'Integrate early tech skills seamlessly into standard play activities.'
    ],
    modules: 6, assignments: 3, quizzes: 2, certificate: true,
    schedule: '2026-11-10', tags: ['Early Childhood', 'Digital Skills', 'Parents', 'Teachers'],
    featured: false, popular: true
  }
];`;

content = content.replace(/window\.COURSES = \[[^]*?\];/, newCoursesCode);
fs.writeFileSync(filePath, content);
console.log('Courses replaced!');
