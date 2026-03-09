import { supabase } from './supabase'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession()
  return {
    Authorization: `Bearer ${session?.access_token || ''}`,
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    ...(await getAuthHeaders()),
    ...options.headers as Record<string, string>,
  }

  // Only set Content-Type for requests that have a body
  if (options.body) {
    headers['Content-Type'] = 'application/json'
  }

  const res = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || 'Request failed')
  }

  if (res.status === 204) return null as T
  return res.json()
}

// -------- Books --------
export interface Book {
  id: string
  title: string
  synopsis?: string
  genre?: string
  coverUrl?: string
  coverColor?: string
  status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED'
  chapters: Chapter[]
  totalWords: number
  chapterCount: number
  createdAt: string
  updatedAt: string
}

export interface Chapter {
  id: string
  title: string
  content: any
  notes?: string
  status: 'DRAFT' | 'REVISION' | 'COMPLETED'
  order: number
  wordCount: number
  charCount: number
  bookId: string
  versions?: ChapterVersion[]
  createdAt: string
  updatedAt: string
}

export interface ChapterVersion {
  id: string
  content: any
  wordCount: number
  label?: string
  createdAt: string
}

export interface UserSettings {
  id: string
  email: string
  name?: string
  theme: string
  fontFamily: string
  fontSize: number
  focusModeFont: string
  focusModeSize: number
}

export const api = {
  // Books
  getBooks: () => request<Book[]>('/books'),
  getBook: (id: string) => request<Book>(`/books/${id}`),
  createBook: (data: { title: string; synopsis?: string; genre?: string; coverColor?: string }) =>
    request<Book>('/books', { method: 'POST', body: JSON.stringify(data) }),
  updateBook: (id: string, data: Partial<Book>) =>
    request<Book>(`/books/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBook: (id: string) =>
    request<void>(`/books/${id}`, { method: 'DELETE' }),

  // Chapters
  getChapters: (bookId: string) => request<Chapter[]>(`/books/${bookId}/chapters`),
  getChapter: (id: string) => request<Chapter>(`/chapters/${id}`),
  createChapter: (data: { title: string; bookId: string }) =>
    request<Chapter>('/chapters', { method: 'POST', body: JSON.stringify(data) }),
  updateChapter: (id: string, data: Partial<Chapter>) =>
    request<Chapter>(`/chapters/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteChapter: (id: string) =>
    request<void>(`/chapters/${id}`, { method: 'DELETE' }),
  reorderChapters: (bookId: string, chapters: { id: string; order: number }[]) =>
    request<void>(`/books/${bookId}/chapters/reorder`, { method: 'PUT', body: JSON.stringify({ chapters }) }),

  // Versions
  saveVersion: (chapterId: string, label?: string) =>
    request<ChapterVersion>(`/chapters/${chapterId}/versions`, { method: 'POST', body: JSON.stringify({ label }) }),
  restoreVersion: (chapterId: string, versionId: string) =>
    request<Chapter>(`/chapters/${chapterId}/versions/${versionId}/restore`, { method: 'POST', body: JSON.stringify({}) }),

  // User
  getMe: () => request<UserSettings>('/me'),
  updateSettings: (data: Partial<UserSettings>) =>
    request<UserSettings>('/me/settings', { method: 'PUT', body: JSON.stringify(data) }),

  // Export
  exportBookHTML: async (bookId: string, bookTitle: string): Promise<void> => {
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch(`${API_URL}/api/books/${bookId}/export/html`, {
      headers: { Authorization: `Bearer ${session?.access_token || ''}` },
    })
    if (!res.ok) throw new Error('Export failed')
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${bookTitle.replace(/[^a-z0-9]/gi, '_')}.html`
    a.click()
    URL.revokeObjectURL(url)
  },
  exportBookPDF: async (bookId: string): Promise<void> => {
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch(`${API_URL}/api/books/${bookId}/export/html`, {
      headers: { Authorization: `Bearer ${session?.access_token || ''}` },
    })
    if (!res.ok) throw new Error('Export failed')
    const html = await res.text()
    const printWindow = window.open('', '_blank')
    if (!printWindow) throw new Error('Popup bloqueado pelo navegador. Permita pop-ups para exportar.')
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.addEventListener('load', () => {
      printWindow.focus()
      printWindow.print()
    })
  },

  // Upload
  uploadImage: async (file: File): Promise<string> => {
    const { data: { session } } = await supabase.auth.getSession()
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch(`${API_URL}/api/upload/image`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session?.access_token || ''}`,
      },
      body: formData,
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Upload failed' }))
      throw new Error(err.error || 'Upload failed')
    }

    const data = await res.json()
    return data.url
  },
}
