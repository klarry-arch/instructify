/* ============================================================
   INSTRUCTIFY KENYA — COURSE / LMS DASHBOARD ENGINE (courses.html)
   Central reactive controller for:
   - LMS Horizontal Sub-Navigation
   - Dynamic Personalised Welcome Area
   - Course Search & Multi-Dimensional Filters
   - Learner Quick-Action Panel
   - Main Featured Learning Banner (Admin Manageable)
   - Browse Courses Catalog (Grid & List View)
   - My Learning Hub (In Progress, Enrolled, Bookmarked, Completed, Certificates)
   - Academies & Learning Areas Filtering
   - Role-Based Access & Admin Controls
   ============================================================ */

(function (window) {
  'use strict';

  // ── Storage Keys ─────────────────────────────────────────────
  const STORAGE_KEYS = {
    BOOKMARKS: 'ik_lms_bookmarks',
    FEATURED_BANNER: 'ik_lms_featured_banner',
    ACTIVE_ROLE_OVERRIDE: 'ik_lms_demo_role',
    VIEW_MODE: 'ik_lms_view_mode'
  };

  // ── State Management ─────────────────────────────────────────
  const state = {
    currentTab: 'home', // 'home' | 'my-learning' | 'academies' | 'admin'
    myLearningSubtab: 'in-progress', // 'in-progress' | 'enrolled' | 'bookmarked' | 'completed' | 'certificates'
    viewMode: localStorage.getItem(STORAGE_KEYS.VIEW_MODE) || 'grid',
    filters: {
      query: '',
      category: 'all',
      academy: 'all',
      level: 'all',
      format: 'all',
      duration: 'all',
      pricing: 'all',
      cpd: false,
      sort: 'popular'
    },
    user: null,
    bookmarks: [],
    courses: [],
    enrollments: []
  };

  // ── Academies Definition (Modern 3D Multi-Colour EdTech Tracks) ──
  const ACADEMIES = [
    {
      id: 'digital-literacy',
      title: 'Digital Literacy & ICT Integration',
      desc: 'Smart boards, LMS, digital devices, and safe internet delivery for 21st-century teaching.',
      theme: 'cobalt',
      accent: '#2563EB',
      accentDark: '#1D4ED8',
      accentSoft: '#EFF6FF',
      accentRing: '#DBEAFE',
      glow: 'rgba(37, 99, 235, 0.28)',
      barGradient: 'linear-gradient(90deg, #2563EB 0%, #38BDF8 100%)',
      pedestalGradient: 'linear-gradient(145deg, #EFF6FF 0%, #DBEAFE 100%)',
      filterKeyword: 'Digital',
      iconSvg: `<svg class="lms-3d-svg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="acad1-body" x1="10" y1="12" x2="54" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#60A5FA"/><stop offset="55%" stop-color="#2563EB"/><stop offset="100%" stop-color="#1D4ED8"/>
          </linearGradient>
          <linearGradient id="acad1-screen" x1="15" y1="16" x2="49" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#E0F2FE"/><stop offset="55%" stop-color="#93C5FD"/><stop offset="100%" stop-color="#3B82F6"/>
          </linearGradient>
          <linearGradient id="acad1-base" x1="6" y1="45" x2="58" y2="54" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#BFDBFE"/><stop offset="50%" stop-color="#60A5FA"/><stop offset="100%" stop-color="#1D4ED8"/>
          </linearGradient>
        </defs>
        <ellipse cx="32" cy="55" rx="22" ry="4.5" fill="#2563EB" opacity="0.18"/>
        <rect x="11" y="13" width="42" height="31" rx="6" fill="url(#acad1-body)"/>
        <rect x="14.5" y="16.5" width="35" height="23.5" rx="3.5" fill="url(#acad1-screen)"/>
        <path d="M15 17.5C15 16.95 15.45 16.5 16 16.5H48C48.55 16.5 49 16.95 49 17.5V22C38 20.5 24 22.5 15 26V17.5Z" fill="#FFFFFF" opacity="0.45"/>
        <rect x="19" y="22" width="14" height="4" rx="2" fill="#FFFFFF" opacity="0.92"/>
        <rect x="19" y="29" width="24" height="3" rx="1.5" fill="#1D4ED8" opacity="0.45"/>
        <rect x="19" y="34" width="16" height="3" rx="1.5" fill="#1D4ED8" opacity="0.32"/>
        <circle cx="43.5" cy="24" r="4" fill="#FACC15"/>
        <path d="M42.2 24L43.2 25L45.2 22.8" stroke="#1E1B4B" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M6.5 45.5C6.5 44.12 7.62 43 9 43H55C56.38 43 57.5 44.12 57.5 45.5L55.2 49.6C54.62 50.65 53.52 51.3 52.32 51.3H11.68C10.48 51.3 9.38 50.65 8.8 49.6L6.5 45.5Z" fill="url(#acad1-base)"/>
        <rect x="26" y="45.2" width="12" height="2.4" rx="1.2" fill="#FFFFFF" opacity="0.8"/>
      </svg>`
    },
    {
      id: 'cbc-curriculum',
      title: 'Teaching & Learning (CBC Pedagogy)',
      desc: 'Competency-based lesson plans, portfolio design, rubrics, and strand integration.',
      theme: 'coral',
      accent: '#EA580C',
      accentDark: '#C2410C',
      accentSoft: '#FFF7ED',
      accentRing: '#FFEDD5',
      glow: 'rgba(234, 88, 12, 0.26)',
      barGradient: 'linear-gradient(90deg, #EA580C 0%, #FACC15 100%)',
      pedestalGradient: 'linear-gradient(145deg, #FFF7ED 0%, #FFEDD5 100%)',
      filterKeyword: 'Curriculum',
      iconSvg: `<svg class="lms-3d-svg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="acad2-cover" x1="10" y1="14" x2="54" y2="52" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#FB923C"/><stop offset="55%" stop-color="#EA580C"/><stop offset="100%" stop-color="#C2410C"/>
          </linearGradient>
          <linearGradient id="acad2-pageL" x1="12" y1="16" x2="32" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#FFEDD5"/>
          </linearGradient>
          <linearGradient id="acad2-pageR" x1="32" y1="16" x2="52" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#FFF7ED"/><stop offset="100%" stop-color="#FED7AA"/>
          </linearGradient>
        </defs>
        <ellipse cx="32" cy="55" rx="22" ry="4.5" fill="#EA580C" opacity="0.18"/>
        <rect x="8" y="18" width="48" height="31" rx="7" fill="url(#acad2-cover)"/>
        <path d="M12 16.5C18 14.5 26 15.5 32 19V44.5C26 41.5 18 40.5 12 42.5V16.5Z" fill="url(#acad2-pageL)"/>
        <path d="M52 16.5C46 14.5 38 15.5 32 19V44.5C38 41.5 46 40.5 52 42.5V16.5Z" fill="url(#acad2-pageR)"/>
        <path d="M32 19V44.5" stroke="#EA580C" stroke-width="1.6" opacity="0.45"/>
        <rect x="16" y="23" width="11" height="2.6" rx="1.3" fill="#EA580C" opacity="0.65"/>
        <rect x="16" y="28.5" width="12" height="2.4" rx="1.2" fill="#C2410C" opacity="0.32"/>
        <rect x="16" y="33.5" width="9" height="2.4" rx="1.2" fill="#C2410C" opacity="0.25"/>
        <rect x="36.5" y="23" width="11" height="2.6" rx="1.3" fill="#EA580C" opacity="0.55"/>
        <rect x="36.5" y="28.5" width="10" height="2.4" rx="1.2" fill="#C2410C" opacity="0.30"/>
        <path d="M41 11H48V24.5L44.5 21.5L41 24.5V11Z" fill="#FACC15"/>
        <path d="M41 11H48V15H41V11Z" fill="#FEF08A" opacity="0.8"/>
        <circle cx="21" cy="12.5" r="4.5" fill="#FACC15"/>
        <path d="M21 9.5L21.9 11.4L24 11.7L22.5 13.1L22.9 15.1L21 14.1L19.1 15.1L19.5 13.1L18 11.7L20.1 11.4L21 9.5Z" fill="#FFFFFF"/>
      </svg>`
    },
    {
      id: 'edtech-vr',
      title: 'Educational Technology & VR',
      desc: 'Immersive ClassVR experiences, interactive simulations, and robotics kits in school.',
      theme: 'violet',
      accent: '#7C3AED',
      accentDark: '#6D28D9',
      accentSoft: '#F5F3FF',
      accentRing: '#EDE9FE',
      glow: 'rgba(124, 58, 237, 0.28)',
      barGradient: 'linear-gradient(90deg, #7C3AED 0%, #22D3EE 100%)',
      pedestalGradient: 'linear-gradient(145deg, #F5F3FF 0%, #EDE9FE 100%)',
      filterKeyword: 'Smart',
      iconSvg: `<svg class="lms-3d-svg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="acad3-shell" x1="8" y1="18" x2="56" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#C4B5FD"/><stop offset="45%" stop-color="#7C3AED"/><stop offset="100%" stop-color="#5B21B6"/>
          </linearGradient>
          <linearGradient id="acad3-visor" x1="13" y1="22" x2="51" y2="43" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#22D3EE"/><stop offset="50%" stop-color="#3B82F6"/><stop offset="100%" stop-color="#1E1B4B"/>
          </linearGradient>
          <radialGradient id="acad3-orb" cx="0.35" cy="0.35" r="0.7">
            <stop offset="0%" stop-color="#FFFFFF"/><stop offset="45%" stop-color="#38BDF8"/><stop offset="100%" stop-color="#7C3AED"/>
          </radialGradient>
        </defs>
        <ellipse cx="32" cy="54.5" rx="22" ry="4.5" fill="#7C3AED" opacity="0.20"/>
        <path d="M10 28C10 20 19 16 32 16C45 16 54 20 54 28V31H10V28Z" fill="#5B21B6" opacity="0.45"/>
        <path d="M8 26.5C8 22.36 11.36 19 15.5 19H48.5C52.64 19 56 22.36 56 26.5V39.5C56 43.64 52.64 47 48.5 47H41.2C39.2 47 37.4 45.9 36.4 44.2L34.7 41.2C33.5 39.2 30.5 39.2 29.3 41.2L27.6 44.2C26.6 45.9 24.8 47 22.8 47H15.5C11.36 47 8 43.64 8 39.5V26.5Z" fill="url(#acad3-shell)"/>
        <path d="M13 27.5C13 24.74 15.24 22.5 18 22.5H46C48.76 22.5 51 24.74 51 27.5V37.2C51 39.96 48.76 42.2 46 42.2H40.5C38.8 42.2 37.3 41.3 36.4 39.8L35 37.4C33.6 35.1 30.4 35.1 29 37.4L27.6 39.8C26.7 41.3 25.2 42.2 23.5 42.2H18C15.24 42.2 13 39.96 13 37.2V27.5Z" fill="url(#acad3-visor)"/>
        <path d="M16 26C16 24.9 16.9 24 18 24H37C31 27.5 23 30 16 31.5V26Z" fill="#FFFFFF" opacity="0.42"/>
        <circle cx="43" cy="31" r="3" fill="#FFFFFF" opacity="0.65"/>
        <circle cx="48" cy="13" r="5.5" fill="url(#acad3-orb)"/>
        <circle cx="15" cy="13.5" r="2.8" fill="#FACC15"/>
      </svg>`
    },
    {
      id: 'early-years',
      title: 'Early Years Education (PP1–Grade 3)',
      desc: 'Foundational literacy, numeracy, creative expression, and inclusive early childhood learning.',
      theme: 'emerald',
      accent: '#059669',
      accentDark: '#047857',
      accentSoft: '#ECFDF5',
      accentRing: '#D1FAE5',
      glow: 'rgba(5, 150, 105, 0.26)',
      barGradient: 'linear-gradient(90deg, #059669 0%, #34D399 100%)',
      pedestalGradient: 'linear-gradient(145deg, #ECFDF5 0%, #D1FAE5 100%)',
      filterKeyword: 'Early',
      iconSvg: `<svg class="lms-3d-svg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="acad4-leafL" x1="12" y1="14" x2="32" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#6EE7B7"/><stop offset="55%" stop-color="#10B981"/><stop offset="100%" stop-color="#047857"/>
          </linearGradient>
          <linearGradient id="acad4-leafR" x1="32" y1="10" x2="54" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#A7F3D0"/><stop offset="50%" stop-color="#34D399"/><stop offset="100%" stop-color="#059669"/>
          </linearGradient>
          <linearGradient id="acad4-pot" x1="18" y1="36" x2="46" y2="54" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#FDBA74"/><stop offset="55%" stop-color="#EA580C"/><stop offset="100%" stop-color="#C2410C"/>
          </linearGradient>
        </defs>
        <ellipse cx="32" cy="55.5" rx="19" ry="4" fill="#059669" opacity="0.18"/>
        <path d="M32 39V22" stroke="#047857" stroke-width="3.4" stroke-linecap="round"/>
        <path d="M32 29C22 29 14 23 14 14C23 14 31 19.5 32 29Z" fill="url(#acad4-leafL)"/>
        <path d="M17 17C22 18.5 26 21.5 29 26" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" opacity="0.55"/>
        <path d="M32 25C42.5 25 51 18.5 51 9.5C41.5 9.5 33 15.5 32 25Z" fill="url(#acad4-leafR)"/>
        <path d="M47.5 13C42.5 14.5 38.5 17.5 35 22" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" opacity="0.6"/>
        <rect x="17" y="34.5" width="30" height="6.5" rx="3.2" fill="#FB923C"/>
        <rect x="19" y="35.6" width="16" height="2" rx="1" fill="#FFFFFF" opacity="0.45"/>
        <path d="M20 40.5H44L41.2 51.2C40.75 52.85 39.25 54 37.54 54H26.46C24.75 54 23.25 52.85 22.8 51.2L20 40.5Z" fill="url(#acad4-pot)"/>
        <circle cx="48" cy="27" r="3.5" fill="#FACC15"/>
        <circle cx="16" cy="28" r="2.2" fill="#34D399"/>
      </svg>`
    },
    {
      id: 'assessment-eval',
      title: 'Assessment & Evaluation',
      desc: 'Formative CBC assessment rubrics, learner progress tracking, and authentic evaluation.',
      theme: 'amber',
      accent: '#D97706',
      accentDark: '#B45309',
      accentSoft: '#FEFCE8',
      accentRing: '#FEF3C7',
      glow: 'rgba(217, 119, 6, 0.26)',
      barGradient: 'linear-gradient(90deg, #D97706 0%, #FACC15 100%)',
      pedestalGradient: 'linear-gradient(145deg, #FEFCE8 0%, #FEF3C7 100%)',
      filterKeyword: 'Assessment',
      iconSvg: `<svg class="lms-3d-svg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="acad5-b1" x1="12" y1="30" x2="22" y2="50" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#FDE047"/><stop offset="100%" stop-color="#D97706"/>
          </linearGradient>
          <linearGradient id="acad5-b2" x1="26" y1="22" x2="38" y2="50" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#FB923C"/><stop offset="100%" stop-color="#EA580C"/>
          </linearGradient>
          <linearGradient id="acad5-b3" x1="42" y1="14" x2="54" y2="50" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#34D399"/><stop offset="100%" stop-color="#059669"/>
          </linearGradient>
        </defs>
        <ellipse cx="32" cy="55.5" rx="22" ry="4" fill="#D97706" opacity="0.18"/>
        <rect x="11" y="32" width="11" height="19" rx="4" fill="url(#acad5-b1)"/>
        <rect x="13" y="34" width="3" height="13" rx="1.5" fill="#FFFFFF" opacity="0.45"/>
        <rect x="26.5" y="23" width="11" height="28" rx="4" fill="url(#acad5-b2)"/>
        <rect x="28.5" y="25" width="3" height="20" rx="1.5" fill="#FFFFFF" opacity="0.4"/>
        <rect x="42" y="15" width="11" height="36" rx="4" fill="url(#acad5-b3)"/>
        <rect x="44" y="17" width="3" height="26" rx="1.5" fill="#FFFFFF" opacity="0.42"/>
        <rect x="8" y="48.5" width="48" height="4.5" rx="2.25" fill="#1E1B4B" opacity="0.82"/>
        <circle cx="20" cy="16" r="8" fill="#FACC15"/>
        <circle cx="20" cy="16" r="6" fill="#D97706" opacity="0.22"/>
        <path d="M16.8 16.2L19 18.4L23.5 13.6" stroke="#1E1B4B" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`
    },
    {
      id: 'pro-development',
      title: 'Professional Development & Coaching',
      desc: 'Teacher mentorship, CPD credit compliance, instructional leadership, and growth.',
      theme: 'rose',
      accent: '#DB2777',
      accentDark: '#BE185D',
      accentSoft: '#FDF2F8',
      accentRing: '#FCE7F3',
      glow: 'rgba(219, 39, 119, 0.26)',
      barGradient: 'linear-gradient(90deg, #DB2777 0%, #F472B6 100%)',
      pedestalGradient: 'linear-gradient(145deg, #FDF2F8 0%, #FCE7F3 100%)',
      filterKeyword: 'Pedagogy',
      iconSvg: `<svg class="lms-3d-svg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="acad6-cup" x1="16" y1="10" x2="48" y2="42" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#FBCFE8"/><stop offset="40%" stop-color="#EC4899"/><stop offset="100%" stop-color="#BE185D"/>
          </linearGradient>
          <linearGradient id="acad6-gold" x1="20" y1="38" x2="44" y2="54" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#FDE047"/><stop offset="60%" stop-color="#FACC15"/><stop offset="100%" stop-color="#D97706"/>
          </linearGradient>
        </defs>
        <ellipse cx="32" cy="55.5" rx="18" ry="4" fill="#DB2777" opacity="0.18"/>
        <path d="M19 17H13C11.34 17 10 18.34 10 20V22C10 27.5 14 31.5 19.5 32" stroke="#F472B6" stroke-width="3.6" stroke-linecap="round"/>
        <path d="M45 17H51C52.66 17 54 18.34 54 20V22C54 27.5 50 31.5 44.5 32" stroke="#DB2777" stroke-width="3.6" stroke-linecap="round"/>
        <path d="M17 13.5C17 12.12 18.12 11 19.5 11H44.5C45.88 11 47 12.12 47 13.5V24C47 32.28 40.28 39 32 39C23.72 39 17 32.28 17 24V13.5Z" fill="url(#acad6-cup)"/>
        <path d="M21 15V23.5C21 28 23.5 31.5 27 33.2" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round" opacity="0.45"/>
        <path d="M32 16.5L33.9 20.4L38.2 21L35.1 24L35.8 28.2L32 26.2L28.2 28.2L28.9 24L25.8 21L30.1 20.4L32 16.5Z" fill="#FACC15"/>
        <rect x="28.5" y="38" width="7" height="8" rx="2" fill="url(#acad6-gold)"/>
        <rect x="19" y="45" width="26" height="7.5" rx="3.75" fill="url(#acad6-gold)"/>
        <rect x="22" y="46.6" width="12" height="2" rx="1" fill="#FFFFFF" opacity="0.55"/>
      </svg>`
    },
    {
      id: 'school-leadership',
      title: 'School Leadership & Management',
      desc: 'Strategic management, education policy, teacher appraisal, and school digitization.',
      theme: 'teal',
      accent: '#0D9488',
      accentDark: '#0F766E',
      accentSoft: '#F0FDFA',
      accentRing: '#CCFBF1',
      glow: 'rgba(13, 148, 136, 0.26)',
      barGradient: 'linear-gradient(90deg, #0D9488 0%, #2DD4BF 100%)',
      pedestalGradient: 'linear-gradient(145deg, #F0FDFA 0%, #CCFBF1 100%)',
      filterKeyword: 'Leadership',
      iconSvg: `<svg class="lms-3d-svg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="acad7-roof" x1="10" y1="10" x2="54" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#5EEAD4"/><stop offset="55%" stop-color="#0D9488"/><stop offset="100%" stop-color="#0F766E"/>
          </linearGradient>
          <linearGradient id="acad7-col" x1="16" y1="26" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#FFFFFF"/><stop offset="55%" stop-color="#CCFBF1"/><stop offset="100%" stop-color="#5EEAD4"/>
          </linearGradient>
        </defs>
        <ellipse cx="32" cy="55.5" rx="23" ry="4" fill="#0D9488" opacity="0.18"/>
        <path d="M30.4 10.6C31.38 10 32.62 10 33.6 10.6L53.8 22.8C55.4 23.77 54.72 26.2 52.85 26.2H11.15C9.28 26.2 8.6 23.77 10.2 22.8L30.4 10.6Z" fill="url(#acad7-roof)"/>
        <circle cx="32" cy="19.5" r="3.2" fill="#FACC15"/>
        <rect x="13" y="26" width="38" height="21" rx="2" fill="#0F766E" opacity="0.16"/>
        <rect x="15.5" y="27" width="6.5" height="19" rx="2.5" fill="url(#acad7-col)"/>
        <rect x="28.75" y="27" width="6.5" height="19" rx="2.5" fill="url(#acad7-col)"/>
        <rect x="42" y="27" width="6.5" height="19" rx="2.5" fill="url(#acad7-col)"/>
        <rect x="11" y="45" width="42" height="4.5" rx="2.25" fill="#14B8A6"/>
        <rect x="8" y="49" width="48" height="4.5" rx="2.25" fill="#0F766E"/>
        <rect x="11" y="50.2" width="16" height="1.6" rx="0.8" fill="#FFFFFF" opacity="0.35"/>
      </svg>`
    },
    {
      id: 'ai-education',
      title: 'Artificial Intelligence in Education',
      desc: 'GenAI lesson design, automated grading, intelligent tutoring, and ethical AI in school.',
      theme: 'indigo',
      accent: '#4338CA',
      accentDark: '#3730A3',
      accentSoft: '#EEF2FF',
      accentRing: '#E0E7FF',
      glow: 'rgba(67, 56, 202, 0.28)',
      barGradient: 'linear-gradient(90deg, #4338CA 0%, #38BDF8 100%)',
      pedestalGradient: 'linear-gradient(145deg, #EEF2FF 0%, #E0E7FF 100%)',
      filterKeyword: 'AI',
      iconSvg: `<svg class="lms-3d-svg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="acad8-head" x1="12" y1="16" x2="52" y2="52" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#A5B4FC"/><stop offset="45%" stop-color="#6366F1"/><stop offset="100%" stop-color="#3730A3"/>
          </linearGradient>
          <linearGradient id="acad8-face" x1="18" y1="24" x2="46" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#1E1B4B"/><stop offset="100%" stop-color="#312E81"/>
          </linearGradient>
        </defs>
        <ellipse cx="32" cy="55.5" rx="20" ry="4" fill="#4338CA" opacity="0.20"/>
        <path d="M32 19V12.5" stroke="#6366F1" stroke-width="3" stroke-linecap="round"/>
        <circle cx="32" cy="10" r="4" fill="#38BDF8"/>
        <circle cx="30.8" cy="8.8" r="1.4" fill="#FFFFFF" opacity="0.8"/>
        <rect x="8" y="29" width="6" height="12" rx="3" fill="#4338CA"/>
        <rect x="50" y="29" width="6" height="12" rx="3" fill="#4338CA"/>
        <rect x="13" y="18" width="38" height="32" rx="12" fill="url(#acad8-head)"/>
        <path d="M19 21.5H45" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" opacity="0.4"/>
        <rect x="18" y="25" width="28" height="18" rx="7" fill="url(#acad8-face)"/>
        <circle cx="26.5" cy="33.5" r="3.4" fill="#38BDF8"/>
        <circle cx="25.5" cy="32.4" r="1.2" fill="#FFFFFF"/>
        <circle cx="37.5" cy="33.5" r="3.4" fill="#38BDF8"/>
        <circle cx="36.5" cy="32.4" r="1.2" fill="#FFFFFF"/>
        <path d="M27.5 39.2C29 40.6 35 40.6 36.5 39.2" stroke="#FACC15" stroke-width="2" stroke-linecap="round"/>
      </svg>`
    }
  ];

  // ── Default Mock Certificates for Demo ───────────────────────
  const DEFAULT_CERTIFICATES = [
    {
      id: 'CERT-IK-2026-0881',
      courseId: 'crs_002',
      courseTitle: 'Digital Literacy Certification Program',
      issueDate: 'August 24, 2026',
      grade: 'Distinction (94%)',
      accreditation: 'TSC & KICD Accredited CPD (30 Hours)',
      downloadUrl: 'student-certificates.html'
    }
  ];

  // ── Helper to Get All Unique Catalog Courses ─────────────────
  function getAllCourses() {
    const lmsCourses = (window.LMSEngine && typeof window.LMSEngine.getCourses === 'function')
      ? window.LMSEngine.getCourses()
      : [];
    const baseCourses = window.COURSES || [];

    const map = new Map();
    baseCourses.forEach(c => map.set(c.id, c));
    lmsCourses.forEach(c => {
      // Merge or prefer custom LMS fields
      if (map.has(c.id)) {
        map.set(c.id, { ...map.get(c.id), ...c });
      } else {
        map.set(c.id, c);
      }
    });

    return Array.from(map.values());
  }

  // ── Initialize Active User Session & Role ────────────────────
  function initUserSession() {
    let session = null;
    if (window.getSession && typeof window.getSession === 'function') {
      session = window.getSession();
    }
    if (!session) {
      try {
        session = JSON.parse(sessionStorage.getItem('ik_session') || localStorage.getItem('ik_session'));
      } catch (e) {
        session = null;
      }
    }

    // Check if demo role override is active
    const demoRole = localStorage.getItem(STORAGE_KEYS.ACTIVE_ROLE_OVERRIDE);

    if (demoRole === 'guest') {
      state.user = null;
    } else if (demoRole === 'trainer') {
      state.user = {
        id: 'usr_002',
        name: 'Dr. Wanjiku Kamau',
        email: 'trainer@instructify.ke',
        role: 'trainer',
        title: 'Lead EdTech Specialist',
        avatar: 'WK'
      };
    } else if (demoRole === 'admin') {
      state.user = {
        id: 'usr_003',
        name: 'Prof. Ochieng Otieno',
        email: 'admin@instructify.ke',
        role: 'admin',
        title: 'Platform Administrator',
        avatar: 'OO'
      };
    } else if (session) {
      state.user = session;
    } else {
      // Guest browsing mode (do not simulate a signed-in user when logged out)
      state.user = null;
    }
  }

  // ── Load Bookmarks ───────────────────────────────────────────
  function loadBookmarks() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      state.bookmarks = stored ? JSON.parse(stored) : ['crs_000', 'crs_004']; // default saved sample
    } catch {
      state.bookmarks = ['crs_000'];
    }
  }

  function saveBookmarks() {
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(state.bookmarks));
    } catch (e) {
      console.warn('Could not save bookmarks to localStorage', e);
    }
  }

  // ── Bookmark Toggle Action ───────────────────────────────────
  window.toggleLmsBookmark = function (courseId, event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const idx = state.bookmarks.indexOf(courseId);
    if (idx >= 0) {
      state.bookmarks.splice(idx, 1);
    } else {
      state.bookmarks.push(courseId);
    }
    saveBookmarks();

    // Update buttons in DOM
    document.querySelectorAll(`.lms-bookmark-btn[data-course-id="${courseId}"]`).forEach(btn => {
      const isSaved = state.bookmarks.includes(courseId);
      btn.classList.toggle('active', isSaved);
      btn.setAttribute('aria-label', isSaved ? 'Remove bookmark' : 'Bookmark course');
      btn.setAttribute('title', isSaved ? 'Remove bookmark' : 'Bookmark course');
    });

    updateCounters();

    // If currently on Bookmarked subtab, re-render
    if (state.currentTab === 'my-learning' && state.myLearningSubtab === 'bookmarked') {
      renderMyLearning();
    }
  };

  // ── Enrollments & Progress Extraction ────────────────────────
  function getEnrollmentsForActiveUser() {
    if (!state.user) return [];

    // 1. Read real paid enrollments from checkout / M-Pesa verification
    let paidEnr = [];
    try {
      const stored = JSON.parse(localStorage.getItem('ik_enrollments') || '[]');
      paidEnr = stored.filter(e => e.userId === state.user.id);
    } catch { /* ignore */ }

    // 2. Read LMSEngine enrollments for this specific user
    let lmsEnr = [];
    if (window.LMSEngine && typeof window.LMSEngine.getAllEnrollments === 'function') {
      const allEnr = window.LMSEngine.getAllEnrollments();
      lmsEnr = allEnr.filter(e => e.studentId === state.user.id);
    }

    const combined = [...paidEnr.map(e => ({
      id: e.orderReference || ('enr_' + e.courseId),
      courseId: e.courseId,
      studentId: state.user.id,
      progressPercent: e.progressPercent || 0,
      completedLessons: e.completedLessons || [],
      activeLessonId: e.activeLessonId || null,
      status: 'active',
      enrolledAt: e.enrolledAt || new Date().toISOString()
    }))];

    lmsEnr.forEach(e => {
      if (!combined.some(c => c.courseId === e.courseId)) {
        combined.push(e);
      }
    });

    return combined;
  }

  // ── Render Personalised Welcome Section ───────────────────────
  function renderWelcomeArea() {
    const welcomeHeading = document.getElementById('lms-welcome-heading');
    const welcomeSub = document.getElementById('lms-welcome-sub');
    const userRoleBadge = document.getElementById('lms-user-role-badge');
    const userAvatarEl = document.getElementById('lms-user-avatar');
    const userNameEl = document.getElementById('lms-user-display-name');

    if (state.user && state.user.name) {
      const firstName = state.user.name.split(' ')[0] || 'Learner';
      if (welcomeHeading) {
        welcomeHeading.innerHTML = `Welcome back, <span style="color:var(--lms-primary); font-weight:800;">${firstName}</span> 👋`;
      }
      if (welcomeSub) {
        welcomeSub.textContent = 'Continue learning, explore new courses, and track your progress.';
      }
      if (userRoleBadge) {
        const roleLabel = state.user.role === 'admin'
          ? 'Administrator'
          : (state.user.role === 'trainer' ? 'Educator / Trainer' : 'Verified Learner');
        userRoleBadge.textContent = roleLabel;
      }
      if (userAvatarEl) {
        userAvatarEl.textContent = state.user.avatar || firstName.slice(0, 2).toUpperCase();
      }
      if (userNameEl) {
        userNameEl.textContent = state.user.name;
      }
    } else {
      if (welcomeHeading) {
        welcomeHeading.innerHTML = `Welcome to <span style="color:var(--lms-primary);">Instructify Learning</span> 🎓`;
      }
      if (welcomeSub) {
        welcomeSub.textContent = 'Build practical skills, access educator-created courses, and learn at your own pace.';
      }
      if (userRoleBadge) {
        userRoleBadge.textContent = 'Guest Learner';
      }
      if (userAvatarEl) {
        userAvatarEl.textContent = 'IK';
      }
      if (userNameEl) {
        userNameEl.textContent = 'Sign In to Track Progress';
      }
    }

    updateCounters();
  }

  // ── Update Counters Across the Page ──────────────────────────
  function updateCounters() {
    const enrollments = getEnrollmentsForActiveUser();
    const inProgressCount = enrollments.filter(e => e.progressPercent > 0 && e.progressPercent < 100).length;
    const completedCount = enrollments.filter(e => e.progressPercent === 100).length;
    const bookmarkedCount = state.bookmarks.length;
    const totalCourses = state.courses.length || 9;
    const certCount = DEFAULT_CERTIFICATES.length;

    // Welcome strip pills
    const welEnrolled = document.getElementById('welcome-enrolled-count');
    if (welEnrolled) welEnrolled.textContent = enrollments.length;

    const welProgress = document.getElementById('welcome-progress-count');
    if (welProgress) welProgress.textContent = inProgressCount;

    const welBookmarked = document.getElementById('welcome-bookmarks-count');
    if (welBookmarked) welBookmarked.textContent = bookmarkedCount;

    const welCert = document.getElementById('welcome-cert-count');
    if (welCert) welCert.textContent = completedCount;

    // Quick Actions Panel
    const qaProgress = document.getElementById('qa-count-inprogress');
    if (qaProgress) qaProgress.textContent = inProgressCount;

    const qaTotal = document.getElementById('qa-count-total');
    if (qaTotal) qaTotal.textContent = totalCourses;

    const qaBookmarked = document.getElementById('qa-count-bookmarked');
    if (qaBookmarked) qaBookmarked.textContent = bookmarkedCount;

    const qaCompleted = document.getElementById('qa-count-completed');
    if (qaCompleted) qaCompleted.textContent = completedCount;

    // Subtabs counters in My Learning
    const tabCountProg = document.getElementById('tab-count-inprogress');
    if (tabCountProg) tabCountProg.textContent = inProgressCount;

    const tabCountEnr = document.getElementById('tab-count-enrolled');
    if (tabCountEnr) tabCountEnr.textContent = enrollments.length;

    const tabCountBkm = document.getElementById('tab-count-bookmarked');
    if (tabCountBkm) tabCountBkm.textContent = bookmarkedCount;

    const tabCountCmp = document.getElementById('tab-count-completed');
    if (tabCountCmp) tabCountCmp.textContent = completedCount;

    const tabCountCrt = document.getElementById('tab-count-certificates');
    if (tabCountCrt) tabCountCrt.textContent = certCount;

    // Update Quick Resume box in Left Panel
    renderQuickResumeBox(enrollments);
  }

  // ── Render Quick Resume Card inside Quick Action Panel ────────
  function renderQuickResumeBox(enrollments) {
    const resumeContainer = document.getElementById('lms-quick-resume-box');
    if (!resumeContainer) return;

    const activeEnr = enrollments.find(e => e.progressPercent > 0 && e.progressPercent < 100);
    if (!activeEnr) {
      resumeContainer.innerHTML = `
        <div class="lms-qr-header">Ready to Learn?</div>
        <div class="lms-qr-course-title">Explore CBC Accredited Tracks</div>
        <p style="font-size:11.5px; color:#94A3B8; margin:0 0 10px; line-height:1.4;">Pick a course from our catalog to begin earning CPD credit hours.</p>
        <button onclick="scrollToLmsCatalog()" class="lms-qr-btn" style="background:#2563EB;">Browse Catalog &rarr;</button>
      `;
      return;
    }

    const course = state.courses.find(c => c.id === activeEnr.courseId) || {
      title: 'ICT Integration in Education',
      id: activeEnr.courseId
    };

    resumeContainer.innerHTML = `
      <div class="lms-qr-header">⚡ Continue Learning</div>
      <div class="lms-qr-course-title" title="${course.title}">${course.title}</div>
      <div class="lms-qr-bar-bg" aria-label="Lesson Progress">
        <div class="lms-qr-bar-fill" style="width: ${activeEnr.progressPercent}%;"></div>
      </div>
      <div class="lms-qr-footer">
        <span class="lms-qr-percent">${activeEnr.progressPercent}% Completed</span>
        <a href="course-player.html?courseId=${course.id}" class="lms-qr-btn">Resume Lesson &rarr;</a>
      </div>
    `;
  }

  // ── Render Academies Grid ────────────────────────────────────
  function renderAcademies() {
    const container = document.getElementById('lms-academies-grid');
    if (!container) return;

    container.innerHTML = ACADEMIES.map(acad => {
      const isSelected = state.filters.academy === acad.id;
      return `
        <div class="lms-academy-card lms-academy-theme-${acad.theme} ${isSelected ? 'active' : ''}"
          style="--acad-accent:${acad.accent}; --acad-accent-dark:${acad.accentDark}; --acad-soft:${acad.accentSoft}; --acad-ring:${acad.accentRing}; --acad-glow:${acad.glow}; --acad-bar:${acad.barGradient}; --acad-pedestal:${acad.pedestalGradient};"
          onclick="selectAcademy('${acad.id}', '${acad.filterKeyword}')"
          onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();selectAcademy('${acad.id}','${acad.filterKeyword}');}"
          role="button" tabindex="0" aria-pressed="${isSelected ? 'true' : 'false'}" aria-label="Browse ${acad.title}">
          <div class="lms-academy-body">
            <div class="lms-academy-icon-box" aria-hidden="true">
              ${acad.iconSvg}
            </div>
            <span class="lms-academy-badge">✓ Accredited Track</span>
            <h3 class="lms-academy-h3">${acad.title}</h3>
            <p class="lms-academy-desc">${acad.desc}</p>
          </div>
          <div class="lms-academy-footer">
            <span class="lms-academy-cta">
              <span>Explore Courses</span>
              <span class="lms-academy-arrow" aria-hidden="true">&rarr;</span>
            </span>
          </div>
        </div>
      `;
    }).join('');
  }

  window.selectAcademy = function (academyId, keyword) {
    if (state.filters.academy === academyId) {
      state.filters.academy = 'all';
      state.filters.category = 'all';
    } else {
      state.filters.academy = academyId;
      state.filters.category = keyword;
    }
    renderAcademies();
    renderCatalog();

    // Scroll smoothly to catalog
    scrollToLmsCatalog();
  };

  // ── Category Configuration (Restrained, Colourful EdTech Accents) ──
  const CATEGORY_CONFIG = {
    'EdTech & Smart Learning': {
      theme: 'edtech',
      color: '#1D4ED8',
      bg: '#EFF6FF',
      border: '#BFDBFE',
      icon: '🎒'
    },
    'ICT': {
      theme: 'ict',
      color: '#4338CA',
      bg: '#EEF2FF',
      border: '#C7D2FE',
      icon: '💻'
    },
    'Digital Skills': {
      theme: 'digital',
      color: '#047857',
      bg: '#ECFDF5',
      border: '#A7F3D0',
      icon: '🎓'
    },
    'Curriculum': {
      theme: 'curriculum',
      color: '#15803D',
      bg: '#F0FDF4',
      border: '#BBF7D0',
      icon: '📗'
    },
    'AI & Tech': {
      theme: 'ai',
      color: '#6D28D9',
      bg: '#F5F3FF',
      border: '#DDD6FE',
      icon: '🤖'
    },
    'Pedagogy': {
      theme: 'pedagogy',
      color: '#B45309',
      bg: '#FFFBEB',
      border: '#FDE68A',
      icon: '🌐'
    },
    'Leadership': {
      theme: 'leadership',
      color: '#0F4C81',
      bg: '#F0F7FF',
      border: '#BAE6FD',
      icon: '🏛️'
    },
    'Assessment': {
      theme: 'assessment',
      color: '#BE123C',
      bg: '#FFF1F2',
      border: '#FECDD3',
      icon: '🧠'
    },
    'CPD': {
      theme: 'cpd',
      color: '#0F766E',
      bg: '#F0FDFA',
      border: '#99F6E4',
      icon: '🏆'
    }
  };

  // ── Active Filters Indicators Bar Helper ─────────────────────
  function renderActiveFilterChips() {
    const bar = document.getElementById('lms-active-filters-bar');
    const container = document.getElementById('lms-active-chips-container');
    if (!bar || !container) return;

    const activeChips = [];

    if (state.filters.query) {
      activeChips.push({
        label: `Search: "${state.filters.query}"`,
        clear: () => clearLmsSearch()
      });
    }
    if (state.filters.category !== 'all') {
      activeChips.push({
        label: `Category: ${state.filters.category}`,
        clear: () => setLmsFilter('category', 'all')
      });
    }
    if (state.filters.level !== 'all') {
      activeChips.push({
        label: `Level: ${state.filters.level}`,
        clear: () => {
          state.filters.level = 'all';
          const sel = document.getElementById('lms-level-select');
          if (sel) sel.value = 'all';
          renderCatalog();
        }
      });
    }
    if (state.filters.format !== 'all') {
      activeChips.push({
        label: `Mode: ${state.filters.format}`,
        clear: () => {
          state.filters.format = 'all';
          const sel = document.getElementById('lms-format-select');
          if (sel) sel.value = 'all';
          renderCatalog();
        }
      });
    }
    if (state.filters.duration !== 'all') {
      const labels = { short: 'Short (≤ 4 Wks)', medium: 'Medium (4–8 Wks)', long: 'Comprehensive (8+ Wks)' };
      activeChips.push({
        label: `Duration: ${labels[state.filters.duration] || state.filters.duration}`,
        clear: () => {
          state.filters.duration = 'all';
          const sel = document.getElementById('lms-duration-select');
          if (sel) sel.value = 'all';
          renderCatalog();
        }
      });
    }
    if (state.filters.pricing !== 'all') {
      const labels = { free: 'Free Access', paid: 'Paid Certificate Tracks', under10k: '< KES 10,000', '10k-18k': 'KES 10k–18k', above18k: '> KES 18,000' };
      activeChips.push({
        label: `Tuition: ${labels[state.filters.pricing] || state.filters.pricing}`,
        clear: () => {
          state.filters.pricing = 'all';
          const sel = document.getElementById('lms-price-select');
          if (sel) sel.value = 'all';
          renderCatalog();
        }
      });
    }
    if (state.filters.cpd) {
      activeChips.push({
        label: `TSC & CPD Only`,
        clear: () => {
          state.filters.cpd = false;
          const chk = document.getElementById('cpd-filter-chk');
          if (chk) chk.checked = false;
          renderCatalog();
        }
      });
    }

    if (activeChips.length === 0) {
      bar.style.display = 'none';
      container.innerHTML = '';
    } else {
      bar.style.display = 'flex';
      container.innerHTML = activeChips.map((chip, index) => `
        <span class="lms-active-chip">
          <span>${chip.label}</span>
          <button type="button" class="chip-remove-btn" onclick="window.__clearLmsActiveFilter(${index})" aria-label="Remove filter ${chip.label}">✕</button>
        </span>
      `).join('');
      window.__activeFilterCallbacks = activeChips.map(c => c.clear);
    }
  }

  window.__clearLmsActiveFilter = function (index) {
    if (window.__activeFilterCallbacks && window.__activeFilterCallbacks[index]) {
      window.__activeFilterCallbacks[index]();
    }
  };

  // ── Render Course Card (Formal, Colourful, Appealing LMS Card) ──
  function createCourseCardHtml(c, isListView = false) {
    const isSaved = state.bookmarks.includes(c.id);
    const thumb = c.image || c.thumbnail || 'assets/images/course_assessment_mastery.jpg';
    const rating = c.rating || '4.8';
    const reviews = c.reviewCount || c.reviewsCount || 120;
    const duration = c.duration || '6 Weeks';
    const level = c.level || 'All Levels';
    const deliveryMode = c.format || 'Online Self-Paced';
    const targetAudience = c.targetAudience || 'Educators & Lifelong Learners';
    const accreditation = c.accreditation || (c.cpd ? `TSC CPD Accredited (${c.cpdHours || 30} Hours)` : 'Accredited Certificate Included');
    const priceVal = typeof c.price === 'number' ? c.price : parseInt(String(c.price || '0').replace(/[^0-9]/g, ''), 10);
    const priceStr = priceVal === 0 ? 'FREE ACCESS' : 'KES ' + (priceVal ? priceVal.toLocaleString() : '15,000');
    const origPriceStr = c.originalPrice ? `KES ${typeof c.originalPrice === 'number' ? c.originalPrice.toLocaleString() : c.originalPrice}` : '';

    const cat = CATEGORY_CONFIG[c.category] || {
      theme: 'default',
      color: '#1D4ED8',
      bg: '#EFF6FF',
      border: '#BFDBFE',
      icon: '📚'
    };

    const topics = Array.isArray(c.outcomes) && c.outcomes.length > 0
      ? c.outcomes.slice(0, 4)
      : ['Competency-based digital pedagogy', 'Practical classroom implementation', 'Reflective portfolio building'];

    // Check if enrolled
    const enrollments = getEnrollmentsForActiveUser();
    const enr = enrollments.find(e => e.courseId === c.id);
    const isEnrolled = !!enr;
    const progressPercent = isEnrolled ? (enr.progressPercent || 0) : 0;

    const detailUrl = `course-detail.html?id=${encodeURIComponent(c.id)}`;
    const syllabusUrl = `course-detail.html?id=${encodeURIComponent(c.id)}#syllabus`;
    const enrolUrl = `checkout.html?id=${encodeURIComponent(c.id)}`;
    const playerUrl = `course-player.html?courseId=${encodeURIComponent(c.id)}`;

    if (isListView) {
      return `
        <article class="lms-course-card lms-course-card-list category-${cat.theme}" data-course-id="${c.id}" aria-label="${c.title}">
          <div class="lms-card-top-accent" style="background:${cat.color};"></div>
          <div class="lms-card-list-wrapper" style="display:flex; flex-direction:row; flex-wrap:wrap; width:100%;">
            <div class="lms-course-thumb-box" style="width:300px; min-height:220px; position:relative; flex-shrink:0;">
              <img src="${thumb}" alt="${c.title}" class="lms-course-thumb-img" onerror="this.src='assets/images/course_assessment_mastery.jpg'" loading="lazy">
              <span class="lms-course-category-badge" style="color:${cat.color}; background:${cat.bg}; border:1px solid ${cat.border};">
                ${cat.icon} ${c.category}
              </span>
              <span class="lms-course-mode-badge">${deliveryMode}</span>
              ${c.cpd ? '<span class="lms-course-cpd-badge">✓ CPD Verified</span>' : ''}
              <button type="button" class="lms-bookmark-btn ${isSaved ? 'active' : ''}" data-course-id="${c.id}" onclick="toggleLmsBookmark('${c.id}', event)" aria-label="${isSaved ? 'Remove from saved' : 'Save course'}" title="${isSaved ? 'Remove from saved' : 'Save course'}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="${isSaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
              </button>
            </div>
            <div class="lms-course-body" style="padding:24px 28px; justify-content:space-between; flex:1; min-width:300px;">
              <div>
                <div class="lms-meta-chips-strip">
                  <span class="lms-meta-badge">⏱️ ${duration} ${c.cpdHours ? `(${c.cpdHours} Hrs)` : ''}</span>
                  <span class="lms-meta-badge">🎯 ${level}</span>
                  <span class="lms-meta-badge">💻 ${deliveryMode}</span>
                  <span class="lms-rating-badge">★ ${rating} <span class="review-count">(${reviews} reviews)</span></span>
                </div>
                <h3 class="lms-course-title">
                  <a href="${detailUrl}">${c.title}</a>
                </h3>
                <div class="lms-audience-tag">
                  <span class="audience-icon">👥</span>
                  <span class="audience-label">Audience:</span>
                  <span class="audience-value">${targetAudience}</span>
                </div>
                <p class="lms-course-desc">${c.description || ''}</p>
                <div class="lms-outline-block">
                  <div class="lms-outline-header">
                    <span class="outline-icon">📋</span>
                    <span>What You Will Learn:</span>
                  </div>
                  <ul class="lms-outline-list">
                    ${topics.map(t => `<li><span class="bullet-check">✓</span> <span>${t}</span></li>`).join('')}
                  </ul>
                  <a href="${syllabusUrl}" class="lms-outline-link" aria-label="View full course outline for ${c.title}">
                    View Full Outline &rarr;
                  </a>
                </div>
                <div class="lms-accreditation-row">
                  <span class="lms-accreditation-badge">📜 ${accreditation}</span>
                </div>
                ${isEnrolled ? `
                  <div class="lms-card-progress-wrap">
                    <div class="lms-card-progress-labels">
                      <span>Progress</span>
                      <span>${progressPercent}% Complete</span>
                    </div>
                    <div class="lms-card-progress-bar-bg">
                      <div class="lms-card-progress-bar-fill" style="width: ${progressPercent}%;"></div>
                    </div>
                  </div>
                ` : ''}
              </div>
              <div class="lms-course-footer" style="padding:16px 0 0 0; margin-top:16px; border-top:1px solid #E8E3D5; background:transparent;">
                <div class="lms-course-price-box">
                  <span class="price-label">Tuition / Investment</span>
                  <div class="price-wrap">
                    <span class="price-current ${priceVal === 0 ? 'free' : ''}">${priceStr}</span>
                    ${origPriceStr ? `<span class="price-original">${origPriceStr}</span>` : ''}
                  </div>
                </div>
                <div class="lms-card-button-group">
                  <a href="${detailUrl}" class="btn-lms-view" aria-label="View Course ${c.title}">View Course</a>
                  <a href="${isEnrolled ? playerUrl : enrolUrl}" class="btn-lms-enrol" aria-label="${isEnrolled ? `Continue learning ${c.title}` : `Enrol now in ${c.title}`}">
                    ${isEnrolled ? '▶ Continue Learning' : '⚡ Enrol Now'}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </article>
      `;
    }

    return `
      <article class="lms-course-card category-${cat.theme}" data-course-id="${c.id}" aria-label="${c.title}">
        <!-- Top Category Accent Bar -->
        <div class="lms-card-top-accent" style="background:${cat.color};"></div>

        <!-- Thumbnail Area -->
        <div class="lms-course-thumb-box">
          <img src="${thumb}" alt="${c.title}" class="lms-course-thumb-img" onerror="this.src='assets/images/course_assessment_mastery.jpg'" loading="lazy">
          <span class="lms-course-category-badge" style="color:${cat.color}; background:${cat.bg}; border:1px solid ${cat.border};">
            ${cat.icon} ${c.category}
          </span>
          <span class="lms-course-mode-badge">${deliveryMode}</span>
          ${c.cpd ? '<span class="lms-course-cpd-badge">✓ CPD Verified</span>' : ''}
          <button type="button" class="lms-bookmark-btn ${isSaved ? 'active' : ''}" data-course-id="${c.id}" onclick="toggleLmsBookmark('${c.id}', event)" aria-label="${isSaved ? 'Remove from saved' : 'Save course'}" title="${isSaved ? 'Remove from saved' : 'Save course'}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="${isSaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
          </button>
        </div>

        <!-- Card Body -->
        <div class="lms-course-body">
          <!-- Meta Strip -->
          <div class="lms-meta-chips-strip">
            <span class="lms-meta-badge">⏱️ ${duration} ${c.cpdHours ? `(${c.cpdHours} Hrs)` : ''}</span>
            <span class="lms-meta-badge">🎯 ${level}</span>
            <span class="lms-rating-badge">★ ${rating} <span class="review-count">(${reviews})</span></span>
          </div>

          <!-- Course Title -->
          <h3 class="lms-course-title">
            <a href="${detailUrl}">${c.title}</a>
          </h3>

          <!-- Target Audience -->
          <div class="lms-audience-tag">
            <span class="audience-icon">👥</span>
            <span class="audience-label">Audience:</span>
            <span class="audience-value">${targetAudience}</span>
          </div>

          <!-- Summarised Description (25-40 words) -->
          <p class="lms-course-desc">${c.description || ''}</p>

          <!-- What You Will Learn (Course Outline) -->
          <div class="lms-outline-block">
            <div class="lms-outline-header">
              <span class="outline-icon">📋</span>
              <span>What You Will Learn:</span>
            </div>
            <ul class="lms-outline-list">
              ${topics.map(t => `<li><span class="bullet-check">✓</span> <span>${t}</span></li>`).join('')}
            </ul>
            <a href="${syllabusUrl}" class="lms-outline-link" aria-label="View full course outline for ${c.title}">
              View Full Outline &rarr;
            </a>
          </div>

          <!-- Accreditation Status -->
          <div class="lms-accreditation-row">
            <span class="lms-accreditation-badge">📜 ${accreditation}</span>
          </div>

          <!-- Enrolment Progress Bar (if enrolled) -->
          ${isEnrolled ? `
            <div class="lms-card-progress-wrap">
              <div class="lms-card-progress-labels">
                <span>Progress</span>
                <span>${progressPercent}% Complete</span>
              </div>
              <div class="lms-card-progress-bar-bg">
                <div class="lms-card-progress-bar-fill" style="width: ${progressPercent}%;"></div>
              </div>
            </div>
          ` : ''}

          <!-- Instructor Attribution -->
          <div class="lms-instructor-row">
            <div class="lms-inst-avatar">${c.instructorAvatar || 'IK'}</div>
            <div class="lms-inst-info">
              <span class="inst-name">${c.instructor || 'Instructify Faculty'}</span>
              <span class="inst-role">${c.instructorTitle || 'Education Specialist'}</span>
            </div>
          </div>
        </div>

        <!-- Card Footer -->
        <div class="lms-course-footer">
          <div class="lms-course-price-box">
            <span class="price-label">Tuition / Investment</span>
            <div class="price-wrap">
              <span class="price-current ${priceVal === 0 ? 'free' : ''}">${priceStr}</span>
              ${origPriceStr ? `<span class="price-original">${origPriceStr}</span>` : ''}
            </div>
          </div>
          <div class="lms-card-button-group">
            <a href="${detailUrl}" class="btn-lms-view" aria-label="View Course ${c.title}">View Course</a>
            <a href="${isEnrolled ? playerUrl : enrolUrl}" class="btn-lms-enrol" aria-label="${isEnrolled ? `Continue learning ${c.title}` : `Enrol now in ${c.title}`}">
              ${isEnrolled ? '▶ Continue Learning' : '⚡ Enrol Now'}
            </a>
          </div>
        </div>
      </article>
    `;
  }

  // ── Render Filtered Catalog ──────────────────────────────────
  function renderCatalog() {
    const grid = document.getElementById('courses-grid');
    if (!grid) return;

    let results = state.courses.filter(c => {
      // Search query (matches title, description, instructor, category, tags, outcomes, targetAudience)
      if (state.filters.query) {
        const q = state.filters.query.toLowerCase().trim();
        const titleMatch = (c.title || '').toLowerCase().includes(q);
        const descMatch = (c.description || '').toLowerCase().includes(q);
        const instMatch = (c.instructor || '').toLowerCase().includes(q);
        const catMatch = (c.category || '').toLowerCase().includes(q);
        const audMatch = (c.targetAudience || '').toLowerCase().includes(q);
        const tagsMatch = Array.isArray(c.tags) && c.tags.some(t => t.toLowerCase().includes(q));
        const outcomesMatch = Array.isArray(c.outcomes) && c.outcomes.some(t => t.toLowerCase().includes(q));
        if (!titleMatch && !descMatch && !instMatch && !catMatch && !audMatch && !tagsMatch && !outcomesMatch) return false;
      }

      // Category filter
      if (state.filters.category !== 'all') {
        const cat = (c.category || '').toLowerCase();
        const target = state.filters.category.toLowerCase();
        if (!cat.includes(target) && !(target === 'curriculum' && cat.includes('cbe'))) {
          const tagMatches = Array.isArray(c.tags) && c.tags.some(t => t.toLowerCase().includes(target));
          if (!tagMatches) return false;
        }
      }

      // Skill level filter
      if (state.filters.level !== 'all') {
        const lvl = (c.level || '').toLowerCase();
        if (!lvl.includes(state.filters.level.toLowerCase())) return false;
      }

      // Delivery mode filter
      if (state.filters.format !== 'all') {
        const fmt = (c.format || '').toLowerCase();
        if (!fmt.includes(state.filters.format.toLowerCase())) return false;
      }

      // Duration filter
      if (state.filters.duration !== 'all') {
        const dur = (c.duration || '').toLowerCase();
        const weeks = parseInt(dur.replace(/[^0-9]/g, ''), 10) || 6;
        if (state.filters.duration === 'short' && weeks > 4) return false;
        if (state.filters.duration === 'medium' && (weeks <= 4 || weeks > 8)) return false;
        if (state.filters.duration === 'long' && weeks <= 8) return false;
      }

      // Pricing filter
      if (state.filters.pricing !== 'all') {
        const priceVal = typeof c.price === 'number' ? c.price : parseInt(String(c.price || '0').replace(/[^0-9]/g, ''), 10);
        if (state.filters.pricing === 'free' && priceVal > 0) return false;
        if (state.filters.pricing === 'paid' && priceVal === 0) return false;
        if (state.filters.pricing === 'under10k' && (priceVal <= 0 || priceVal >= 10000)) return false;
        if (state.filters.pricing === '10k-18k' && (priceVal < 10000 || priceVal > 18000)) return false;
        if (state.filters.pricing === 'above18k' && priceVal <= 18000) return false;
      }

      // CPD filter
      if (state.filters.cpd && !c.cpd) return false;

      return true;
    });

    // Sorting
    if (state.filters.sort === 'rating') {
      results.sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0));
    } else if (state.filters.sort === 'price-low') {
      results.sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0));
    } else if (state.filters.sort === 'price-high') {
      results.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));
    } else if (state.filters.sort === 'duration') {
      results.sort((a, b) => {
        const durA = parseInt(String(a.duration || '6').replace(/[^0-9]/g, ''), 10) || 6;
        const durB = parseInt(String(b.duration || '6').replace(/[^0-9]/g, ''), 10) || 6;
        return durA - durB;
      });
    } else if (state.filters.sort === 'newest') {
      results.sort((a, b) => (b.new ? 1 : 0) - (a.new ? 1 : 0));
    } else {
      // Popular (default)
      results.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
    }

    // Update count indicator
    const countEl = document.getElementById('catalog-count');
    if (countEl) {
      countEl.textContent = `Showing ${results.length} of ${state.courses.length} Accredited Programs`;
    }

    // Render active filter chips
    renderActiveFilterChips();

    if (results.length === 0) {
      grid.innerHTML = `
        <div class="ik-empty-state" style="grid-column: 1 / -1;">
          <div class="ik-empty-icon" aria-hidden="true">🔍</div>
          <h4 class="ik-empty-title">No matching courses found</h4>
          <p class="ik-empty-desc">Try clearing your search query or resetting category filters to browse all available programmes.</p>
          <button type="button" onclick="resetLmsFilters()" class="btn btn-primary btn-sm">↺ Reset All Filters</button>
        </div>
      `;
      return;
    }

    const isList = state.viewMode === 'list';
    grid.innerHTML = results.map(c => createCourseCardHtml(c, isList)).join('');
  }

  // ── Render My Learning Tab Panels ────────────────────────────
  function renderMyLearning() {
    const container = document.getElementById('lms-mylearning-cards');
    if (!container) return;

    const enrollments = getEnrollmentsForActiveUser();
    let displayItems = [];

    if (state.myLearningSubtab === 'in-progress') {
      displayItems = enrollments.filter(e => e.progressPercent > 0 && e.progressPercent < 100);
      if (displayItems.length === 0) {
        container.innerHTML = `
          <div class="lms-empty-state-box">
            <div class="lms-empty-icon">📖</div>
            <h4 class="lms-empty-title">No courses currently in progress</h4>
            <p class="lms-empty-desc">You are not actively taking any course right now. Browse our catalog to enroll in accredited CPD programs.</p>
            <button onclick="scrollToLmsCatalog()" class="btn btn-primary btn-sm">Browse Course Catalog &rarr;</button>
          </div>
        `;
        return;
      }
    } else if (state.myLearningSubtab === 'enrolled') {
      displayItems = enrollments;
      if (displayItems.length === 0) {
        container.innerHTML = `
          <div class="lms-empty-state-box">
            <div class="lms-empty-icon">🎓</div>
            <h4 class="lms-empty-title">You are not enrolled in any courses yet</h4>
            <p class="lms-empty-desc">Explore our CBC and digital pedagogy curriculum to enroll today.</p>
            <button onclick="scrollToLmsCatalog()" class="btn btn-primary btn-sm">Explore Courses &rarr;</button>
          </div>
        `;
        return;
      }
    } else if (state.myLearningSubtab === 'bookmarked') {
      const bookmarkedCourses = state.courses.filter(c => state.bookmarks.includes(c.id));
      if (bookmarkedCourses.length === 0) {
        container.innerHTML = `
          <div class="lms-empty-state-box">
            <div class="lms-empty-icon">🔖</div>
            <h4 class="lms-empty-title">No courses saved to bookmarks</h4>
            <p class="lms-empty-desc">Click the bookmark icon on any course card in the catalog to save it for quick access later.</p>
            <button onclick="scrollToLmsCatalog()" class="btn btn-outline btn-sm">Browse Catalog &rarr;</button>
          </div>
        `;
        return;
      }
      container.innerHTML = bookmarkedCourses.map(c => createCourseCardHtml(c, false)).join('');
      return;
    } else if (state.myLearningSubtab === 'completed') {
      displayItems = enrollments.filter(e => e.progressPercent === 100);
      if (displayItems.length === 0) {
        container.innerHTML = `
          <div class="lms-empty-state-box">
            <div class="lms-empty-icon">🏆</div>
            <h4 class="lms-empty-title">No completed courses yet</h4>
            <p class="lms-empty-desc">Complete all lessons, quizzes, and modules in an active course to earn your verified accreditation certificate.</p>
            <button onclick="switchMyLearningSubtab('in-progress')" class="btn btn-outline btn-sm">View Ongoing Courses &rarr;</button>
          </div>
        `;
        return;
      }
    } else if (state.myLearningSubtab === 'certificates') {
      renderCertificates(container);
      return;
    }

    // Render ongoing or enrolled cards with full resume actions
    container.innerHTML = displayItems.map(enr => {
      const course = state.courses.find(c => c.id === enr.courseId) || {
        title: 'Accredited Curriculum Program',
        description: 'Competency-based professional development.',
        instructor: 'Dr. Wanjiku Kamau',
        image: 'assets/images/course_assessment_mastery.jpg'
      };

      const percent = enr.progressPercent || 0;
      const lessonTitle = enr.currentLessonTitle || 'Module 1: Getting Started';
      const isComplete = percent >= 100;

      return `
        <div class="lms-ml-card">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
              <span class="lms-badge ${isComplete ? 'badge-green' : 'badge-blue'}">${isComplete ? 'Completed' : 'In Progress'}</span>
              <span style="font-size:12px; color:var(--lms-text-muted);">Last active: ${enr.lastActiveAt ? 'Recent' : 'Today'}</span>
            </div>
            <h3 class="lms-course-title" style="font-size:17.5px; margin-bottom:6px;">${course.title}</h3>
            <div style="font-size:12.5px; color:#2563EB; font-weight:600; margin-bottom:14px;">
              📖 ${lessonTitle}
            </div>

            <div class="lms-card-progress-wrap" style="margin-bottom:16px;">
              <div class="lms-card-progress-labels">
                <span>Course Completion</span>
                <span style="color:#2563EB;">${percent}%</span>
              </div>
              <div class="lms-card-progress-bar-bg">
                <div class="lms-card-progress-bar-fill" style="width: ${percent}%;"></div>
              </div>
            </div>
          </div>

          <div style="display:flex; gap:10px; align-items:center; justify-content:space-between; border-top:1px solid #F7F3E6; padding-top:14px;">
            <a href="course-player.html?courseId=${enr.courseId}" class="btn ${isComplete ? 'btn-outline' : 'btn-primary'} btn-sm" style="flex:1; text-align:center;">
              ${isComplete ? 'Review Course ↻' : 'Continue Lesson →'}
            </a>
            ${isComplete ? `
              <a href="student-certificates.html" class="btn btn-outline btn-sm" title="View Certificate" style="color:#059669; border-color:#059669;">
                🏆 Certificate
              </a>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  // ── Render Certificates ──────────────────────────────────────
  function renderCertificates(container) {
    container.innerHTML = DEFAULT_CERTIFICATES.map(cert => `
      <div class="lms-ml-card" style="border-left: 4px solid #10B981;">
        <div>
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
            <span class="lms-badge badge-green">✓ Verified TSC &amp; KICD CPD</span>
            <span style="font-family:monospace; font-size:11px; color:#5B5882;">${cert.id}</span>
          </div>
          <h3 class="lms-course-title" style="font-size:18px; margin-bottom:6px;">${cert.courseTitle}</h3>
          <p style="font-size:13px; color:#433F6B; margin-bottom:12px;">Issued on <strong>${cert.issueDate}</strong> with grade <strong>${cert.grade}</strong>.</p>
          <div style="font-size:12px; color:#059669; font-weight:600; margin-bottom:16px;">
            🏅 ${cert.accreditation}
          </div>
        </div>
        <div style="display:flex; gap:10px; border-top:1px solid #F7F3E6; padding-top:14px;">
          <a href="student-certificates.html" class="btn btn-primary btn-sm" style="flex:1; text-align:center;">View Certificate &rarr;</a>
          <button onclick="window.print()" class="btn btn-outline btn-sm">Print</button>
        </div>
      </div>
    `).join('');
  }

  // ── Subtab Switcher in My Learning ───────────────────────────
  window.switchMyLearningSubtab = function (subtab) {
    state.myLearningSubtab = subtab;
    document.querySelectorAll('.lms-ml-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-subtab') === subtab);
    });
    renderMyLearning();
  };

  // ── LMS Top Navigation Tab Switcher ──────────────────────────
  window.switchLmsNavTab = function (tabName, optionalSubtab) {
    state.currentTab = tabName;

    // Update active nav links
    document.querySelectorAll('.lms-subnav-link').forEach(link => {
      link.classList.toggle('active', link.getAttribute('data-tab') === tabName);
    });

    const homeOverview = document.getElementById('lms-overview-section');
    const myLearningSection = document.getElementById('lms-mylearning-section');
    const academiesSection = document.getElementById('academies-section');
    const catalogSection = document.getElementById('catalog-section');
    const adminSection = document.getElementById('lms-admin-studio-section');

    if (tabName === 'home') {
      if (homeOverview) homeOverview.style.display = 'block';
      if (myLearningSection) myLearningSection.style.display = 'none';
      if (academiesSection) academiesSection.style.display = 'block';
      if (catalogSection) catalogSection.style.display = 'block';
      if (adminSection) adminSection.style.display = 'none';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tabName === 'my-learning') {
      if (homeOverview) homeOverview.style.display = 'none';
      if (myLearningSection) myLearningSection.style.display = 'block';
      if (academiesSection) academiesSection.style.display = 'none';
      if (catalogSection) catalogSection.style.display = 'none';
      if (adminSection) adminSection.style.display = 'none';
      if (optionalSubtab) {
        switchMyLearningSubtab(optionalSubtab);
      } else {
        renderMyLearning();
      }
      myLearningSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (tabName === 'academies') {
      if (homeOverview) homeOverview.style.display = 'block';
      if (myLearningSection) myLearningSection.style.display = 'none';
      if (academiesSection) academiesSection.style.display = 'block';
      if (catalogSection) catalogSection.style.display = 'block';
      if (adminSection) adminSection.style.display = 'none';
      academiesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (tabName === 'admin') {
      if (adminSection) {
        adminSection.style.display = 'block';
        adminSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Quick Action Switcher Proxy
  window.switchLmsTab = function (tabName, subtab) {
    window.switchLmsNavTab(tabName, subtab);
  };

  window.scrollToLmsCatalog = function () {
    // Make sure catalog is visible
    const homeOverview = document.getElementById('lms-overview-section');
    const myLearningSection = document.getElementById('lms-mylearning-section');
    const catalogSection = document.getElementById('catalog-section');
    if (homeOverview) homeOverview.style.display = 'block';
    if (myLearningSection) myLearningSection.style.display = 'none';
    if (catalogSection) {
      catalogSection.style.display = 'block';
      catalogSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // ── Filter Controls API ──────────────────────────────────────
  window.setLmsFilter = function (key, value) {
    state.filters[key] = value;

    // Update active filter chip UI if applicable
    if (key === 'category') {
      document.querySelectorAll('.lms-filter-chip').forEach(chip => {
        chip.classList.toggle('active', chip.getAttribute('data-category') === value);
      });
    }

    renderCatalog();
  };

  window.toggleLmsCPD = function (chk) {
    state.filters.cpd = chk.checked;
    renderCatalog();
  };

  window.setLmsViewMode = function (mode) {
    state.viewMode = mode;
    localStorage.setItem(STORAGE_KEYS.VIEW_MODE, mode);

    const btnGrid = document.getElementById('btn-view-grid');
    const btnList = document.getElementById('btn-view-list');
    const grid = document.getElementById('courses-grid');

    if (btnGrid) btnGrid.classList.toggle('active', mode === 'grid');
    if (btnList) btnList.classList.toggle('active', mode === 'list');

    if (grid) {
      if (mode === 'grid') {
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))';
        grid.style.gap = '24px';
      } else {
        grid.style.display = 'flex';
        grid.style.flexDirection = 'column';
        grid.style.gap = '18px';
      }
    }

    renderCatalog();
  };

  window.resetLmsFilters = function () {
    state.filters = {
      query: '',
      category: 'all',
      academy: 'all',
      level: 'all',
      format: 'all',
      duration: 'all',
      pricing: 'all',
      cpd: false,
      sort: 'popular'
    };

    const searchInput = document.getElementById('course-search');
    if (searchInput) searchInput.value = '';

    const clearBtn = document.getElementById('search-clear-btn');
    if (clearBtn) clearBtn.style.display = 'none';

    const cpdChk = document.getElementById('cpd-filter-chk');
    if (cpdChk) cpdChk.checked = false;

    const levelSelect = document.getElementById('lms-level-select');
    if (levelSelect) levelSelect.value = 'all';

    const formatSelect = document.getElementById('lms-format-select');
    if (formatSelect) formatSelect.value = 'all';

    const durSelect = document.getElementById('lms-duration-select');
    if (durSelect) durSelect.value = 'all';

    const priceSelect = document.getElementById('lms-price-select');
    if (priceSelect) priceSelect.value = 'all';

    const sortSelect = document.getElementById('course-sort-select');
    if (sortSelect) sortSelect.value = 'popular';

    document.querySelectorAll('.lms-filter-chip').forEach(chip => {
      chip.classList.toggle('active', chip.getAttribute('data-category') === 'all');
    });

    renderAcademies();
    renderCatalog();
  };

  window.clearLmsSearch = function () {
    const searchInput = document.getElementById('course-search');
    if (searchInput) {
      searchInput.value = '';
      searchInput.focus();
    }
    const clearBtn = document.getElementById('search-clear-btn');
    if (clearBtn) clearBtn.style.display = 'none';
    state.filters.query = '';
    renderCatalog();
  };

  window.executeSearch = function () {
    const searchInput = document.getElementById('course-search');
    if (searchInput) {
      state.filters.query = searchInput.value.trim();
    }
    renderCatalog();
    scrollToLmsCatalog();
  };

  // ── Role Switcher for Evaluation / Admin Access ──────────────
  window.changeDemoRole = function (role) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ROLE_OVERRIDE, role);
    initUserSession();
    renderWelcomeArea();
    updateRoleBasedNav();
    updateCounters();
    renderCatalog();
    if (state.currentTab === 'my-learning') renderMyLearning();
  };

  function updateRoleBasedNav() {
    const adminLink = document.getElementById('lms-nav-admin');
    const adminStudioSection = document.getElementById('lms-admin-studio-section');
    const roleSelect = document.getElementById('lms-role-select-box');

    const isEducatorOrAdmin = state.user && (state.user.role === 'admin' || state.user.role === 'trainer');

    if (adminLink) {
      adminLink.style.display = isEducatorOrAdmin ? 'inline-flex' : 'none';
    }
    if (adminStudioSection) {
      if (!isEducatorOrAdmin) adminStudioSection.style.display = 'none';
    }
    if (roleSelect && state.user) {
      roleSelect.value = state.user.role;
    }
  }

  // ── Featured Banner Manageability ────────────────────────────
  function loadFeaturedBanner() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FEATURED_BANNER);
      if (stored) {
        const data = JSON.parse(stored);
        const titleEl = document.getElementById('featured-banner-title');
        const descEl = document.getElementById('featured-banner-desc');
        if (titleEl && data.title) titleEl.textContent = data.title;
        if (descEl && data.desc) descEl.textContent = data.desc;
      }
    } catch (e) {
      console.warn('Could not load custom featured banner', e);
    }
  }

  window.editFeaturedBanner = function () {
    const newTitle = prompt('Enter Featured Program Title:', 'Digital Literacy for Educators Masterclass');
    if (!newTitle) return;
    const newDesc = prompt('Enter Featured Supporting Message:', 'Build practical skills, access educator-created courses, and learn at your own pace.');
    if (!newDesc) return;

    const data = { title: newTitle, desc: newDesc };
    localStorage.setItem(STORAGE_KEYS.FEATURED_BANNER, JSON.stringify(data));
    loadFeaturedBanner();
  };

  // ── Setup Real-Time Search Listeners ─────────────────────────
  function setupSearchListeners() {
    const searchInput = document.getElementById('course-search');
    const clearBtn = document.getElementById('search-clear-btn');
    let debounceTimer;

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const val = e.target.value;
        if (clearBtn) {
          clearBtn.style.display = val.length > 0 ? 'inline-flex' : 'none';
        }
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          state.filters.query = val;
          renderCatalog();
        }, 200);
      });

      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          executeSearch();
        }
      });
    }
  }

  // ── Public Initialization ────────────────────────────────────
  function init() {
    state.courses = getAllCourses();
    loadBookmarks();
    initUserSession();
    renderWelcomeArea();
    updateRoleBasedNav();
    loadFeaturedBanner();
    renderAcademies();
    renderCatalog();
    setupSearchListeners();

    // Check URL parameters (e.g. courses.html?category=Digital or courses.html?tab=my-learning)
    const urlParams = new URLSearchParams(window.location.search);
    const catParam = urlParams.get('category');
    if (catParam) {
      state.filters.category = catParam;
      document.querySelectorAll('.lms-filter-chip').forEach(chip => {
        chip.classList.toggle('active', chip.getAttribute('data-category')?.toLowerCase() === catParam.toLowerCase());
      });
      renderCatalog();
    }

    const tabParam = urlParams.get('tab');
    if (tabParam) {
      switchLmsNavTab(tabParam);
    }
  }

  // Expose engine to global window
  window.LmsDashboard = {
    init,
    state,
    renderCatalog,
    renderMyLearning,
    updateCounters
  };

  // Launch on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(window);
