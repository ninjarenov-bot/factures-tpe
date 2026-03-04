'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import DocumentForm from '@/components/DocumentForm'

export default function NewInvoicePage() {
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')
  const [initialData, setInitialData] = useState<any>(undefined)
  const [loading, setLoading] = useState(!!editId)

  useEffect(() => {
    if (!editId) return
    const supabase = createClient()
    supabase
      .from('invoices')
      .select('*, items:invoice_items(*)')
      .eq('id', editId)
      .single()
      .then(({ data }) => {
        if (data) {
          const sorted = (data.items || []).sort((a: any, b: any) => a.sort_order - b.sort_order)
          setInitialData({
            id: data.id,
            number: data.number,
            client_id: data.client_id,
            subject: data.subject,
            issue_date: data.issue_date,
            due_date: data.due_date,
            notes: data.notes,
            payment_terms: data.payment_terms,
            status: data.status,
            items: sorted.map((item: any) => ({
              id: item.id,
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unit_price,
              unit: item.unit,
              vat_rate: item.vat_rate,
              discount_percent: item.discount_percent || 0,
              total: item.total,
            })),
          })
        }
        setLoading(false)
      })
  }, [editId])

  if (loading) return (
    <div className="flex-1 flex items-center justify-center py-16">
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return <DocumentForm type="invoice" initialData={initialData} />
}
