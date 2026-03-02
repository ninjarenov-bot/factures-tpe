'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Client, Product, InvoiceItem, QuoteItem } from '@/types/database'
import { formatCurrency, generateNumber } from '@/lib/utils'
import { PlusIcon, TrashIcon, ChevronDownIcon } from '@heroicons/react/24/outline'

type LineItem = {
  id?: string
  description: string
  quantity: number
  unit_price: number
  unit: string
  vat_rate: number
  discount_percent: number
  total: number
}

type DocumentType = 'invoice' | 'quote'

interface DocumentFormProps {
  type: DocumentType
  initialData?: {
    id: string
    number: string
    client_id?: string
    subject?: string
    issue_date: string
    due_date?: string
    valid_until?: string
    notes?: string
    payment_terms?: string
    items: LineItem[]
    status: string
  }
}

const UNITS = ['unité', 'heure', 'jour', 'mois', 'm²', 'm³', 'kg', 'forfait', 'autre']
const VAT_RATES = [0, 5.5, 10, 20]

export default function DocumentForm({ type, initialData }: DocumentFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [clients, setClients] = useState<Client[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [profile, setProfile] = useState<any>(null)

  const [docNumber, setDocNumber] = useState(initialData?.number || '')
  const [clientId, setClientId] = useState(initialData?.client_id || '')
  const [subject, setSubject] = useState(initialData?.subject || '')
  const [issueDate, setIssueDate] = useState(initialData?.issue_date || new Date().toISOString().split('T')[0])
  const [dueDate, setDueDate] = useState(initialData?.due_date || '')
  const [validUntil, setValidUntil] = useState(initialData?.valid_until || '')
  const [notes, setNotes] = useState(initialData?.notes || '')
  const [paymentTerms, setPaymentTerms] = useState(initialData?.payment_terms || '')
  // Payment status (invoices only)
  const [paymentStatus, setPaymentStatus] = useState<'to_pay' | 'paid'>(
    initialData?.status === 'paid' ? 'paid' : 'to_pay'
  )
  const [paidAt, setPaidAt] = useState(new Date().toISOString().split('T')[0])
  const [items, setItems] = useState<LineItem[]>(
    initialData?.items || [{ description: '', quantity: 1, unit_price: 0, unit: 'unité', vat_rate: 20, discount_percent: 0, total: 0 }]
  )

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [clientsRes, productsRes, profileRes] = await Promise.all([
      supabase.from('clients').select('*').eq('user_id', user.id).eq('is_active', true).order('company_name'),
      supabase.from('products').select('*').eq('user_id', user.id).eq('is_active', true).order('name'),
      supabase.from('profiles').select('*').eq('id', user.id).single(),
    ])
    setClients(clientsRes.data || [])
    setProducts(productsRes.data || [])
    setProfile(profileRes.data)

    if (!initialData) {
      const counter = type === 'invoice' ? profileRes.data?.invoice_counter || 1 : profileRes.data?.quote_counter || 1
      const prefix = type === 'invoice' ? profileRes.data?.invoice_prefix || 'FAC' : profileRes.data?.quote_prefix || 'DEV'
      setDocNumber(generateNumber(prefix, counter))

      const terms = profileRes.data?.default_payment_terms
      if (terms && type === 'invoice') {
        const d = new Date()
        d.setDate(d.getDate() + terms)
        setDueDate(d.toISOString().split('T')[0])
      }
      if (type === 'quote') {
        const v = new Date()
        v.setDate(v.getDate() + 30)
        setValidUntil(v.toISOString().split('T')[0])
      }
    }
  }

  function calcItem(item: LineItem): LineItem {
    const base = item.quantity * item.unit_price
    const afterDiscount = base * (1 - item.discount_percent / 100)
    return { ...item, total: Math.round(afterDiscount * 100) / 100 }
  }

  function updateItem(idx: number, field: keyof LineItem, value: string | number) {
    setItems(prev => {
      const updated = [...prev]
      updated[idx] = calcItem({ ...updated[idx], [field]: value } as LineItem)
      return updated
    })
  }

  function addItem() {
    setItems(prev => [...prev, {
      description: '',
      quantity: 1,
      unit_price: 0,
      unit: 'unité',
      vat_rate: profile?.default_vat_rate || 20,
      discount_percent: 0,
      total: 0,
    }])
  }

  function removeItem(idx: number) {
    setItems(prev => prev.filter((_, i) => i !== idx))
  }

  function selectProduct(idx: number, productId: string) {
    const product = products.find(p => p.id === productId)
    if (!product) return
    setItems(prev => {
      const updated = [...prev]
      updated[idx] = calcItem({
        ...updated[idx],
        description: product.name + (product.description ? `\n${product.description}` : ''),
        unit_price: product.unit_price,
        unit: product.unit,
        vat_rate: product.vat_rate,
      })
      return updated
    })
  }

  const subtotal = items.reduce((s, i) => s + i.total, 0)
  const taxByRate = items.reduce((acc, item) => {
    const base = item.total
    const rate = item.vat_rate
    acc[rate] = (acc[rate] || 0) + base * rate / 100
    return acc
  }, {} as Record<number, number>)
  const taxTotal = Object.values(taxByRate).reduce((s, v) => s + v, 0)
  const total = subtotal + taxTotal

  async function handleSave(status: string) {
    setSaving(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      // For invoices: override status if already paid
      const finalStatus = type === 'invoice' && paymentStatus === 'paid' ? 'paid' : status

      let numberToUse = docNumber

      let docId = initialData?.id

      if (initialData) {
        // ── Mise à jour d'un document existant ──
        const docData: any = {
          client_id: clientId || null,
          number: numberToUse,
          status: finalStatus,
          issue_date: issueDate,
          subject: subject || null,
          notes: notes || null,
          payment_terms: paymentTerms || null,
          subtotal,
          tax_amount: taxTotal,
          total,
          ...(type === 'invoice' ? { due_date: dueDate || null } : { valid_until: validUntil || null }),
        }
        if (type === 'invoice' && paymentStatus === 'paid') {
          docData.paid_at = paidAt ? new Date(paidAt).toISOString() : new Date().toISOString()
        }
        const table = type === 'invoice' ? 'invoices' : 'quotes'
        const { error: updateErr } = await supabase.from(table).update(docData).eq('id', initialData.id)
        if (updateErr) throw updateErr
        const itemsTable = type === 'invoice' ? 'invoice_items' : 'quote_items'
        await supabase.from(itemsTable).delete().eq(type === 'invoice' ? 'invoice_id' : 'quote_id', initialData.id)
      } else {
        // ── Création d'un nouveau document ──
        // Recharge le compteur depuis la BDD pour éviter les doublons
        const { data: freshProfile } = await supabase
          .from('profiles')
          .select('invoice_counter, invoice_prefix, quote_counter, quote_prefix')
          .eq('id', user.id)
          .single()

        const counterField = type === 'invoice' ? 'invoice_counter' : 'quote_counter'
        const freshCounter = type === 'invoice'
          ? (freshProfile?.invoice_counter || 1)
          : (freshProfile?.quote_counter || 1)
        const freshPrefix = type === 'invoice'
          ? (freshProfile?.invoice_prefix || 'FAC')
          : (freshProfile?.quote_prefix || 'DEV')

        // Génère un numéro frais depuis la BDD et met à jour l'affichage
        numberToUse = generateNumber(freshPrefix, freshCounter)
        setDocNumber(numberToUse)

        const docData: any = {
          user_id: user.id,
          client_id: clientId || null,
          number: numberToUse,
          status: finalStatus,
          issue_date: issueDate,
          subject: subject || null,
          notes: notes || null,
          payment_terms: paymentTerms || null,
          subtotal,
          tax_amount: taxTotal,
          total,
          ...(type === 'invoice' ? { due_date: dueDate || null } : { valid_until: validUntil || null }),
        }
        if (type === 'invoice' && paymentStatus === 'paid') {
          docData.paid_at = paidAt ? new Date(paidAt).toISOString() : new Date().toISOString()
        }

        const table = type === 'invoice' ? 'invoices' : 'quotes'
        const { data: doc, error: insertErr } = await supabase.from(table).insert(docData).select().single()
        if (insertErr) {
          // Si doublon, incrémente et réessaie une fois
          if (insertErr.code === '23505') {
            const retryNumber = generateNumber(freshPrefix, freshCounter + 1)
            setDocNumber(retryNumber)
            docData.number = retryNumber
            const { data: doc2, error: insertErr2 } = await supabase.from(table).insert(docData).select().single()
            if (insertErr2) throw insertErr2
            docId = doc2.id
            await supabase.from('profiles').update({ [counterField]: freshCounter + 2 }).eq('id', user.id)
          } else {
            throw insertErr
          }
        } else {
          docId = doc.id
          // Incrémente le compteur
          await supabase.from('profiles').update({ [counterField]: freshCounter + 1 }).eq('id', user.id)
        }
      }

      // Insert items
      if (docId) {
        const itemsTable = type === 'invoice' ? 'invoice_items' : 'quote_items'
        const docKey = type === 'invoice' ? 'invoice_id' : 'quote_id'
        const itemsData = items.map((item, idx) => ({
          [docKey]: docId,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          unit: item.unit,
          vat_rate: item.vat_rate,
          discount_percent: item.discount_percent,
          total: item.total,
          sort_order: idx,
        }))
        const { error: itemsErr } = await supabase.from(itemsTable).insert(itemsData)
        if (itemsErr) throw itemsErr
      }

      router.push(type === 'invoice' ? '/invoices' : '/quotes')
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde')
    }
    setSaving(false)
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F9FC]">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            {initialData ? `Modifier ${type === 'invoice' ? 'la facture' : 'le devis'}` : `Nouvelle ${type === 'invoice' ? 'facture' : 'devis'}`}
          </h1>
          <p className="text-sm text-gray-500">{docNumber}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Annuler
          </button>
          {!(type === 'invoice' && paymentStatus === 'paid') && (
            <button
              onClick={() => handleSave('draft')}
              disabled={saving}
              className="px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Brouillon
            </button>
          )}
          <button
            onClick={() => handleSave(type === 'invoice' && paymentStatus === 'paid' ? 'paid' : 'sent')}
            disabled={saving}
            className={`px-3 py-2 text-sm text-white rounded-lg disabled:opacity-50 ${
              type === 'invoice' && paymentStatus === 'paid'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {saving ? 'Sauvegarde...' : type === 'invoice' && paymentStatus === 'paid' ? '✓ Enregistrer payée' : 'Enregistrer'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-4 sm:mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex-1 p-4 sm:p-6 space-y-4 max-w-5xl mx-auto w-full">
        {/* Header section */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              N° {type === 'invoice' ? 'Facture' : 'Devis'}
            </label>
            <input
              type="text"
              value={docNumber}
              onChange={(e) => setDocNumber(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Client</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">— Sélectionner un client —</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.type === 'company' ? c.company_name : `${c.first_name} ${c.last_name}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Objet</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ex: Travaux de plomberie"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Date d'émission</label>
            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {type === 'invoice' ? (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Date d'échéance</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Valide jusqu'au</label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          {/* Payment status — invoices only */}
          {type === 'invoice' && (
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-xs font-medium text-gray-700 mb-2">Statut de paiement</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentStatus('to_pay')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                    paymentStatus === 'to_pay'
                      ? 'border-orange-400 bg-orange-50 text-orange-700'
                      : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${paymentStatus === 'to_pay' ? 'bg-orange-400' : 'bg-gray-300'}`} />
                  À payer
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentStatus('paid')}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                    paymentStatus === 'paid'
                      ? 'border-green-400 bg-green-50 text-green-700'
                      : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${paymentStatus === 'paid' ? 'bg-green-400' : 'bg-gray-300'}`} />
                  Déjà payée
                </button>
              </div>
              {paymentStatus === 'paid' && (
                <div className="mt-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Date de paiement</label>
                  <input
                    type="date"
                    value={paidAt}
                    onChange={(e) => setPaidAt(e.target.value)}
                    className="w-full sm:w-48 px-3 py-2 text-sm border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-green-50"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Items */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Lignes</h2>
          </div>

          {/* Desktop header */}
          <div className="hidden lg:grid grid-cols-12 gap-2 px-5 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
            <div className="col-span-4">Description</div>
            <div className="col-span-1 text-center">Qté</div>
            <div className="col-span-1 text-center">Unité</div>
            <div className="col-span-2 text-right">P.U. HT</div>
            <div className="col-span-1 text-center">TVA %</div>
            <div className="col-span-1 text-center">Remise %</div>
            <div className="col-span-1 text-right">Total HT</div>
            <div className="col-span-1 text-center">Action</div>
          </div>

          <div className="divide-y divide-gray-100">
            {items.map((item, idx) => (
              <div key={idx} className="p-4 lg:p-0">
                {/* Product selector */}
                <div className="mb-3 lg:hidden">
                  <select
                    onChange={(e) => selectProduct(idx, e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-500"
                    defaultValue=""
                  >
                    <option value="" disabled>Sélectionner un produit...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                <div className="hidden lg:grid grid-cols-12 gap-2 px-5 py-3 items-start">
                  <div className="col-span-4">
                    <div className="flex gap-1 mb-1">
                      <select
                        onChange={(e) => selectProduct(idx, e.target.value)}
                        className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded text-gray-400 bg-gray-50"
                        defaultValue=""
                      >
                        <option value="" disabled>+ Produit</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                    <textarea
                      value={item.description}
                      onChange={(e) => updateItem(idx, 'description', e.target.value)}
                      placeholder="Description..."
                      rows={2}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                    />
                  </div>
                  <div className="col-span-1">
                    <input type="number" min="0" step="0.001" value={item.quantity}
                      onChange={(e) => updateItem(idx, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-2 text-sm text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="col-span-1">
                    <select value={item.unit} onChange={(e) => updateItem(idx, 'unit', e.target.value)}
                      className="w-full px-1 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500">
                      {UNITS.map(u => <option key={u}>{u}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <input type="number" min="0" step="0.01" value={item.unit_price}
                      onChange={(e) => updateItem(idx, 'unit_price', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-2 text-sm text-right border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="col-span-1">
                    <select value={item.vat_rate} onChange={(e) => updateItem(idx, 'vat_rate', parseFloat(e.target.value))}
                      className="w-full px-1 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500">
                      {VAT_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
                    </select>
                  </div>
                  <div className="col-span-1">
                    <input type="number" min="0" max="100" step="0.1" value={item.discount_percent}
                      onChange={(e) => updateItem(idx, 'discount_percent', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-2 text-sm text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="col-span-1 flex items-center justify-end">
                    <span className="text-sm font-semibold text-gray-900">{formatCurrency(item.total)}</span>
                  </div>
                  <div className="col-span-1 flex items-center justify-center">
                    <button onClick={() => removeItem(idx)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Mobile item */}
                <div className="lg:hidden grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="text-xs text-gray-500">Description</label>
                    <textarea value={item.description} onChange={(e) => updateItem(idx, 'description', e.target.value)}
                      placeholder="Description..." rows={2}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Quantité</label>
                    <input type="number" min="0" step="0.001" value={item.quantity}
                      onChange={(e) => updateItem(idx, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Prix unitaire HT</label>
                    <input type="number" min="0" step="0.01" value={item.unit_price}
                      onChange={(e) => updateItem(idx, 'unit_price', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">TVA</label>
                    <select value={item.vat_rate} onChange={(e) => updateItem(idx, 'vat_rate', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white mt-1">
                      {VAT_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
                    </select>
                  </div>
                  <div className="flex items-end justify-between col-span-2">
                    <span className="text-sm font-bold text-gray-900">Total HT : {formatCurrency(item.total)}</span>
                    <button onClick={() => removeItem(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="px-5 py-4 border-t border-gray-100">
            <button
              onClick={addItem}
              className="inline-flex items-center gap-2 text-sm text-indigo-600 font-medium hover:text-indigo-800"
            >
              <PlusIcon className="w-4 h-4" />
              Ajouter une ligne
            </button>
          </div>

          {/* Totals */}
          <div className="border-t border-gray-200 px-5 py-4 bg-gray-50/50">
            <div className="max-w-xs ml-auto space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sous-total HT</span>
                <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
              </div>
              {Object.entries(taxByRate).filter(([, v]) => v > 0).map(([rate, amount]) => (
                <div key={rate} className="flex justify-between text-sm">
                  <span className="text-gray-600">TVA {rate}%</span>
                  <span className="text-gray-900">{formatCurrency(amount)}</span>
                </div>
              ))}
              <div className="flex justify-between text-base font-bold border-t border-gray-300 pt-2">
                <span className="text-gray-900">Total TTC</span>
                <span className="text-indigo-700">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Notes & conditions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes visibles sur le document..."
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Conditions de paiement</label>
              <textarea
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                placeholder="Ex: Virement bancaire à 30 jours..."
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Save buttons (bottom) */}
        <div className="flex flex-col sm:flex-row gap-3 pb-6">
          <button onClick={() => router.back()} className="flex-1 sm:flex-none px-5 py-3 border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50">
            Annuler
          </button>
          <div className="flex-1 sm:flex-none sm:ml-auto flex gap-3">
            {!(type === 'invoice' && paymentStatus === 'paid') && (
              <button onClick={() => handleSave('draft')} disabled={saving}
                className="flex-1 px-5 py-3 border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 disabled:opacity-50">
                Sauver brouillon
              </button>
            )}
            <button
              onClick={() => handleSave(type === 'invoice' && paymentStatus === 'paid' ? 'paid' : 'sent')}
              disabled={saving}
              className={`flex-1 px-5 py-3 text-white text-sm font-semibold rounded-xl disabled:opacity-50 ${
                type === 'invoice' && paymentStatus === 'paid'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {saving ? 'Sauvegarde...' : type === 'invoice' && paymentStatus === 'paid' ? '✓ Enregistrer payée' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
