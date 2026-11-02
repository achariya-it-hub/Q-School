export interface StudentProgress {
  id: string; // PRG-0001
  studentId?: string; // STU-0001 (link to StudentRecord if available)
  studentName: string; // Students Name
  age: string | number; // Age (e.g. 8, 9, 10, "9 yrs")
  doj: string; // DOJ (e.g. "12 Jun 2026")
  workshop2Days: string; // 2 Days workshop (e.g. "Completed", "Pending", "Attended")
  programName: string; // Program Name (e.g. "Divya Yoga", "Divya Mantra", "Quantum Speed Reading", "Midbrain Activation", "Super Memory", "Abacus")
  batch: string; // Batch (e.g. "Weekend Batch A", "Weekday Batch")
  trainerName: string; // Trainer Name (e.g. "Priya K.", "Rohit M.", "Sneha D.", "Arjun V.")
  noOfClasses: string | number; // No.of class (e.g. "12 / 16", "8", 10)
  // Students Achievement Level
  vision: string; // Vision (e.g. "Level 1 (Colors)", "Level 2 (Cards)", "Level 3 (Words)", "Passed", "In Progress")
  videoShare1: string; // Video share (e.g. "Shared", "Pending", "Approved")
  symbolOfElements: string; // Symbol of elements (e.g. "50/50", "118 Elements", "Level 1", "Passed")
  videoShare2: string; // Video share (e.g. "Shared", "Pending", "Approved")
  qHabit: string; // Q-Habit (e.g. "21-Day Streak", "Active", "85%", "Completed")
  tracker: string; // Tracker (e.g. "Daily Logged", "Up to Date", "Pending Review")
  abacus: string; // ABACUS (e.g. "Level 1 Passed", "Level 2", "Speed Test Passed")
  centreId?: string; // e.g. "moolakulam", "lawspet"
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

