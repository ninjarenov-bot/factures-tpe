'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { DocumentCurrencyEuroIcon, ArrowLeftIcon, CheckIcon, StarIcon } from '@heroicons/react/24/solid'

type Mode = 'login' | 'register' | 'forgot'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

const FEATURES = [
  'Factures et devis conformes à la loi française',
  'Créez et envoyez en moins de 2 minutes',
  'Suivi des paiements et relances automatiques',
  'PDF professionnel prêt à l\'impression',
  'Accessible depuis mobile, tablette et ordinateur',
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
      options: { redirectTo: `${window.location.origin}/auth/callback` },
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
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">

      {/* ── GAUCHE : formulaire ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:py-0">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 mb-10">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
            <DocumentCurrencyEuroIcon className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900 tracking-tight">Factures TPE</span>
        </a>

        <div className="w-full max-w-sm">
          {/* Mot de passe oublié */}
          {mode === 'forgot' ? (
            <div>
              <button onClick={() => switchMode('login')} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-6 transition-colors">
                <ArrowLeftIcon className="w-4 h-4" /> Retour
              </button>
              <h1 className="text-2xl font-bold text-gray-900 mb-1.5">Mot de passe oublié ?</h1>
              <p className="text-sm text-gray-500 mb-7">Nous vous enverrons un lien de réinitialisation par email.</p>
              {success ? (
                <div className="text-center py-8 bg-green-50 rounded-2xl border border-green-100 px-6">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="font-semibold text-gray-900 mb-1">Email envoyé !</p>
                  <p className="text-sm text-gray-500 mb-5">{success}</p>
                  <button onClick={() => switchMode('login')} className="text-sm text-indigo-600 font-semibold hover:underline">
                    Retour à la connexion
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgot} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse email</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="jean@exemple.fr"
                      className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 transition" />
                  </div>
                  {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-100">{error}</p>}
                  <button type="submit" disabled={loading}
                    className="w-full py-3 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                    {loading ? 'Envoi...' : 'Envoyer le lien'}
                  </button>
                </form>
              )}
            </div>

          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-1.5 text-center">
                {mode === 'login' ? 'Connectez-vous' : 'Créez votre compte'}
              </h1>
              <p className="text-sm text-gray-500 text-center mb-7">
                {mode === 'login' ? 'Bon retour parmi nous 👋' : 'Commencez gratuitement, sans carte bancaire'}
              </p>

              {success ? (
                <div className="text-center py-8 bg-green-50 rounded-2xl border border-green-100 px-6">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                    <CheckIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="font-semibold text-gray-900 mb-1">Compte créé avec succès !</p>
                  <p className="text-sm text-gray-500 mb-5">{success}</p>
                  <button onClick={() => switchMode('login')} className="text-sm text-indigo-600 font-semibold hover:underline">Se connecter</button>
                </div>
              ) : (
                <>
                  {/* Bouton Google */}
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={googleLoading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 shadow-sm mb-4"
                  >
                    {googleLoading
                      ? <svg className="animate-spin w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      : <GoogleIcon />}
                    {googleLoading ? 'Redirection...' : 'Continuer avec Google'}
                  </button>

                  {/* Séparateur */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-px bg-gray-100" />
                    <span className="text-xs text-gray-400">ou</span>
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>

                  {/* Formulaire */}
                  <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-3">
                    {mode === 'register' && (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Prénom</label>
                            <input name="firstName" type="text" value={form.firstName} onChange={handleChange} placeholder="Jean"
                              className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 transition" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom</label>
                            <input name="lastName" type="text" value={form.lastName} onChange={handleChange} placeholder="Dupont"
                              className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 transition" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Entreprise</label>
                          <input name="companyName" type="text" value={form.companyName} onChange={handleChange} placeholder="Mon Entreprise SARL"
                            className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 transition" />
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                      <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="jean@exemple.fr"
                        className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 transition" />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-sm font-medium text-gray-700">Mot de passe</label>
                        {mode === 'login' && (
                          <button type="button" onClick={() => switchMode('forgot')} className="text-xs text-indigo-600 hover:underline font-medium">
                            Mot de passe oublié ?
                          </button>
                        )}
                      </div>
                      <input name="password" type="password" value={form.password} onChange={handleChange} required
                        placeholder={mode === 'login' ? '••••••••' : 'Minimum 6 caractères'} minLength={mode === 'register' ? 6 : undefined}
                        className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 transition" />
                    </div>

                    {error && (
                      <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-100">{error}</p>
                    )}

                    <button type="submit" disabled={loading}
                      className="w-full py-3 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors mt-1">
                      {loading
                        ? <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                            Chargement...
                          </span>
                        : mode === 'login' ? 'Se connecter' : 'Créer mon compte gratuitement'}
                    </button>
                  </form>

                  {/* Switch mode */}
                  <p className="text-center text-sm text-gray-500 mt-5">
                    {mode === 'login' ? (
                      <>Pas encore de compte ?{' '}
                        <button onClick={() => switchMode('register')} className="text-indigo-600 font-semibold hover:underline">Créer un compte</button>
                      </>
                    ) : (
                      <>Déjà un compte ?{' '}
                        <button onClick={() => switchMode('login')} className="text-indigo-600 font-semibold hover:underline">Se connecter</button>
                      </>
                    )}
                  </p>
                </>
              )}
            </>
          )}

          <p className="text-center text-xs text-gray-300 mt-8">
            En continuant, vous acceptez nos{' '}
            <a href="/cgv" className="underline hover:text-gray-500">CGV</a> et notre{' '}
            <a href="/confidentialite" className="underline hover:text-gray-500">politique de confidentialité</a>.
          </p>
        </div>
      </div>

      {/* ── DROITE : panneau info bleu ── */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] flex-col justify-center px-12 xl:px-16 bg-sky-50 border-l border-sky-100">

        {/* Titre */}
        <div className="mb-8">
          <h2 className="text-2xl xl:text-3xl font-bold text-gray-900 leading-tight mb-2">
            Factures professionnelles<br />
            <span className="text-indigo-600">en 2 minutes chrono</span>
          </h2>
          <p className="text-sm text-gray-500 font-medium">100 % conforme à la réglementation française</p>
        </div>

        {/* Features */}
        <ul className="space-y-3.5 mb-10">
          {FEATURES.map((f, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckIcon className="w-3 h-3 text-green-600" />
              </div>
              <span className="text-sm text-gray-700 leading-relaxed">{f}</span>
            </li>
          ))}
        </ul>

        {/* Social proof */}
        <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-5">
          <div className="flex items-center gap-1 mb-2">
            {[1,2,3,4,5].map(i => (
              <StarIcon key={i} className={`w-4 h-4 ${i <= 4 ? 'text-yellow-400' : 'text-yellow-200'}`} />
            ))}
            <span className="text-sm font-bold text-gray-900 ml-1.5">4.8</span>
            <span className="text-xs text-gray-400 ml-1">/ 5</span>
          </div>
          <p className="text-xs text-gray-500 mb-3">Basé sur les avis de nos utilisateurs</p>
          <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
            <div className="flex -space-x-2">
              {['🧑‍🔧','👩‍💼','🧑‍🏭','👨‍🔨'].map((e, i) => (
                <div key={i} className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-sm border-2 border-white">{e}</div>
              ))}
            </div>
            <p className="text-xs text-gray-600">
              <span className="font-bold text-gray-900">+8 000</span> artisans et TPE nous font confiance 🇫🇷
            </p>
          </div>
        </div>

        {/* Compte démo */}
        <div className="mt-5 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
          <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wider mb-1.5">Compte de démonstration</p>
          <p className="text-xs text-indigo-900"><span className="opacity-60">Email :</span> <span className="font-mono font-semibold">demo@factures-tpe.fr</span></p>
          <p className="text-xs text-indigo-900 mt-0.5"><span className="opacity-60">Mdp :</span> <span className="font-mono font-semibold">Demo2026!</span></p>
        </div>
      </div>

    </div>
  )
}
