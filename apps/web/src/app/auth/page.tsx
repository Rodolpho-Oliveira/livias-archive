'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const { signInWithEmail, signUpWithEmail } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        await signInWithEmail(email, password)
        toast.success('Bem-vinda de volta! 🐰')
      } else {
        await signUpWithEmail(email, password, name)
        toast.success('Conta criada! Verifique seu email 💌')
      }
      router.push('/library')
    } catch (err: any) {
      toast.error(err.message || 'Algo deu errado...')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream dark:bg-dark-bg p-4">
      {/* Decorative animals */}
      <div className="fixed top-10 left-10 text-4xl animate-float opacity-30">🐱</div>
      <div className="fixed top-20 right-16 text-3xl animate-float opacity-30" style={{ animationDelay: '0.5s' }}>🦋</div>
      <div className="fixed bottom-16 left-20 text-3xl animate-float opacity-30" style={{ animationDelay: '1s' }}>🐾</div>
      <div className="fixed bottom-10 right-10 text-4xl animate-float opacity-30" style={{ animationDelay: '1.5s' }}>🌸</div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-3 animate-float">🐰</div>
          <h1 className="text-3xl font-display font-bold text-cocoa dark:text-dark-text">
            Livia&apos;s Archive
          </h1>
          <p className="text-rose/70 mt-2 font-body">
            Seu cantinho fofo para escrever histórias ✨
          </p>
        </div>

        <div className="card !p-8">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-bubble font-display font-semibold transition-all ${
                isLogin
                  ? 'bg-rose text-white shadow-soft'
                  : 'text-cocoa/50 hover:bg-blush dark:text-dark-text/50'
              }`}
            >
              Entrar 🌟
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-bubble font-display font-semibold transition-all ${
                !isLogin
                  ? 'bg-rose text-white shadow-soft'
                  : 'text-cocoa/50 hover:bg-blush dark:text-dark-text/50'
              }`}
            >
              Criar conta 🌈
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-display font-semibold text-cocoa dark:text-dark-text mb-1">
                  Seu nome 🎀
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  placeholder="Como posso te chamar?"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-display font-semibold text-cocoa dark:text-dark-text mb-1">
                Email 💌
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-display font-semibold text-cocoa dark:text-dark-text mb-1">
                Senha 🔑
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full !py-3 text-lg disabled:opacity-50"
            >
              {loading ? '...' : isLogin ? 'Entrar ✨' : 'Criar conta 🎉'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-cocoa/40 dark:text-dark-text/40 mt-6 font-body">
          Feito com 💖 para escrever histórias lindas
        </p>
      </div>
    </div>
  )
}
