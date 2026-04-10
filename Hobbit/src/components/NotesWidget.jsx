import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Image from '@tiptap/extension-image'
import { X, Plus, Trash2, Minus, Bold, Italic, List, ListOrdered, Image as ImageIcon, Underline as UnderlineIcon } from 'lucide-react'
import Draggable from 'react-draggable'

export default function NotesWidget({ session, onClose }) {
  const [notes, setNotes] = useState([])
  const [active, setActive] = useState(null)
  const [title, setTitle] = useState('')
  const nodeRef = useRef(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        
        bulletList: { HTMLAttributes: { class: 'hubbit-list' } },
        orderedList: { HTMLAttributes: { class: 'hubbit-list-num' } },
      }),
      Underline,
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          style: 'max-width: 100%; border-radius: 12px; border: 2px solid #93c5fd44; margin-top: 10px;',
        },
      }),
    ],
    onUpdate: ({ editor }) => {
      if (active) saveContent(editor.getHTML())
    },
    editorProps: {
      attributes: {
        
        class: 'outline-none text-white p-5 min-h-[300px] text-sm leading-relaxed scrollbar-custom overflow-y-auto',
        style: 'color: white;'
      }
    }
  })

  useEffect(() => { fetchNotes() }, [])

  async function fetchNotes() {
    const { data } = await supabase.from('notes').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false })
    if (data) setNotes(data)
  }

  function selectNote(note) {
    setActive(note); setTitle(note.title); editor?.commands.setContent(note.content || '')
  }

  async function saveContent(content) {
    if (active) await supabase.from('notes').update({ content }).eq('id', active.id)
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        editor.chain().focus().setImage({ src: event.target.result }).run()
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Draggable nodeRef={nodeRef} handle=".drag-handle" defaultPosition={{ x: window.innerWidth / 2 - 325, y: -60 }}>
      <div ref={nodeRef} style={styles.widget} className="glass-ui">
        {}
        <div className="drag-handle" style={styles.header}>
          <span style={styles.pixelTitle}>HUBBIT NOTES</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={onClose} style={styles.navBtn}><Minus size={14} /></button>
            <button onClick={onClose} style={styles.navBtn}><X size={14} /></button>
          </div>
        </div>

        {}
        {active && (
          <div style={styles.toolbar}>
            <button onClick={() => editor.chain().focus().toggleBold().run()} style={{...styles.toolBtn, color: editor.isActive('bold') ? '#93c5fd' : '#64748b'}}><Bold size={16} /></button>
            <button onClick={() => editor.chain().focus().toggleItalic().run()} style={{...styles.toolBtn, color: editor.isActive('italic') ? '#93c5fd' : '#64748b'}}><Italic size={16} /></button>
            <button onClick={() => editor.chain().focus().toggleUnderline().run()} style={{...styles.toolBtn, color: editor.isActive('underline') ? '#93c5fd' : '#64748b'}}><UnderlineIcon size={16} /></button>
            <div style={styles.divider} />
            <button onClick={() => editor.chain().focus().toggleBulletList().run()} style={{...styles.toolBtn, color: editor.isActive('bulletList') ? '#93c5fd' : '#64748b'}}><List size={16} /></button>
            <button onClick={() => editor.chain().focus().toggleOrderedList().run()} style={{...styles.toolBtn, color: editor.isActive('orderedList') ? '#93c5fd' : '#64748b'}}><ListOrdered size={16} /></button>
            <label style={styles.toolBtn}>
              <ImageIcon size={16} style={{color: '#64748b', cursor: 'pointer'}} />
              <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
            </label>
          </div>
        )}

        <div style={styles.body}>
          <div style={styles.sidebar} className="scrollbar-custom">
            <button onClick={async () => {
              const { data } = await supabase.from('notes').insert({ user_id: session.user.id, title: 'New Note' }).select().single()
              if(data) { setNotes([data, ...notes]); selectNote(data) }
            }} style={styles.addBtn}>+ New Note</button>
            {notes.map(n => (
              <div key={n.id} onClick={() => selectNote(n)} style={{ ...styles.noteItem, background: active?.id === n.id ? 'rgba(147,197,253,0.15)' : 'transparent', border: active?.id === n.id ? '1px solid rgba(147,197,253,0.3)' : '1px solid transparent' }}>
                <span style={{flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{n.title}</span>
                <Trash2 size={12} onClick={async (e) => { 
                  e.stopPropagation()
                  await supabase.from('notes').delete().eq('id', n.id)
                  fetchNotes()
                }} style={{opacity: 0.5, color: '#f87171'}} />
              </div>
            ))}
          </div>

          <div style={styles.editorContainer}>
            <style>{`
              .ProseMirror ul { list-style-type: disc; padding-left: 20px; }
              .ProseMirror ol { list-style-type: decimal; padding-left: 20px; }
              .ProseMirror img { display: block; max-width: 100%; height: auto; margin: 10px 0; border-radius: 8px; }
            `}</style>
            {active ? (
              <>
                <input value={title} onChange={e => {
                  setTitle(e.target.value)
                  supabase.from('notes').update({ title: e.target.value }).eq('id', active.id).then(() => {
                    setNotes(notes.map(note => note.id === active.id ? {...note, title: e.target.value} : note))
                  })
                }} style={styles.titleInput} placeholder="Title..." />
                <div style={{flex: 1, overflowY: 'auto'}} className="scrollbar-custom">
                  <EditorContent editor={editor} />
                </div>
              </>
            ) : <div style={styles.empty}>Select a note to start!</div>}
          </div>
        </div>
      </div>
    </Draggable>
  )
}

const styles = {
  widget: { position: 'fixed', zIndex: 100, width: '650px', height: '480px', background: 'rgba(8,15,40,0.98)', border: '1px solid rgba(147,197,253,0.3)', borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px rgba(0,0,0,0.7)' },
  header: { padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'grab' },
  pixelTitle: { fontFamily: "'Press Start 2P', monospace", fontSize: '9px', color: '#93c5fd' },
  navBtn: { background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' },
  toolbar: { display: 'flex', gap: '14px', padding: '10px 20px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)' },
  toolBtn: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  divider: { width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' },
  body: { display: 'flex', flex: 1, overflow: 'hidden' },
  sidebar: { width: '180px', borderRight: '1px solid rgba(255,255,255,0.1)', padding: '15px', overflowY: 'auto' },
  addBtn: { width: '100%', padding: '10px', borderRadius: '10px', background: '#2563eb', color: 'white', border: 'none', marginBottom: '15px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' },
  noteItem: { padding: '10px', fontSize: '12px', color: '#cbd5e1', borderRadius: '10px', cursor: 'pointer', marginBottom: '6px', display: 'flex', alignItems: 'center' },
  editorContainer: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  titleInput: { background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '15px 25px', color: 'white', fontSize: '20px', fontWeight: 'bold', outline: 'none' },
  empty: { margin: 'auto', color: '#64748b', fontSize: '13px' }
}