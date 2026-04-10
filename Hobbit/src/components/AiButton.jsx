import { useState, useRef, useEffect } from 'react'
import { Bot, X, Send, FileUp, BookOpen, Loader2 } from 'lucide-react'
import Draggable from 'react-draggable'
import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const HUBBIT_SYSTEM_PROMPT = `
Kamu adalah "Hubbit AI", dan kamu adalah asisten produktivitas yang minimalist and berguna.
Tugas kamu adalah untuk memastikan bahwa user tetap fokus dalam sesi belajarnya dan tetap belajar dari dokumen-dokumen yang akan diupload.

Personality: "Kamu adalah asisten yang menggunakan bahasa gaul dari mahasiswa di Indonesia"
Formatting: "Selalu jawab dalam format Markdown yang rapi dan teratur untuk membantu user mudah membaca materi."
Constraint: "Jangan menjawab pertanyaan di luar topik produktivitas dan dokumen yang diupload. Tetap stay-on-topik untuk menjaga fokus user

Rules:
1. Sebagai AI, jawaban kamu harus ringkas tapi mendorong user untuk bisa terus belajar
2. Jika konteks yang diberikan ada di dalam PDF, prioritaskan untuk jawab berdasarkan konteks dari PDF.
3. Jika user meminta untuk quiz, berikan user soal-soal pilihan ganda yang jelas.
4. Jangan lupa untuk tetap bersikap ramah dan membantu selama user bertanya.

Formatting Rules:
1. Double Line Break (\n\n) antar paragraf agar nanti tidak menumpuk
2. Bold (**) digunakan untuk poin-poin yang relevan dan penting
3. Gunakan Bullet Points (-) yang rapi
4. Jangan gunakan header (#) terlalu banyak, maksimal h3.
5. Jika membuat roadmap, gunakan format list yang berjenjang.
`;

export default function AIButton({ username }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [context, setContext] = useState('')
  const nodeRef = useRef(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (username) {
      setMessages([{ role: 'ai', text: `Hi ${username}! Ready for a Hubbit Quiz? Upload a PDF! 🌙` }])
    }
  }, [username])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLoading(true)
    const reader = new FileReader() 
    reader.onload = async (ev) => {
      try {
        const typedarray = new Uint8Array(ev.target.result)
        const pdf = await pdfjsLib.getDocument(typedarray).promise
        let text = ""
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const content = await page.getTextContent()
          text += content.items.map(s => s.str).join(' ')
        }
        setContext(text)
        setMessages(prev => [...prev, { role: 'ai', text: `✅ "${file.name}" loaded! Ask me for a quiz.` }])
      } catch (err) {
        setMessages(prev => [...prev, { role: 'ai', text: "Gagal baca PDF nih." }])
      } finally {
        setLoading(false)
      }
    }
    reader.readAsArrayBuffer(file)
  }

  async function sendMessage(isQuiz = false) {
    const msg = isQuiz ? "Generate 5 multiple choice questions from my file." : input.trim();
    if (!msg || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setLoading(true);

    const promptText = `
      ${HUBBIT_SYSTEM_PROMPT}
      
      CONTEXT DOKUMEN:
      ${context || "Tidak ada dokumen diupload."}
      
      PERTANYAAN USER:
      ${msg}
    `;

    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }]
        })
      });

      const data = await res.json();
      
      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        const aiText = data.candidates[0].content.parts[0].text;
        setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
      } else {
        throw new Error("Gagal dapet respon dari Gemini");
      }

    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: `Error: ${error.message}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {open && (
        <Draggable nodeRef={nodeRef} handle=".drag-handle">
          <div ref={nodeRef} style={styles.panel} className="glass-ui">
            <div className="drag-handle" style={styles.header}>
              <span style={styles.pixelTitle}>HUBBIT AI</span>
              <button onClick={() => setOpen(false)} style={styles.closeBtn}><X size={18} /></button>
            </div>
            <div style={styles.chat} className="scrollbar-custom">
              {messages.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{...styles.bubble, background: m.role === 'user' ? '#2563eb' : 'rgba(255,255,255,0.1)', whiteSpace: 'pre-wrap'}}>{m.text}</div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <div style={styles.footer}>
              <div style={{display:'flex', gap:'10px', marginBottom:'10px'}}>
                <label style={{cursor:'pointer', color:'#93c5fd'}}><FileUp size={20}/><input type="file" hidden accept=".pdf" onChange={handleFileUpload}/></label>
                <button onClick={() => sendMessage(true)} style={{background:'none', border:'none', color:'#93c5fd', cursor:'pointer'}}><BookOpen size={20}/></button>
              </div>
              <div style={{display:'flex', gap:'10px'}}>
                <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendMessage()} style={styles.input} placeholder="Ask Hubbit..."/>
                <button onClick={()=>sendMessage()} style={styles.sendBtn}>{loading ? <Loader2 className="animate-spin" size={16}/> : <Send size={16}/>}</button>
              </div>
            </div>
          </div>
        </Draggable>
      )}
      {!open && <button onClick={()=>setOpen(true)} style={styles.fab}><Bot size={24}/></button>}
    </>
  )
}

const styles = {
  panel: { position: 'fixed', bottom: '100px', right: '30px', zIndex: 200, width: '350px', height: '500px', background: 'rgba(8,15,40,0.98)', border: '1px solid rgba(147,197,253,0.3)', borderRadius: '24px', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  header: { padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'grab' },
  pixelTitle: { fontFamily: "'Press Start 2P', monospace", fontSize: '9px', color: 'white' },
  closeBtn: { background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' },
  chat: { flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' },
  bubble: { maxWidth: '80%', padding: '12px', borderRadius: '15px', fontSize: '13px', color: 'white' },
  footer: { padding: '15px', background: 'rgba(0,0,0,0.2)' },
  input: { flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px', color: 'white', outline: 'none' },
  sendBtn: { background: '#2563eb', border: 'none', color: 'white', padding: '10px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  fab: { position: 'fixed', bottom: '30px', right: '30px', width: '60px', height: '60px', borderRadius: '50%', background: '#2563eb', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }
}