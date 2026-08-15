'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createPot } from '../actions'
import { calculateDTarget } from '../../lib/habit-scoring'

export default function CreatePotForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [targetMinutesPerDay, setTargetMinutesPerDay] = useState(30)
  const [difficulty, setDifficulty] = useState(5)
  const [frequencyPerWeek, setFrequencyPerWeek] = useState(7)
  const formRef = useRef<HTMLFormElement>(null)

  const dTarget = useMemo(() => {
    const value = calculateDTarget({
      difficulty,
      frequencyPerWeek,
      targetMinutesPerDay,
    })

    return value
  }, [difficulty, frequencyPerWeek, targetMinutesPerDay])

  useEffect(() => {
    if (targetMinutesPerDay <= 0) {
      setTargetMinutesPerDay(1)
    }
  }, [targetMinutesPerDay])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const formData = new FormData(e.currentTarget)

    try {
      const result = await createPot(formData)

      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        formRef.current?.reset()
        setTargetMinutesPerDay(30)
        setDifficulty(5)
        setFrequencyPerWeek(7)
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-2xl bg-gray-800 rounded-lg p-6 text-white">
      <h2 className="text-xl font-bold mb-6">Create a New Habit Pot</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-900 text-red-100 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-900 text-green-100 rounded">
          ✓ Pot created successfully!
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Pot Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="e.g., Morning Exercise, Reading"
            className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="target_minutes_per_day" className="block text-sm font-medium mb-2">
            Target Minutes per Day
          </label>
          <input
            type="number"
            id="target_minutes_per_day"
            name="target_minutes_per_day"
            value={targetMinutesPerDay}
            onChange={(event) => setTargetMinutesPerDay(Number(event.target.value) || 1)}
            placeholder="e.g., 30"
            min="1"
            className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="difficulty" className="block text-sm font-medium mb-2">
            Habit Difficulty (1-10)
          </label>
          <input
            type="range"
            id="difficulty"
            name="difficulty"
            min="1"
            max="10"
            step="1"
            value={difficulty}
            onChange={(event) => setDifficulty(Number(event.target.value))}
            className="w-full accent-blue-500"
          />
          <div className="mt-2 flex items-center justify-between text-xs text-gray-300">
            <span>Easy</span>
            <span className="font-bold text-blue-300">{difficulty}/10</span>
            <span>Hard</span>
          </div>
        </div>

        <div>
          <label htmlFor="frequency_per_week" className="block text-sm font-medium mb-2">
            Frequency per Week
          </label>
          <select
            id="frequency_per_week"
            name="frequency_per_week"
            value={frequencyPerWeek}
            onChange={(event) => setFrequencyPerWeek(Number(event.target.value))}
            className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-blue-500"
            required
          >
            <option value="1">Once a week</option>
            <option value="2">2 times a week</option>
            <option value="3">3 times a week</option>
            <option value="4">4 times a week</option>
            <option value="5">5 times a week</option>
            <option value="6">6 times a week</option>
            <option value="7">Daily (7 times a week)</option>
          </select>
        </div>

        <div className="rounded bg-gray-700 p-4 border border-gray-600">
          <div className="text-sm text-gray-300">Calculated target window</div>
          <div className="mt-1 text-2xl font-bold text-green-400">{dTarget} days</div>
          <div className="mt-1 text-xs text-gray-400">
            Based on a 21-day baseline, {difficulty}/10 difficulty, {frequencyPerWeek}x/week, and {targetMinutesPerDay} minutes/day
          </div>
        </div>

        <input type="hidden" name="d_target" value={dTarget} />
        <input type="hidden" name="difficulty" value={difficulty} />

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium rounded transition"
        >
          {loading ? 'Creating...' : 'Create Pot'}
        </button>
      </form>
    </div>
  )
}
