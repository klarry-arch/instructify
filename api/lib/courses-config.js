/* ============================================================
   INSTRUCTIFY KENYA — Server-Side Course Catalogue (Price Truth)
   Prices stored as integers in KES × 100 (minor units).
   NEVER trust prices submitted by the browser.
   ============================================================ */

'use strict';

/**
 * Authoritative course catalogue.
 * amount = KES price × 100 (Paystack minor units convention).
 * originalAmount is for display only — never charged.
 */
const COURSE_CATALOGUE = {
  crs_001: {
    id: 'crs_001',
    title: 'ICT Integration in Education',
    amount: 1500000,        // KES 15,000
    originalAmount: 2200000, // KES 22,000
    currency: 'KES',
    active: true,
  },
  crs_002: {
    id: 'crs_002',
    title: 'Digital Literacy Certification Program',
    amount: 850000,         // KES 8,500
    originalAmount: 1400000, // KES 14,000
    currency: 'KES',
    active: true,
  },
  crs_003: {
    id: 'crs_003',
    title: 'CBE Curriculum Implementation',
    amount: 1850000,        // KES 18,500
    originalAmount: 2800000, // KES 28,000
    currency: 'KES',
    active: true,
  },
  crs_004: {
    id: 'crs_004',
    title: 'Artificial Intelligence in Education',
    amount: 2200000,        // KES 22,000
    originalAmount: 3500000, // KES 35,000
    currency: 'KES',
    active: true,
  },
  crs_005: {
    id: 'crs_005',
    title: 'Online Teaching Methodologies',
    amount: 1200000,        // KES 12,000
    originalAmount: 1800000, // KES 18,000
    currency: 'KES',
    active: true,
  },
  crs_006: {
    id: 'crs_006',
    title: 'Educational Leadership & Management',
    amount: 2500000,        // KES 25,000
    originalAmount: 4000000, // KES 40,000
    currency: 'KES',
    active: true,
  },
  crs_007: {
    id: 'crs_007',
    title: 'Assessment & Evaluation Strategies',
    amount: 1350000,        // KES 13,500
    originalAmount: 2000000, // KES 20,000
    currency: 'KES',
    active: true,
  },
  crs_008: {
    id: 'crs_008',
    title: 'Continuous Professional Development for Teachers',
    amount: 650000,         // KES 6,500
    originalAmount: 1000000, // KES 10,000
    currency: 'KES',
    active: true,
  },
};

/**
 * Retrieve a course by ID. Returns null if not found or inactive.
 * @param {string} courseId
 * @returns {object|null}
 */
export function getCourse(courseId) {
  const course = COURSE_CATALOGUE[courseId];
  if (!course || !course.active) return null;
  return course;
}

/**
 * Validate that a submitted amount matches the server-side price.
 * @param {string} courseId
 * @param {number} submittedAmount — in minor units
 * @returns {boolean}
 */
export function validateAmount(courseId, submittedAmount) {
  const course = getCourse(courseId);
  if (!course) return false;
  return course.amount === Number(submittedAmount);
}

export default COURSE_CATALOGUE;
