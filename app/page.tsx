import { createClient } from '../lib/server'
import { redirect } from 'next/navigation'
import RiverComponent from './components/RiverComponent'
import DashboardClient from './components/DashboardClient'
import AppLayout from './components/AppLayout'

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
    <AppLayout>
      <div className="flex flex-col items-center p-8 sm:p-12 md:p-24 bg-white text-gray-900">
        {/* River Component - Shows remaining time in the day */}
        <div className="w-full max-w-2xl mb-8">
          <RiverComponent />
        </div>
        <DashboardClient pots={pots || []} potsError={potsError} />
      </div>
    </AppLayout>
  )
}
