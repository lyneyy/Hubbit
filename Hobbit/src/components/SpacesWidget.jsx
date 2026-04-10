import { useState, useRef } from 'react'
import Draggable from 'react-draggable'
import { X, Search, Minus, Video } from 'lucide-react'

import bg1 from '../assets/background1.gif'
import bg2 from '../assets/background2.gif' 
import bg3 from '../assets/background3.gif' 
import bg4 from '../assets/background4.gif' 
import bg5 from '../assets/background5.gif' 
import bg6 from '../assets/background6.gif' 

const SPACES_DATA = [
  { id: 1, label: 'Comfy City', src: bg1 },
  { id: 2, label: 'Secret Garden', src: bg2 },
  { id: 3, label: 'Rainy Terrace', src: bg3 },
  { id: 4, label: 'Old Alley', src: bg4 },
  { id: 5, label: 'Apartment Balcony', src: bg5 },
  { id: 6, label: 'Train Station', src: bg6 },
]

export default function SpacesWidget({ onClose, onSelect }) {
  const [searchTerm, setSearchTerm] = useState('')
  const nodeRef = useRef(null)
  const filtered = SPACES_DATA.filter(s => s.label.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <Draggable nodeRef={nodeRef} handle=".drag-handle" defaultPosition={{x: 20, y: 20}}>
      <div ref={nodeRef} style={styles.widget} className="glass-ui">
        <div className="drag-handle" style={styles.header}>
          <span style={styles.pixelTitle}>SPACES</span>
          <div style={{display: 'flex', gap: '8px'}}>
            <button onClick={onClose} style={styles.navBtn}><Minus size={14}/></button>
            <button onClick={onClose} style={styles.navBtn}><X size={14}/></button>
          </div>
        </div>
        <div style={styles.content}>
          <div style={styles.searchBox}>
            <Search size={14} style={styles.searchIcon} />
            <input placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={styles.input} />
          </div>
          <div style={styles.gridContainer} className="scrollbar-custom">
            <div style={styles.grid}>
              {filtered.map(space => (
                <div key={space.id} onClick={() => onSelect(space.src)} style={styles.card}>
                  <div style={{position:'relative'}}>
                    <img src={space.src} style={styles.img} />
                    <div style={styles.videoBadge}><Video size={8} /></div>
                  </div>
                  <div style={styles.cardLabel}>{space.label}</div>
                </div>
              ))}
            </div>
            <div style={styles.comingSoon}>
               <p>🎬 Coming soon: More 4K Videos!</p>
            </div>
          </div>
        </div>
      </div>
    </Draggable>
  )
}

const styles = {
  widget: { position: 'fixed', zIndex: 100, width: '300px', background: 'rgba(8,15,40,0.95)', border: '1px solid rgba(147,197,253,0.2)', borderRadius: '16px', overflow: 'hidden' },
  header: { padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'grab' },
  pixelTitle: { fontFamily: "'Press Start 2P', monospace", fontSize: '8px', color: '#93c5fd' },
  navBtn: { background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' },
  content: { padding: '12px' },
  searchBox: { position: 'relative', marginBottom: '12px' },
  searchIcon: { position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' },
  input: { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '6px 6px 6px 30px', color: 'white', fontSize: '12px', outline: 'none' },
  gridContainer: { maxHeight: '300px', overflowY: 'auto' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  card: { cursor: 'pointer', borderRadius: '8px', overflow: 'hidden', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' },
  img: { width: '100%', height: '70px', objectFit: 'cover' },
  videoBadge: { position: 'absolute', top: '5px', right: '5px', background: 'rgba(0,0,0,0.5)', padding: '2px', borderRadius: '4px', color: 'white' },
  cardLabel: { padding: '5px', fontSize: '10px', color: '#cbd5e1', textAlign: 'center' },
  comingSoon: { marginTop: '15px', padding: '10px', textAlign: 'center', fontSize: '10px', color: '#64748b', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '8px' }
}