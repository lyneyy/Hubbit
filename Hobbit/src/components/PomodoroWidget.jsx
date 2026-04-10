import { useState, useEffect, useRef } from 'react'
import { X, Play, Pause, RotateCcw, Timer } from 'lucide-react'
import Draggable from 'react-draggable'

export default function PomodoroWidget({ onClose }) {
  const durations = {
    pomodoro: 25 * 60,
    short: 5 * 60,
    long: 15 * 60
  }

  const [mode, setMode] = useState('pomodoro')
  const [timeLeft, setTimeLeft] = useState(durations.pomodoro)
  const [isActive, setIsActive] = useState(false)
  const [customInput, setCustomInput] = useState('')
  const nodeRef = useRef(null)
  const audioRef = useRef(new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg'))

  useEffect(() => {
    let interval = null
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000)
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false)
      audioRef.current.play()
      alert("⏰ Time's up! Take a break!")
    } else {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [isActive, timeLeft])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleSetTime = () => {
    if (!customInput) return
    if (customInput.includes(':')) {
      const [m, s] = customInput.split(':').map(Number)
      if (!isNaN(m) && !isNaN(s)) setTimeLeft(m * 60 + s)
    } else {
      const m = parseInt(customInput)
      if (!isNaN(m)) setTimeLeft(m * 60)
    }
    setIsActive(false)
    setCustomInput('')
  }

  const handleRetry = () => {
    setIsActive(false)
    setTimeLeft(durations[mode]) 
  }

  const changeMode = (newMode) => {
    setMode(newMode)
    setTimeLeft(durations[newMode])
    setIsActive(false)
  }

  return (
    <Draggable nodeRef={nodeRef} handle=".drag-handle" defaultPosition={{ x: window.innerWidth - 260, y: -10 }}>
      <div ref={nodeRef} style={styles.widget} className="glass-ui">
        <div className="drag-handle" style={styles.header}>
          <div style={styles.headerTitle}>
            <Timer size={12} color="#93c5fd" />
            <span style={styles.pixelFontSmall}>POMODORO</span>
          </div>
          <button onClick={onClose} style={styles.closeBtn}><X size={14} /></button>
        </div>

        <div style={styles.content}>
          <div style={styles.timerBox}>
            <h1 style={styles.timerTextPixel}>{formatTime(timeLeft)}</h1>
          </div>

          <div style={styles.modes}>
            <button onClick={() => changeMode('pomodoro')} style={{...styles.modeBtn, borderBottom: mode === 'pomodoro' ? '2px solid #3b82f6' : 'none'}}>Pomodoro</button>
            <button onClick={() => changeMode('short')} style={{...styles.modeBtn, borderBottom: mode === 'short' ? '2px solid #3b82f6' : 'none'}}>Short</button>
            <button onClick={() => changeMode('long')} style={{...styles.modeBtn, borderBottom: mode === 'long' ? '2px solid #3b82f6' : 'none'}}>Long</button>
          </div>

          <div style={styles.controlRow}>
            <button onClick={() => setIsActive(!isActive)} style={styles.mainBtn}>
              {isActive ? <Pause size={14} fill="white" /> : <Play size={14} fill="white" />}
            </button>
            
            <button onClick={handleRetry} style={styles.iconBtn}>
              <RotateCcw size={14} />
            </button>
            
            <div style={styles.inputWrapper}>
              <input 
                placeholder="MM:SS" 
                value={customInput}
                onChange={e => setCustomInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSetTime()}
                style={styles.input}
              />
              <button onClick={handleSetTime} style={styles.setBtn}>Set</button>
            </div>
          </div>
        </div>
      </div>
    </Draggable>
  )
}

const styles = {
  widget: { position: 'fixed', zIndex: 100, width: '220px', background: 'rgba(10, 15, 30, 0.98)', border: '1px solid rgba(147,197,253,0.2)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 15px 40px rgba(0,0,0,0.6)' },
  header: { padding: '6px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'grab' },
  headerTitle: { display: 'flex', alignItems: 'center', gap: '6px' },
  pixelFontSmall: { fontFamily: "'Press Start 2P', monospace", fontSize: '7px', color: '#93c5fd' },
  closeBtn: { background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex' },
  content: { padding: '10px 15px 15px 15px' },
  timerBox: { textAlign: 'center', marginBottom: '0px' },
  timerTextPixel: { 
    fontSize: '32px', 
    color: 'white', 
    fontFamily: "'Press Start 2P', monospace", 
    letterSpacing: '-2px',
    margin: '10px 0'
  },
  modes: { display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '12px' },
  modeBtn: { background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', paddingBottom: '2px', fontFamily: "'Press Start 2P', monospace", fontSize: '6px' },
  controlRow: { display: 'flex', alignItems: 'center', gap: '6px' },
  mainBtn: { background: '#2563eb', border: 'none', color: 'white', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  iconBtn: { background: 'rgba(255,255,255,0.05)', border: 'none', color: '#cbd5e1', padding: '8px', borderRadius: '8px', cursor: 'pointer' },
  inputWrapper: { display: 'flex', flex: 1, background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '2px 6px', alignItems: 'center' },
  input: { width: '100%', background: 'transparent', border: 'none', color: 'white', fontSize: '8px', outline: 'none', padding: '4px', fontFamily: "'Press Start 2P', monospace" },
  setBtn: { background: 'none', border: 'none', color: '#3b82f6', fontSize: '8px', fontFamily: "'Press Start 2P', monospace", cursor: 'pointer' }
}