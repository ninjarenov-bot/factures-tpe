'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon, PaperAirplaneIcon, EnvelopeIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'

interface EmailModalProps {
  isOpen: boolean
  onClose: () => void
  defaultTo?: string
  defaultCc?: string
  subject: string
  body: string
  docType: 'facture' | 'devis'
  docNumber: string
}

export default function EmailModal({ isOpen, onClose, defaultTo = '', defaultCc = '', subject, body, docType, docNumber }: EmailModalProps) {
  const [to, setTo] = useState(defaultTo)
  const [cc, setCc] = useState(defaultCc)
  const [subjectText, setSubjectText] = useState(subject)
  const [message, setMessage] = useState(body)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setTo(defaultTo)
      setCc(defaultCc)
      setSubjectText(subject)
      setMessage(body)
      setSent(false)
      setError('')
    }
  }, [isOpen, defaultTo, defaultCc, subject, body])

  if (!isOpen) return null

  const handleSend = async () => {
    if (!to) return
    setSending(true)
    setError('')

    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, cc, subject: subjectText, message }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Erreur lors de l'envoi. Vérifiez votre clé Resend.")
        setSending(false)
        return
      }

      setSent(true)
      setSending(false)
      setTimeout(() => { setSent(false); onClose() }, 3000)
    } catch {
      setError("Erreur réseau. Vérifiez votre connexion.")
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <EnvelopeIcon className="w-5 h-5 text-indigo-600" />
            <h2 className="font-semibold text-gray-900">Envoyer par email</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors">
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Succès */}
        {sent ? (
          <div className="p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <CheckCircleIcon className="w-9 h-9 text-green-600" />
            </div>
            <p className="font-semibold text-gray-900 text-lg">Email envoyé !</p>
            <p className="text-sm text-gray-500 mt-1">
              {docType === 'facture' ? 'La facture' : 'Le devis'} <strong>{docNumber}</strong> a bien été envoyé à <strong>{to}</strong>
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Destinataire *</label>
              <input
                type="email"
                value={to}
                onChange={e => setTo(e.target.value)}
                placeholder="client@exemple.fr"
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Copie (CC) — votre email</label>
              <input
                type="email"
                value={cc}
                onChange={e => setCc(e.target.value)}
                placeholder="votre@email.fr"
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-blue-50/40"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Objet</label>
              <input
                type="text"
                value={subjectText}
                onChange={e => setSubjectText(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Message</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={6}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            {/* Erreur */}
            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <ExclamationCircleIcon className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-700">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button onClick={onClose} className="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50">
                Annuler
              </button>
              <button
                onClick={handleSend}
                disabled={!to || sending}
                className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
              >
                {sending ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <PaperAirplaneIcon className="w-4 h-4" />
                    Envoyer
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
