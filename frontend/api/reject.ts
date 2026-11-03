import { badRequest, methodNotAllowed, readJsonBody, relayToN8n } from './_n8n.js'

// POST /api/reject { id } -> n8n POST /webhook/bizpilot-reject
export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'POST') return methodNotAllowed('POST')

    const body = await readJsonBody(request)
    const id = body?.id
    if (typeof id !== 'string' || !id.trim()) return badRequest('Champ "id" manquant ou invalide.')

    return relayToN8n('/webhook/bizpilot-reject', {
      method: 'POST',
      body: JSON.stringify({ id }),
    })
  },
}
