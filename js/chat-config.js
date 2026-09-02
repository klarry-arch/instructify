/**
 * INSTRUCTIFY KENYA — Central Communication & Live Chat Configuration
 * Single source of truth for contact details, social media handles, and automated assistant FAQs.
 */

window.INSTRUCTIFY_COMM_CONFIG = {
  brand: {
    name: 'Instructify Kenya',
    tagline: 'Empowering Educators. Transforming Institutions. Driving Digital Learning Excellence.',
    website: 'https://instructify.ke',
  },

  // Verified Contact Channels
  contact: {
    whatsappNumber: '254700123456',
    displayPhone: '+254 700 123 456',
    secondaryPhone: '+254 733 987 654',
    email: 'info@instructify.ke',
    supportEmail: 'support@instructify.ke',
    officeLocation: 'Nairobi, Kenya',
    workingHours: 'Mon - Fri: 8:00 AM - 5:00 PM EAT',
  },

  // Official Social Media Profiles
  social: {
    linkedin: 'https://www.linkedin.com/company/instructify-kenya',
    youtube: 'https://www.youtube.com/@instructifykenya',
    facebook: 'https://www.facebook.com/instructifykenya',
    twitter: 'https://twitter.com/instructifyke',
    instagram: 'https://www.instagram.com/instructifykenya',
    tiktok: 'https://www.tiktok.com/@instructifykenya',
  },

  // Live Chat System Settings
  chat: {
    botName: 'Instructify Assistant',
    status: 'online', // 'online' | 'offline'
    statusText: 'We typically reply in under 2 minutes',
    greeting: {
      title: 'Hello! Welcome to Instructify Kenya 👋',
      message: 'How can we help you today? Ask us about our certified teacher training, institutional consultancy, AI & ICT masterclasses, or the Instructify Podcast.',
    },
    
    // Quick-Reply Topic Options
    topics: [
      { id: 'training', icon: '🎓', label: 'Training & Courses' },
      { id: 'consultancy', icon: '💼', label: 'Consultancy' },
      { id: 'ict_skills', icon: '🖥️', label: 'ICT & Digital Skills' },
      { id: 'ai_innovation', icon: '🤖', label: 'AI & EdTech' },
      { id: 'podcast', icon: '🎙️', label: 'Podcast' },
      { id: 'blog', icon: '📰', label: 'Knowledge Hub' },
      { id: 'verify', icon: '📜', label: 'Verify Certificate' },
      { id: 'agent', icon: '💬', label: 'Talk to an Advisor' },
    ],

    // Automated FAQ Knowledge Base
    faq: {
      training: {
        title: '🎓 Teacher Training & CPD Courses',
        text: 'We offer self-paced and cohort-based CPD accredited courses for educators, school leaders, and EdTech practitioners. Popular programs include AI in the Classroom, CBC Digital Pedagogy, and Hybrid Learning.',
        actions: [
          { text: 'Browse All Courses →', url: 'courses.html', type: 'primary' },
          { text: 'Chat on WhatsApp', action: 'whatsapp', topic: 'Training Programmes', type: 'whatsapp' },
          { text: 'Leave an Enquiry', action: 'form', topic: 'Training', type: 'secondary' }
        ]
      },
      consultancy: {
        title: '💼 Institutional Consultancy & B2B Solutions',
        text: 'We partner with schools, county governments, NGOs, and universities to implement digital infrastructure, teacher capacity audits, and customized LMS platforms.',
        actions: [
          { text: 'Explore Consultancy →', url: 'consultancy.html', type: 'primary' },
          { text: 'Book Discovery Call', action: 'whatsapp', topic: 'Institutional Consultancy', type: 'whatsapp' },
          { text: 'Request a Proposal', action: 'form', topic: 'Consultancy', type: 'secondary' }
        ]
      },
      ict_skills: {
        title: '🖥️ ICT & CBC Digital Integration',
        text: 'Master CBC-aligned lesson planning, multimedia content creation, Google Classroom management, and offline digital tools for low-connectivity classrooms.',
        actions: [
          { text: 'View ICT Masterclass →', url: 'courses.html?cat=ict', type: 'primary' },
          { text: 'Ask about School Workshops', action: 'whatsapp', topic: 'ICT Workshops', type: 'whatsapp' }
        ]
      },
      ai_innovation: {
        title: '🤖 AI in Education & STEM Robotics',
        text: 'Learn how to use generative AI for automated grading, personalized lesson plans, and interactive STEM robotics projects.',
        actions: [
          { text: 'Explore AI Course →', url: 'courses.html?cat=ai', type: 'primary' },
          { text: 'Schedule Demo', action: 'form', topic: 'AI Solutions', type: 'secondary' }
        ]
      },
      podcast: {
        title: '🎙️ Instructify Kenya Podcast',
        text: 'Tune into conversations with African educational leaders, founders, and innovators shaping the future of digital learning in Kenya.',
        actions: [
          { text: 'Listen to Episodes →', url: 'podcast.html', type: 'primary' },
          { text: 'Apply as Guest Speaker', action: 'form', topic: 'Podcast Guest', type: 'secondary' }
        ]
      },
      blog: {
        title: '📰 Instructify Knowledge Hub',
        text: 'Read in-depth research, pedagogical frameworks, policy analysis, and free downloadable toolkits created by Kenyan education experts.',
        actions: [
          { text: 'Read Knowledge Hub →', url: 'blog.html', type: 'primary' }
        ]
      },
      verify: {
        title: '📜 Certificate Verification',
        text: 'Every certificate issued by Instructify Kenya comes with a unique tamper-proof ID that can be instantly authenticated online.',
        actions: [
          { text: 'Verify Certificate Now →', url: 'verify.html', type: 'primary' }
        ]
      },
      agent: {
        title: '💬 Connect with an Advisor',
        text: 'Our admissions and consultancy team in Nairobi is ready to assist you. Choose your preferred contact method:',
        actions: [
          { text: 'Chat on WhatsApp (+254 700 123 456)', action: 'whatsapp', topic: 'General Enquiry', type: 'whatsapp' },
          { text: 'Leave a Message / Callback', action: 'form', topic: 'General Support', type: 'primary' },
          { text: 'Call Us Now', url: 'tel:+254700123456', type: 'secondary' }
        ]
      }
    }
  }
};
