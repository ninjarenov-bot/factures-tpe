'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { Product } from '@/types/database'
import { formatCurrency } from '@/lib/utils'
import Header from '@/components/Header'
import EmptyState from '@/components/EmptyState'
import { ArchiveBoxIcon, PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon, XMarkIcon, PhotoIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'

const UNITS = ['unité', 'heure', 'jour', 'mois', 'm²', 'm³', 'kg', 'forfait', 'autre']
const EMPTY = { name: '', description: '', reference: '', unit_price: 0, unit: 'unité', vat_rate: 20, category: '', image_url: '' }

export default function ProductsPage() {
  const supabase = createClient()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { load() }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/auth'; return }
    const { data } = await supabase.from('products').select('*').eq('user_id', user.id).order('name')
    setProducts((data || []) as Product[])
    setLoading(false)
  }

  function openCreate() {
    setEditing(null)
    setForm(EMPTY)
    setImagePreview('')
    setImageFile(null)
    setShowModal(true)
  }

  function openEdit(p: Product) {
    setEditing(p)
    setForm({
      name: p.name,
      description: p.description || '',
      reference: p.reference || '',
      unit_price: p.unit_price,
      unit: p.unit,
      vat_rate: p.vat_rate,
      category: p.category || '',
      image_url: p.image_url || '',
    })
    setImagePreview(p.image_url || '')
    setImageFile(null)
    setShowModal(true)
  }

  function handleFileSelect(file: File) {
    if (!file.type.startsWith('image/')) return
    if (file.size > 5 * 1024 * 1024) {
      alert('Image trop lourde (max 5 Mo)')
      return
    }
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setImagePreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  function removeImage() {
    setImageFile(null)
    setImagePreview('')
    setForm(f => ({ ...f, image_url: '' }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function uploadImage(userId: string): Promise<string | null> {
    if (!imageFile) return form.image_url || null
    setUploadingImage(true)
    const ext = imageFile.name.split('.').pop()
    const path = `${userId}/${Date.now()}.${ext}`
    const { error } = await supabase.storage
      .from('product-images')
      .upload(path, imageFile, { upsert: true })
    setUploadingImage(false)
    if (error) { alert("Erreur lors de l'upload de l'image"); return null }
    const { data } = supabase.storage.from('product-images').getPublicUrl(path)
    return data.publicUrl
  }

  async function handleSave() {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const uploadedUrl = await uploadImage(user.id)
    const payload = { ...form, image_url: uploadedUrl || null, user_id: user.id }

    if (editing) {
      await supabase.from('products').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('products').insert(payload)
    }
    await load()
    setShowModal(false)
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce produit ?')) return
    await supabase.from('products').delete().eq('id', id)
    setProducts(p => p.filter(x => x.id !== id))
  }

  const filtered = products.filter(p =>
    !search ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title="Produits & Services"
        subtitle={`${products.length} produit${products.length !== 1 ? 's' : ''}`}
        actions={
          <button onClick={openCreate} className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">
            <PlusIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Nouveau produit</span>
          </button>
        }
      />

      <main className="flex-1 p-4 sm:p-6 space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
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
              title="Aucun produit"
              description="Créez un catalogue de produits et services pour les ajouter facilement dans vos factures."
              icon={ArchiveBoxIcon}
              action={{ label: 'Ajouter un produit', onClick: openCreate }}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Produit</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Catégorie</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Unité</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Prix HT</th>
                    <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">TVA</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {/* Miniature */}
                          {p.image_url ? (
                            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                              <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <PhotoIcon className="w-5 h-5 text-gray-300" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                            {p.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{p.description}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell"><span className="text-sm text-gray-600">{p.category || '—'}</span></td>
                      <td className="px-5 py-4 hidden sm:table-cell"><span className="text-sm text-gray-600">{p.unit}</span></td>
                      <td className="px-5 py-4 text-right"><span className="text-sm font-semibold text-gray-900">{formatCurrency(p.unit_price)}</span></td>
                      <td className="px-5 py-4 text-center hidden md:table-cell"><span className="text-sm text-gray-600">{p.vat_rate}%</span></td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><PencilIcon className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(p.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><TrashIcon className="w-4 h-4" /></button>
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

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-lg font-semibold">{editing ? 'Modifier le produit' : 'Nouveau produit'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Image upload */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Photo du produit <span className="text-gray-400 font-normal">(optionnel)</span>
                </label>

                {imagePreview ? (
                  /* Preview avec bouton supprimer */
                  <div className="relative w-full h-44 rounded-xl overflow-hidden border border-gray-200 group">
                    <img src={imagePreview} alt="Aperçu" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                      <button
                        onClick={removeImage}
                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-red-600 rounded-full p-2 shadow-lg hover:bg-red-50"
                        title="Supprimer l'image"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-white text-gray-700 text-xs font-medium px-3 py-1.5 rounded-lg shadow hover:bg-gray-50"
                      >
                        Changer
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Zone de drop */
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    className={`w-full h-36 rounded-xl border-2 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                      dragOver
                        ? 'border-indigo-400 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                    }`}
                  >
                    <ArrowUpTrayIcon className="w-7 h-7 text-gray-300" />
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-600">Cliquer ou glisser une image</p>
                      <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, WEBP · max 5 Mo</p>
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) handleFileSelect(file)
                  }}
                />
              </div>

              {/* Champs texte */}
              {[
                { label: 'Nom *', key: 'name', placeholder: 'Ex: Heure de plomberie' },
                { label: 'Référence', key: 'reference', placeholder: 'PLB-001' },
                { label: 'Catégorie', key: 'category', placeholder: 'Plomberie' },
                { label: 'Description', key: 'description', placeholder: 'Détails du produit...' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    type="text"
                    value={(form as any)[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ))}

              {/* Prix + unité */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Prix unitaire HT</label>
                  <input
                    type="number" min="0" step="0.01"
                    value={form.unit_price}
                    onChange={e => setForm(f => ({ ...f, unit_price: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Unité</label>
                  <select
                    value={form.unit}
                    onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {UNITS.map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              {/* TVA */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Taux de TVA</label>
                <select
                  value={form.vat_rate}
                  onChange={e => setForm(f => ({ ...f, vat_rate: parseFloat(e.target.value) }))}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {[0, 5.5, 10, 20].map(r => <option key={r} value={r}>{r}%</option>)}
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving || uploadingImage || !form.name}
                className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {(saving || uploadingImage) ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {uploadingImage ? 'Upload...' : 'Sauvegarde...'}
                  </>
                ) : (
                  editing ? 'Modifier' : 'Créer'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
