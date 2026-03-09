'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { api, Chapter, ChapterVersion } from '@/lib/api'
import { TipTapEditor } from '@/components/editor/TipTapEditor'
import {
  ArrowLeft, Save, Eye, EyeOff, Clock, RotateCcw,
  FileText, Check, MessageSquare, X, History, Maximize, Minimize, Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function ChapterEditorPage() {
  const params = useParams()
  const router = useRouter()
  const bookId = params.bookId as string
  const chapterId = params.chapterId as string

  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [focusMode, setFocusMode] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [showVersions, setShowVersions] = useState(false)
  const [notes, setNotes] = useState('')
  const [chapterStatus, setChapterStatus] = useState<'DRAFT' | 'REVISION' | 'COMPLETED'>('DRAFT')
  const [contentKey, setContentKey] = useState(0)
  const [savingVersion, setSavingVersion] = useState(false)
  const [restoringVersionId, setRestoringVersionId] = useState<string | null>(null)
  const [savingNotes, setSavingNotes] = useState(false)

  // User font settings
  const [fontFamily, setFontFamily] = useState('Georgia')
  const [fontSize, setFontSize] = useState(16)
  const [focusModeFont, setFocusModeFont] = useState('Georgia')
  const [focusModeSize, setFocusModeSize] = useState(18)

  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null)
  const pendingContent = useRef<any>(null)
  const pendingWordCount = useRef(0)
  const pendingCharCount = useRef(0)

  const loadChapter = useCallback(async () => {
    try {
      const data = await api.getChapter(chapterId)
      setChapter(data)
      setNotes(data.notes || '')
      setChapterStatus(data.status)
    } catch {
      toast.error('Capítulo não encontrado')
      router.push(`/book/${bookId}`)
    } finally {
      setLoading(false)
    }
  }, [chapterId, bookId, router])

  useEffect(() => {
    loadChapter()
    // Load user font settings
    api.getMe().then((settings) => {
      if (settings) {
        setFontFamily(settings.fontFamily)
        setFontSize(settings.fontSize)
        setFocusModeFont(settings.focusModeFont)
        setFocusModeSize(settings.focusModeSize)
      }
    }).catch(() => {})
  }, [loadChapter])

  const saveChapter = useCallback(async (content?: any, wordCount?: number, charCount?: number) => {
    const c = content || pendingContent.current
    const w = wordCount ?? pendingWordCount.current
    const ch = charCount ?? pendingCharCount.current

    if (!c) return

    setSaving(true)
    try {
      await api.updateChapter(chapterId, {
        content: c,
        wordCount: w,
        charCount: ch,
        notes,
        status: chapterStatus,
      })
      setLastSaved(new Date())
    } catch {
      toast.error('Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }, [chapterId, notes, chapterStatus])

  const handleContentChange = useCallback((content: any, wordCount: number, charCount: number) => {
    pendingContent.current = content
    pendingWordCount.current = wordCount
    pendingCharCount.current = charCount

    // Autosave debounce - save 2s after last change
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(() => {
      saveChapter(content, wordCount, charCount)
    }, 2000)
  }, [saveChapter])

  const handleManualSave = async () => {
    await saveChapter()
    toast.success('Salvo! 💾')
  }

  const handleSaveVersion = async () => {
    setSavingVersion(true)
    try {
      await api.saveVersion(chapterId)
      toast.success('Versão salva! 📸')
      loadChapter()
    } catch {
      toast.error('Erro ao salvar versão')
    } finally {
      setSavingVersion(false)
    }
  }

  const handleRestoreVersion = async (versionId: string) => {
    if (!confirm('Restaurar esta versão? O conteúdo atual será substituído.')) return
    setRestoringVersionId(versionId)
    try {
      await api.restoreVersion(chapterId, versionId)
      toast.success('Versão restaurada! ✨')
      await loadChapter()
      setContentKey(k => k + 1)
      setShowVersions(false)
    } catch {
      toast.error('Erro ao restaurar')
    } finally {
      setRestoringVersionId(null)
    }
  }

  const handleSaveNotes = async () => {
    setSavingNotes(true)
    try {
      await api.updateChapter(chapterId, { notes })
      toast.success('Notas salvas! 📝')
    } catch {
      toast.error('Erro ao salvar notas')
    } finally {
      setSavingNotes(false)
    }
  }

  // Keyboard shortcut: Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleManualSave()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [saveChapter])

  // Cleanup autosave on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream dark:bg-dark-bg">
        <div className="text-center animate-float">
          <div className="text-5xl mb-3">✍️</div>
          <p className="text-rose font-display">Abrindo editor...</p>
        </div>
      </div>
    )
  }

  if (!chapter) return null

  return (
    <div className={`min-h-screen bg-cream dark:bg-dark-bg ${focusMode ? '' : 'ml-0'}`}>
      {/* Top bar */}
      <div className={`sticky top-0 z-20 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-sm border-b border-blush dark:border-dark-border ${focusMode ? 'opacity-0 hover:opacity-100 transition-opacity' : ''}`}>
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {!focusMode && (
              <Link
                href={`/book/${bookId}`}
                className="text-cocoa/40 dark:text-dark-text/40 hover:text-cocoa dark:hover:text-dark-text transition-colors"
              >
                <ArrowLeft size={20} />
              </Link>
            )}
            <div>
              <h1 className="font-display font-bold text-cocoa dark:text-dark-text text-lg">
                {chapter.title}
              </h1>
              <div className="flex items-center gap-2 text-xs text-cocoa/40 dark:text-dark-text/40">
                {saving ? (
                  <span className="flex items-center gap-1 text-rose">
                    <Save size={11} className="animate-pulse" /> Salvando...
                  </span>
                ) : lastSaved ? (
                  <span className="flex items-center gap-1 text-mint">
                    <Check size={11} /> Salvo às {lastSaved.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                ) : (
                  <span>Autosave ativado ✨</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Chapter status */}
            <select
              value={chapterStatus}
              onChange={(e) => {
                setChapterStatus(e.target.value as any)
                api.updateChapter(chapterId, { status: e.target.value as any })
              }}
              className="text-xs bg-blush dark:bg-dark-card border-0 rounded-bubble px-3 py-1.5 font-display text-cocoa dark:text-dark-text"
            >
              <option value="DRAFT">📝 Rascunho</option>
              <option value="REVISION">🔍 Revisão</option>
              <option value="COMPLETED">✅ Finalizado</option>
            </select>

            <button
              onClick={() => setShowNotes(!showNotes)}
              className={`p-2 rounded-cute transition-all ${showNotes ? 'bg-rose/20 text-berry' : 'text-cocoa/40 hover:bg-blush dark:text-dark-text/40 dark:hover:bg-dark-card'}`}
              title="Notas"
            >
              <MessageSquare size={18} />
            </button>

            <button
              onClick={() => setShowVersions(!showVersions)}
              className={`p-2 rounded-cute transition-all ${showVersions ? 'bg-rose/20 text-berry' : 'text-cocoa/40 hover:bg-blush dark:text-dark-text/40 dark:hover:bg-dark-card'}`}
              title="Versões"
            >
              <History size={18} />
            </button>

            <button
              onClick={() => setFocusMode(!focusMode)}
              className="p-2 rounded-cute text-cocoa/40 hover:bg-blush dark:text-dark-text/40 dark:hover:bg-dark-card transition-all"
              title={focusMode ? 'Sair do modo foco' : 'Modo foco'}
            >
              {focusMode ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>

            <button
              onClick={handleManualSave}
              disabled={saving}
              className="btn-primary text-sm !px-4 !py-2 flex items-center gap-1.5 disabled:opacity-60"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? 'Salvando...' : 'Salvar'}
            </button>

            <button
              onClick={handleSaveVersion}
              disabled={savingVersion}
              className="btn-secondary text-sm !px-4 !py-2 flex items-center justify-center disabled:opacity-60"
              title="Salvar versão (snapshot)"
            >
              {savingVersion ? <Loader2 size={14} className="animate-spin" /> : '📸'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 flex gap-4">
        {/* Main editor */}
        <div className={`flex-1 ${focusMode ? 'max-w-3xl mx-auto' : ''}`}>
          <div className="card !p-6">
            <TipTapEditor
              content={chapter.content}
              contentKey={contentKey}
              onChange={handleContentChange}
              focusMode={focusMode}
              fontFamily={focusMode ? focusModeFont : fontFamily}
              fontSize={focusMode ? focusModeSize : fontSize}
            />
          </div>
        </div>

        {/* Side panels */}
        {(showNotes || showVersions) && !focusMode && (
          <div className="w-80 space-y-4">
            {/* Notes panel */}
            {showNotes && (
              <div className="card !p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display font-bold text-cocoa dark:text-dark-text text-sm">
                    📝 Notas do capítulo
                  </h3>
                  <button onClick={() => setShowNotes(false)} className="text-cocoa/30 hover:text-cocoa dark:text-dark-text/30">
                    <X size={16} />
                  </button>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input-field !h-40 resize-none text-sm"
                  placeholder="Anotações, ideias, lembretes..."
                />
                <button onClick={handleSaveNotes} disabled={savingNotes} className="btn-secondary text-xs mt-2 w-full flex items-center justify-center gap-1.5 disabled:opacity-60">
                  {savingNotes ? <Loader2 size={12} className="animate-spin" /> : null}
                  {savingNotes ? 'Salvando...' : 'Salvar notas 💾'}
                </button>
              </div>
            )}

            {/* Versions panel */}
            {showVersions && (
              <div className="card !p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display font-bold text-cocoa dark:text-dark-text text-sm">
                    📸 Versões salvas
                  </h3>
                  <button onClick={() => setShowVersions(false)} className="text-cocoa/30 hover:text-cocoa dark:text-dark-text/30">
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {chapter.versions && chapter.versions.length > 0 ? (
                    chapter.versions.map((version) => (
                      <div
                        key={version.id}
                        className="p-3 rounded-cute bg-blush/30 dark:bg-dark-border/50 hover:bg-blush dark:hover:bg-dark-border transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-display font-semibold text-cocoa dark:text-dark-text">
                              {version.label || 'Versão'}
                            </p>
                            <p className="text-[10px] text-cocoa/40 dark:text-dark-text/40 mt-0.5">
                              {new Date(version.createdAt).toLocaleString('pt-BR')} · {version.wordCount} palavras
                            </p>
                          </div>
                          <button
                            onClick={() => handleRestoreVersion(version.id)}
                            disabled={restoringVersionId === version.id}
                            className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-dark-surface text-cocoa/40 hover:text-berry transition-all disabled:opacity-60"
                            title="Restaurar"
                          >
                            {restoringVersionId === version.id ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-cocoa/40 dark:text-dark-text/40 text-center py-4">
                      Nenhuma versão salva ainda.<br />
                      Clique em 📸 para salvar.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
