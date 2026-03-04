export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'refused' | 'expired' | 'invoiced'
export type PaymentMethod = 'virement' | 'espèces' | 'chèque' | 'carte' | 'prélèvement' | 'autre'
export type ClientType = 'company' | 'individual'

export interface Profile {
  id: string
  email: string
  company_name?: string
  first_name?: string
  last_name?: string
  phone?: string
  address?: string
  city?: string
  postal_code?: string
  country: string
  siret?: string
  vat_number?: string
  logo_url?: string
  bank_iban?: string
  bank_bic?: string
  bank_name?: string
  invoice_prefix: string
  invoice_counter: number
  quote_prefix: string
  quote_counter: number
  default_payment_terms: number
  default_vat_rate: number
  currency: string
  footer_text?: string
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  user_id: string
  type: ClientType
  company_name?: string
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  postal_code?: string
  country: string
  siret?: string
  vat_number?: string
  notes?: string
  logo_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  user_id: string
  name: string
  description?: string
  reference?: string
  unit_price: number
  unit: string
  vat_rate: number
  category?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Invoice {
  id: string
  user_id: string
  client_id?: string
  number: string
  status: InvoiceStatus
  issue_date: string
  due_date?: string
  subject?: string
  subtotal: number
  discount_percent: number
  discount_amount: number
  tax_amount: number
  total: number
  notes?: string
  payment_terms?: string
  currency: string
  paid_at?: string
  sent_at?: string
  created_at: string
  updated_at: string
  client?: Client
  items?: InvoiceItem[]
}

export interface InvoiceItem {
  id: string
  invoice_id: string
  product_id?: string
  description: string
  quantity: number
  unit_price: number
  unit: string
  vat_rate: number
  discount_percent: number
  total: number
  sort_order: number
  created_at: string
}

export interface Quote {
  id: string
  user_id: string
  client_id?: string
  number: string
  status: QuoteStatus
  issue_date: string
  valid_until?: string
  subject?: string
  subtotal: number
  discount_percent: number
  discount_amount: number
  tax_amount: number
  total: number
  notes?: string
  payment_terms?: string
  currency: string
  accepted_at?: string
  refused_at?: string
  sent_at?: string
  converted_invoice_id?: string
  created_at: string
  updated_at: string
  client?: Client
  items?: QuoteItem[]
}

export interface QuoteItem {
  id: string
  quote_id: string
  product_id?: string
  description: string
  quantity: number
  unit_price: number
  unit: string
  vat_rate: number
  discount_percent: number
  total: number
  sort_order: number
  created_at: string
}

export interface Payment {
  id: string
  invoice_id: string
  user_id: string
  amount: number
  payment_date: string
  method: PaymentMethod
  reference?: string
  notes?: string
  created_at: string
}

export interface DashboardStats {
  totalRevenue: number
  totalPaid: number
  totalPending: number
  totalOverdue: number
  invoiceCount: number
  quoteCount: number
  clientCount: number
  recentInvoices: Invoice[]
}
