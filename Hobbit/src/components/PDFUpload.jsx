import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { FileUp, Trash2, ExternalLink } from 'lucide-react'

export default function PDFUpload({ session }) {
  const [pdfs, setPdfs] = useState([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => { fetchPdfs() }, [])

  async function fetchPdfs() {
    const { data } = await supabase
      .from('pdfs')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
    if (data) setPdfs(data)
  }

  async function uploadPDF(e) {
    const file = e.target.files[0]
    if (!file || file.type !== 'application/pdf') return
    setUploading(true)
    const path = `${session.user.id}/${Date.now()}_${file.name}`
    const { error } = await supabase.storage.from('pdfs').upload(path, file)
    if (!error) {
      const { data: urlData } = supabase.storage.from('pdfs').getPublicUrl(path)
      const { data } = await supabase
        .from('pdfs')
        .insert({ user_id: session.user.id, name: file.name, url: urlData.publicUrl })
        .select()
        .single()
      if (data) setPdfs(prev => [data, ...prev])
    }
    setUploading(false)
  }

  async function deletePDF(pdf) {
    await supabase.from('pdfs').delete().eq('id', pdf.id)
    setPdfs(prev => prev.filter(p => p.id !== pdf.id))
  }

  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto">
      <label className="pixel-card rounded-2xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:bg-white/5 transition border-dashed border-2 border-purple-500/40">
        <FileUp size={32} className="text-purple-400" />
        <span className="font-pixel text-xs text-purple-300">
          {uploading ? 'Uploading...' : 'Click to upload PDF'}
        </span>
        <span className="text-purple-500 text-xs">PDF files only</span>
        <input type="file" accept=".pdf" onChange={uploadPDF} className="hidden" />
      </label>

      <div className="flex flex-col gap-3">
        {pdfs.length === 0 && (
          <p className="text-purple-500 text-sm text-center py-4">No PDFs uploaded yet ✦</p>
        )}
        {pdfs.map(pdf => (
          <div key={pdf.id} className="pixel-card rounded-xl px-5 py-4 flex items-center gap-3 group">
            <FileUp size={18} className="text-purple-400 shrink-0" />
            <span className="flex-1 text-purple-200 text-sm truncate">{pdf.name}</span>
            <a
              href={pdf.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-200 transition"
            >
              <ExternalLink size={16} />
            </a>
            <button
              onClick={() => deletePDF(pdf)}
              className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition cursor-pointer"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}