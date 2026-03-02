'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { DocumentCurrencyEuroIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'

type Mode = 'login' | 'register' | 'forgot'

export default function AuthPage() {
  const router = useRouter()
  const supabase = createClient()
  const [mode, setMode] = useState<Mode>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    email: '', password: '', firstName: '', lastName: '', companyName: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <a href="/" className="flex items-center justify-center gap-3 mb-8 group">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg group-hover:shadow-indigo-200 transition-shadow">
            <DocumentCurrencyEuroIcon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">FacturePro</h1>
        </a>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

          {/* ── MOT DE PASSE OUBLIÉ ── */}
          {mode === 'forgot' && (
            <>
              <div className="px-6 pt-6 pb-2">
                <button onClick={() => switchMode('login')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
                  <ArrowLeftIcon className="w-4 h-4" /> Retour à la connexion
                </button>
                <h2 className="text-xl font-bold text-gray-900">Mot de passe oublié ?</h2>
                <p className="text-sm text-gray-500 mt-1 mb-5">Entrez votre email, nous vous enverrons un lien pour réinitialiser votre mot de passe.</p>
              </div>
              <div className="px-6 pb-6">
                {success ? (
                  <div className="text-center py-6">
                    <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                      <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="font-semibold text-gray-900 mb-1">Email envoyé !</p>
                    <p className="text-sm text-gray-500">{success}</p>
                    <button onClick={() => switchMode('login')} className="mt-4 text-sm text-indigo-600 font-medium hover:underline">
                      Retour à la connexion
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleForgot} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Adresse email</label>
                      <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="jean@exemple.fr"
                        className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
                    <button type="submit" disabled={loading}
                      className="w-full py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                      {loading ? 'Envoi...' : 'Envoyer le lien de réinitialisation'}
                    </button>
                  </form>
                )}
              </div>
            </>
          )}

          {/* ── CONNEXION / INSCRIPTION ── */}
          {mode !== 'forgot' && (
            <>
              <div className="flex border-b border-gray-200">
                {(['login', 'register'] as const).map(m => (
                  <button key={m}
                    className={`flex-1 py-4 text-sm font-medium transition-colors ${mode === m ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => switchMode(m)}>
                    {m === 'login' ? 'Connexion' : 'Créer un compte'}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {success ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-gray-700">{success}</p>
                    <button onClick={() => switchMode('login')} className="mt-4 text-indigo-600 text-sm font-medium hover:underline">Se connecter</button>
                  </div>
                ) : (
                  <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4">
                    {mode === 'register' && (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Prénom</label>
                            <input name="firstName" type="text" value={form.firstName} onChange={handleChange} placeholder="Jean"
                              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Nom</label>
                            <input name="lastName" type="text" value={form.lastName} onChange={handleChange} placeholder="Dupont"
                              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Nom de l'entreprise</label>
                          <input name="companyName" type="text" value={form.companyName} onChange={handleChange} placeholder="Mon Entreprise SARL"
                            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                      </>
                    )}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Adresse email</label>
                      <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="jean@exemple.fr"
                        className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-medium text-gray-700">Mot de passe</label>
                        {mode === 'login' && (
                          <button type="button" onClick={() => switchMode('forgot')} className="text-xs text-indigo-600 hover:text-indigo-700 hover:underline">
                            Mot de passe oublié ?
                          </button>
                        )}
                      </div>
                      <input name="password" type="password" value={form.password} onChange={handleChange} required
                        placeholder={mode === 'login' ? '••••••••' : 'Minimum 6 caractères'} minLength={mode === 'register' ? 6 : undefined}
                        className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
                    <button type="submit" disabled={loading}
                      className="w-full py-2.5 px-4 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
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
                )}
              </div>
            </>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Gestion de factures et devis pour artisans et TPE
        </p>
      </div>
    </div>
  )
}
