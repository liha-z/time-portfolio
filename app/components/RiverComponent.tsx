'use client'

import { useState, useEffect } from 'react'

export default function RiverComponent() {
  const [remainingMinutes, setRemainingMinutes] = useState<number>(0)

  useEffect(() => {
    // Function to calculate remaining minutes in the day
    const calculateRemainingMinutes = () => {
      const now = new Date()
      const hours = now.getHours()
      const minutes = now.getMinutes()
      const totalMinutesElapsed = hours * 60 + minutes
      const remaining = 1440 - totalMinutesElapsed
      setRemainingMinutes(remaining)
    }

    // Calculate immediately on mount
    calculateRemainingMinutes()

    // Set up interval to update every 60 seconds
    const interval = setInterval(calculateRemainingMinutes, 60000)

    // Cleanup interval on unmount
    return () => clearInterval(interval)
  }, [])

  // Convert minutes to hours and minutes for display
  const hours = Math.floor(remainingMinutes / 60)
  const minutes = remainingMinutes % 60

  return (
    <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg p-6 text-white text-center">
      <p className="text-sm text-gray-300 mb-2">Time Remaining Today</p>
      <div className="text-4xl font-bold">
        {hours}h {minutes}m
      </div>
      <p className="text-xs text-gray-400 mt-2">
        ({remainingMinutes} minutes)
      </p>
    </div>
  )
}
