import { useState, useEffect, useRef } from 'react'
import { X, Play, Pause, RotateCcw } from 'lucide-react'

const PRESETS = [
  { label: 'Pomodoro', minutes: 25 },
  { label: 'Short Break', minutes: 5 },
  { label: 'Long Break', minutes: 15 },
]

export default function PomodoroWidget({ onClose }) {
  const [selected, setSelected] = useState(0)
  const [custom, setCustom] = useState('')
  const [seconds, setSeconds] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) { clearInterval(intervalRef.current); setRunning(false); return 0 }
          return s - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running])

  function selectPreset(i) {
    setSelected(i)
    setRunning(false)
    setSeconds(PRESETS[i].minutes * 60)
    setCustom('')
  }

  function applyCustom() {
    const mins = parseInt(custom)
    if (!mins || mins < 1) return
    setRunning(false)
    setSeconds(mins * 60)
    setSelected(-1)
  }

  function reset() {
    setRunning(false)
    if (selected >= 0) setSeconds(PRESETS[selected].minutes * 60)
    else setSeconds(parseInt(custom) * 60 || 0)
  }

  const mins = String(Math.floor(seconds / 60)).padStart(2, '0')
  const secs = String(seconds % 60).padStart(2, '0')

  return (
    <div style={{
      position: 'fixed', top: '80px', right: '24px',
      zIndex: 50, width: '280px',
      background: 'rgba(8,15,40,0.92)',
      border: '1px solid rgba(147,197,253,0.2)',
      backdropFilter: 'blur(20px)',
      borderRadius: '16px', padding: '20px',
    }}>
      {}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span style={{ fontFamily: "'Press Start 2P', monospace", color: 'white', fontSize: '9px' }}>Timer</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#93c5fd', cursor: 'pointer' }}>
          <X size={16} />
        </button>
      </div>

      {}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
        {PRESETS.map((p, i) => (
          <button key={i} onClick={() => selectPreset(i)} style={{
            flex: 1, padding: '6px 4px', borderRadius: '8px',
            border: '1px solid rgba(147,197,253,0.2)',
            background: selected === i ? 'rgba(147,197,253,0.2)' : 'transparent',
            color: selected === i ? '#93c5fd' : 'rgba(255,255,255,0.5)',
            fontSize: '9px', fontFamily: "'Nunito', sans-serif",
            cursor: 'pointer'
          }}>{p.label}</button>
        ))}
      </div>

      {}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <span style={{
          fontFamily: "'Press Start 2P', monospace",
          color: 'white', fontSize: '40px',
          textShadow: '0 0 20px rgba(147,197,253,0.5)'
        }}>{mins}:{secs}</span>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button onClick={() => setRunning(r => !r)} style={{
          flex: 1, padding: '10px', borderRadius: '10px',
          background: 'rgba(37,99,235,0.7)',
          border: '1px solid rgba(147,197,253,0.3)',
          color: 'white', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          fontFamily: "'Nunito', sans-serif", fontSize: '13px', fontWeight: '600'
        }}>
          {running ? <Pause size={16} /> : <Play size={16} />}
          {running ? 'Pause' : 'Start'}
        </button>
        <button onClick={reset} style={{
          padding: '10px 14px', borderRadius: '10px',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <RotateCcw size={16} />
        </button>
      </div>

      {}
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="number"
          placeholder="Custom (min)"
          value={custom}
          onChange={e => setCustom(e.target.value)}
          style={{
            flex: 1, background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '8px', padding: '8px 12px',
            color: 'white', fontSize: '13px',
            fontFamily: "'Nunito', sans-serif", outline: 'none'
          }}
        />
        <button onClick={applyCustom} style={{
          padding: '8px 14px', borderRadius: '8px',
          background: 'rgba(147,197,253,0.15)',
          border: '1px solid rgba(147,197,253,0.3)',
          color: '#93c5fd', cursor: 'pointer',
          fontFamily: "'Nunito', sans-serif", fontSize: '12px'
        }}>Set</button>
      </div>
    </div>
  )
}