import type { ApproveResponse, RejectResponse, Request, RequestsResponse } from '../types'
import { createMockRequests } from '../mocks/requests'

/**
 * Le navigateur n'appelle QUE les routes /api/* de l'application.
 * Ces routes (fonctions serverless dans /api) relaient vers n8n côté serveur.
 * Aucune clé ni URL n8n n'est présente dans ce code.
 */

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export class ApiError extends Error {
  readonly status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function parseJson(res: Response): Promise<unknown> {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

function errorMessage(data: unknown, fallback: string): string {
  if (data && typeof data === 'object' && 'error' in data) {
    const err = (data as { error: unknown }).error
    if (typeof err === 'string' && err.trim()) return err
  }
  return fallback
}

async function postJson<T>(url: string, payload: unknown): Promise<T> {
  let res: Response
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    throw new ApiError('Impossible de joindre le serveur. Vérifiez votre connexion.', 0)
  }
  const data = await parseJson(res)
  if (!res.ok) {
    throw new ApiError(errorMessage(data, `Le serveur a répondu avec une erreur (${res.status}).`), res.status)
  }
  if (data && typeof data === 'object' && 'error' in data) {
    throw new ApiError(errorMessage(data, 'Erreur inconnue.'), res.status)
  }
  return data as T
}

// ---------- Mode mock (aucun appel réseau) ----------

let mockStore: Request[] | null = null
const getMockStore = () => (mockStore ??= createMockRequests())
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

function updateMock(id: string, patch: (r: Request) => Request) {
  mockStore = getMockStore().map((r) => (r.id === id ? patch(r) : r))
}

// ---------- API publique ----------

export async function fetchRequests(): Promise<Request[]> {
  if (USE_MOCK) {
    await delay(200)
    return structuredClone(getMockStore())
  }
  let res: Response
  try {
    res = await fetch('/api/requests', { headers: { Accept: 'application/json' } })
  } catch {
    throw new ApiError('Impossible de joindre le serveur. Vérifiez votre connexion.', 0)
  }
  const data = await parseJson(res)
  if (!res.ok) {
    throw new ApiError(errorMessage(data, `Impossible de charger les demandes (${res.status}).`), res.status)
  }
  const requests = (data as Partial<RequestsResponse> | null)?.requests
  return Array.isArray(requests) ? requests : []
}

export async function approveRequest(id: string, draftReply: string): Promise<ApproveResponse> {
  if (USE_MOCK) {
    await delay(800)
    const at = new Date().toISOString()
    updateMock(id, (r) => ({
      ...r,
      status: 'sent',
      error: null,
      analysis: r.analysis ? { ...r.analysis, draft_reply: draftReply } : r.analysis,
      history: [
        ...r.history,
        { at, action: 'Approbation', status: 'ok', detail: 'Réponse approuvée (mode démo)' },
        { at, action: 'Envoi', status: 'sent', detail: 'Réponse envoyée (mode démo)' },
      ],
    }))
    return { ok: true }
  }
  return postJson<ApproveResponse>('/api/approve', { id, draft_reply: draftReply })
}

export async function rejectRequest(id: string): Promise<RejectResponse> {
  if (USE_MOCK) {
    await delay(400)
    updateMock(id, (r) => ({
      ...r,
      status: 'rejected',
      history: [
        ...r.history,
        { at: new Date().toISOString(), action: 'Rejet', status: 'rejected', detail: 'Rejeté (mode démo)' },
      ],
    }))
    return { ok: true }
  }
  return postJson<RejectResponse>('/api/reject', { id })
}

export const isMockMode = USE_MOCK
