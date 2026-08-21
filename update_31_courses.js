const fs = require('fs');
const path = require('path');

const jsPath = path.join('c:\\instructify', 'js', 'courses.js');
let jsContent = fs.readFileSync(jsPath, 'utf8');

const newCoursesCode = `window.COURSES = [
  // --- FOR TEACHERS ---
  {
    id: 'crs_t1', slug: 'ict-integration-teaching-learning',
    title: 'ICT Integration in Teaching and Learning',
    category: 'For Teachers',
    intro: 'Learn how to use technology to plan lessons, create digital resources, assess learners, and improve classroom participation.',
    audience: 'Teachers and school leaders',
    duration: '6 weeks',
    format: 'Blended or school-based',
    price: 'From KES 15,000',
    ctaText: 'Enroll Now',
    image: 'assets/images/course-ict.png'
  },
  {
    id: 'crs_t2', slug: 'cpd-for-teachers',
    title: 'CPD for Teachers',
    category: 'For Teachers',
    intro: 'Strengthen your teaching practice through digital skills, classroom innovation, assessment strategies, and reflective learning.',
    audience: 'Teachers and educators',
    duration: '4 weeks',
    format: 'Online or in-person',
    price: 'From KES 6,500',
    ctaText: 'Learn More',
    image: 'assets/images/about.png'
  },
  {
    id: 'crs_t3', slug: 'ai-tools-teachers',
    title: 'AI Tools for Teachers',
    category: 'For Teachers',
    intro: 'Discover how to use AI tools responsibly for lesson planning, content creation, assessment support, and teacher productivity.',
    audience: 'Teachers and educators',
    duration: '3 weeks',
    format: 'Online',
    price: 'From KES 12,000',
    ctaText: 'Enroll Now',
    image: 'assets/images/course-ai.png'
  },
  {
    id: 'crs_t4', slug: 'digital-storytelling-education',
    title: 'Digital Storytelling in Education',
    category: 'For Teachers',
    intro: 'Use images, audio, video, animation, and presentations to create engaging educational stories.',
    audience: 'Teachers and learners',
    duration: '3 weeks',
    format: 'Online or blended',
    price: 'From KES 14,000',
    ctaText: 'Enroll Now',
    image: 'assets/images/course-digital.png'
  },
  {
    id: 'crs_t5', slug: 'tech-higher-order-thinking',
    title: 'Technology for Higher Order Thinking Skills',
    category: 'For Teachers',
    intro: 'Design technology-supported activities that promote critical thinking, creativity, collaboration, analysis, and problem-solving.',
    audience: 'Teachers and school leaders',
    duration: '4 weeks',
    format: 'Online or in-person',
    price: 'From KES 18,500',
    ctaText: 'Learn More',
    image: 'assets/images/course-ict.png'
  },
  {
    id: 'crs_t6', slug: 'mentorship-coaching-teachers',
    title: 'Mentorship and Coaching for Teachers',
    category: 'For Teachers',
    intro: 'Get practical coaching, classroom technology support, feedback, and peer learning to improve digital teaching confidence.',
    audience: 'Teachers and educators',
    duration: 'Flexible',
    format: 'Online, in-person, or school-based',
    price: 'From KES 25,000',
    ctaText: 'Book Mentorship',
    image: 'assets/images/about.png'
  },

  // --- FOR CHILDREN ---
  {
    id: 'crs_c1', slug: 'coding-for-kids',
    title: 'Coding for Kids',
    category: 'For Children',
    intro: 'Introduce children to coding through games, puzzles, block-based programming, logic, and creative projects.',
    audience: 'Children and beginners',
    duration: '6 weeks',
    format: 'Online or in-person',
    price: 'From KES 12,000',
    ctaText: 'Enroll Now',
    image: 'assets/images/course-ai.png'
  },
  {
    id: 'crs_c2', slug: 'creative-digital-projects-children',
    title: 'Creative Digital Projects for Children',
    category: 'For Children',
    intro: 'Help children create posters, stories, drawings, animations, and simple presentations using digital tools.',
    audience: 'Children and young learners',
    duration: '4 weeks',
    format: 'In-person or school-based',
    price: 'From KES 10,000',
    ctaText: 'Enroll Now',
    image: 'assets/images/course-cbe.png'
  },
  {
    id: 'crs_c3', slug: 'intro-ai-children',
    title: 'Introduction to AI for Children',
    category: 'For Children',
    intro: 'A simple and safe introduction to artificial intelligence using examples, games, and guided activities.',
    audience: 'Children and young learners',
    duration: '4 weeks',
    format: 'Online or in-person',
    price: 'From KES 14,000',
    ctaText: 'Learn More',
    image: 'assets/images/course-ai.png'
  },
  {
    id: 'crs_c4', slug: 'digital-storytelling-young-learners',
    title: 'Digital Storytelling for Young Learners',
    category: 'For Children',
    intro: 'Children learn to create stories using pictures, voice recordings, drawings, animations, and presentations.',
    audience: 'Children and young learners',
    duration: '3 weeks',
    format: 'Online or in-person',
    price: 'From KES 9,500',
    ctaText: 'Enroll Now',
    image: 'assets/images/course-digital.png'
  },
  {
    id: 'crs_c5', slug: 'computer-basics-children',
    title: 'Computer Basics for Children',
    category: 'For Children',
    intro: 'Introduce children to computer parts, mouse skills, keyboard use, basic typing, file handling, and safe computer habits.',
    audience: 'Young children and beginners',
    duration: '4 weeks',
    format: 'In-person',
    price: 'From KES 8,000',
    ctaText: 'Enroll Now',
    image: 'assets/images/course-ict.png'
  },
  {
    id: 'crs_c6', slug: 'intro-robotics-children',
    title: 'Introduction to Robotics and Computational Thinking',
    category: 'For Children',
    intro: 'Help children explore sequencing, logic, patterns, problem-solving, and simple robotics activities.',
    audience: 'Children and young learners',
    duration: '6 weeks',
    format: 'In-person or school-based',
    price: 'From KES 18,000',
    ctaText: 'Learn More',
    image: 'assets/images/course-ai.png'
  },

  // --- FOR PARENTS ---
  {
    id: 'crs_p1', slug: 'digital-parenting-online-safety',
    title: 'Digital Parenting and Online Safety',
    category: 'For Parents',
    intro: 'Learn how to guide children in safe, responsible, and balanced technology use at home.',
    audience: 'Parents and caregivers',
    duration: '2 weeks',
    format: 'Online or in-person',
    price: 'From KES 5,000',
    ctaText: 'Enroll Now',
    image: 'assets/images/course-digital.png'
  },
  {
    id: 'crs_p2', slug: 'supporting-children-digital-learning',
    title: 'Supporting Children with Digital Learning at Home',
    category: 'For Parents',
    intro: 'Learn how to support children with educational apps, online learning tools, digital assignments, and creative platforms.',
    audience: 'Parents and caregivers',
    duration: '3 weeks',
    format: 'Online',
    price: 'From KES 6,500',
    ctaText: 'Learn More',
    image: 'assets/images/course-cbe.png'
  },
  {
    id: 'crs_p3', slug: 'teach-computers-young-children',
    title: 'How to Teach Computers to Young Children',
    category: 'For Parents',
    intro: 'Learn playful, safe, and age-appropriate ways to introduce computers, mouse skills, keyboard use, and digital safety.',
    audience: 'Parents, caregivers, and early years teachers',
    duration: '4 weeks',
    format: 'Online or in-person',
    price: 'From KES 9,000',
    ctaText: 'Enroll Now',
    image: 'assets/images/course-ict.png'
  },
  {
    id: 'crs_p4', slug: 'nurturing-creativity-parents',
    title: 'Nurturing Creativity in Children',
    category: 'For Parents',
    intro: 'Use stories, art, design, games, and digital tools to support children’s creativity and problem-solving skills.',
    audience: 'Parents, teachers, and young learners',
    duration: '4 weeks',
    format: 'Online or school-based',
    price: 'From KES 12,000',
    ctaText: 'Learn More',
    image: 'assets/images/course-cbe.png'
  },
  {
    id: 'crs_p5', slug: 'understanding-coding-ai-parents',
    title: 'Understanding Coding and AI for Parents',
    category: 'For Parents',
    intro: 'A simple course that helps parents understand coding, AI, and future digital skills so they can support their children.',
    audience: 'Parents and caregivers',
    duration: '2 weeks',
    format: 'Online',
    price: 'From KES 5,000',
    ctaText: 'Enroll Now',
    image: 'assets/images/course-ai.png'
  },

  // --- FOR SCHOOLS ---
  {
    id: 'crs_s1', slug: 'school-ict-integration',
    title: 'School ICT Integration Programme',
    category: 'For Schools',
    intro: 'A school-based programme that helps teachers integrate ICT into lessons, assessment, administration, and learner engagement.',
    audience: 'Schools, teachers, and school leaders',
    duration: 'Custom',
    format: 'School-based',
    price: 'Custom quote',
    ctaText: 'Book Training',
    image: 'assets/images/course-ict.png'
  },
  {
    id: 'crs_s2', slug: 'digital-transformation-schools',
    title: 'Digital Transformation for Schools',
    category: 'For Schools',
    intro: 'Support school leaders in building a digital learning culture, choosing tools, supporting teachers, and improving ICT planning.',
    audience: 'School leaders and administrators',
    duration: 'Custom',
    format: 'School-based or blended',
    price: 'Custom quote',
    ctaText: 'Book Training',
    image: 'assets/images/about.png'
  },
  {
    id: 'crs_s3', slug: 'teacher-digital-skills-bootcamp',
    title: 'Teacher Digital Skills Bootcamp',
    category: 'For Schools',
    intro: 'A practical training programme that improves teachers’ digital literacy, productivity, and classroom technology use.',
    audience: 'Schools and teachers',
    duration: '1 to 2 weeks',
    format: 'School-based',
    price: 'Custom quote',
    ctaText: 'Book Training',
    image: 'assets/images/course-digital.png'
  },
  {
    id: 'crs_s4', slug: 'coding-ai-programme-schools',
    title: 'Coding and AI Programme for Schools',
    category: 'For Schools',
    intro: 'Help schools introduce coding, AI, computational thinking, and digital innovation to learners.',
    audience: 'Schools and learners',
    duration: 'Custom',
    format: 'School-based',
    price: 'Custom quote',
    ctaText: 'Book Training',
    image: 'assets/images/course-ai.png'
  },
  {
    id: 'crs_s5', slug: 'digital-safety-citizenship-schools',
    title: 'Digital Safety and Citizenship for Schools',
    category: 'For Schools',
    intro: 'Teach learners and teachers responsible internet use, online safety, cyber awareness, and ethical technology use.',
    audience: 'Schools, teachers, and learners',
    duration: 'Custom',
    format: 'School-based',
    price: 'Custom quote',
    ctaText: 'Book Training',
    image: 'assets/images/course-digital.png'
  },
  {
    id: 'crs_s6', slug: 'customized-school-training',
    title: 'Customized School Training Package',
    category: 'For Schools',
    intro: 'A flexible training package designed around each school’s needs, including teacher training, learner workshops, mentorship, and digital resource development.',
    audience: 'Schools and education partners',
    duration: 'Flexible',
    format: 'School-based or blended',
    price: 'Custom quote',
    ctaText: 'Contact Us',
    image: 'assets/images/about.png'
  },

  // --- CODING & AI (Unique Additions) ---
  {
    id: 'crs_ca1', slug: 'coding-ai-skills-beginners',
    title: 'Coding and AI Skills for Beginners',
    category: 'Coding & AI',
    intro: 'Learn coding concepts, computational thinking, artificial intelligence, responsible AI use, and simple digital projects.',
    audience: 'Teachers, children, and beginners',
    duration: '6 weeks',
    format: 'Online or in-person',
    price: 'From KES 22,000',
    ctaText: 'Enroll Now',
    image: 'assets/images/course-ai.png'
  },
  {
    id: 'crs_ca2', slug: 'computational-thinking-learners',
    title: 'Computational Thinking for Learners',
    category: 'Coding & AI',
    intro: 'Build logic, sequencing, pattern recognition, decomposition, problem-solving, and algorithmic thinking skills.',
    audience: 'Learners and beginners',
    duration: '4 weeks',
    format: 'Online or in-person',
    price: 'From KES 12,000',
    ctaText: 'Enroll Now',
    image: 'assets/images/course-ai.png'
  },
  {
    id: 'crs_ca3', slug: 'introduction-to-robotics',
    title: 'Introduction to Robotics',
    category: 'Coding & AI',
    intro: 'Explore robotics, automation, sensors, movement, and problem-solving through simple hands-on projects.',
    audience: 'Children and learners',
    duration: '6 weeks',
    format: 'In-person or school-based',
    price: 'From KES 20,000',
    ctaText: 'Learn More',
    image: 'assets/images/course-ai.png'
  },

  // --- DIGITAL LITERACY (Unique Additions) ---
  {
    id: 'crs_dl1', slug: 'digital-literacy-skills',
    title: 'Digital Literacy Skills',
    category: 'Digital Literacy',
    intro: 'Build confidence in using computers, digital devices, internet tools, productivity software, online safety, and digital communication.',
    audience: 'Teachers, learners, parents, and beginners',
    duration: '4 weeks',
    format: 'Online or in-person',
    price: 'From KES 8,500',
    ctaText: 'Enroll Now',
    image: 'assets/images/course-digital.png'
  },
  {
    id: 'crs_dl2', slug: 'computer-basics-beginners',
    title: 'Computer Basics for Beginners',
    category: 'Digital Literacy',
    intro: 'Learn computer parts, typing, mouse skills, file management, folders, documents, and basic troubleshooting.',
    audience: 'Beginners, children, parents, and teachers',
    duration: '4 weeks',
    format: 'In-person or online',
    price: 'From KES 6,500',
    ctaText: 'Enroll Now',
    image: 'assets/images/course-ict.png'
  },
  {
    id: 'crs_dl3', slug: 'microsoft-office-productivity',
    title: 'Microsoft Office and Productivity Tools',
    category: 'Digital Literacy',
    intro: 'Learn how to use Word, PowerPoint, Excel, email, cloud storage, and digital collaboration tools.',
    audience: 'Teachers, learners, parents, and professionals',
    duration: '5 weeks',
    format: 'Online or in-person',
    price: 'From KES 12,000',
    ctaText: 'Enroll Now',
    image: 'assets/images/course-digital.png'
  },
  {
    id: 'crs_dl4', slug: 'online-safety-citizenship',
    title: 'Online Safety and Digital Citizenship',
    category: 'Digital Literacy',
    intro: 'Learn safe, responsible, respectful, and ethical use of the internet and digital platforms.',
    audience: 'Teachers, parents, learners, and schools',
    duration: '2 weeks',
    format: 'Online or school-based',
    price: 'From KES 5,000',
    ctaText: 'Learn More',
    image: 'assets/images/course-digital.png'
  },
  {
    id: 'crs_dl5', slug: 'digital-communication-skills',
    title: 'Digital Communication Skills',
    category: 'Digital Literacy',
    intro: 'Build confidence using email, online meetings, messaging tools, collaboration platforms, and professional digital communication.',
    audience: 'Teachers, learners, parents, and beginners',
    duration: '3 weeks',
    format: 'Online',
    price: 'From KES 7,500',
    ctaText: 'Enroll Now',
    image: 'assets/images/course-digital.png'
  },
  {
    id: 'crs_dl6', slug: 'internet-research-information-literacy',
    title: 'Internet Research and Information Literacy',
    category: 'Digital Literacy',
    intro: 'Learn how to search for information, evaluate online sources, avoid misinformation, and use digital content responsibly.',
    audience: 'Teachers, learners, and parents',
    duration: '3 weeks',
    format: 'Online or in-person',
    price: 'From KES 8,000',
    ctaText: 'Learn More',
    image: 'assets/images/course-digital.png'
  }
];`;

