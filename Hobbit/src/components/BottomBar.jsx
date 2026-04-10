import { FileText, CheckSquare, Timer, Calendar, Layout, LogOut } from 'lucide-react'

const items = [
  { key: 'spaces',   icon: Layout,      label: 'Spaces' },
  { key: 'notes',    icon: FileText,    label: 'Notes' },
  { key: 'todo',     icon: CheckSquare, label: 'Tasks' },
  { key: 'pomodoro', icon: Timer,       label: 'Timer' },
  { key: 'calendar', icon: Calendar,    label: 'Calendar' },
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