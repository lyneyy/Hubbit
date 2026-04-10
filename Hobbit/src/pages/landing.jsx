import { useState } from 'react'
import { supabase } from '../lib/supabase'
import bg from '../assets/background1.gif'

export default function Landing() {
  const [showModal, setShowModal] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setError('')
    setLoading(true)
    if (isRegister) {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { username } }
      })
      if (error) setError(error.message)
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    }
    setLoading(false)
  }

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>

      {}
      <img src={bg} alt="bg" style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%', objectFit: 'cover'
      }} />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)' }} />

      {}
      <nav style={{
        position: 'relative', zIndex: 10,
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 40px'
      }}>
        <span style={{
          fontFamily: "'Press Start 2P', monospace",
          color: 'white', fontSize: '13px',
          textShadow: '0 2px 8px rgba(0,0,0,0.6)'
        }}>Hubbit</span>

        <button
          onClick={() => { setShowModal(true); setIsRegister(false) }}
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '10px', color: 'white',
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.3)',
            padding: '10px 22px', borderRadius: '10px',
            cursor: 'pointer',
            boxShadow: '-2px 0 0 0 #93c5fd, 2px 0 0 0 #93c5fd, 0 -2px 0 0 #93c5fd, 0 2px 0 0 #93c5fd'
          }}
        >Login</button>
      </nav>

      {}
      <div style={{
        position: 'absolute', bottom: '48px', left: '48px',
        zIndex: 10
      }}>
        <h1 style={{
          fontFamily: "'Press Start 2P', monospace",
          color: 'white', fontSize: '28px',
          textShadow: '0 4px 24px rgba(0,0,0,0.7)',
          marginBottom: '12px', lineHeight: '1.6'
        }}>Hubbit</h1>
        <p style={{
          fontFamily: "'Nunito', sans-serif",
          color: 'rgba(255,255,255,0.75)',
          fontSize: '15px', marginBottom: '24px',
          lineHeight: '1.6', maxWidth: '360px'
        }}>
          Your cozy study space for notes, PDFs, todos, and AI — all in one place.
        </p>
        <button
          onClick={() => { setShowModal(true); setIsRegister(true) }}
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '10px', color: 'white',
            background: 'rgba(37,99,235,0.8)',
            border: '2px solid rgba(147,197,253,0.5)',
            padding: '14px 28px', borderRadius: '12px',
            cursor: 'pointer',
            boxShadow: '-2px 0 0 0 #93c5fd, 2px 0 0 0 #93c5fd, 0 -2px 0 0 #93c5fd, 0 2px 0 0 #93c5fd'
          }}
        >Get Started</button>
      </div>

      {}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: 'absolute', inset: 0, zIndex: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.6)'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'relative',
              background: 'rgba(8,15,40,0.95)',
              border: '1px solid rgba(147,197,253,0.2)',
              backdropFilter: 'blur(24px)',
              borderRadius: '20px',
              padding: '44px 40px 36px',
              width: '100%', maxWidth: '360px',
              margin: '0 16px',
              display: 'flex', flexDirection: 'column', gap: '14px'
            }}
          >
            {}
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: 'absolute', top: '16px', right: '16px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#93c5fd', width: '30px', height: '30px',
                borderRadius: '8px', cursor: 'pointer',
                fontSize: '13px', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontFamily: 'sans-serif'
              }}
            >✕</button>

            <h2 style={{
              fontFamily: "'Press Start 2P', monospace",
              color: 'white', fontSize: '11px',
              textAlign: 'center', marginBottom: '8px'
            }}>
              {isRegister ? 'Create Account' : 'Welcome Back'}
            </h2>

            {isRegister && (
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                style={inputStyle}
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={inputStyle}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={inputStyle}
            />

            {error && (
              <p style={{ color: '#f87171', fontSize: '11px', textAlign: 'center' }}>{error}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '10px', color: 'white',
                background: loading ? 'rgba(37,99,235,0.4)' : 'rgba(37,99,235,0.85)',
                border: '1px solid rgba(147,197,253,0.3)',
                padding: '14px', borderRadius: '12px',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '4px'
              }}
            >
              {loading ? 'loading...' : isRegister ? 'Register' : 'Login'}
            </button>

            <p style={{
              fontFamily: "'Nunito', sans-serif",
              color: '#93c5fd', fontSize: '12px', textAlign: 'center'
            }}>
              {isRegister ? 'Already have an account? ' : 'No account? '}
              <span
                onClick={() => { setIsRegister(!isRegister); setError('') }}
                style={{ color: '#bfdbfe', textDecoration: 'underline', cursor: 'pointer' }}
              >
                {isRegister ? 'Login' : 'Register'}
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

const inputStyle = {
  fontFamily: "'Nunito', sans-serif",
  background: 'rgba(255,255,255,0.07)',
  color: 'white',
  border: '1px solid rgba(255,255,255,0.15)',
  padding: '12px 16px',
  borderRadius: '10px',
  fontSize: '14px',
  outline: 'none',
  width: '100%'
}