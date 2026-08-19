'use client'

import { useState, useEffect, useMemo } from 'react'

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

  // SVG Circle properties
  const radius = 52
  const strokeWidth = 10
  const circumference = 2 * Math.PI * radius

  // Calculate the progress
  const progress = useMemo(() => {
    return remainingMinutes / 1440
  }, [remainingMinutes])

  const strokeDashoffset = circumference * (1 - progress)

  return (
    <div className="bg-gray-800 rounded-lg p-6 text-white flex flex-col items-center">
      <h2 className="text-lg font-semibold mb-4">Time Remaining Today</h2>
      <div className="relative w-40 h-40">
        <svg className="w-full h-full" viewBox="0 0 120 120">
          {/* Background Circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth={strokeWidth}
          />
          {/* Progress Circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
            className="transition-all duration-500"
          />
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="text-3xl font-bold">
            {hours}h {minutes}m
          </div>
          <p className="text-xs text-gray-400 mt-1">
            ({remainingMinutes} mins)
          </p>
        </div>
      </div>
    </div>
  )
}
