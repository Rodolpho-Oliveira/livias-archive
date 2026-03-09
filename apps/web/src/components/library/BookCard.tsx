'use client'

import Link from 'next/link'
import { Book } from '@/lib/api'
import { BookOpen, Pencil, Check, Clock } from 'lucide-react'

const statusConfig = {
  DRAFT: { label: 'Rascunho', emoji: '📝', color: 'bg-honey text-cocoa' },
  IN_PROGRESS: { label: 'Em andamento', emoji: '✍️', color: 'bg-sky/50 text-cocoa' },
  COMPLETED: { label: 'Concluído', emoji: '✅', color: 'bg-mint/50 text-cocoa' },
}

const animals = ['🐰', '🐱', '🦊', '🐻', '🐼', '🦋', '🌸', '🍓', '🌷', '🎀']

interface Props {
  book: Book
}

export function BookCard({ book }: Props) {
  const status = statusConfig[book.status]
  const randomAnimal = animals[book.title.length % animals.length]

  return (
    <Link href={`/book/${book.id}`}>
      <div className="card group cursor-pointer hover:scale-[1.02] !p-0 overflow-hidden">
        {/* Cover */}
        <div
          className="h-44 flex items-center justify-center relative"
          style={{ backgroundColor: book.coverColor || '#f4a7bb' }}
        >
          {book.coverUrl ? (
            <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
          ) : (
            <div className="text-center p-4">
              <span className="text-4xl mb-2 block opacity-80">{randomAnimal}</span>
              <p className="text-white font-display font-bold text-lg drop-shadow leading-tight">
                {book.title}
              </p>
            </div>
          )}

          {/* Status badge */}
          <div className={`absolute top-3 right-3 px-2 py-1 rounded-bubble text-xs font-display font-semibold ${status.color}`}>
            {status.emoji} {status.label}
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-display font-bold text-cocoa dark:text-dark-text text-lg truncate">
            {book.title}
          </h3>
          
          {book.genre && (
            <span className="inline-block bg-lilac/30 dark:bg-dark-border text-plum dark:text-lavender text-xs px-2 py-0.5 rounded-bubble font-display mt-1">
              {book.genre}
            </span>
          )}

          {book.synopsis && (
            <p className="text-cocoa/50 dark:text-dark-text/50 text-sm mt-2 line-clamp-2 font-body">
              {book.synopsis}
            </p>
          )}

          <div className="flex items-center gap-4 mt-3 text-xs text-cocoa/40 dark:text-dark-text/40 font-body">
            <span className="flex items-center gap-1">
              <BookOpen size={12} />
              {book.chapterCount || 0} capítulos
            </span>
            <span className="flex items-center gap-1">
              <Pencil size={12} />
              {(book.totalWords || 0).toLocaleString()} palavras
            </span>
          </div>

          <div className="flex items-center gap-1 mt-2 text-xs text-cocoa/30 dark:text-dark-text/30">
            <Clock size={11} />
            <span>
              {new Date(book.updatedAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
