'use client'

import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { api, UserSettings } from '@/lib/api'
import { useTheme } from '@/hooks/useTheme'
import { Moon, Sun, Type, Monitor, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const FONTS = [
  { name: 'Georgia', label: 'Georgia', sample: 'Aa' },
  { name: 'Times New Roman', label: 'Times New Roman', sample: 'Aa' },
  { name: 'Merriweather', label: 'Merriweather', sample: 'Aa' },
  { name: 'Lora', label: 'Lora', sample: 'Aa' },
  { name: 'Nunito', label: 'Nunito', sample: 'Aa' },
  { name: 'Inter', label: 'Inter', sample: 'Aa' },
]

const FONT_SIZES = [12, 14, 16, 18, 20, 22, 24]

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fontFamily, setFontFamily] = useState('Georgia')
  const [fontSize, setFontSize] = useState(16)
  const [focusModeFont, setFocusModeFont] = useState('Georgia')
  const [focusModeSize, setFocusModeSize] = useState(18)
  const [name, setName] = useState('')

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await api.getMe()
        if (data) {
          setSettings(data)
          setFontFamily(data.fontFamily)
          setFontSize(data.fontSize)
          setFocusModeFont(data.focusModeFont)
          setFocusModeSize(data.focusModeSize)
          setName(data.name || '')
          // Only use DB theme if no local preference exists
          const localTheme = localStorage.getItem('livia-theme')
          if (!localTheme && data.theme) setTheme(data.theme as 'light' | 'dark')
        }
      } catch {
        // Settings not loaded
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.updateSettings({
        name,
        theme,
        fontFamily,
        fontSize,
        focusModeFont,
        focusModeSize,
      })
      toast.success('Configurações salvas! ⚙️✨')
    } catch {
      toast.error('Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-display font-bold text-cocoa dark:text-dark-text mb-8">
          Configurações ⚙️
        </h1>

        {loading ? (
          <div className="text-center py-10 animate-float">
            <div className="text-4xl mb-3">⚙️</div>
            <p className="text-rose font-display">Carregando...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Profile */}
            <div className="card !p-6">
              <h2 className="font-display font-bold text-lg text-cocoa dark:text-dark-text mb-4">
                Perfil 🐾
              </h2>
              <div>
                <label className="block text-sm font-display font-semibold text-cocoa dark:text-dark-text mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  placeholder="Seu nome"
                />
              </div>
            </div>

            {/* Theme */}
            <div className="card !p-6">
              <h2 className="font-display font-bold text-lg text-cocoa dark:text-dark-text mb-4">
                Tema 🎨
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={() => { setTheme('light'); api.updateSettings({ theme: 'light' }).catch(() => {}) }}
                  className={`flex-1 p-4 rounded-cute border-2 transition-all flex flex-col items-center gap-2 ${
                    theme === 'light'
                      ? 'border-rose bg-rose/10 shadow-soft'
                      : 'border-blush hover:border-rose/50 dark:border-dark-border'
                  }`}
                >
                  <Sun size={24} className="text-honey" />
                  <span className="font-display font-semibold text-sm text-cocoa dark:text-dark-text">
                    Claro ☀️
                  </span>
                  <div className="w-full h-12 rounded-lg bg-cream border border-blush" />
                </button>
                <button
                  onClick={() => { setTheme('dark'); api.updateSettings({ theme: 'dark' }).catch(() => {}) }}
                  className={`flex-1 p-4 rounded-cute border-2 transition-all flex flex-col items-center gap-2 ${
                    theme === 'dark'
                      ? 'border-lavender bg-lavender/10 shadow-soft'
                      : 'border-blush hover:border-lavender/50 dark:border-dark-border'
                  }`}
                >
                  <Moon size={24} className="text-lavender" />
                  <span className="font-display font-semibold text-sm text-cocoa dark:text-dark-text">
                    Escuro 🌙
                  </span>
                  <div className="w-full h-12 rounded-lg bg-dark-bg border border-dark-border" />
                </button>
              </div>
            </div>

            {/* Editor Font */}
            <div className="card !p-6">
              <h2 className="font-display font-bold text-lg text-cocoa dark:text-dark-text mb-4">
                Fonte do Editor ✏️
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-display font-semibold text-cocoa dark:text-dark-text mb-2">
                    Fonte
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {FONTS.map((font) => (
                      <button
                        key={font.name}
                        onClick={() => setFontFamily(font.name)}
                        className={`p-3 rounded-cute border-2 transition-all text-center ${
                          fontFamily === font.name
                            ? 'border-rose bg-rose/10 shadow-soft'
                            : 'border-blush hover:border-rose/50 dark:border-dark-border'
                        }`}
                      >
                        <span className="text-xl block mb-1" style={{ fontFamily: font.name }}>
                          {font.sample}
                        </span>
                        <span className="text-xs font-display text-cocoa/60 dark:text-dark-text/60">
                          {font.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-display font-semibold text-cocoa dark:text-dark-text mb-2">
                    Tamanho: {fontSize}px
                  </label>
                  <div className="flex gap-2">
                    {FONT_SIZES.map((size) => (
                      <button
                        key={size}
                        onClick={() => setFontSize(size)}
                        className={`px-3 py-1.5 rounded-bubble text-sm font-display transition-all ${
                          fontSize === size
                            ? 'bg-rose text-white shadow-soft'
                            : 'bg-blush text-cocoa/60 hover:bg-rose/20 dark:bg-dark-card dark:text-dark-text/60'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div className="p-4 rounded-cute border border-blush dark:border-dark-border bg-cream/50 dark:bg-dark-bg/50">
                  <p className="text-cocoa/30 dark:text-dark-text/30 text-xs font-display mb-2">
                    Preview:
                  </p>
                  <p style={{ fontFamily, fontSize: `${fontSize}px` }} className="text-cocoa dark:text-dark-text">
                    Era uma vez, em um reino muito distante, uma princesa que amava escrever histórias...
                  </p>
                </div>
              </div>
            </div>

            {/* Focus Mode Settings */}
            <div className="card !p-6">
              <h2 className="font-display font-bold text-lg text-cocoa dark:text-dark-text mb-4">
                Modo Foco 🎯
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-display font-semibold text-cocoa dark:text-dark-text mb-2">
                    Fonte no modo foco
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {FONTS.map((font) => (
                      <button
                        key={font.name}
                        onClick={() => setFocusModeFont(font.name)}
                        className={`p-2 rounded-cute border-2 transition-all text-center text-sm ${
                          focusModeFont === font.name
                            ? 'border-lavender bg-lavender/10'
                            : 'border-blush hover:border-lavender/50 dark:border-dark-border'
                        }`}
                      >
                        <span style={{ fontFamily: font.name }}>{font.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-display font-semibold text-cocoa dark:text-dark-text mb-2">
                    Tamanho no modo foco: {focusModeSize}px
                  </label>
                  <div className="flex gap-2">
                    {[16, 18, 20, 22, 24, 28].map((size) => (
                      <button
                        key={size}
                        onClick={() => setFocusModeSize(size)}
                        className={`px-3 py-1.5 rounded-bubble text-sm font-display transition-all ${
                          focusModeSize === size
                            ? 'bg-lavender text-white'
                            : 'bg-lilac/30 text-plum hover:bg-lavender/30 dark:bg-dark-card dark:text-dark-text/60'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary w-full !py-3 text-lg flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving && <Loader2 size={18} className="animate-spin" />}
              {saving ? 'Salvando...' : 'Salvar Configurações ✨'}
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
