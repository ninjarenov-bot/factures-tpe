'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  DocumentCurrencyEuroIcon,
  ArrowRightIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  CheckIcon,
  ArrowLeftIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setErrorMsg('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, honeypot: '' }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error || "Une erreur s'est produite.")
        setStatus('error')
      } else {
        setStatus('success')
        setForm({ name: '', email: '', subject: '', message: '' })
      }
    } catch {
      setErrorMsg('Erreur réseau, veuillez réessayer.')
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* HEADER */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
              <DocumentCurrencyEuroIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900">Factures TPE</span>
          </Link>
          <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800">
            <ArrowLeftIcon className="w-4 h-4" />
            Mon espace
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

        {/* TITRE */}
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-100 mb-4">
            <EnvelopeIcon className="w-7 h-7 text-indigo-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3">
            Nous contacter
          </h1>
          <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto">
            Une question, un problème, une suggestion ? Notre équipe vous répond rapidement.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10 items-start">

          {/* INFO CARDS — gauche */}
          <div className="lg:col-span-2 space-y-4">

            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <EnvelopeIcon className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Email</p>
                  <a href="mailto:bonjour@factures-tpe.fr" className="text-sm text-indigo-600 hover:underline mt-0.5 block">
                    bonjour@factures-tpe.fr
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                  <ClockIcon className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Délai de réponse</p>
                  <p className="text-sm text-gray-500 mt-0.5">Généralement sous 24h ouvrées</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
                  <ChatBubbleLeftRightIcon className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Sujets fréquents</p>
                  <ul className="mt-1.5 space-y-1">
                    {['Question sur la facturation', 'Problème technique', 'Mon abonnement', 'Suggestion d\'amélioration', 'Autre'].map(s => (
                      <li key={s} className="text-xs text-gray-500 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-gray-300 flex-shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-indigo-600 rounded-2xl p-5 text-white">
              <p className="font-bold text-sm mb-1">Besoin d&apos;aide rapide ?</p>
              <p className="text-indigo-100 text-xs mb-3 leading-relaxed">
                Consultez notre FAQ pour trouver une réponse immédiate aux questions courantes.
              </p>
              <Link href="/#faq" className="inline-flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                Voir la FAQ <ArrowRightIcon className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* FORMULAIRE — droite */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-5">

              {/* Honeypot anti-spam */}
              <input type="text" name="website" tabIndex={-1} aria-hidden="true" className="hidden" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nom complet *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Jean Dupont"
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="jean@exemple.fr"
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Objet *</label>
                <select
                  required
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                >
                  <option value="">Sélectionnez un sujet...</option>
                  <option value="Question sur la facturation">Question sur la facturation</option>
                  <option value="Problème technique">Problème technique</option>
                  <option value="Mon abonnement">Mon abonnement</option>
                  <option value="Suggestion d'amélioration">Suggestion d&apos;amélioration</option>
                  <option value="Partenariat">Partenariat</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Message *</label>
                <textarea
                  required
                  rows={6}
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Décrivez votre question ou votre besoin en détail..."
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Feedback */}
              {status === 'success' && (
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
                  <CheckIcon className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Message envoyé !</p>
                    <p className="text-xs font-normal text-green-600 mt-0.5">Nous vous répondrons dans les 24 heures ouvrées.</p>
                  </div>
                </div>
              )}
              {status === 'error' && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-60 text-sm"
              >
                {status === 'sending' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <EnvelopeIcon className="w-4 h-4" />
                    Envoyer le message
                  </>
                )}
              </button>

              <p className="text-xs text-gray-400 text-center">
                Vos données sont utilisées uniquement pour répondre à votre demande.
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
