import { FileText, CheckSquare, Timer, Calendar, Layout, LogOut } from 'lucide-react'

const items = [
  { key: 'spaces', icon: Layout, label: 'Spaces' },
  { key: 'notes', icon: FileText, label: 'Notes' },
  { key: 'todo', icon: CheckSquare, label: 'Tasks' },
  { key: 'pomodoro', icon: Timer, label: 'Timer' },
  { key: 'calendar', icon: Calendar, label: 'Calendar' },
  { 
    key: 'youtube', 
    icon: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.14 1 12 1 12s0 3.86.46 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.86 23 12 23 12s0-3.86-.46-5.58z"></path><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon></svg>
    ), 
    label: 'YouTube' 
  },
  { 
    key: 'spotify', 
    icon: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
    ), 
    label: 'Music' 
  },
]

export default function BottomBar({ openWidgets, toggle, onLogout }) {
  return (
    <div style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 99, display: 'flex', gap: '8px', background: 'rgba(8,15,35,0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '20px', padding: '8px 16px' }}>
      {items.map(({ key, icon: Icon, label }) => (
        <button key={key} onClick={() => toggle(key)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '8px 16px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: openWidgets[key] ? 'rgba(147,197,253,0.2)' : 'transparent', color: openWidgets[key] ? '#93c5fd' : 'rgba(255,255,255,0.6)' }}>
          <Icon size={20} />
          <span style={{ fontSize: '10px' }}>{label}</span>
        </button>
      ))}
      <button onClick={onLogout} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '8px 16px', border: 'none', cursor: 'pointer', background: 'transparent', color: 'rgba(255,100,100,0.7)' }}>
        <LogOut size={20} />
        <span style={{ fontSize: '10px' }}>Out</span>
      </button>
    </div>
  )
}