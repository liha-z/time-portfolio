import { describe, expect, it } from 'vitest'
import { calculateDTarget, calculateMTarget } from '../lib/habit-scoring'
import {
  calculateDailyReward,
  calculateEffectiveGap,
  calculateMaturationScore,
  calculateMomentumStreak,
} from '../lib/maturation-score'

describe('habit target calculations', () => {
  it('keeps the baseline reading habit at 21 days', () => {
    expect(
      calculateDTarget({ difficulty: 5, frequencyPerWeek: 7, targetMinutesPerDay: 30 })
    ).toBe(21)
    expect(calculateMTarget(21, 5)).toBe(42.47)
  })
})

describe('maturation scoring', () => {
  it('uses linear effort for partial daily investments', () => {
    expect(
      calculateDailyReward({
        dailyMinutes: 6,
        targetMinutesPerDay: 30,
        difficulty: 5,
        streakDays: 15,
      })
    ).toBe(0.5)
  })

  it('does not decay within the same creation-anchored seven-day window', () => {
    expect(
      calculateEffectiveGap({
        creationDate: '2026-01-01T12:00:00.000Z',
        lastInvestmentAt: '2026-01-06T12:00:00.000Z',
        now: new Date('2026-01-07T11:59:00.000Z'),
      })
    ).toBe(0)
  })

  it('calculates a fractional effective gap after the creation window changes', () => {
    expect(
      calculateEffectiveGap({
        creationDate: '2026-01-01T12:00:00.000Z',
        lastInvestmentAt: '2026-01-06T12:00:00.000Z',
        now: new Date('2026-01-08T00:00:00.000Z'),
      })
    ).toBe(1.5)
  })

  it('applies a 0.1 decay constant before adding the daily reward', () => {
    expect(
      calculateMaturationScore({ previousScore: 10, effectiveGap: 2, dailyReward: 0.5 })
    ).toBe(8.6873)
  })

  it('regresses momentum by a gap before crediting the next active day', () => {
    expect(
      calculateMomentumStreak(
        [
          { logDate: '2026-01-01', investedAt: '2026-01-01T12:00:00.000Z' },
          { logDate: '2026-01-02', investedAt: '2026-01-02T12:00:00.000Z' },
          { logDate: '2026-01-09', investedAt: '2026-01-09T12:00:00.000Z' },
        ],
        '2026-01-01T12:00:00.000Z'
      )
    ).toBe(1)
  })
})
