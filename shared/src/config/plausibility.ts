/**
 * Configurable compensation plausibility bands for students.
 * Detects offers claiming unrealistic income for zero/little experience.
 */

export const PLAUSIBILITY_LIMITS = {
  // Monthly stipend above 1,50,000 INR for an internship without specialized seniority
  MAX_MONTHLY_INTERNSHIP_INR: 150000,

  // Daily or hourly wages that exceed plausible student freelance bands
  MAX_HOURLY_FREELANCE_INR: 5000,
  MAX_DAILY_EARNING_INR: 15000,

  // Typical entry-level annual compensation ceiling for student campus offers (e.g., 60 LPA)
  MAX_ANNUAL_FRESHER_SALARY_INR: 6000000,
} as const;

export function isCompensationUnrealistic(
  amountInr: number,
  period: "month" | "year" | "day" | "hour",
  domain?: string
): boolean {
  if (period === "month") {
    if (domain === "internship" && amountInr > PLAUSIBILITY_LIMITS.MAX_MONTHLY_INTERNSHIP_INR) {
      return true;
    }
  } else if (period === "day") {
    if (amountInr > PLAUSIBILITY_LIMITS.MAX_DAILY_EARNING_INR) {
      return true;
    }
  } else if (period === "hour") {
    if (amountInr > PLAUSIBILITY_LIMITS.MAX_HOURLY_FREELANCE_INR) {
      return true;
    }
  } else if (period === "year") {
    if (amountInr > PLAUSIBILITY_LIMITS.MAX_ANNUAL_FRESHER_SALARY_INR) {
      return true;
    }
  }
  return false;
}
