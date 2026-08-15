'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {
  calculateDTarget,
  calculateMTarget,
  MAX_D_TARGET,
  MIN_D_TARGET,
} from '../lib/habit-scoring'
import { createClient } from '../lib/server'

export async function createPot(formData: FormData) {
  const supabase = await createClient()

  // Get the current user's session
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  // Extract form data
  const name = formData.get('name') as string
  const target_minutes_per_day = parseInt(formData.get('target_minutes_per_day') as string)
  const difficulty = parseInt(formData.get('difficulty') as string)
  const frequency_per_week = parseInt(formData.get('frequency_per_week') as string)

  // Validate inputs
  if (!name || !target_minutes_per_day || !difficulty || !frequency_per_week) {
    return { error: 'All fields are required' }
  }

  if (target_minutes_per_day <= 0) {
    return { error: 'Target minutes per day must be positive' }
  }

  if (difficulty < 1 || difficulty > 10) {
    return { error: 'Difficulty must be between 1 and 10' }
  }

  if (frequency_per_week < 1 || frequency_per_week > 7) {
    return { error: 'Frequency must be between 1 and 7 times per week' }
  }

  const d_target = calculateDTarget({
    difficulty,
    frequencyPerWeek: frequency_per_week,
    targetMinutesPerDay: target_minutes_per_day,
  })

  const m_target = calculateMTarget(d_target, difficulty)

  if (d_target < MIN_D_TARGET || d_target > MAX_D_TARGET) {
    return { error: 'Calculated target days must be between 7 and 365 days' }
  }

  if (!Number.isFinite(m_target) || m_target <= 0) {
    return { error: 'Calculated target score must be positive' }
  }

  // Insert the new pot into the database
  const { data, error } = await supabase
    .from('pots')
    .insert([
      {
        name,
        target_minutes_per_day,
        m_target,
        difficulty,
        frequency_per_week,
        user_id: user.id,
      },
    ])
    .select()

  if (error) {
    console.error('Failed to create pot:', error)
    return { error: 'Unable to create this pot. Please try again.' }
  }

  // Revalidate the dashboard to instantly refresh the UI
  try {
    revalidatePath('/')
  } catch (revalidateError) {
    console.error('Revalidation error:', revalidateError)
    // Don't fail the operation if revalidation fails
  }

  return { success: true, data }
}

export async function logTimeInvestment(potId: string, elapsedMinutes: number) {
  const supabase = await createClient()

  // Get the current user's session
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: 'Unauthorized' }
  }

  const safeElapsedMinutes = Number(elapsedMinutes)

  // Validate inputs before passing them to the database function.
  if (!potId || !Number.isFinite(safeElapsedMinutes) || safeElapsedMinutes <= 0) {
    return { error: 'Invalid pot ID or elapsed minutes' }
  }

  const minutes = Math.max(1, Math.round(safeElapsedMinutes))

  const { data, error } = await supabase.rpc('log_time_investment', {
    p_pot_id: potId,
    p_minutes: minutes,
  })

  if (error || !data?.[0]) {
    const underlyingError = error?.message || 'Unknown database error'
    console.error('Failed to log time investment:', underlyingError)

    return {
      error:
        process.env.NODE_ENV === 'development'
          ? underlyingError
          : 'Unable to save this investment. Please try again.',
    }
  }

  revalidatePath('/')
  return { success: true, data: data[0] }
}
