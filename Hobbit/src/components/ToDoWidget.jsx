import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { X, Plus, Trash2, Minus } from 'lucide-react'
import Draggable from 'react-draggable'

export default function TodoWidget({ session, onClose }) {
  const [todos, setTodos] = useState([])
  const [input, setInput] = useState('')
  const nodeRef = useRef(null)

  useEffect(() => { fetchTodos() }, [])

  async function fetchTodos() {
    const { data } = await supabase.from('todos').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false })
    if (data) setTodos(data)
  }

  async function addTodo() {
    if (!input.trim()) return
    const { data } = await supabase.from('todos').insert({ user_id: session.user.id, task: input.trim() }).select().single()
    if (data) { setTodos(prev => [data, ...prev]); setInput('') }
  }

  return (
    <Draggable nodeRef={nodeRef} handle=".drag-handle" defaultPosition={{x: 25, y: -20}}>
      <div ref={nodeRef} style={styles.widget} className="glass-ui">
        <div className="drag-handle" style={styles.header}>
          <span style={styles.pixelTitle}>TO DO</span>
          <div style={{display: 'flex', gap: '8px'}}>
            <button onClick={onClose} style={styles.navBtn}><Minus size={14}/></button>
            <button onClick={onClose} style={styles.navBtn}><X size={14}/></button>
          </div>
        </div>
        <div style={styles.content}>
          <div style={styles.inputArea}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTodo()} placeholder="Add task..." style={styles.input} />
            <button onClick={addTodo} style={styles.addBtn}><Plus size={14}/></button>
          </div>
          <div style={styles.list} className="scrollbar-custom">
            {todos.map(t => (
              <div key={t.id} style={styles.item}>
                <span style={{fontSize: '12px', color: '#e0e7ff', flex: 1}}>{t.task}</span>
                <button onClick={async () => { await supabase.from('todos').delete().eq('id', t.id); fetchTodos(); }} style={styles.delBtn}><Trash2 size={12}/></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Draggable>
  )
}

const styles = {
  widget: { position: 'fixed', zIndex: 100, width: '280px', background: 'rgba(8,15,40,0.95)', border: '1px solid rgba(147,197,253,0.2)', borderRadius: '16px', overflow: 'hidden' },
  header: { padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'grab' },
  pixelTitle: { fontFamily: "'Press Start 2P', monospace", fontSize: '8px', color: '#93c5fd' },
  navBtn: { background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' },
  content: { padding: '12px' },
  inputArea: { display: 'flex', gap: '6px', marginBottom: '10px' },
  input: { flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '6px 10px', color: 'white', fontSize: '12px', outline: 'none' },
  addBtn: { background: '#2563eb', border: 'none', color: 'white', padding: '6px', borderRadius: '8px', cursor: 'pointer' },
  list: { maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' },
  item: { display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '8px' },
  delBtn: { background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', opacity: 0.6 }
}