'use client'

import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { BookCard } from '@/components/library/BookCard'
import { CreateBookModal } from '@/components/library/CreateBookModal'
import { api, Book } from '@/lib/api'
import { Plus, Search, Filter } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LibraryPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  const loadBooks = async () => {
    try {
      const data = await api.getBooks()
      setBooks(data)
    } catch (err: any) {
      toast.error('Erro ao carregar livros')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBooks()
  }, [])

  const filteredBooks = books.filter((book) => {
    const matchesSearch = book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.genre?.toLowerCase().includes(search.toLowerCase()) ||
      book.synopsis?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || book.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-cocoa dark:text-dark-text">
              Biblioteca 📚
            </h1>
            <p className="text-cocoa/50 dark:text-dark-text/50 font-body mt-1">
              {books.length} {books.length === 1 ? 'livro' : 'livros'} na sua coleção
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            Novo Livro
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-rose/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field !pl-11"
              placeholder="Buscar livros..."
            />
          </div>
          <div className="flex gap-2">
            {[
              { key: 'ALL', label: 'Todos', emoji: '📚' },
              { key: 'DRAFT', label: 'Rascunho', emoji: '📝' },
              { key: 'IN_PROGRESS', label: 'Em andamento', emoji: '✍️' },
              { key: 'COMPLETED', label: 'Concluído', emoji: '✅' },
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setStatusFilter(filter.key)}
                className={`px-4 py-2 rounded-bubble text-sm font-display font-medium transition-all ${
                  statusFilter === filter.key
                    ? 'bg-rose text-white shadow-soft'
                    : 'bg-white dark:bg-dark-card text-cocoa/60 dark:text-dark-text/60 hover:bg-blush dark:hover:bg-dark-border border border-blush dark:border-dark-border'
                }`}
              >
                {filter.emoji} {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Books grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="text-center animate-float">
              <div className="text-5xl mb-3">🐰</div>
              <p className="text-rose font-display">Carregando seus livros...</p>
            </div>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="flex justify-center py-20">
            <div className="text-center">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-display font-bold text-cocoa dark:text-dark-text mb-2">
                {search || statusFilter !== 'ALL'
                  ? 'Nenhum livro encontrado'
                  : 'Sua biblioteca está vazia'}
              </h3>
              <p className="text-cocoa/50 dark:text-dark-text/50 font-body mb-4">
                {search || statusFilter !== 'ALL'
                  ? 'Tente alterar os filtros 🔍'
                  : 'Que tal começar a escrever sua primeira história? 🌟'}
              </p>
              {!search && statusFilter === 'ALL' && (
                <button onClick={() => setShowCreate(true)} className="btn-primary">
                  <Plus size={18} className="inline mr-1" />
                  Criar meu primeiro livro
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </div>

      <CreateBookModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={loadBooks}
      />
    </AppLayout>
  )
}
