/**
 * Relais serveur vers n8n. Exécuté uniquement côté Vercel (jamais dans le navigateur).
 * Les fichiers préfixés par "_" ne sont pas exposés comme routes par Vercel.
 *
 * Ne journalise jamais le contenu des requêtes / réponses (e-mails clients).
 */

const TIMEOUT_MS = 25_000

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  })
}

export function methodNotAllowed(allowed: string): Response {
  const res = json(405, { error: `Méthode non autorisée. Utilisez ${allowed}.` })
  res.headers.set('Allow', allowed)
  return res
}

export async function relayToN8n(path: string, init: { method: 'GET' | 'POST'; body?: string }): Promise<Response> {
  const baseUrl = process.env.N8N_BASE_URL
  const apiKey = process.env.N8N_API_KEY
  if (!baseUrl || !apiKey) {
    return json(500, { error: 'Configuration serveur incomplète (N8N_BASE_URL / N8N_API_KEY).' })
  }

  const url = baseUrl.replace(/\/+$/, '') + path
  const headers: Record<string, string> = { 'x-api-key': apiKey, Accept: 'application/json' }
  if (init.body !== undefined) headers['Content-Type'] = 'application/json'

  let upstream: Response
  try {
    upstream = await fetch(url, {
      method: init.method,
      headers,
      body: init.body,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
  } catch (e) {
    const timedOut = e instanceof Error && (e.name === 'TimeoutError' || e.name === 'AbortError')
    return json(timedOut ? 504 : 502, {
      error: timedOut ? 'Le service n8n ne répond pas (délai dépassé).' : 'Impossible de joindre le service n8n.',
    })
  }

  // Renvoie le statut et le JSON reçus de n8n.
  const text = await upstream.text()
  let data: unknown
  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    return json(upstream.ok ? 502 : upstream.status, {
      error: `Réponse invalide du service n8n (statut ${upstream.status}).`,
    })
  }
  return json(upstream.status, data)
}

/** Lit le corps JSON de la requête entrante ; renvoie null s'il est invalide. */
export async function readJsonBody(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await request.json()
    return body && typeof body === 'object' && !Array.isArray(body) ? (body as Record<string, unknown>) : null
  } catch {
    return null
  }
}

export function badRequest(message: string): Response {
  return json(400, { error: message })
}
