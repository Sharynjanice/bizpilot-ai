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

// Valeurs produites par le prompt Claude du workflow n8n (nœud « Preparer analyse »).
const CATEGORY_LABELS: Record<string, string> = {
  property_search: 'Recherche de bien',
  visit_request: 'Demande de visite',
  information: 'Demande d’information',
  to_review: 'À examiner',
}

export function categoryLabel(category: string | undefined | null): string {
  if (!category) return 'Non analysée'
  return CATEGORY_LABELS[category] ?? category.charAt(0).toUpperCase() + category.slice(1).replace(/_/g, ' ')
}

const PRIORITY_LABELS: Record<string, string> = { low: 'Basse', normal: 'Normale', high: 'Haute' }
export function priorityLabel(p: string): string {
  return PRIORITY_LABELS[p] ?? p
}

const ACTION_LABELS: Record<string, string> = {
  prepare_visit: 'Préparer une visite',
  reply_only: 'Répondre uniquement',
  review: 'À examiner',
}
export function actionLabel(a: string): string {
  return ACTION_LABELS[a] ?? a
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
