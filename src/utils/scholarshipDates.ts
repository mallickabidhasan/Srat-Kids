/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Centralized configuration for Star Scholarship Festival 2027 Timeline & Schedules
export const SCHOLARSHIP_2027_SCHEDULE = {
  // Target Exam Date: 9 October 2027, 09:00 AM (Bangladesh Time, UTC+6)
  examDate: '2027-10-09T09:00:00+06:00',
  // Application window: 1 August 2027 to 15 September 2027 23:59:59 (Bangladesh Time)
  applicationStartDate: '2027-08-01T00:00:00+06:00',
  applicationEndDate: '2027-09-15T23:59:59+06:00',
  // Admit card download window: 20 September 2027 to 8 October 2027
  admitCardStartDate: '2027-09-20T00:00:00+06:00',
  admitCardEndDate: '2027-10-08T23:59:59+06:00',
};

/**
 * Checks whether the current real-world time is within the 2027 online application period.
 * When true, clicking "আবেদন" opens the active application form directly.
 * When false, clicking "আবেদন" opens the "স্টার বৃত্তি উৎসব ২০২৭ রোডম্যাপ ও টাইমলাইন" page.
 */
export const is2027ApplicationOpen = (): boolean => {
  const now = new Date();
  const start = new Date(SCHOLARSHIP_2027_SCHEDULE.applicationStartDate);
  const end = new Date(SCHOLARSHIP_2027_SCHEDULE.applicationEndDate);
  return now >= start && now <= end;
};
