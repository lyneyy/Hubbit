import { useState, useRef } from 'react'
import Draggable from 'react-draggable'
import { X, Youtube, Music, Link as LinkIcon } from 'lucide-react'

export default function MusicWidget({ type, onClose }) {
  const defaultLinks = {
    youtube: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
    spotify: "https://open.spotify.com/embed/playlist/37i9dQZF1DWWQRvui9Df7X"
  }

  const [urlInput, setUrlInput] = useState(defaultLinks[type])
  const [embedUrl, setEmbedUrl] = useState(type === 'youtube' ? "https://www.youtube.com/embed/jfKfPfyJRdk" : defaultLinks.spotify)
  const nodeRef = useRef(null)

    const handleUpdateLink = () => {
    if (type === 'youtube') {
      const videoId = urlInput.match(/(?:https?:\/\/(?:www\.)?youtube\.com\/watch\?v=|https?:\/\/youtu\.be\/)([^& \n<]+)/)
      if (videoId && videoId[1]) {
        setEmbedUrl(`https://www.youtube.com/embed/${videoId[1]}`)
      }
    } else {
     
      if (urlInput.includes('spotify.com') && !urlInput.includes('/embed/')) {
        setEmbedUrl(urlInput.replace('spotify.com/', 'spotify.com/embed/'))
      } else {
        setEmbedUrl(urlInput)
      }
    }
  }

  return (
    <Draggable nodeRef={nodeRef} handle=".drag-handle" defaultPosition={{ x: 450, y: 150 }}>
      <div ref={nodeRef} style={styles.widget} className="glass-ui">
        <div className="drag-handle" style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {type === 'youtube' ? <Youtube size={14} color="#ff0000" /> : <Music size={14} color="#1DB954" />}
            <span style={styles.pixelTitle}>{type.toUpperCase()} PLAYER</span>
          </div>
          <button onClick={onClose} style={styles.navBtn}><X size={16} /></button>
        </div>

        <div style={styles.content}>
          {}
          <iframe
            style={{ borderRadius: '12px', background: '#000', marginBottom: '12px' }}
            src={embedUrl}
            width="100%"
            height={type === 'youtube' ? "160" : "80"}
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          ></iframe>

          {/* Input Area buat Custom Link */}
          <div style={styles.inputArea}>
            <div style={styles.inputWrapper}>
              <LinkIcon size={12} color="#64748b" />
              <input 
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder={`Paste ${type} link...`}
                style={styles.input}
              />
            </div>
            <button onClick={handleUpdateLink} style={styles.setBtn}>Set</button>
          </div>
        </div>
      </div>
    </Draggable>
  )
}

const styles = {
  widget: { position: 'fixed', zIndex: 110, width: '320px', background: 'rgba(8,15,40,0.95)', border: '1px solid rgba(147,197,253,0.2)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' },
  header: { padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'grab' },
  pixelTitle: { fontFamily: "'Press Start 2P', monospace", fontSize: '7px', color: '#cbd5e1' },
  navBtn: { background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' },
  content: { padding: '12px' },
  inputArea: { display: 'flex', gap: '8px', alignItems: 'center' },
  inputWrapper: { flex: 1, display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '6px 10px' },
  input: { width: '100%', background: 'transparent', border: 'none', color: 'white', fontSize: '10px', outline: 'none' },
  setBtn: { padding: '6px 12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }
}