jsContent = jsContent.replace(/window\.COURSES = \[[^]*?\];/, newCoursesCode);

// Update price rendering format safely since they might be strings now like "From KES 15,000" or "Custom quote"
// Also need to adjust the renderer for the exact requested format.
jsContent = jsContent.replace(
  /<strong style="color: #374151;">Price:<\/strong> (.*?)(?:<\/span>)/g, 
  '<strong style="color: #374151;">Price:</strong> \\${course.price}</span>'
);

// We need to modify the filter logic in courses.js to perfectly match these exact tags.
const newFilterLogic = `
  if (currentTab !== 'all') {
    results = results.filter(course => {
      const c = course.category.toLowerCase();
      const a = course.audience.toLowerCase();
      const t = course.title.toLowerCase();
      
      switch(currentTab) {
        case 'teachers': return c.includes('teachers') || a.includes('teacher');
        case 'children': return c.includes('children') || a.includes('child') || a.includes('learner');
        case 'parents': return c.includes('parents') || a.includes('parent');
        case 'schools': return c.includes('schools') || a.includes('school');
        case 'coding-ai': return c.includes('coding') || c.includes('ai') || t.includes('coding') || t.includes('ai ');
        case 'digital-literacy': return c.includes('digital literacy') || t.includes('digital literacy');
        default: return true;
      }
    });
  }
`;

jsContent = jsContent.replace(/if \(currentTab !== 'all'\) \{[^]*?\}/, newFilterLogic);

fs.writeFileSync(jsPath, jsContent);
console.log('Updated courses.js with 30+ courses.');
