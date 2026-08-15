export const BASE_DAYS = 21
export const MIN_D_TARGET = 7
export const MAX_D_TARGET = 365
export const VOLUME_BASE_MINUTES = 30

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function normalizeDifficulty(difficulty: number) {
  return clamp(Math.round(difficulty), 1, 10)
}

export function calculateDTarget({
  difficulty,
  frequencyPerWeek,
  targetMinutesPerDay,
  baseDays = BASE_DAYS,
  volumeBaseMinutes = VOLUME_BASE_MINUTES,
}: {
  difficulty: number
  frequencyPerWeek: number
  targetMinutesPerDay: number
  baseDays?: number
  volumeBaseMinutes?: number
}) {
  const normalizedDifficulty = normalizeDifficulty(difficulty)
  const normalizedFrequency = clamp(Math.round(frequencyPerWeek), 1, 7)
  const normalizedMinutes = Math.max(1, Number(targetMinutesPerDay) || 1)

  const difficultyMultiplier = 1 + (normalizedDifficulty - 5) * 0.09
  const targetDays =
    baseDays *
    difficultyMultiplier *
    (7 / normalizedFrequency) *
    Math.sqrt(volumeBaseMinutes / normalizedMinutes)

  return Math.round(clamp(targetDays, MIN_D_TARGET, MAX_D_TARGET))
}

export function calculateMTarget(dTarget: number, difficulty: number) {
  const normalizedDTarget = clamp(Math.round(dTarget), MIN_D_TARGET, MAX_D_TARGET)
  const normalizedDifficulty = normalizeDifficulty(difficulty)
  const a = 0.05 + (normalizedDifficulty - 1) * 0.012
  const sMid = normalizedDTarget / 2

  let total = 0

  for (let day = 1; day <= normalizedDTarget; day += 1) {
    const logisticTerm = 2 / (1 + Math.exp(-a * (day - sMid)))
    total += 1 + logisticTerm
  }

  return Number(total.toFixed(2))
}
