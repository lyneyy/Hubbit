import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Landing from './pages/landing'
import Dashboard from './pages/dashboard'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return (
    <div className="w-screen h-screen bg-[#0f0a1e] flex items-center justify-center">
      <span className="font-pixel text-purple-300 text-xs animate-pulse">loading...</span>
    </div>
  )

  return session ? <Dashboard session={session} /> : <Landing />
}