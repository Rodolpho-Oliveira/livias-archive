'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Sidebar } from './Sidebar'

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream dark:bg-dark-bg">
        <div className="text-center animate-float">
          <div className="text-5xl mb-3">🐰</div>
          <p className="text-rose font-display">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-cream dark:bg-dark-bg">
      <Sidebar />
      <main className="ml-64 p-6">
        {children}
      </main>
    </div>
  )
}
