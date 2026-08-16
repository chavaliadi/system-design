/**
 * SM-2 Spaced Repetition Algorithm Implementation
 * Pure functions for calculating review intervals, ease factors, and repetition counts.
 */

export interface SM2Result {
  repetitions: number
  easeFactor: number
  interval: number
  nextReview: Date
}

/**
 * Calculates the updated SM-2 spaced repetition state based on response quality.
 *
 * @param quality Response quality rating from 1 to 5 (matches QuizSession.qualityScore)
 * @param repetitions Current count of consecutive successful repetitions (>= 0)
 * @param easeFactor Current ease factor (>= 1.3)
 * @param interval Current review interval in days (>= 0)
 * @param now Reference date for calculating nextReview (defaults to current Date)
 * @returns Updated SM2Result containing new repetitions, easeFactor, interval, and nextReview date
 */
export function sm2Update(
  quality: number,
  repetitions: number,
  easeFactor: number,
  interval: number,
  now: Date = new Date()
): SM2Result {
  // Validate and clamp quality to 1-5 integer range
  const clampedQuality = Math.max(1, Math.min(5, Math.round(quality)))
  
  // Map quality (1-5) to SM-2 standard 0-5 scale: q = quality - 1
  const q = clampedQuality - 1

  let newRepetitions: number
  let newInterval: number

  if (q >= 3) {
    // Successful recall (quality 4 or 5)
    if (repetitions === 0) {
      newInterval = 1
    } else if (repetitions === 1) {
      newInterval = 6
    } else {
      newInterval = Math.round(interval * easeFactor)
    }
    newRepetitions = repetitions + 1
  } else {
    // Failed recall (quality 1, 2, or 3)
    newRepetitions = 0
    newInterval = 1
  }

  // Update ease factor: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  const rawEaseFactor = easeFactor + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)
  // Round to 2 decimal places to avoid floating point precision artifacts, clamped at minimum 1.3
  const roundedEaseFactor = Math.round(rawEaseFactor * 100) / 100
  const newEaseFactor = Math.max(1.3, roundedEaseFactor)

  // Calculate next review date: today + interval days
  const nextReview = new Date(now.getTime())
  nextReview.setDate(nextReview.getDate() + newInterval)

  return {
    repetitions: newRepetitions,
    easeFactor: newEaseFactor,
    interval: newInterval,
    nextReview
  }
}

