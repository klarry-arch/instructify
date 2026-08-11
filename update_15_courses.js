const fs = require('fs');
const path = require('path');

const jsPath = path.join('c:\\instructify', 'js', 'courses.js');
let jsContent = fs.readFileSync(jsPath, 'utf8');

const newCoursesCode = `window.COURSES = [
  {
    id: 'crs_001', slug: 'digital-literacy-skills',
    title: 'Digital Literacy Skills',
    category: 'Digital Literacy',
    intro: 'Learn essential computer, internet, productivity, and online safety skills for everyday teaching and learning.',
    audience: 'Teachers, learners, parents, and beginners',
    duration: '4 weeks',
    format: 'Online or In-person',
    price: '8,500',
    ctaText: 'Enroll Now',
    image: 'assets/images/course-digital.png'
  },
  {
    id: 'crs_002', slug: 'ict-integration-teaching-learning',
    title: 'ICT Integration in Teaching and Learning',
    category: 'For Teachers',
    intro: 'Discover how to use technology to plan lessons, create digital resources, assess learners, and improve classroom engagement.',
    audience: 'Teachers and school leaders',
    duration: '6 weeks',
    format: 'Blended or School-based',
    price: '15,000',
    ctaText: 'Enroll Now',
    image: 'assets/images/course-ict.png'
  },
  {
    id: 'crs_003', slug: 'cpd-for-teachers',
    title: 'CPD for Teachers',
    category: 'For Teachers',
    intro: 'Strengthen your teaching practice through digital skills, classroom innovation, assessment strategies, and reflective learning.',
    audience: 'Teachers and educators',
    duration: '4 weeks',
    format: 'Online or In-person',
    price: '6,500',
    ctaText: 'Learn More',
    image: 'assets/images/about.png'
  },
  {
    id: 'crs_004', slug: 'coding-ai-skills-beginners',
    title: 'Coding and AI Skills for Beginners',
    category: 'Coding & AI',
    intro: 'Get started with coding, computational thinking, artificial intelligence, responsible AI use, and simple digital projects.',
    audience: 'Teachers, children, and beginners',
    duration: '6 weeks',
    format: 'Online or In-person',
    price: '22,000',
    ctaText: 'Enroll Now',
    image: 'assets/images/course-ai.png'
  },
  {
    id: 'crs_005', slug: 'nurturing-creativity-children',
    title: 'Nurturing Creativity in Children',
    category: 'For Children',
    intro: 'Learn how to use digital tools, games, storytelling, design, art, and creative projects to develop children’s imagination.',
    audience: 'Teachers, parents, and young learners',
    duration: '4 weeks',
    format: 'Online or School-based',
    price: '12,000',
    ctaText: 'Learn More',
    image: 'assets/images/course-cbe.png'
  },
  {
    id: 'crs_006', slug: 'digital-storytelling-education',
    title: 'Digital Storytelling in Education',
    category: 'For Teachers',
    intro: 'Use images, audio, video, animation, and presentations to create engaging educational stories.',
    audience: 'Teachers and learners',
    duration: '3 weeks',
    format: 'Online or blended',
    price: '14,000',
    ctaText: 'Enroll Now',
    image: 'assets/images/course-digital.png'
  },
  {
    id: 'crs_007', slug: 'tech-higher-order-thinking',
    title: 'Technology for Higher Order Thinking Skills',
    category: 'For Teachers',
    intro: 'Design technology-supported activities that promote critical thinking, creativity, collaboration, analysis, and problem-solving.',
    audience: 'Teachers and school leaders',
    duration: '4 weeks',
    format: 'Online or in-person',
    price: '18,500',
    ctaText: 'Learn More',
    image: 'assets/images/course-ict.png'
  },
  {
    id: 'crs_008', slug: 'mentorship-coaching-teachers',
    title: 'Mentorship and Coaching for Teachers',
    category: 'For Teachers',
    intro: 'Get practical coaching, classroom technology support, feedback, and peer learning to improve digital teaching confidence.',
    audience: 'Teachers and educators',
    duration: 'Flexible',
    format: 'Online, in-person, or school-based',
    price: '25,000',
    ctaText: 'Book Mentorship',
    image: 'assets/images/about.png'
  },
  {
    id: 'crs_009', slug: 'teach-computers-young-children',
    title: 'How to Teach Computers to Young Children',
    category: 'For Parents',
    intro: 'Learn playful, safe, age-appropriate methods for introducing computers, mouse skills, keyboard use, and digital safety.',
    audience: 'Early years teachers, parents, and caregivers',
    duration: '4 weeks',
    format: 'Online or In-person',
    price: '9,000',
    ctaText: 'Enroll Now',
    image: 'assets/images/course-digital.png'
  },
  {
    id: 'crs_010', slug: 'microsoft-office-educators',
    title: 'Microsoft Office and Productivity Tools for Educators',
    category: 'Digital Literacy',
    intro: 'Master Word, Excel, PowerPoint, and cloud collaboration tools to streamline lesson planning and school administration.',
    audience: 'Teachers and school administrators',
    duration: '5 weeks',
    format: 'Online',
    price: '10,500',
    ctaText: 'Enroll Now',
    image: 'assets/images/course-ict.png'
  },
  {
    id: 'crs_011', slug: 'online-safety-digital-citizenship',
    title: 'Online Safety and Digital Citizenship',
    category: 'Digital Literacy',
    intro: 'Equip learners with the knowledge to navigate the internet safely, protect privacy, and practice responsible digital citizenship.',
    audience: 'Teachers, parents, and schools',
    duration: '3 weeks',
    format: 'Online or School-based',
    price: '8,000',
    ctaText: 'Learn More',
    image: 'assets/images/course-digital.png'
  },
  {
    id: 'crs_012', slug: 'creative-digital-projects-children',
    title: 'Creative Digital Projects for Children',
    category: 'For Children',
    intro: 'Help children create posters, stories, drawings, animations, and simple presentations using engaging digital tools.',
    audience: 'Children (Ages 7-12)',
    duration: '4 weeks',
    format: 'Online',
    price: '12,500',
    ctaText: 'Enroll Now',
    image: 'assets/images/course-cbe.png'
  },
  {
    id: 'crs_013', slug: 'ai-tools-for-teachers',
    title: 'AI Tools for Teachers',
    category: 'For Teachers',
    intro: 'Discover how to use AI tools responsibly for lesson planning, content creation, assessment support, and teacher productivity.',
    audience: 'Teachers and educators',
    duration: '3 weeks',
    format: 'Online',
    price: '16,000',
    ctaText: 'Enroll Now',
    image: 'assets/images/course-ai.png'
  },
  {
    id: 'crs_014', slug: 'school-ict-leadership',
    title: 'School ICT Leadership and Digital Transformation',
    category: 'For Schools',
    intro: 'Guide your school through digital transformation with strategic ICT planning, infrastructure management, and staff training.',
    audience: 'School leaders and administrators',
    duration: '8 weeks',
    format: 'Blended',
    price: '35,000',
    ctaText: 'Book Training',
    image: 'assets/images/about.png'
  },
  {
    id: 'crs_015', slug: 'intro-robotics-computational-thinking',
    title: 'Introduction to Robotics and Computational Thinking',
    category: 'Coding & AI',
    intro: 'Introduce students to the exciting world of robotics, logic puzzles, and hands-on computational problem-solving.',
    audience: 'Teachers and learners',
    duration: '6 weeks',
    format: 'In-person or School-based',
    price: '28,000',
    ctaText: 'Enroll Now',
    image: 'assets/images/course-ai.png'
  }
];`;

jsContent = jsContent.replace(/window\.COURSES = \[[^]*?\];/, newCoursesCode);

// Update price rendering format
jsContent = jsContent.replace(/<strong style="color: #374151;">Price:<\/strong> KES \$\{course\.price\.toLocaleString\(\)\}/g, '<strong style="color: #374151;">Price:</strong> From KES ${course.price}');

fs.writeFileSync(jsPath, jsContent);
console.log('Updated courses.js with 15 courses and pricing format.');
