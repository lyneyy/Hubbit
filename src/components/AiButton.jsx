import { useState, useRef, useEffect } from 'react'
import { Bot, X, Send, FileUp, BookOpen, Loader2, CheckCircle } from 'lucide-react'
import Draggable from 'react-draggable'
import * as pdfjsLib from 'pdfjs-dist'
import ReactMarkdown from 'react-markdown'

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

const API_KEY = import.meta.env.VITE_GROQ_API_KEY

const HUBBIT_SYSTEM_PROMPT = `Kamu adalah "Hubbit AI", asisten produktivitas minimalist yang nemenin sesi belajar user.

**Personality:** Pakai bahasa gaul mahasiswa Indonesia yang santai tapi informatif. Contoh: "oke sip", "gas belajar", "nah ini penting nih", "coba perhatiin".

**Formatting (WAJIB):**
- Selalu jawab dalam format Markdown yang rapi
- Gunakan **bold** untuk poin penting
- Gunakan bullet points (-) untuk list
- Gunakan \`code\` untuk istilah teknis
- Double line break antar paragraf
- Maksimal heading h3 (###)
- Jika buat roadmap, gunakan nested list

**Tugas Utama:**
1. Bantu user fokus dan pahami materi dari dokumen yang diupload
2. Jika ada konteks PDF, PRIORITASKAN jawaban dari sana
3. Jika diminta quiz, buat 5 soal pilihan ganda (A/B/C/D) yang jelas dengan kunci jawaban di bagian bawah (spoiler style)
4. Jawaban harus ringkas tapi mendorong user belajar lebih dalam

**Batasan:**
- Jangan jawab pertanyaan di luar topik produktivitas & dokumen yang diupload
- Kalau ditanya hal random, ingatkan user buat tetap fokus dengan cara yang friendly`

const MAX_CONTEXT_CHARS = 8000 // ✅ FIX 2: Batasi panjang context biar ga overflow token

