import { supabase } from './supabase'

const API_URL = 'http://localhost:3333'

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession()
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session?.access_token || ''}`,
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = await getAuthHeaders()
  
  const res = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string>) },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || 'Request failed')
  }

  if (res.status === 204) return null as T
  return res.json()
}

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
  createdAt: string
  updatedAt: string
}

export const api = {
  getBooks: () => request<Book[]>('/books'),
  getBook: (id: string) => request<Book>(`/books/${id}`),
  createBook: (data: { title: string; synopsis?: string; genre?: string; coverColor?: string }) =>
    request<Book>('/books', { method: 'POST', body: JSON.stringify(data) }),
  updateBook: (id: string, data: Partial<Book>) =>
    request<Book>(`/books/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBook: (id: string) =>
    request<void>(`/books/${id}`, { method: 'DELETE' }),
  getChapter: (id: string) => request<Chapter>(`/chapters/${id}`),
  createChapter: (data: { title: string; bookId: string }) =>
    request<Chapter>('/chapters', { method: 'POST', body: JSON.stringify(data) }),
  updateChapter: (id: string, data: Partial<Chapter>) =>
    request<Chapter>(`/chapters/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteChapter: (id: string) =>
    request<void>(`/chapters/${id}`, { method: 'DELETE' }),
}
