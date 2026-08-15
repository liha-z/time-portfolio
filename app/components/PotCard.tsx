'use client'

import { useState, useEffect } from 'react'
import { logTimeInvestment } from '../actions'

interface PotCardProps {
  pot: {
    id: string
    name: string
    target_minutes_per_day: number
    m_target: number
    current_score: number
    current_gap_days: number
    frequency_per_week: number
    creation_date: string
  }
  isActive: boolean
  startTime: number | null
  onInvestStart: (potId: string, potName: string) => void
  onInvestEnd: (potId: string) => void
}

export default function PotCard({
  pot,
  isActive,
  startTime,
  onInvestStart,
  onInvestEnd,
}: PotCardProps) {
  const [elapsedTime, setElapsedTime] = useState<number>(0)
  const [isLogging, setIsLogging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const maxExpectedGapDays = Math.floor(7 / pot.frequency_per_week)
  const isBehindSchedule = pot.current_gap_days > maxExpectedGapDays
  const creationDate = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(pot.creation_date))

  // Update elapsed time every second while active
  useEffect(() => {
    if (!isActive || !startTime) return

    const timer = setInterval(() => {
      const now = Date.now()
      const elapsed = Math.floor((now - startTime) / 1000) // elapsed in seconds
      setElapsedTime(elapsed)
    }, 1000)

    return () => clearInterval(timer)
  }, [isActive, startTime])

  // Format elapsed time as MM:SS
  const formatElapsedTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleInvestStart = () => {
    onInvestStart(pot.id, pot.name)
  }

  const handleInvestEnd = async () => {
    if (!startTime) return

    setIsLogging(true)
    setError(null)
    const elapsedMinutes = (Date.now() - startTime) / 60000
    const result = await logTimeInvestment(pot.id, elapsedMinutes)

    if (result.error) {
      console.error('Error logging time:', result.error)
      setError(result.error)
      setIsLogging(false)
      return
    }

    setElapsedTime(0)
    onInvestEnd(pot.id)
    setIsLogging(false)
  }

  return (
    <div
      className={`bg-gray-700 rounded p-4 border-2 transition-all ${
        isActive ? 'border-green-500 shadow-lg shadow-green-500' : 'border-gray-600'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-white">{pot.name}</h3>
        {isActive && (
          <div className="text-2xl font-bold text-green-400 animate-pulse">
            {formatElapsedTime(elapsedTime)}
          </div>
        )}
      </div>

      <div className="grid grid-cols-5 gap-3 text-sm mb-4">
        <div>
          <p className="text-gray-400">Target/Day</p>
          <p className="text-blue-400 font-bold">{pot.target_minutes_per_day}m</p>
        </div>
        <div>
          <p className="text-gray-400">Score</p>
          <p className="text-green-400 font-bold">
            {pot.current_score.toFixed(1)} / {pot.m_target.toFixed(1)}
          </p>
        </div>
        <div>
          <p className="text-gray-400">Score target</p>
          <p className="text-green-400 font-bold">{pot.m_target}</p>
        </div>
        <div>
          <p className="text-gray-400">Frequency</p>
          <p className="text-purple-400 font-bold">{pot.frequency_per_week}x/wk</p>
        </div>
        <div>
          <p className="text-gray-400">Current gap</p>
          {pot.current_gap_days === 0 ? (
            <p className="text-green-400 font-bold">Active today ✓</p>
          ) : isBehindSchedule ? (
            <p className="text-red-400 font-bold">Behind · {pot.current_gap_days}d ago</p>
          ) : (
            <p className="text-amber-400 font-bold">{pot.current_gap_days}d ago</p>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-500 mb-4">
        Created: {creationDate}
      </p>

      {error && <p className="mb-3 text-sm text-red-300">{error}</p>}

      {!isActive ? (
        <button
          onClick={handleInvestStart}
          className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded transition"
        >
          Invest
        </button>
      ) : (
        <button
          onClick={handleInvestEnd}
          disabled={isLogging}
          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-medium rounded transition"
        >
          {isLogging ? 'Logging...' : 'End'}
        </button>
      )}
    </div>
  )
}
