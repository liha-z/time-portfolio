'use client'

import { useState } from 'react'
import CreatePotForm from './CreatePotForm'
import PotsList from './PotsList'

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

interface DashboardClientProps {
  pots: Pot[]
  potsError?: { message?: string } | null
}

export default function DashboardClient({ pots, potsError }: DashboardClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <PotsList pots={pots} potsError={potsError} />

      {/* Floating Action Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-full flex items-center justify-center shadow-lg transition-transform transform hover:scale-110 z-40"
        aria-label="Create New Habit Pot"
        title="Create New Habit Pot"
      >
       + New Pot
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl">
            <CreatePotForm />
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-3xl leading-none"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </>
  )
}