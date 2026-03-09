'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { BookOpen, Library, Settings, LogOut, Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/library', label: 'Biblioteca', icon: Library, emoji: '📚' },
  { href: '/settings', label: 'Configurações', icon: Settings, emoji: '⚙️' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { signOut, user } = useAuth()
  const { theme, toggleTheme } = useTheme()

  return (
    <aside className="w-64 h-screen bg-white dark:bg-dark-surface border-r border-blush dark:border-dark-border flex flex-col fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="p-5 border-b border-blush dark:border-dark-border">
        <Link href="/library" className="flex items-center gap-3 group">
          <span className="text-3xl group-hover:animate-float">🐰</span>
          <div>
            <h1 className="font-display font-bold text-lg text-cocoa dark:text-dark-text leading-tight">
              Livia&apos;s
            </h1>
            <p className="font-display text-xs text-rose dark:text-lavender -mt-0.5">Archive</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-cute font-display font-medium transition-all',
                isActive
                  ? 'bg-blush dark:bg-dark-card text-berry dark:text-lavender shadow-soft'
                  : 'text-cocoa/60 dark:text-dark-text/60 hover:bg-blush/50 dark:hover:bg-dark-card/50'
              )}
            >
              <span className="text-lg">{item.emoji}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-3 border-t border-blush dark:border-dark-border space-y-1">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-4 py-3 rounded-cute w-full text-cocoa/60 dark:text-dark-text/60 hover:bg-blush/50 dark:hover:bg-dark-card/50 font-display font-medium transition-all"
        >
          <span className="text-lg">{theme === 'light' ? '🌙' : '☀️'}</span>
          <span>{theme === 'light' ? 'Modo escuro' : 'Modo claro'}</span>
        </button>

        {/* User info */}
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 rounded-full bg-lavender/30 flex items-center justify-center text-sm">
            🐾
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-display font-semibold text-cocoa dark:text-dark-text truncate">
              {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
            </p>
          </div>
          <button
            onClick={signOut}
            className="text-cocoa/40 dark:text-dark-text/40 hover:text-berry transition-colors"
            title="Sair"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  )
}