export default function AIButton({ username }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [context, setContext] = useState('')
  const [pdfName, setPdfName] = useState('')
  const nodeRef = useRef(null)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (username) {
      setMessages([{
        role: 'ai',
        text: `Heyy **${username}**! 👋 Hubbit AI siap nemenin belajarmu.\n\nUpload PDF dulu biar gue bisa bantu quiz & jelasin materi. Atau langsung tanya aja! 🚀`
      }])
    }
  }, [username])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setPdfLoading(true)
    setPdfName(file.name)

    const reader = new FileReader()
    reader.onload = async (ev) => {
      try {
        const typedarray = new Uint8Array(ev.target.result)
        const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise
        let text = ''

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const content = await page.getTextContent()
          text += content.items.map(s => s.str).join(' ') + '\n'
        }

        const trimmed = text.length > MAX_CONTEXT_CHARS
          ? text.slice(0, MAX_CONTEXT_CHARS) + '\n\n[... dokumen dipotong karena terlalu panjang]'
          : text

        setContext(trimmed)
        setMessages(prev => [...prev, {
          role: 'ai',
          text: `✅ **"${file.name}"** berhasil diload!\n\n- **${pdf.numPages} halaman** terbaca\n- ${text.length > MAX_CONTEXT_CHARS ? `Konteks dipotong di ${MAX_CONTEXT_CHARS} karakter (biar ga makan banyak token)` : 'Semua konten terbaca'}\n\nMau langsung **quiz**? Klik ikon buku di bawah! 📖`
        }])
      } catch (err) {
        setMessages(prev => [...prev, {
          role: 'ai',
          text: `❌ Waduh, gagal baca PDF-nya nih. Coba pastiin file-nya ga corrupt ya.\n\nError: \`${err.message}\``
        }])
      } finally {
        setPdfLoading(false)
        e.target.value = ''
      }
    }
    reader.readAsArrayBuffer(file)
  }

  async function sendMessage(isQuiz = false) {
    const msg = isQuiz
      ? 'Buatin aku 5 soal pilihan ganda (A/B/C/D) dari dokumen yang udah diupload. Taruh kunci jawabannya di bawah soal dengan format spoiler.'
      : input.trim()

    if (!msg || loading) return

    setInput('')
    const newUserMsg = { role: 'user', text: msg }
    setMessages(prev => [...prev, newUserMsg])
    setLoading(true)
    
    const historyForAPI = messages
      .filter(m => m.text) // filter pesan kosong
      .map(m => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.text
      }))

    const userContent = context
      ? `[Konteks Dokumen "${pdfName}"]:\n${context}\n\n[Pertanyaan User]: ${msg}`
      : msg

    historyForAPI.push({ role: 'user', content: userContent })

    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [

            { role: 'system', content: HUBBIT_SYSTEM_PROMPT },
            ...historyForAPI
          ],
          temperature: 0.7,
          max_tokens: 2048
        })
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error?.message || `HTTP ${res.status}`)
      }

      const data = await res.json()
      const aiText = data.choices?.[0]?.message?.content

      if (!aiText) throw new Error('Response kosong dari Groq')

      setMessages(prev => [...prev, { role: 'ai', text: aiText }])
    } catch (error) {
      console.error('Groq Error:', error)
      setMessages(prev => [...prev, {
        role: 'ai',
        text: `❌ **Waduh, error nih!**\n\n\`${error.message}\`\n\nCoba lagi ya, atau cek API key-nya dulu.`
      }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {open && (
        <Draggable nodeRef={nodeRef} handle=".drag-handle" bounds="body">
          <div ref={nodeRef} style={styles.panel}>
            {/* Header */}
            <div className="drag-handle" style={styles.header}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={styles.dot} />
                <span style={styles.pixelTitle}>HUBBIT AI</span>
              </div>
              {/* PDF Status Badge */}
              {pdfName && !pdfLoading && (
                <div style={styles.pdfBadge}>
                  <CheckCircle size={11} />
                  <span style={{ fontSize: '10px', maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {pdfName}
                  </span>
                </div>
              )}
              {pdfLoading && (
                <div style={styles.pdfBadge}>
                  <Loader2 size={11} className="animate-spin" />
                  <span style={{ fontSize: '10px' }}>Loading PDF...</span>
                </div>
              )}
              <button onClick={() => setOpen(false)} style={styles.closeBtn}>
                <X size={16} />
              </button>
            </div>

            {/* Chat Area */}
            <div style={styles.chat} className="scrollbar-custom">
              {messages.map((m, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  {m.role === 'ai' && (
                    <span style={styles.roleLabel}>Hubbit AI</span>
                  )}
                  <div style={{ ...styles.bubble, ...(m.role === 'user' ? styles.userBubble : styles.aiBubble) }}>
                    {/* ✅ FIX 6: Render markdown dengan benar */}
                    {m.role === 'ai' ? (
                      <div style={styles.markdownWrapper}>
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p style={{ margin: '0 0 8px', lineHeight: '1.6' }}>{children}</p>,
                            strong: ({ children }) => <strong style={{ color: '#93c5fd', fontWeight: 600 }}>{children}</strong>,
                            ul: ({ children }) => <ul style={{ margin: '6px 0', paddingLeft: '18px' }}>{children}</ul>,
                            ol: ({ children }) => <ol style={{ margin: '6px 0', paddingLeft: '18px' }}>{children}</ol>,
                            li: ({ children }) => <li style={{ margin: '3px 0', lineHeight: '1.5' }}>{children}</li>,
                            code: ({ inline, children }) => inline
                              ? <code style={{ background: 'rgba(255,255,255,0.15)', padding: '1px 5px', borderRadius: '4px', fontSize: '12px', fontFamily: 'monospace' }}>{children}</code>
                              : <pre style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px', overflow: 'auto', fontSize: '12px' }}><code>{children}</code></pre>,
                            h3: ({ children }) => <h3 style={{ color: '#93c5fd', fontSize: '13px', fontWeight: 600, margin: '10px 0 5px' }}>{children}</h3>,
                            blockquote: ({ children }) => <blockquote style={{ borderLeft: '3px solid #93c5fd', paddingLeft: '10px', margin: '8px 0', opacity: 0.85 }}>{children}</blockquote>,
                          }}
                        >
                          {m.text}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <span style={{ fontSize: '13px' }}>{m.text}</span>
                    )}
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {loading && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <div style={{ ...styles.bubble, ...styles.aiBubble }}>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      {[0, 1, 2].map(i => (
                        <div key={i} style={{
                          width: '6px', height: '6px', borderRadius: '50%',
                          background: '#93c5fd', opacity: 0.6,
                          animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`
                        }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Footer */}
            <div style={styles.footer}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', alignItems: 'center' }}>
                {/* Upload PDF */}
                <label style={styles.iconBtn} title="Upload PDF">
                  {pdfLoading
                    ? <Loader2 size={18} className="animate-spin" />
                    : <FileUp size={18} />
                  }
                  <input type="file" hidden accept=".pdf" onChange={handleFileUpload} disabled={pdfLoading} />
                </label>

                {/* Quick Quiz */}
                <button
                  onClick={() => sendMessage(true)}
                  style={{ ...styles.iconBtn, ...(context ? {} : { opacity: 0.4 }) }}
                  title={context ? 'Generate Quiz dari PDF' : 'Upload PDF dulu ya!'}
                  disabled={!context || loading}
                >
                  <BookOpen size={18} />
                </button>

                {/* PDF name */}
                {pdfName && !pdfLoading && (
                  <span style={{ fontSize: '10px', color: '#4ade80', opacity: 0.8, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    ✓ {pdfName}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  style={styles.input}
                  placeholder="Tanya Hubbit... (Enter kirim, Shift+Enter baris baru)"
                  rows={1}
                  disabled={loading}
                />
                <button
                  onClick={() => sendMessage()}
                  style={{ ...styles.sendBtn, opacity: (!input.trim() || loading) ? 0.5 : 1 }}
                  disabled={!input.trim() || loading}
                >
                  {loading ? <Loader2 className="animate-spin" size={15} /> : <Send size={15} />}
                </button>
              </div>
            </div>
          </div>
        </Draggable>
      )}

      {/* FAB */}
      {!open && (
        <button onClick={() => setOpen(true)} style={styles.fab} title="Buka Hubbit AI">
          <Bot size={22} />
        </button>
      )}

      {/* CSS animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(0.8); opacity: 0.4; }
          50% { transform: scale(1.2); opacity: 1; }
        }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </>
  )
}

const styles = {
  panel: {
    position: 'fixed', bottom: '100px', right: '30px', zIndex: 200,
    width: '360px', height: '520px',
    background: 'rgba(8, 14, 40, 0.97)',
    border: '1px solid rgba(147, 197, 253, 0.25)',
    borderRadius: '20px',
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
  },
  header: {
    padding: '13px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    cursor: 'grab', background: 'rgba(255,255,255,0.03)'
  },
  dot: {
    width: '8px', height: '8px', borderRadius: '50%',
    background: '#4ade80', boxShadow: '0 0 6px #4ade80'
  },
  pixelTitle: {
    fontFamily: "'Press Start 2P', monospace",
    fontSize: '8px', color: 'white', letterSpacing: '1px'
  },
  pdfBadge: {
    display: 'flex', alignItems: 'center', gap: '4px',
    background: 'rgba(74, 222, 128, 0.15)',
    border: '1px solid rgba(74, 222, 128, 0.3)',
    borderRadius: '20px', padding: '3px 8px', color: '#4ade80', flex: 1,
    marginLeft: '8px', marginRight: '8px'
  },
  closeBtn: {
    background: 'none', border: 'none', color: '#64748b', cursor: 'pointer',
    padding: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center',
    transition: 'color 0.2s'
  },
  chat: {
    flex: 1, overflowY: 'auto', padding: '16px',
    display: 'flex', flexDirection: 'column', gap: '10px'
  },
  roleLabel: {
    fontSize: '10px', color: '#64748b', marginBottom: '3px', paddingLeft: '4px'
  },
  bubble: {
    maxWidth: '88%', padding: '10px 14px', borderRadius: '14px',
    color: 'white', wordBreak: 'break-word'
  },
  userBubble: {
    background: '#2563eb', borderBottomRightRadius: '4px'
  },
  aiBubble: {
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderBottomLeftRadius: '4px'
  },
  markdownWrapper: {
    fontSize: '13px', lineHeight: '1.6', color: '#e2e8f0'
  },
  footer: {
    padding: '12px 14px',
    background: 'rgba(0,0,0,0.25)',
    borderTop: '1px solid rgba(255,255,255,0.07)'
  },
  iconBtn: {
    background: 'none', border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '8px', color: '#93c5fd', cursor: 'pointer',
    padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  input: {
    flex: 1, background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '10px', padding: '9px 12px', color: 'white',
    outline: 'none', resize: 'none', fontSize: '13px',
    fontFamily: 'inherit', lineHeight: '1.5'
  },
  sendBtn: {
    background: '#2563eb', border: 'none', color: 'white',
    padding: '9px 12px', borderRadius: '10px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'opacity 0.2s'
  },
  fab: {
    position: 'fixed', bottom: '30px', right: '30px',
    width: '56px', height: '56px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
    color: 'white', border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 200, boxShadow: '0 4px 20px rgba(37, 99, 235, 0.5)',
    transition: 'transform 0.2s'
  }
}
