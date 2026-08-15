import { createClient } from '../lib/server'
import { redirect } from 'next/navigation'
import CreatePotForm from './components/CreatePotForm'
import RiverComponent from './components/RiverComponent'
import PotsList from './components/PotsList'

export default async function Home() {
  const supabase = await createClient()
  
  // Check if the user is authenticated
  const { data: { user }, error } = await supabase.auth.getUser()

  // If not logged in, send them back to the login page
  if (error || !user) {
    redirect('/login')
  }

  // Fetch the user's pots
  const { data: pots, error: potsError } = await supabase
    .from('pots')
    .select('*')
    .order('creation_date', { ascending: false })

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-3xl font-bold mb-4">Time Portfolio Dashboard</h1>
      <p className="text-gray-600 mb-8">Logged in as: {user.email}</p>
      
      {/* River Component - Shows remaining time in the day */}
      <div className="w-full max-w-2xl mb-8">
        <RiverComponent />
      </div>
      
      {/* Form to create a new pot */}
      <CreatePotForm />

      {/* Display existing pots with Invest/End functionality */}
      <PotsList pots={pots || []} potsError={potsError} />
    </main>
  )
}
