import { describe, it, expect } from 'vitest'
import { sm2Update } from '../lib/sm2'

describe('SM-2 Spaced Repetition Algorithm (sm2Update)', () => {
  const baseDate = new Date('2026-08-16T12:00:00Z')

  it('quality=5, repetitions=0 -> interval becomes 1, repetitions becomes 1', () => {
    const result = sm2Update(5, 0, 2.5, 0, baseDate)

    expect(result.repetitions).toBe(1)
    expect(result.interval).toBe(1)
    expect(result.easeFactor).toBe(2.5) // q=4: EF delta is 0
  })

  it('quality=5, repetitions=1 -> interval becomes 6', () => {
    const result = sm2Update(5, 1, 2.5, 1, baseDate)

    expect(result.repetitions).toBe(2)
    expect(result.interval).toBe(6)
    expect(result.easeFactor).toBe(2.5)
  })

  // Explicit Arithmetic Verification Test Case 1
  it('quality=5, repetitions=2 with interval=6, easeFactor=2.5 -> calculates interval=15', () => {
    /*
     * MANUAL CALCULATION VERIFICATION (Case 1):
     * Input: quality = 5 -> q = 5 - 1 = 4
     * repetitions = 2 >= 2 -> interval = round(previous_interval * easeFactor)
     * easeFactor update:
     *   rawEF = 2.5 + 0.1 - (5 - 4) * (0.08 + (5 - 4) * 0.02)
     *   rawEF = 2.5 + 0.1 - 1 * 0.10 = 2.50
     * interval update:
     *   newInterval = round(6 * 2.50) = round(15.0) = 15
     * repetitions update:
     *   newRepetitions = 2 + 1 = 3
     */
    const result = sm2Update(5, 2, 2.5, 6, baseDate)

    expect(result.repetitions).toBe(3)
    expect(result.interval).toBe(15)
    expect(result.easeFactor).toBe(2.5)
  })

  // Explicit Arithmetic Verification Test Case 2
  it('quality=4, repetitions=3 with interval=15, easeFactor=2.5 -> calculates interval=38 and easeFactor=2.36', () => {
    /*
     * MANUAL CALCULATION VERIFICATION (Case 2):
     * Input: quality = 4 -> q = 4 - 1 = 3, repetitions = 3, interval = 15, easeFactor = 2.5
     * repetitions = 3 >= 2 -> interval = round(previous_interval * input_easeFactor)
     * interval update:
     *   newInterval = round(15 * 2.5) = round(37.5) = 38
     * easeFactor update:
     *   rawEF = 2.5 + 0.1 - (5 - 3) * (0.08 + (5 - 3) * 0.02)
     *   rawEF = 2.5 + 0.1 - 2 * (0.08 + 0.04)
     *   rawEF = 2.5 + 0.1 - 2 * 0.12 = 2.5 + 0.1 - 0.24 = 2.36
     * repetitions update:
     *   newRepetitions = 3 + 1 = 4
     */
    const result = sm2Update(4, 3, 2.5, 15, baseDate)

    expect(result.repetitions).toBe(4)
    expect(result.easeFactor).toBe(2.36)
    expect(result.interval).toBe(38)
  })

  it('quality=1 or 2 (failure) at any repetitions -> resets repetitions to 0 and interval to 1', () => {
    const resultLowQuality1 = sm2Update(1, 5, 2.5, 30, baseDate)
    expect(resultLowQuality1.repetitions).toBe(0)
    expect(resultLowQuality1.interval).toBe(1)

    const resultLowQuality2 = sm2Update(2, 10, 2.3, 60, baseDate)
    expect(resultLowQuality2.repetitions).toBe(0)
    expect(resultLowQuality2.interval).toBe(1)
  })

  it('easeFactor never drops below 1.3 even after repeated low-quality answers', () => {
    let ef = 1.5
    let rep = 3
    let interval = 15

    // Run 5 consecutive quality=1 attempts (q=0 -> delta = -0.80 per step)
    for (let i = 0; i < 5; i++) {
      const res = sm2Update(1, rep, ef, interval, baseDate)
      ef = res.easeFactor
      rep = res.repetitions
      interval = res.interval
    }

    expect(ef).toBe(1.3)
    expect(rep).toBe(0)
    expect(interval).toBe(1)
  })

  it('calculates nextReview correctly as baseDate + interval days', () => {
    const result = sm2Update(5, 1, 2.5, 1, baseDate) // interval becomes 6
    expect(result.interval).toBe(6)

    // Expected nextReview is 2026-08-16 + 6 days = 2026-08-22
    const expectedDate = new Date('2026-08-22T12:00:00Z')
    expect(result.nextReview.toISOString()).toBe(expectedDate.toISOString())
    expect(result.nextReview.getTime() - baseDate.getTime()).toBe(6 * 24 * 60 * 60 * 1000)
  })
})

