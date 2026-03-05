'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { DocumentCurrencyEuroIcon, ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline'

type Mode = 'login' | 'register' | 'forgot'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

const FEATURES = [
  'Factures et devis professionnels en 2 minutes',
  'Envoi par email directement depuis l\'application',
  'Suivi des paiements et relances automatiques',
  'Export PDF prêt à l\'impression',
]

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [mode, setMode] = useState<Mode>('login')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    email: '', password: '', firstName: '', lastName: '', companyName: '',
  })

  useEffect(() => {
    if (searchParams.get('error') === 'oauth') {
      setError('Erreur lors de la connexion Google. Veuillez réessayer.')
    }
  }, [searchParams])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) { setError(error.message); setGoogleLoading(false) }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
    if (error) setError(error.message === 'Invalid login credentials' ? 'Email ou mot de passe incorrect' : error.message)
    else { router.push('/dashboard'); router.refresh() }
    setLoading(false)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.signUp({
      email: form.email, password: form.password,
      options: { data: { first_name: form.firstName, last_name: form.lastName, company_name: form.companyName } },
    })
    if (error) setError(error.message)
    else setSuccess('Compte créé ! Vérifiez votre email pour confirmer votre inscription.')
    setLoading(false)
  }

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.email) { setError('Veuillez saisir votre adresse email.'); return }
    setLoading(true); setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    })
    if (error) setError(error.message)
    else setSuccess('Un lien de réinitialisation a été envoyé à ' + form.email)
    setLoading(false)
  }

  const switchMode = (m: Mode) => { setMode(m); setError(''); setSuccess('') }

  return (
    <div className="min-h-screen flex">

      {/* ── PANNEAU GAUCHE (branding) ── */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] flex-col bg-indigo-600 p-10 relative overflow-hidden">
        {/* Cercles déco */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-indigo-500/40" />
        <div className="absolute -bottom-16 -left-16 w-80 h-80 rounded-full bg-indigo-700/50" />
        <div className="absolute top-1/2 right-0 w-32 h-32 rounded-full bg-indigo-400/20" />

        {/* Logo */}
        <a href="/" className="relative flex items-center gap-3 mb-12">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <DocumentCurrencyEuroIcon className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">Factures TPE</span>
        </a>

        {/* Tagline */}
        <div className="relative flex-1 flex flex-col justify-center">
          <h2 className="text-3xl xl:text-4xl font-bold text-white leading-tight mb-4">
            Gérez vos factures<br />en toute simplicité
          </h2>
          <p className="text-indigo-200 text-base mb-10 leading-relaxed">
            L'outil de facturation pensé pour les artisans et les TPE françaises.
          </p>

          <ul className="space-y-4">
            {FEATURES.map((f, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckIcon className="w-3 h-3 text-white" />
                </div>
                <span className="text-indigo-100 text-sm leading-relaxed">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Compte démo */}
        <div className="relative mt-8 p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
          <p className="text-indigo-100 text-xs font-semibold uppercase tracking-wider mb-2">Compte de démonstration</p>
          <p className="text-white text-sm"><span className="opacity-70">Email :</span> demo@factures-tpe.fr</p>
          <p className="text-white text-sm"><span className="opacity-70">Mdp :</span> Demo2026!</p>
        </div>
      </div>

      {/* ── PANNEAU DROIT (formulaire) ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md">

          {/* Logo mobile */}
          <a href="/" className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
              <DocumentCurrencyEuroIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Factures TPE</span>
          </a>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

            {/* ── MOT DE PASSE OUBLIÉ ── */}
            {mode === 'forgot' && (
              <div className="p-7">
                <button onClick={() => switchMode('login')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-5">
                  <ArrowLeftIcon className="w-4 h-4" /> Retour
                </button>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Mot de passe oublié ?</h2>
                <p className="text-sm text-gray-500 mb-6">Entrez votre email, nous vous enverrons un lien de réinitialisation.</p>
                {success ? (
                  <div className="text-center py-6">
                    <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                      <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="font-semibold text-gray-900 mb-1">Email envoyé !</p>
                    <p className="text-sm text-gray-500 mb-4">{success}</p>
                    <button onClick={() => switchMode('login')} className="text-sm text-indigo-600 font-medium hover:underline">
                      Retour à la connexion
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleForgot} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">Adresse email</label>
                      <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="jean@exemple.fr"
                        className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                    </div>
                    {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>}
                    <button type="submit" disabled={loading}
                      className="w-full py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                      {loading ? 'Envoi...' : 'Envoyer le lien'}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* ── CONNEXION / INSCRIPTION ── */}
            {mode !== 'forgot' && (
              <>
                {/* Onglets */}
                <div className="flex border-b border-gray-100">
                  {(['login', 'register'] as const).map(m => (
                    <button key={m}
                      className={`flex-1 py-4 text-sm font-semibold transition-all ${mode === m
                        ? 'text-indigo-600 border-b-2 border-indigo-600'
                        : 'text-gray-400 hover:text-gray-600'}`}
                      onClick={() => switchMode(m)}>
                      {m === 'login' ? 'Connexion' : 'Créer un compte'}
                    </button>
                  ))}
                </div>

                <div className="p-7">
                  {success ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                        <CheckIcon className="w-8 h-8 text-green-600" />
                      </div>
                      <p className="font-semibold text-gray-900 mb-2">Compte créé avec succès !</p>
                      <p className="text-sm text-gray-500 mb-4">{success}</p>
                      <button onClick={() => switchMode('login')} className="text-indigo-600 text-sm font-medium hover:underline">Se connecter</button>
                    </div>
                  ) : (
                    <>
                      {/* Bouton Google */}
                      <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={googleLoading}
                        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 mb-5"
                      >
                        {googleLoading ? (
                          <svg className="animate-spin w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : <GoogleIcon />}
                        {googleLoading ? 'Redirection...' : 'Continuer avec Google'}
                      </button>

                      {/* Séparateur */}
                      <div className="flex items-center gap-3 mb-5">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-xs text-gray-400 font-medium">ou continuer avec email</span>
                        <div className="flex-1 h-px bg-gray-200" />
                      </div>

                      {/* Formulaire email */}
                      <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4">
                        {mode === 'register' && (
                          <>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">Prénom</label>
                                <input name="firstName" type="text" value={form.firstName} onChange={handleChange} placeholder="Jean"
                                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1.5">Nom</label>
                                <input name="lastName" type="text" value={form.lastName} onChange={handleChange} placeholder="Dupont"
                                  className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1.5">Nom de l'entreprise</label>
                              <input name="companyName" type="text" value={form.companyName} onChange={handleChange} placeholder="Mon Entreprise SARL"
                                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                            </div>
                          </>
                        )}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1.5">Adresse email</label>
                          <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="jean@exemple.fr"
                            className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-medium text-gray-700">Mot de passe</label>
                            {mode === 'login' && (
                              <button type="button" onClick={() => switchMode('forgot')} className="text-xs text-indigo-600 hover:text-indigo-700 hover:underline">
                                Mot de passe oublié ?
                              </button>
                            )}
                          </div>
                          <input name="password" type="password" value={form.password} onChange={handleChange} required
                            placeholder={mode === 'login' ? '••••••••' : 'Minimum 6 caractères'} minLength={mode === 'register' ? 6 : undefined}
                            className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                        </div>

                        {error && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
                        )}

                        <button type="submit" disabled={loading}
                          className="w-full py-2.5 px-4 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                          {loading ? (
                            <span className="flex items-center justify-center gap-2">
                              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                              Chargement...
                            </span>
                          ) : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
                        </button>
                      </form>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            En vous inscrivant, vous acceptez nos{' '}
            <a href="/cgv" className="underline hover:text-gray-600">conditions générales</a> et notre{' '}
            <a href="/confidentialite" className="underline hover:text-gray-600">politique de confidentialité</a>.
          </p>
        </div>
      </div>
    </div>
  )
}
