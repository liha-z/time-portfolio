'use client'

import { useState, useEffect } from 'react'
import { deletePot } from '../actions'
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
  const [potList, setPotList] = useState(pots)

  // Sync with props in case of revalidation from server
  useEffect(() => {
    setPotList(pots)
  }, [pots])

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

  const handleDeletePot = async (deletedPotId: string) => {
    const originalPots = potList
    // Remove the pot from the local state for an immediate UI update
    setPotList((currentPots) => currentPots.filter((p) => p.id !== deletedPotId))

    // If the deleted pot was the active one, reset the active state
    if (activePotId === deletedPotId) {
      setActivePotId(null)
      setActivePotName('')
      setStartTime(null)
    }

    const result = await deletePot(deletedPotId)

    if (result.error) {
      console.error('Failed to delete pot:', result.error)
      // If the server-side deletion fails, revert the UI to its original state
      // and show an error message.
      setPotList(originalPots)
      alert(`Error: ${result.error}`)
    }
  }

  return (
    <div className="w-full max-w-2xl">
      <h2 className="text-xl font-bold mb-4">Your Habit Pots</h2>

      {potsError ? (
        <p className="text-red-600">Error loading pots: {potsError.message}</p>
      ) : potList && potList.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {potList.map((pot) => (
            <PotCard
              key={pot.id}
              pot={pot}
              isActive={activePotId === pot.id}
              startTime={activePotId === pot.id ? startTime : null}
              onInvestStart={handleInvestStart}
              onInvestEnd={handleInvestEnd}
              onDelete={handleDeletePot}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No pots created yet. Create one to get started!</p>
      )}
    </div>
  )
}
