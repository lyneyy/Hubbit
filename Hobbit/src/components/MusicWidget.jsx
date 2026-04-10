import { useState, useRef } from 'react'
import Draggable from 'react-draggable'

export default function MusicWidget({ type, onClose }) {
  const nodeRef = useRef(null)

  const defaults = {
    youtube: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
    spotify: "https://open.spotify.com/playlist/0vvXsWCC9xrXsKd4FyS8kM"
  }

  const [urlInput, setUrlInput] = useState(type === 'youtube' ? defaults.youtube : "https://open.spotify.com/playlist/0vvXsWCC9xrXsKd4FyS8kM")
  const [embedUrl, setEmbedUrl] = useState(
    type === 'youtube' 
    ? "https://www.youtube.com/embed/jfKfPfyJRdk" 
    : "https://open.spotify.com/embed/playlist/0vvXsWCC9xrXsKd4FyS8kM"
  )

  const handleUpdate = () => {
    if (!urlInput) return

    if (type === 'youtube') {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
      const match = urlInput.match(regExp)
      if (match && match[2].length === 11) {
        setEmbedUrl(`https://www.youtube.com/embed/${match[2]}`)
      }
    } else {
      let spotLink = urlInput.split('?')[0]
      if (spotLink.includes('spotify.com') && !spotLink.includes('/embed/')) {
        const finalLink = spotLink.replace('spotify.com/', 'spotify.com/embed/')
        setEmbedUrl(finalLink)
      } else {
        setEmbedUrl(spotLink)
      }
    }
  }

  return (
    <Draggable nodeRef={nodeRef} handle=".drag-handle" defaultPosition={{ x: 500, y: 200 }}>
      <div ref={nodeRef} style={styles.widget} className="glass-ui">
        <div className="drag-handle" style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {type === 'youtube' ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff0000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.14 1 12 1 12s0 3.86.46 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.86 23 12 23 12s0-3.86-.46-5.58z"></path><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1DB954" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
            )}
            <span style={styles.pixelTitle}>{(type || 'PLAYER').toUpperCase()}</span>
          </div>
          <button onClick={onClose} style={styles.navBtn}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <div style={styles.content}>
          <iframe
            style={{ borderRadius: '12px', background: '#000', marginBottom: '10px' }}
            src={embedUrl}
            width="100%"
            height={type === 'youtube' ? "180" : "152"}
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          ></iframe>

          <div style={styles.inputBox}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
            <input 
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
              placeholder="Paste link..."
              style={styles.input}
            />
            <button onClick={handleUpdate} style={styles.setBtn}>Set</button>
          </div>
        </div>
      </div>
    </Draggable>
  )
}

const styles = {
  widget: { position: 'fixed', zIndex: 150, width: '300px', background: 'rgba(8,15,40,0.95)', border: '1px solid rgba(147,197,253,0.2)', borderRadius: '16px', overflow: 'hidden' },
  header: { padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'grab' },
  pixelTitle: { fontFamily: "'Press Start 2P', monospace", fontSize: '7px', color: '#93c5fd' },
  navBtn: { background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' },
  content: { padding: '12px' },
  inputBox: { display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' },
  input: { flex: 1, background: 'transparent', border: 'none', color: 'white', fontSize: '10px', outline: 'none' },
  setBtn: { background: 'none', border: 'none', color: '#3b82f6', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }
}