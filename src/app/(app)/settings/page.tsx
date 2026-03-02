'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { Profile } from '@/types/database'
import Header from '@/components/Header'
import { CheckIcon, CameraIcon, BuildingOfficeIcon, XMarkIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'

type Section = 'company' | 'bank' | 'docs' | 'account'

export default function SettingsPage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<Partial<Profile>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [section, setSection] = useState<Section>('company')
  const [userId, setUserId] = useState<string>('')
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const logoRef = useRef<HTMLInputElement>(null)
  const avatarRef = useRef<HTMLInputElement>(null)

  useEffect(() => { load() }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/auth'; return }
    setUserId(user.id)
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    setProfile(data || {})
    setLoading(false)
  }

  async function handleSave() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').update(profile).eq('id', user.id)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
    setSaving(false)
  }

  async function uploadFile(file: File, bucket: 'logos' | 'avatars', field: 'logo_url') {
    const isLogo = bucket === 'logos'
    if (isLogo) setUploadingLogo(true); else setUploadingAvatar(true)
    const ext = file.name.split('.').pop()
    const path = `${userId}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path)
      setProfile(p => ({ ...p, [field]: publicUrl }))
    }
    if (isLogo) setUploadingLogo(false); else setUploadingAvatar(false)
  }

  const set = (key: keyof Profile, value: string | number) =>
    setProfile(p => ({ ...p, [key]: value }))

  const sections: { id: Section; label: string }[] = [
    { id: 'company', label: 'Mon entreprise' },
    { id: 'bank', label: 'Coordonnées bancaires' },
    { id: 'docs', label: 'Documents' },
    { id: 'account', label: 'Mon compte' },
  ]

  if (loading) return (
    <div className="flex-1 flex items-center justify-center py-16">
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Paramètres"
        actions={
          section !== 'account' ? (
            <button onClick={handleSave} disabled={saving}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                saved ? 'bg-green-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'
              } disabled:opacity-50`}>
              {saved ? <><CheckIcon className="w-4 h-4" /> Enregistré</> : saving ? 'Sauvegarde...' : 'Enregistrer'}
            </button>
          ) : undefined
        }
      />

      <main className="flex-1 p-4 sm:p-6">
        <div className="max-w-3xl mx-auto">
          {/* Section tabs */}
          <div className="bg-white rounded-xl border border-gray-200 mb-4 p-1 flex gap-1 overflow-x-auto">
            {sections.map(s => (
              <button key={s.id} onClick={() => setSection(s.id)}
                className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  section === s.id ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}>
                {s.label}
              </button>
            ))}
          </div>

          {/* ── MON ENTREPRISE ── */}
          {section === 'company' && (
            <div className="space-y-4">
              {/* Logo + Avatar upload card */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 text-base mb-5">Identité visuelle</h2>
                <div className="flex flex-col sm:flex-row gap-8">
                  {/* Logo entreprise */}
                  <div className="flex flex-col items-center gap-3">
                    <div
                      onClick={() => logoRef.current?.click()}
                      className="relative w-28 h-28 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all group overflow-hidden"
                    >
                      {profile.logo_url ? (
                        <Image src={profile.logo_url} alt="Logo" fill className="object-contain p-2" />
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-gray-400 group-hover:text-indigo-500 transition-colors">
                          <BuildingOfficeIcon className="w-8 h-8" />
                          <span className="text-xs font-medium">Logo</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                        <CameraIcon className="w-6 h-6 text-white" />
                      </div>
                      {uploadingLogo && (
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-2xl">
                          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                    <input ref={logoRef} type="file" accept="image/*" className="hidden"
                      onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0], 'logos', 'logo_url')}
                    />
                    <div className="text-center">
                      <p className="text-xs font-semibold text-gray-700">Logo entreprise</p>
                      <p className="text-xs text-gray-400">Affiché sur vos PDF</p>
                    </div>
                    {profile.logo_url && (
                      <button onClick={() => setProfile(p => ({ ...p, logo_url: '' }))}
                        className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                        <XMarkIcon className="w-3 h-3" /> Supprimer
                      </button>
                    )}
                  </div>

                  <div className="hidden sm:block w-px bg-gray-200" />

                  <div className="flex-1">
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Ajoutez le logo de votre entreprise. Il apparaîtra automatiquement sur toutes vos factures et devis en PDF. Format recommandé : carré, fond transparent (PNG), taille max 5 Mo.
                    </p>
                    <button onClick={() => logoRef.current?.click()}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-lg hover:bg-indigo-100 transition-colors">
                      <CameraIcon className="w-4 h-4" />
                      {profile.logo_url ? 'Changer le logo' : 'Ajouter un logo'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Infos entreprise */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                <h2 className="font-semibold text-gray-900 text-base">Informations entreprise</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SettingField label="Nom de l'entreprise" value={profile.company_name || ''} onChange={v => set('company_name', v)} placeholder="SARL Dupont" full />
                  <SettingField label="Prénom" value={profile.first_name || ''} onChange={v => set('first_name', v)} placeholder="Jean" />
                  <SettingField label="Nom" value={profile.last_name || ''} onChange={v => set('last_name', v)} placeholder="Dupont" />
                  <SettingField label="Email professionnel" type="email" value={profile.email || ''} onChange={v => set('email', v)} placeholder="contact@entreprise.fr" />
                  <SettingField label="Téléphone" type="tel" value={profile.phone || ''} onChange={v => set('phone', v)} placeholder="06 12 34 56 78" />
                  <SettingField label="Adresse" value={profile.address || ''} onChange={v => set('address', v)} placeholder="12 rue de la Paix" full />
                  <SettingField label="Code postal" value={profile.postal_code || ''} onChange={v => set('postal_code', v)} placeholder="75001" />
                  <SettingField label="Ville" value={profile.city || ''} onChange={v => set('city', v)} placeholder="Paris" />
                  <SettingField label="Pays" value={profile.country || 'France'} onChange={v => set('country', v)} placeholder="France" />
                  <SettingField label="SIRET" value={profile.siret || ''} onChange={v => set('siret', v)} placeholder="123 456 789 00012" />
                  <SettingField label="N° TVA intracommunautaire" value={profile.vat_number || ''} onChange={v => set('vat_number', v)} placeholder="FR12345678901" full />
                </div>
              </div>
            </div>
          )}

          {/* ── COORDONNÉES BANCAIRES ── */}
          {section === 'bank' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
              <div>
                <h2 className="font-semibold text-gray-900 text-base">Coordonnées bancaires</h2>
                <p className="text-sm text-gray-500 mt-1">Ces informations apparaîtront sur vos factures pour faciliter les virements.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SettingField label="Nom de la banque" value={profile.bank_name || ''} onChange={v => set('bank_name', v)} placeholder="BNP Paribas" full />
                <SettingField label="IBAN" value={profile.bank_iban || ''} onChange={v => set('bank_iban', v)} placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX" full />
                <SettingField label="BIC / SWIFT" value={profile.bank_bic || ''} onChange={v => set('bank_bic', v)} placeholder="BNPAFRPP" />
              </div>
            </div>
          )}

          {/* ── DOCUMENTS ── */}
          {section === 'docs' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
              <h2 className="font-semibold text-gray-900 text-base">Paramètres des documents</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SettingField label="Préfixe factures" value={profile.invoice_prefix || 'FAC'} onChange={v => set('invoice_prefix', v)} placeholder="FAC" />
                <SettingField label="Préfixe devis" value={profile.quote_prefix || 'DEV'} onChange={v => set('quote_prefix', v)} placeholder="DEV" />
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Délai de paiement par défaut (jours)</label>
                  <input type="number" min="0" value={profile.default_payment_terms || 30}
                    onChange={e => set('default_payment_terms', parseInt(e.target.value) || 30)}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Taux TVA par défaut (%)</label>
                  <select value={profile.default_vat_rate || 20} onChange={e => set('default_vat_rate', parseFloat(e.target.value))}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {[0, 5.5, 10, 20].map(r => <option key={r} value={r}>{r}%</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Texte de pied de page</label>
                  <textarea value={profile.footer_text || ''} onChange={e => set('footer_text', e.target.value)}
                    placeholder="Ex: Merci de votre confiance. Pénalités de retard de 3× le taux légal..."
                    rows={3} className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                </div>
              </div>
            </div>
          )}

          {/* ── MON COMPTE ── */}
          {section === 'account' && (
            <AccountSection supabase={supabase} profile={profile} />
          )}

          {/* Save (bottom) */}
          {section !== 'account' && (
            <div className="mt-4 flex justify-end">
              <button onClick={handleSave} disabled={saving}
                className={`px-6 py-2.5 text-sm font-semibold rounded-xl transition-all ${saved ? 'bg-green-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'} disabled:opacity-50`}>
                {saved ? '✓ Enregistré' : saving ? 'Sauvegarde...' : 'Enregistrer les modifications'}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function AccountSection({ supabase, profile }: { supabase: any; profile: Partial<Profile> }) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function changePassword() {
    if (newPassword.length < 6) { setPwMsg({ type: 'error', text: 'Le mot de passe doit faire au moins 6 caractères.' }); return }
    if (newPassword !== confirmPassword) { setPwMsg({ type: 'error', text: 'Les mots de passe ne correspondent pas.' }); return }
    setPwSaving(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) setPwMsg({ type: 'error', text: error.message })
    else { setPwMsg({ type: 'success', text: 'Mot de passe mis à jour avec succès !' }); setNewPassword(''); setConfirmPassword('') }
    setPwSaving(false)
    setTimeout(() => setPwMsg(null), 4000)
  }

  return (
    <div className="space-y-4">
      {/* Info compte */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 text-base mb-4">Informations du compte</h2>
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
            {(profile.first_name?.[0] || profile.email?.[0] || '?').toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{[profile.first_name, profile.last_name].filter(Boolean).join(' ') || 'Mon compte'}</p>
            <p className="text-sm text-gray-500">{profile.email}</p>
          </div>
        </div>
      </div>

      {/* Changement de mot de passe */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 text-base mb-1">Changer le mot de passe</h2>
        <p className="text-sm text-gray-500 mb-4">Choisissez un mot de passe sécurisé d'au moins 6 caractères.</p>
        <div className="space-y-3 max-w-sm">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" minLength={6}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••"
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          {pwMsg && (
            <div className={`p-3 rounded-lg text-sm ${pwMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {pwMsg.text}
            </div>
          )}
          <button onClick={changePassword} disabled={pwSaving || !newPassword}
            className="px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
            {pwSaving ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
          </button>
        </div>
      </div>

      {/* Déconnexion */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center justify-between">
        <div>
          <p className="font-semibold text-gray-900 text-sm">Déconnexion</p>
          <p className="text-xs text-gray-500 mt-0.5">Vous serez redirigé vers la page d'accueil.</p>
        </div>
        <button
          onClick={async () => { await supabase.auth.signOut(); window.location.href = '/' }}
          className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">
          Se déconnecter
        </button>
      </div>
    </div>
  )
}

function SettingField({ label, value, onChange, placeholder, type = 'text', full }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; full?: boolean
}) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
    </div>
  )
}
