'use client'

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream dark:bg-dark-bg">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-float">🐰</div>
        <h1 className="text-3xl font-display font-bold text-cocoa dark:text-dark-text mb-2">
          Página não encontrada
        </h1>
        <p className="text-cocoa/50 dark:text-dark-text/50 font-body mb-6">
          A página que você procura não existe ou foi removida.
        </p>
        <Link href="/library" className="btn-primary">
          Voltar à Biblioteca 📚
        </Link>
      </div>
    </div>
  )
}
