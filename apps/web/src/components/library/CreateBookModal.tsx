'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

const COVER_COLORS = [
  '#f4a7bb', '#C8A2E8', '#A7D8F0', '#B8E8D0', '#FFD4B8',
  '#FFE5A0', '#D46A9E', '#8B5E9B', '#E8D5F5', '#FFE4EC',
]

const GENRES = [
  'Romance', 'Fantasia', 'Ficção Científica', 'Terror', 'Mistério',
  'Aventura', 'Drama', 'Comédia', 'Poesia', 'Conto', 'Outro',
]

interface Props {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

export function CreateBookModal({ open, onClose, onCreated }: Props) {
  const [title, setTitle] = useState('')
  const [synopsis, setSynopsis] = useState('')
  const [genre, setGenre] = useState('')
  const [coverColor, setCoverColor] = useState(COVER_COLORS[0])
  const [loading, setLoading] = useState(false)

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)
    try {
      await api.createBook({ title, synopsis, genre, coverColor })
      toast.success('Livro criado! 📖✨')
      onCreated()
      onClose()
      setTitle('')
      setSynopsis('')
      setGenre('')
      setCoverColor(COVER_COLORS[0])
    } catch (err: any) {
      toast.error(err.message || 'Erro ao criar livro')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="card !p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-display font-bold text-cocoa dark:text-dark-text">
            Novo Livro 📖
          </h2>
          <button onClick={onClose} className="text-cocoa/40 hover:text-cocoa dark:text-dark-text/40 dark:hover:text-dark-text">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-display font-semibold text-cocoa dark:text-dark-text mb-1">
              Título ✏️
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              placeholder="O título do seu livro"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-display font-semibold text-cocoa dark:text-dark-text mb-1">
              Sinopse 📝
            </label>
            <textarea
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              className="input-field !h-24 resize-none"
              placeholder="Uma breve descrição da sua história..."
            />
          </div>

          <div>
            <label className="block text-sm font-display font-semibold text-cocoa dark:text-dark-text mb-1">
              Gênero 🏷️
            </label>
            <div className="flex flex-wrap gap-2">
              {GENRES.map((g) => (
                <button
                  type="button"
                  key={g}
                  onClick={() => setGenre(g)}
                  className={`px-3 py-1 rounded-bubble text-sm font-display transition-all ${
                    genre === g
                      ? 'bg-rose text-white shadow-soft'
                      : 'bg-blush text-cocoa/70 hover:bg-rose/20 dark:bg-dark-card dark:text-dark-text/70'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-display font-semibold text-cocoa dark:text-dark-text mb-1">
              Cor da Capa 🎨
            </label>
            <div className="flex gap-2 flex-wrap">
              {COVER_COLORS.map((color) => (
                <button
                  type="button"
                  key={color}
                  onClick={() => setCoverColor(color)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    coverColor === color ? 'ring-2 ring-cocoa ring-offset-2 scale-110' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="flex justify-center py-4">
            <div
              className="w-28 h-40 rounded-lg shadow-card flex items-center justify-center p-3"
              style={{ backgroundColor: coverColor }}
            >
              <p className="text-white font-display font-bold text-center text-sm leading-tight drop-shadow">
                {title || 'Meu Livro'}
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !title.trim()}
            className="btn-primary w-full disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 size={16} className="animate-spin" /> Criando...</>
            ) : 'Criar Livro ✨'}
          </button>
        </form>
      </div>
    </div>
  )
}
