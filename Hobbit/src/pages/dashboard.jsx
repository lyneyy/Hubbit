import { useState } from 'react'
import { supabase } from '../lib/supabase'
import bg1 from '../assets/background1.gif'
import BottomBar from '../components/BottomBar'
import NotesWidget from '../components/NotesWidget'
import TodoWidget from '../components/TodoWidget'
import PomodoroWidget from '../components/PomodoroWidget'
import AIButton from '../components/AiButton'
import CalendarWidget from '../components/CalendarWidget'
import SpacesWidget from '../components/SpacesWidget'
import MusicWidget from '../components/MusicWidget'

export default function Dashboard({ session }) {
  const [openWidgets, setOpenWidgets] = useState({
    notes: false, todo: false, pomodoro: false, calendar: false, spaces: false,
  })
  const [background, setBackground] = useState(bg1)
  const username = session.user.user_metadata?.username || session.user.email.split('@')[0]

  const toggle = (key) => setOpenWidgets(prev => ({ ...prev, [key]: !prev[key] }))
  const close = (key) => setOpenWidgets(prev => ({ ...prev, [key]: false }))

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <img src={background} alt="bg" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: '0.5s' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }} />

      <header style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', padding: '24px 40px' }}>
        <span style={{ fontFamily: "'Press Start 2P', monospace", color: 'white', fontSize: '14px' }}>Hubbit</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#93c5fd', color: '#1e3a8a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>
            {username[0].toUpperCase()}
          </div>
          <span style={{ color: 'white', fontSize: '14px', fontWeight: '600' }}>{username}</span>
        </div>
      </header>

      {openWidgets.notes && <NotesWidget session={session} onClose={() => close('notes')} />}
      {openWidgets.todo && <TodoWidget session={session} onClose={() => close('todo')} />}
      {openWidgets.pomodoro && <PomodoroWidget onClose={() => close('pomodoro')} />}
      {openWidgets.calendar && <CalendarWidget onClose={() => close('calendar')} />}
      {openWidgets.spaces && <SpacesWidget onClose={() => close('spaces')} onSelect={setBackground} />}
      {openWidgets.youtube && <MusicWidget type="youtube" onClose={() => close('youtube')} />}
      {openWidgets.spotify && <MusicWidget type="spotify" onClose={() => close('spotify')} />}

      <AIButton />
      <BottomBar openWidgets={openWidgets} toggle={toggle} onLogout={() => supabase.auth.signOut()} />
    </div>
  )
}