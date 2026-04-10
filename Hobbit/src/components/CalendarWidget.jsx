import { useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

export default function CalendarWidget({ onClose }) {
  const today = new Date()
  const [current, setCurrent] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [notes, setNotes] = useState({})
  const [selected, setSelected] = useState(null)
  const [input, setInput] = useState('')

  const year = current.getFullYear()
  const month = current.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthName = current.toLocaleString('default', { month: 'long' })

  const days = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)

  function selectDay(day) {
    if (!day) return
    const key = `${year}-${month}-${day}`
    setSelected(key)
    setInput(notes[key] || '')
  }

  function saveNote() {
    if (!selected) return
    setNotes(prev => ({ ...prev, [selected]: input }))
  }

  return (
    <div style={{
      position: 'fixed', top: '80px', right: '24px',
      zIndex: 50, width: '320px',
      background: 'rgba(8,15,40,0.92)',
      border: '1px solid rgba(147,197,253,0.2)',
      backdropFilter: 'blur(20px)',
      borderRadius: '16px', overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <span style={{ fontFamily: "'Press Start 2P', monospace", color: 'white', fontSize: '9px' }}>Calendar</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#93c5fd', cursor: 'pointer' }}><X size={16} /></button>
      </div>

      <div style={{ padding: '16px' }}>
        {}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <button onClick={() => setCurrent(new Date(year, month - 1, 1))} style={{ background: 'none', border: 'none', color: '#93c5fd', cursor: 'pointer' }}><ChevronLeft size={16} /></button>
          <span style={{ color: 'white', fontFamily: "'Nunito', sans-serif", fontWeight: '700', fontSize: '14px' }}>{monthName} {year}</span>
          <button onClick={() => setCurrent(new Date(year, month + 1, 1))} style={{ background: 'none', border: 'none', color: '#93c5fd', cursor: 'pointer' }}><ChevronRight size={16} /></button>
        </div>

        {}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '6px' }}>
          {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
            <div key={d} style={{ textAlign: 'center', color: 'rgba(147,197,253,0.5)', fontSize: '10px', fontFamily: "'Nunito', sans-serif", padding: '4px 0' }}>{d}</div>
          ))}
        </div>

        {}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
          {days.map((day, i) => {
            const key = `${year}-${month}-${day}`
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
            const isSelected = selected === key
            const hasNote = notes[key]
            return (
              <button key={i} onClick={() => selectDay(day)} style={{
                padding: '6px 0', borderRadius: '8px', border: 'none', cursor: day ? 'pointer' : 'default',
                background: isSelected ? 'rgba(37,99,235,0.6)' : isToday ? 'rgba(147,197,253,0.2)' : 'transparent',
                color: day ? (isToday ? '#93c5fd' : 'white') : 'transparent',
                fontSize: '12px', fontFamily: "'Nunito', sans-serif", position: 'relative'
              }}>
                {day}
                {hasNote && <div style={{ position: 'absolute', bottom: '2px', left: '50%', transform: 'translateX(-50%)', width: '4px', height: '4px', borderRadius: '50%', background: '#93c5fd' }} />}
              </button>
            )
          })}
        </div>

        {}
        {selected && (
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Write a note for this day..."
              rows={3}
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', padding: '8px 12px', color: 'white', fontSize: '12px', fontFamily: "'Nunito', sans-serif", outline: 'none', resize: 'none' }}
            />
            <button onClick={saveNote} style={{ padding: '8px', borderRadius: '8px', background: 'rgba(37,99,235,0.6)', border: '1px solid rgba(147,197,253,0.3)', color: 'white', cursor: 'pointer', fontFamily: "'Nunito', sans-serif", fontSize: '12px' }}>Save Note</button>
          </div>
        )}
      </div>
    </div>
  )
}