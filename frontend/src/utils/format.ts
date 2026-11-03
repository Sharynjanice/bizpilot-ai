import type { Filter, Request, RequestStatus } from '../types'

const dateFmt = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
const euroFmt = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })

export function formatDate(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : dateFmt.format(d)
}

export function formatEuro(value: number | null): string | null {
  return value == null ? null : euroFmt.format(value)
}

export const STATUS_LABELS: Record<RequestStatus, string> = {
  to_validate: 'À valider',
  sending: 'Envoi en cours',
  sent: 'Envoyée',
  rejected: 'Rejetée',
  error: 'Erreur',
}

const CATEGORY_LABELS: Record<string, string> = {
  achat: 'Achat',
  vente: 'Vente',
  location: 'Location',
  estimation: 'Estimation',
  gestion: 'Gestion locative',
  hors_sujet: 'Hors sujet',
  autre: 'Autre',
}

export function categoryLabel(category: string | undefined | null): string {
  if (!category) return 'Non analysée'
  return CATEGORY_LABELS[category] ?? category.charAt(0).toUpperCase() + category.slice(1).replace(/_/g, ' ')
}

const PRIORITY_LABELS: Record<string, string> = { low: 'Basse', medium: 'Moyenne', high: 'Haute' }
export function priorityLabel(p: string): string {
  return PRIORITY_LABELS[p] ?? p
}

/** « Nouvelle » = reçue au cours des dernières 24 heures. */
export function isNew(r: Request): boolean {
  const t = new Date(r.receivedAt).getTime()
  return Date.now() - t < 24 * 3600_000
}

export function isProcessed(r: Request): boolean {
  return r.status === 'sent' || r.status === 'rejected'
}

export function matchesFilter(r: Request, f: Filter): boolean {
  switch (f) {
    case 'all':
      return true
    case 'to_validate':
      return r.status === 'to_validate' || r.status === 'sending'
    case 'processed':
      return isProcessed(r)
    case 'error':
      return r.status === 'error'
  }
}
