import { normalizeDifficulty } from './habit-scoring'

const DAY_MS = 24 * 60 * 60 * 1000
const WINDOW_DAYS = 7
const DECAY_CONSTANT = 0.1
const MAX_STREAK_BONUS = 3
const STREAK_MIDPOINT = 15

export function currentScoreDate(now = new Date()) {
  return now.toISOString().slice(0, 10)
}

export function calculateEffectiveGap({
  creationDate,
  lastInvestmentAt,
  now = new Date(),
}: {
  creationDate: string
  lastInvestmentAt: string | null
  now?: Date
}) {
  if (!lastInvestmentAt) return 0

  const creationTime = new Date(creationDate).getTime()
  const currentTime = now.getTime()
  const previousTime = new Date(lastInvestmentAt).getTime()
  const gapDays = Math.max(0, (currentTime - previousTime) / DAY_MS)

  if (gapDays <= 0) return 0

  const currentWindow = Math.floor((currentTime - creationTime) / (WINDOW_DAYS * DAY_MS))
  const previousWindow = Math.floor((previousTime - creationTime) / (WINDOW_DAYS * DAY_MS))

  if (currentWindow === previousWindow && gapDays < 1) {
    return 0
  }

  return Number(gapDays.toFixed(4))
}

export function calculateMomentumStreak(
  investments: Array<{ logDate: string; investedAt: string }>,
  creationDate: string
) {
  const firstInvestmentByDay = new Map<string, string>()

  for (const investment of investments) {
    if (!firstInvestmentByDay.has(investment.logDate)) {
      firstInvestmentByDay.set(investment.logDate, investment.investedAt)
    }
  }

  let streakDays = 0
  let lastInvestmentAt: string | null = null

  for (const investedAt of firstInvestmentByDay.values()) {
    const effectiveGap = calculateEffectiveGap({
      creationDate,
      lastInvestmentAt,
      now: new Date(investedAt),
    })

    if (effectiveGap > 0) {
      streakDays = Math.max(0, streakDays - effectiveGap)
    }

    streakDays += 1
    lastInvestmentAt = investedAt
  }

  return streakDays
}

export function calculateDailyReward({
  dailyMinutes,
  targetMinutesPerDay,
  difficulty,
  streakDays,
}: {
  dailyMinutes: number
  targetMinutesPerDay: number
  difficulty: number
  streakDays: number
}) {
  const normalizedDifficulty = normalizeDifficulty(difficulty)
  // Score invested time proportionally: 6 of a 30-minute target earns 20% of
  // the effort component, before the momentum multiplier is applied.
  const effortReward = Math.max(0, dailyMinutes) / Math.max(1, targetMinutesPerDay)
  const curveSteepness = 0.05 + (normalizedDifficulty - 1) * 0.012
  const streakMultiplier =
    1 + MAX_STREAK_BONUS / (1 + Math.exp(-curveSteepness * (streakDays - STREAK_MIDPOINT)))

  return Number((effortReward * streakMultiplier).toFixed(4))
}

export function calculateMaturationScore({
  previousScore,
  effectiveGap,
  dailyReward,
}: {
  previousScore: number
  effectiveGap: number
  dailyReward: number
}) {
  return Number((previousScore * Math.exp(-DECAY_CONSTANT * effectiveGap) + dailyReward).toFixed(4))
}
