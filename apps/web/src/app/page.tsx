'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      router.replace(user ? '/library' : '/auth')
    }
  }, [user, loading, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream dark:bg-dark-bg">
      <div className="text-center animate-float">
        <div className="text-6xl mb-4">🐰</div>
        <h1 className="text-2xl font-display font-bold text-cocoa dark:text-dark-text">
          Livia&apos;s Archive
        </h1>
        <p className="text-rose mt-2 font-body">Carregando...</p>
      </div>
    </div>
  )
}
