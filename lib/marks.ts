export type Grade = "A+" | "A" | "A-" | "B+" | "B" | "B-" | "C+" | "C" | "D" | "F";

export const GRADE_OPTIONS: Grade[] = [
  "A+",
  "A",
  "A-",
  "B+",
  "B",
  "B-",
  "C+",
  "C",
  "D",
  "F",
];

export const GRADE_THRESHOLDS: Record<Grade, number> = {
  "A+": 80,
  "A": 75,
  "A-": 70,
  "B+": 65,
  "B": 60,
  "B-": 55,
  "C+": 50,
  "C": 45,
  "D": 40,
  "F": 0,
};

export function getGradeThreshold(grade: Grade): number {
  return GRADE_THRESHOLDS[grade];
}

export type AssessmentComponent = {
  total: number;
  obtained: number;
};

export type CourseComponents = {
  midterm: AssessmentComponent;
  ct: AssessmentComponent; // Class Test
  attendance: AssessmentComponent;
  classPerformance: AssessmentComponent;
  assignment: AssessmentComponent;
  presentation: AssessmentComponent;
};

export type Course = {
  id: string;
  name: string;
  components: CourseComponents;
  targetGrade: Grade;
  createdAt: number;
};

export const DEFAULT_COMPONENTS: CourseComponents = {
  midterm: { total: 20, obtained: 0 },
  ct: { total: 15, obtained: 0 },
  attendance: { total: 10, obtained: 0 },
  classPerformance: { total: 0, obtained: 0 },
  assignment: { total: 10, obtained: 0 },
  presentation: { total: 20, obtained: 0 },
};

export function calculateCurrentTotals(components: CourseComponents) {
  const totals = Object.values(components).reduce(
    (acc, c) => {
      const t = Number.isFinite(c.total) ? c.total : 0;
      const o = Number.isFinite(c.obtained) ? c.obtained : 0;
      acc.total += Math.max(0, t);
      acc.obtained += Math.max(0, Math.min(o, t));
      return acc;
    },
    { total: 0, obtained: 0 }
  );
  return totals; // totals.total is non-final maximum (<=70), obtained is non-final earned
}

export function validateNonFinalCap(components: CourseComponents): {
  valid: boolean;
  totalNonFinal: number;
  message?: string;
} {
  const { total } = calculateCurrentTotals(components);
  if (total > 70) {
    return {
      valid: false,
      totalNonFinal: total,
      message: "Sum of non-final component totals must not exceed 70 marks.",
    };
  }
  return { valid: true, totalNonFinal: total };
}

export function computeRequiredFinalMarks(
  components: CourseComponents,
  targetGrade: Grade
): {
  required: number; // unclamped required (can be >30)
  requiredClamped: number; // clamped to [0,30]
  achievable: boolean;
  targetTotal: number;
  currentObtained: number;
} {
  const current = calculateCurrentTotals(components).obtained; // out of <=70
  const targetTotal = getGradeThreshold(targetGrade); // out of 100
  const requiredRaw = targetTotal - current;
  const required = Math.max(0, Math.round((requiredRaw + Number.EPSILON) * 100) / 100);
  const achievable = required <= 30; // final exam capacity
  const requiredClamped = Math.min(30, required);
  return { required, requiredClamped, achievable, targetTotal, currentObtained: current };
}

export const COURSE_COMPONENT_KEYS = [
  "midterm",
  "ct",
  "attendance",
  "classPerformance",
  "assignment",
  "presentation",
] as const;

export type CourseComponentKey = typeof COURSE_COMPONENT_KEYS[number];

export const COURSE_COMPONENT_LABELS: Record<CourseComponentKey, string> = {
  midterm: "Midterm",
  ct: "CT",
  attendance: "Attendance",
  classPerformance: "Class Performance",
  assignment: "Assignment",
  presentation: "Presentation",
};
