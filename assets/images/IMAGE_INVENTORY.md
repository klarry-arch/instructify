# Instructify Kenya — Central Visual Asset Inventory

This document provides a comprehensive audit, inventory, and governance registry of all photographic and visual assets across the Instructify Kenya web application.

---

## 1. Photographic Assets (Authentic Kenyan & African Context)

| Filename | Format | Aspect Ratio | Primary Context & Page Placement | Visual Description | Approved Alt Text |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `home_hero_classroom.jpg` | JPEG | 16:9 | `index.html` (Hero section), `resources-data.js` (`res-1`, `media-4`) | Modern Kenyan classroom with female teacher at digital interactive whiteboard and attentive students with tablets. | *"Kenyan modern classroom with interactive digital board and engaged students"* |
| `home_interactive_teaching.jpg` | JPEG | 16:9 | `js/courses.js` (`crs_005`), `js/blog-data.js` (Article 2), `js/resources-data.js` (`feat-4`, `res-6`, `res-10`) | Enthusiastic Kenyan teacher guiding a small group of primary school learners around a wooden desk with digital tablets. | *"Kenyan teacher facilitating interactive group learning with digital tablets"* |
| `home_stem_collaboration.jpg` | JPEG | 16:9 | `index.html` (Pathway 3), `js/blog-data.js` (Article 7), `js/resources-data.js` (`res-9`, `res-17`, `res-21`, `art-1`) | Kenyan junior secondary learners collaborating on hands-on robotics, circuitry, and coding on laptops in science lab. | *"Students engaged in STEM robotics and collaborative learning"* |
| `home_digital_leadership.jpg` | JPEG | 16:9 | `index.html` (Pathway 2), `js/courses.js` (`crs_006`), `js/blog-data.js` (Article 6), `js/resources-data.js` (`feat-8`, `res-11`, `res-20`, `media-8`) | African school leaders and principals in an institutional boardroom reviewing digital transformation KPIs. | *"School leadership and institutional transformation"* |
| `home_teacher_coaching.jpg` | JPEG | 16:9 | `index.html` (Pathway 1), `js/resources-data.js` (`feat-5`, `res-4`, `res-14`, `media-5`) | African educational consultant mentoring a secondary school teacher on CBC curriculum planning and digital tools. | *"Teacher professional development and mentorship"* |
| `about_strategy_session.jpg` | JPEG | 16:9 | `about.html` (Hero), `index.html` (Consultation CTA), `js/resources-data.js` (`res-3`, `res-19`) | Instructify Kenya curriculum specialists and leadership team planning educational transformation frameworks in Nairobi. | *"Instructify Kenya leadership and education strategy planning session"* |
| `about_educator_workshop.jpg` | JPEG | 16:9 | `about.html` (Story section), `js/courses.js` (`crs_008`), `js/resources-data.js` (`res-8`) | Inspiring African female facilitator leading an active teacher professional development seminar in Kenya. | *"Kenyan educators actively participating in an interactive training workshop"* |
| `consultancy_smart_boards.jpg` | JPEG | 16:9 | `consultancy.html`, `js/resources-data.js` (`feat-7`, `media-2`, `art-6`) | Modern Kenyan smart classroom demonstration with interactive touch display and ClassVR headsets. | *"Smart interactive display and virtual reality classroom demonstration"* |
| `consultancy_ict_network.jpg` | JPEG | 16:9 | `consultancy.html`, `js/resources-data.js` (`feat-3`, `res-7`, `res-15`, `res-22`, `media-6`, `art-4`) | African ICT network engineer in a school server room connecting structured Ethernet cables and server racks. | *"School ICT network infrastructure and server deployment"* |
| `course_assessment_mastery.jpg` | JPEG | 16:9 | `courses.html` (Banner), `js/courses.js` (`crs_007`), `js/blog-data.js` (Article 4), `js/resources-data.js` (`feat-1`, `res-2`, `res-13`, `media-1`, `art-5`) | Kenyan teacher evaluating student assignment portfolios and CBC rubric score sheets in a bright classroom. | *"Competency-Based Curriculum Development and Assessment"* |
| `course_smart_vr_classroom.jpg` | JPEG | 16:9 | `courses.html` (Featured Masterclass), `js/courses.js` (`crs_000`), `js/blog-data.js` (Article 5), `js/resources-data.js` (`feat-2`, `res-23`, `res-24`, `media-7`, `art-2`) | Kenyan junior secondary learners exploring human anatomy via ClassVR headsets and touch smart boards. | *"Smart Classrooms and ClassVR Virtual Reality instruction"* |
| `course_ict_integration.jpg` | JPEG | 16:9 | `js/courses.js` (`crs_001`), `js/blog-data.js` (Article 3), `js/resources-data.js` (`feat-6`, `res-12`) | Male Kenyan ICT teacher guiding secondary school students in modern computer lab with simulation software. | *"ICT Integration and educational software instruction in Kenyan computer lab"* |
| `founder_alex.jpg` | JPEG | 1:1 | `js/blog-data.js`, `js/podcast-data.js`, `about.html` | Profile portrait of Alex Nderitu, Founder and Lead Educator of Instructify Kenya. | *"Alex Nderitu, Founder of Instructify Kenya"* |

---

## 2. Branded Course & Vector Identity Assets

| Filename | Format | Description & Usage |
| :--- | :--- | :--- |
| `instructify-logo.svg` | SVG | Official vector logo (light/dark mode adaptive). |
| `instructify-logo-dark.svg` | SVG | Dark variant vector logo. |
| `instructify-icon.svg` | SVG | Vector favicon and mobile bookmark icon. |
| `logo.png` / `logo_new.png` | PNG | Raster fallback brand logos for header and footer navigation. |
| `course-ai.png` | PNG | Dedicated brand graphic for *Artificial Intelligence in Education* course and articles. |
| `course-cbe.png` | PNG | Dedicated brand graphic for *CBE Curriculum Implementation* course. |
| `course-digital.png` | PNG | Dedicated brand graphic for *Digital Literacy Certification Program* course. |
| `instructify-certificate-template.png` | PNG | High-resolution certificate background for automated CPD course completion credentials. |

---

## 3. Visual Quality & Diversity Guidelines

1. **Zero Duplicate Content Photos Side-by-Side**:
   - No adjacent cards or rows within any hub (Courses, Blog, Resources) may display duplicate imagery.
2. **Authentic Representation**:
   - All classroom, leadership, and student photographs must authentically represent Kenyan and African education environments, including CBC curricula, Kenyan school uniforms, local learning materials, and modern EdTech.
3. **Optimized Loading**:
   - Above-the-fold hero images are loaded with `loading="eager"` and high fetch priority.
   - All catalog, blog, and library card thumbnails include `loading="lazy"` and explicit aspect ratios to avoid Cumulative Layout Shift (CLS).
