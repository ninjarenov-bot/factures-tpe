'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { Client } from '@/types/database'
import { getClientName } from '@/lib/utils'
import Header from '@/components/Header'
import EmptyState from '@/components/EmptyState'
import {
  UserGroupIcon, PlusIcon, MagnifyingGlassIcon,
  PencilIcon, TrashIcon, XMarkIcon, PhotoIcon, BuildingOfficeIcon, UserIcon
} from '@heroicons/react/24/outline'

const EMPTY_CLIENT = {
  type: 'company' as 'company' | 'individual',
  company_name: '', first_name: '', last_name: '',
  email: '', phone: '', address: '', city: '', postal_code: '',
  country: 'France', siret: '', vat_number: '', notes: '',
  logo_url: '',
}

export default function ClientsPage() {
  const supabase = createClient()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [form, setForm] = useState(EMPTY_CLIENT)
  const [saving, setSaving] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>('')
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { loadClients() }, [])

  async function loadClients() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/auth'; return }
    const { data } = await supabase.from('clients').select('*').eq('user_id', user.id).order('company_name', { nullsFirst: false })
    setClients((data || []) as Client[])
    setLoading(false)
  }

  function openCreate() {
    setEditingClient(null)
    setForm(EMPTY_CLIENT)
    setLogoFile(null)
    setLogoPreview('')
    setShowModal(true)
  }

  function openEdit(client: Client) {
    setEditingClient(client)
    setForm({
      type: client.type,
      company_name: client.company_name || '',
      first_name: client.first_name || '',
      last_name: client.last_name || '',
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      city: client.city || '',
      postal_code: client.postal_code || '',
      country: client.country || 'France',
      siret: client.siret || '',
      vat_number: client.vat_number || '',
      notes: client.notes || '',
      logo_url: client.logo_url || '',
    })
    setLogoFile(null)
    setLogoPreview(client.logo_url || '')
    setShowModal(true)
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  function removeLogo() {
    setLogoFile(null)
    setLogoPreview('')
    setForm(f => ({ ...f, logo_url: '' }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function uploadLogo(userId: string, clientId: string): Promise<string | null> {
    if (!logoFile) return form.logo_url || null
    setUploadingLogo(true)
    const ext = logoFile.name.split('.').pop()
    const path = `clients/${userId}/${clientId}.${ext}`
    const { error } = await supabase.storage
      .from('logos')
      .upload(path, logoFile, { upsert: true })
    setUploadingLogo(false)
    if (error) { console.error('Upload logo:', error); return null }
    const { data } = supabase.storage.from('logos').getPublicUrl(path)
    return data.publicUrl
  }

  async function handleSave() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (editingClient) {
      // Mise à jour
      const logoUrl = await uploadLogo(user.id, editingClient.id)
      const payload = { ...form, logo_url: logoUrl, user_id: user.id }
      await supabase.from('clients').update(payload).eq('id', editingClient.id)
    } else {
      // Création : insérer d'abord pour obtenir l'id
      const { data: newClient } = await supabase
        .from('clients')
        .insert({ ...form, logo_url: null, user_id: user.id })
        .select()
        .single()
      if (newClient && logoFile) {
        const logoUrl = await uploadLogo(user.id, newClient.id)
        await supabase.from('clients').update({ logo_url: logoUrl }).eq('id', newClient.id)
      }
    }

    await loadClients()
    setShowModal(false)
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce client ?')) return
    await supabase.from('clients').delete().eq('id', id)
    setClients(c => c.filter(cl => cl.id !== id))
  }

  const filtered = clients.filter(c => {
    const q = search.toLowerCase()
    return !q || getClientName(c).toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q)
  })

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Clients"
        subtitle={`${clients.length} client${clients.length !== 1 ? 's' : ''}`}
        actions={
          <button onClick={openCreate} className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
            <PlusIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Nouveau client</span>
          </button>
        }
      />

      <main className="flex-1 p-4 sm:p-6 space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title="Aucun client"
              description="Ajoutez vos clients pour les retrouver facilement dans vos factures."
              icon={UserGroupIcon}
              action={{ label: 'Ajouter un client', href: '#' }}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nom / Société</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Email</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Téléphone</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Ville</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50/50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {/* Avatar / Logo */}
                          {client.logo_url ? (
                            <img
                              src={client.logo_url}
                              alt={getClientName(client)}
                              className="w-9 h-9 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                              {client.type === 'company'
                                ? <BuildingOfficeIcon className="w-5 h-5 text-indigo-500" />
                                : <UserIcon className="w-5 h-5 text-indigo-500" />
                              }
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{getClientName(client)}</p>
                            <p className="text-xs text-gray-500">{client.type === 'company' ? 'Entreprise' : 'Particulier'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <span className="text-sm text-gray-600">{client.email || '—'}</span>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <span className="text-sm text-gray-600">{client.phone || '—'}</span>
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell">
                        <span className="text-sm text-gray-600">{client.city || '—'}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(client)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(client.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingClient ? 'Modifier le client' : 'Nouveau client'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">

              {/* Upload Logo */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Logo du client</label>
                <div className="flex items-center gap-4">
                  {/* Preview */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-colors overflow-hidden flex-shrink-0"
                  >
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <div className="text-center">
                        <PhotoIcon className="w-7 h-7 text-gray-400 mx-auto" />
                        <span className="text-xs text-gray-400 mt-1 block">Logo</span>
                      </div>
                    )}
                  </div>
                  {/* Boutons */}
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      {logoPreview ? 'Changer le logo' : 'Choisir un logo'}
                    </button>
                    {logoPreview && (
                      <button
                        type="button"
                        onClick={removeLogo}
                        className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        Supprimer
                      </button>
                    )}
                    <p className="text-xs text-gray-400">PNG, JPG — max 2 Mo</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Type */}
              <div className="flex gap-3">
                {(['company', 'individual'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setForm(f => ({ ...f, type: t }))}
                    className={`flex-1 py-2.5 text-sm font-medium rounded-lg border transition-colors ${
                      form.type === t ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {t === 'company' ? 'Entreprise' : 'Particulier'}
                  </button>
                ))}
              </div>

              {form.type === 'company' && (
                <Field label="Nom de la société" value={form.company_name} onChange={v => setForm(f => ({ ...f, company_name: v }))} placeholder="SARL Dupont" />
              )}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Prénom" value={form.first_name} onChange={v => setForm(f => ({ ...f, first_name: v }))} placeholder="Jean" />
                <Field label="Nom" value={form.last_name} onChange={v => setForm(f => ({ ...f, last_name: v }))} placeholder="Dupont" />
              </div>
              <Field label="Email" type="email" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} placeholder="jean@exemple.fr" />
              <Field label="Téléphone" type="tel" value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} placeholder="06 12 34 56 78" />
              <Field label="Adresse" value={form.address} onChange={v => setForm(f => ({ ...f, address: v }))} placeholder="12 rue de la Paix" />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Code postal" value={form.postal_code} onChange={v => setForm(f => ({ ...f, postal_code: v }))} placeholder="75001" />
                <Field label="Ville" value={form.city} onChange={v => setForm(f => ({ ...f, city: v }))} placeholder="Paris" />
              </div>
              {form.type === 'company' && (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="SIRET" value={form.siret} onChange={v => setForm(f => ({ ...f, siret: v }))} placeholder="123 456 789 00012" />
                  <Field label="N° TVA" value={form.vat_number} onChange={v => setForm(f => ({ ...f, vat_number: v }))} placeholder="FR12345678901" />
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50">
                Annuler
              </button>
              <button onClick={handleSave} disabled={saving || uploadingLogo} className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2">
                {(saving || uploadingLogo) && (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                )}
                {saving || uploadingLogo ? 'Sauvegarde...' : editingClient ? 'Modifier' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  )
}
