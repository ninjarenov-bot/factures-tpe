'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Client } from '@/types/database'
import { getClientName } from '@/lib/utils'
import Header from '@/components/Header'
import EmptyState from '@/components/EmptyState'
import {
  UserGroupIcon, PlusIcon, MagnifyingGlassIcon,
  PencilIcon, TrashIcon, XMarkIcon, CheckIcon
} from '@heroicons/react/24/outline'

const EMPTY_CLIENT = {
  type: 'company' as const,
  company_name: '', first_name: '', last_name: '',
  email: '', phone: '', address: '', city: '', postal_code: '',
  country: 'France', siret: '', vat_number: '', notes: '',
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
    })
    setShowModal(true)
  }

  async function handleSave() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const payload = { ...form, user_id: user.id }
    if (editingClient) {
      await supabase.from('clients').update(payload).eq('id', editingClient.id)
    } else {
      await supabase.from('clients').insert(payload)
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
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{getClientName(client)}</p>
                          <p className="text-xs text-gray-500">{client.type === 'company' ? 'Entreprise' : 'Particulier'}</p>
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
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50">
                {saving ? 'Sauvegarde...' : editingClient ? 'Modifier' : 'Créer'}
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
