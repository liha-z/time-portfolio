import { createClient } from '../lib/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createClient()
  
  // Check if the user is authenticated
  const { data: { user }, error } = await supabase.auth.getUser()

  // If not logged in, send them back to the login page
  if (error || !user) {
    redirect('/login')
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-3xl font-bold mb-4">Time Portfolio Dashboard</h1>
      <p className="text-gray-600 mb-8">Logged in as: {user.email}</p>
      
      <div className="w-full max-w-2xl bg-gray-800 rounded-lg p-6 text-white">
        <h2 className="text-xl mb-4">Your Habit Pots</h2>
        <p>No pots created yet.</p>
      </div>
    </main>
  )
}
