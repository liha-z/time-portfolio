'use client'

import { useState } from 'react'
import PotCard from './PotCard'

interface Pot {
  id: string
  name: string
  target_minutes_per_day: number
  m_target: number
  current_score: number
  current_gap_days: number
  frequency_per_week: number
  creation_date: string
}

interface PotsListProps {
  pots: Pot[]
  potsError?: { message?: string } | null
}

export default function PotsList({ pots, potsError }: PotsListProps) {
  const [activePotId, setActivePotId] = useState<string | null>(null)
  const [activePotName, setActivePotName] = useState<string>('')
  const [startTime, setStartTime] = useState<number | null>(null)

  const handleInvestStart = (potId: string, potName: string) => {
    // Check if another pot is already active
    if (activePotId !== null) {
      alert(
        `You are currently investing time in ${activePotName}. Please end that session first.`
      )
      return
    }

    // Proceed with starting the timer
    setActivePotId(potId)
    setActivePotName(potName)
    setStartTime(Date.now())
  }

  const handleInvestEnd = (potId: string) => {
    if (activePotId === potId) {
      setActivePotId(null)
      setActivePotName('')
      setStartTime(null)
    }
  }

  return (
    <div className="w-full max-w-2xl bg-gray-800 rounded-lg p-6 text-white mt-8">
      <h2 className="text-xl font-bold mb-4">Your Habit Pots</h2>

      {potsError ? (
        <p className="text-red-400">Error loading pots: {potsError.message}</p>
      ) : pots && pots.length > 0 ? (
        <div className="space-y-3">
          {pots.map((pot) => (
            <PotCard
              key={pot.id}
              pot={pot}
              isActive={activePotId === pot.id}
              startTime={activePotId === pot.id ? startTime : null}
              onInvestStart={handleInvestStart}
              onInvestEnd={handleInvestEnd}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-400">No pots created yet. Create one above to get started!</p>
      )}
    </div>
  )
}
