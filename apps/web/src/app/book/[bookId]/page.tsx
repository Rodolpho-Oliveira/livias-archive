'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { api, Book, Chapter } from '@/lib/api'
import {
  Plus, ArrowLeft, Trash2, Edit3, GripVertical,
  BookOpen, FileText, Check, RotateCcw, MoreHorizontal, ImageIcon, X,
  FileDown, Printer, Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { useRef } from 'react'

const statusConfig = {
  DRAFT: { label: 'Rascunho', emoji: '📝', color: 'bg-honey/50' },
  IN_PROGRESS: { label: 'Em andamento', emoji: '✍️', color: 'bg-sky/30' },
  COMPLETED: { label: 'Concluído', emoji: '✅', color: 'bg-mint/30' },
}

const chapterStatusConfig = {
  DRAFT: { label: 'Rascunho', emoji: '📝', color: 'text-cocoa/50' },
  REVISION: { label: 'Revisão', emoji: '🔍', color: 'text-amber-600' },
  COMPLETED: { label: 'Finalizado', emoji: '✅', color: 'text-green-600' },
}

export default function BookPage() {
  const params = useParams()
  const router = useRouter()
  const bookId = params.bookId as string

  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingTitle, setEditingTitle] = useState(false)
  const [title, setTitle] = useState('')
  const [newChapterTitle, setNewChapterTitle] = useState('')
  const [showCreateChapter, setShowCreateChapter] = useState(false)
  const [editingBookInfo, setEditingBookInfo] = useState(false)
  const [synopsis, setSynopsis] = useState('')
  const [bookStatus, setBookStatus] = useState<'DRAFT' | 'IN_PROGRESS' | 'COMPLETED'>('DRAFT')
  const [uploadingCover, setUploadingCover] = useState(false)
  const [removingCover, setRemovingCover] = useState(false)
  const [savingTitle, setSavingTitle] = useState(false)
  const [savingInfo, setSavingInfo] = useState(false)
  const [creatingChapter, setCreatingChapter] = useState(false)
  const [deletingChapterId, setDeletingChapterId] = useState<string | null>(null)
  const [deletingBook, setDeletingBook] = useState(false)
  const [exportingHTML, setExportingHTML] = useState(false)
  const [exportingPDF, setExportingPDF] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingCover(true)
    try {
      const url = await api.uploadImage(file)
      await api.updateBook(bookId, { coverUrl: url })
      await loadBook()
      toast.success('Capa atualizada! 🖼️')
    } catch {
      toast.error('Erro ao enviar imagem')
    } finally {
      setUploadingCover(false)
      if (coverInputRef.current) coverInputRef.current.value = ''
    }
  }

  const handleRemoveCover = async () => {
    setRemovingCover(true)
    try {
      await api.updateBook(bookId, { coverUrl: '' })
      await loadBook()
      toast.success('Capa removida')
    } catch {
      toast.error('Erro ao remover capa')
    } finally {
      setRemovingCover(false)
    }
  }

  const loadBook = useCallback(async () => {
    try {
      const data = await api.getBook(bookId)
      setBook(data)
      setTitle(data.title)
      setSynopsis(data.synopsis || '')
      setBookStatus(data.status)
    } catch {
      toast.error('Livro não encontrado')
      router.push('/library')
    } finally {
      setLoading(false)
    }
  }, [bookId, router])

  useEffect(() => {
    loadBook()
  }, [loadBook])

  const handleUpdateTitle = async () => {
    if (!title.trim() || title === book?.title) {
      setEditingTitle(false)
      return
    }
    setSavingTitle(true)
    try {
      await api.updateBook(bookId, { title })
      toast.success('Título atualizado! ✨')
      loadBook()
    } catch {
      toast.error('Erro ao atualizar')
    } finally {
      setSavingTitle(false)
      setEditingTitle(false)
    }
  }

  const handleUpdateBookInfo = async () => {
    setSavingInfo(true)
    try {
      await api.updateBook(bookId, { synopsis, status: bookStatus })
      toast.success('Livro atualizado! ✨')
      setEditingBookInfo(false)
      loadBook()
    } catch {
      toast.error('Erro ao atualizar')
    } finally {
      setSavingInfo(false)
    }
  }

  const handleCreateChapter = async () => {
    if (!newChapterTitle.trim()) return
    setCreatingChapter(true)
    try {
      await api.createChapter({ title: newChapterTitle, bookId })
      toast.success('Capítulo criado! 📄')
      setNewChapterTitle('')
      setShowCreateChapter(false)
      loadBook()
    } catch {
      toast.error('Erro ao criar capítulo')
    } finally {
      setCreatingChapter(false)
    }
  }

  const handleDeleteChapter = async (chapterId: string, chapterTitle: string) => {
    if (!confirm(`Deletar "${chapterTitle}"? Essa ação não pode ser desfeita.`)) return
    setDeletingChapterId(chapterId)
    try {
      await api.deleteChapter(chapterId)
      toast.success('Capítulo deletado')
      loadBook()
    } catch {
      toast.error('Erro ao deletar')
    } finally {
      setDeletingChapterId(null)
    }
  }

  const handleDeleteBook = async () => {
    if (!confirm(`Deletar "${book?.title}"? Todos os capítulos serão perdidos!`)) return
    setDeletingBook(true)
    try {
      await api.deleteBook(bookId)
      toast.success('Livro deletado')
      router.push('/library')
    } catch {
      toast.error('Erro ao deletar livro')
      setDeletingBook(false)
    }
  }

  const handleExportHTML = async () => {
    setShowExportMenu(false)
    setExportingHTML(true)
    try {
      await api.exportBookHTML(bookId, book!.title)
      toast.success('Exportado como HTML! 📄')
    } catch (e: unknown) {
      toast.error((e instanceof Error ? e.message : null) || 'Erro ao exportar')
    } finally {
      setExportingHTML(false)
    }
  }

  const handleExportPDF = async () => {
    setShowExportMenu(false)
    setExportingPDF(true)
    try {
      await api.exportBookPDF(bookId)
    } catch (e: unknown) {
      toast.error((e instanceof Error ? e.message : null) || 'Erro ao exportar')
    } finally {
      setExportingPDF(false)
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-20">
          <div className="text-center animate-float">
            <div className="text-5xl mb-3">📖</div>
            <p className="text-rose font-display">Abrindo livro...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (!book) return null

  const status = statusConfig[book.status]

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => router.push('/library')}
          className="btn-ghost flex items-center gap-2 mb-6 -ml-3"
        >
          <ArrowLeft size={18} />
          Voltar à Biblioteca
        </button>

        {/* Book header */}
        <div className="card !p-6 mb-6">
          <div className="flex gap-6">
            {/* Cover preview */}
            <div className="relative group flex-shrink-0">
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverUpload}
              />
              <div
                className="w-32 h-44 rounded-lg shadow-soft flex items-center justify-center overflow-hidden cursor-pointer"
                style={{ backgroundColor: book.coverColor || '#f4a7bb' }}
                onClick={() => coverInputRef.current?.click()}
              >
                {book.coverUrl ? (
                  <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-2">
                    <p className="text-white font-display font-bold text-sm drop-shadow">
                      {book.title}
                    </p>
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  {uploadingCover ? (
                    <span className="text-white text-xs font-display flex items-center gap-1">
                      <Loader2 size={14} className="animate-spin" /> Enviando...
                    </span>
                  ) : (
                    <div className="text-center">
                      <ImageIcon size={20} className="text-white mx-auto mb-1" />
                      <span className="text-white text-xs font-display">
                        {book.coverUrl ? 'Trocar capa' : 'Adicionar capa'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Remove cover button */}
              {book.coverUrl && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleRemoveCover() }}
                  disabled={removingCover}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-400 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm disabled:opacity-60"
                  title="Remover capa"
                >
                  {removingCover ? <Loader2 size={10} className="animate-spin" /> : <X size={12} />}
                </button>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              {editingTitle ? (
                <div className="flex gap-2 mb-2">
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input-field text-xl font-display font-bold"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleUpdateTitle()}
                  />
                  <button onClick={handleUpdateTitle} disabled={savingTitle} className="btn-primary !px-4 disabled:opacity-60">
                    {savingTitle ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  </button>
                </div>
              ) : (
                <h1
                  className="text-2xl font-display font-bold text-cocoa dark:text-dark-text cursor-pointer hover:text-berry transition-colors inline-flex items-center gap-2"
                  onClick={() => setEditingTitle(true)}
                >
                  {book.title}
                  <Edit3 size={16} className="opacity-30" />
                </h1>
              )}

              <div className="flex items-center gap-3 mt-2">
                <span className={`px-3 py-1 rounded-bubble text-xs font-display font-semibold ${status.color}`}>
                  {status.emoji} {status.label}
                </span>
                {book.genre && (
                  <span className="px-3 py-1 rounded-bubble text-xs font-display bg-lilac/30 text-plum">
                    {book.genre}
                  </span>
                )}
              </div>

              {book.synopsis && (
                <p className="text-cocoa/60 dark:text-dark-text/60 mt-3 font-body text-sm">
                  {book.synopsis}
                </p>
              )}

              <div className="flex items-center gap-4 mt-4 text-sm text-cocoa/40 dark:text-dark-text/40 font-body">
                <span>📖 {book.chapters?.length || 0} capítulos</span>
                <span>✏️ {(book.totalWords || 0).toLocaleString()} palavras</span>
                <span>📅 Criado em {new Date(book.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setEditingBookInfo(true)}
                  className="btn-ghost text-sm flex items-center gap-1"
                >
                  <Edit3 size={14} />
                  Editar info
                </button>

                {/* Export dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowExportMenu(v => !v)}
                    disabled={exportingHTML || exportingPDF}
                    className="btn-ghost text-sm flex items-center gap-1 disabled:opacity-60"
                  >
                    {(exportingHTML || exportingPDF) ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
                    {exportingHTML ? 'Exportando...' : exportingPDF ? 'Preparando...' : 'Exportar'}
                  </button>
                  {showExportMenu && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowExportMenu(false)}
                      />
                      <div className="absolute left-0 top-full mt-1 z-20 bg-white dark:bg-dark-card border border-rose/20 rounded-xl shadow-soft w-48 py-1 text-sm">
                        <button
                          onClick={handleExportHTML}
                          disabled={exportingHTML}
                          className="w-full flex items-center gap-2 px-4 py-2 hover:bg-cream dark:hover:bg-dark-hover transition-colors text-cocoa dark:text-dark-text disabled:opacity-50"
                        >
                          {exportingHTML ? <Loader2 size={14} className="animate-spin text-berry" /> : <FileDown size={14} className="text-berry" />}
                          Baixar como HTML
                        </button>
                        <button
                          onClick={handleExportPDF}
                          disabled={exportingPDF}
                          className="w-full flex items-center gap-2 px-4 py-2 hover:bg-cream dark:hover:bg-dark-hover transition-colors text-cocoa dark:text-dark-text disabled:opacity-50"
                        >
                          {exportingPDF ? <Loader2 size={14} className="animate-spin text-berry" /> : <Printer size={14} className="text-berry" />}
                          Imprimir / Salvar PDF
                        </button>
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={handleDeleteBook}
                  disabled={deletingBook}
                  className="btn-ghost text-sm flex items-center gap-1 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-60"
                >
                  {deletingBook ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  {deletingBook ? 'Deletando...' : 'Deletar livro'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Edit book info modal */}
        {editingBookInfo && (
          <div className="card !p-6 mb-6 border-2 border-rose/30">
            <h3 className="font-display font-bold text-lg text-cocoa dark:text-dark-text mb-4">
              Editar informações 📝
            </h3>
            <div className="space-y-3">
              <textarea
                value={synopsis}
                onChange={(e) => setSynopsis(e.target.value)}
                className="input-field !h-24 resize-none"
                placeholder="Sinopse..."
              />
              <div>
                <label className="text-sm font-display font-semibold text-cocoa dark:text-dark-text mb-1 block">
                  Status
                </label>
                <div className="flex gap-2">
                  {(['DRAFT', 'IN_PROGRESS', 'COMPLETED'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setBookStatus(s)}
                      className={`px-3 py-1.5 rounded-bubble text-sm font-display transition-all ${
                        bookStatus === s
                          ? 'bg-rose text-white shadow-soft'
                          : 'bg-blush text-cocoa/60 hover:bg-rose/20 dark:bg-dark-card dark:text-dark-text/60'
                      }`}
                    >
                      {statusConfig[s].emoji} {statusConfig[s].label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleUpdateBookInfo} disabled={savingInfo} className="btn-primary text-sm flex items-center gap-1.5 disabled:opacity-60">
                  {savingInfo && <Loader2 size={13} className="animate-spin" />}
                  {savingInfo ? 'Salvando...' : 'Salvar ✨'}
                </button>
                <button onClick={() => setEditingBookInfo(false)} disabled={savingInfo} className="btn-ghost text-sm">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Chapters */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display font-bold text-cocoa dark:text-dark-text">
            Capítulos 📑
          </h2>
          <button
            onClick={() => setShowCreateChapter(true)}
            className="btn-secondary text-sm flex items-center gap-1"
          >
            <Plus size={16} />
            Novo capítulo
          </button>
        </div>

        {/* New chapter form */}
        {showCreateChapter && (
          <div className="card !p-4 mb-4 border-2 border-lavender/30">
            <div className="flex gap-2">
              <input
                value={newChapterTitle}
                onChange={(e) => setNewChapterTitle(e.target.value)}
                className="input-field flex-1"
                placeholder="Nome do capítulo..."
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCreateChapter()}
              />
              <button onClick={handleCreateChapter} disabled={creatingChapter} className="btn-primary !px-4 text-sm flex items-center gap-1.5 disabled:opacity-60">
                {creatingChapter && <Loader2 size={13} className="animate-spin" />}
                {creatingChapter ? 'Criando...' : 'Criar'}
              </button>
              <button
                onClick={() => { setShowCreateChapter(false); setNewChapterTitle('') }}
                disabled={creatingChapter}
                className="btn-ghost text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Chapter list */}
        <div className="space-y-2">
          {book.chapters && book.chapters.length > 0 ? (
            book.chapters.map((chapter, index) => {
              const chStatus = chapterStatusConfig[chapter.status]
              return (
                <div
                  key={chapter.id}
                  className="card !p-4 flex items-center gap-4 group hover:border-rose/30"
                >
                  <div className="text-cocoa/20 dark:text-dark-text/20 cursor-grab">
                    <GripVertical size={18} />
                  </div>

                  <div className="w-8 h-8 rounded-full bg-blush dark:bg-dark-border flex items-center justify-center font-display font-bold text-sm text-rose dark:text-lavender">
                    {index + 1}
                  </div>

                  <Link
                    href={`/book/${bookId}/chapter/${chapter.id}`}
                    className="flex-1 min-w-0"
                  >
                    <h3 className="font-display font-semibold text-cocoa dark:text-dark-text truncate hover:text-berry transition-colors">
                      {chapter.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-cocoa/40 dark:text-dark-text/40 font-body">
                      <span className={chStatus.color}>
                        {chStatus.emoji} {chStatus.label}
                      </span>
                      <span>{chapter.wordCount.toLocaleString()} palavras</span>
                    </div>
                  </Link>

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      href={`/book/${bookId}/chapter/${chapter.id}`}
                      className="p-2 rounded-cute hover:bg-blush dark:hover:bg-dark-border text-cocoa/40 hover:text-cocoa dark:text-dark-text/40 dark:hover:text-dark-text transition-all"
                      title="Editar"
                    >
                      <Edit3 size={16} />
                    </Link>
                    <button
                      onClick={() => handleDeleteChapter(chapter.id, chapter.title)}
                      disabled={deletingChapterId === chapter.id}
                      className="p-2 rounded-cute hover:bg-red-50 dark:hover:bg-red-900/20 text-cocoa/40 hover:text-red-500 transition-all disabled:opacity-60"
                      title="Deletar"
                    >
                      {deletingChapterId === chapter.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    </button>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">📄</div>
              <p className="text-cocoa/50 dark:text-dark-text/50 font-display">
                Nenhum capítulo ainda
              </p>
              <button
                onClick={() => setShowCreateChapter(true)}
                className="btn-secondary mt-3 text-sm"
              >
                Criar primeiro capítulo ✨
              </button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
