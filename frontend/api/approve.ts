import { badRequest, methodNotAllowed, readJsonBody, relayToN8n } from './_n8n.js'

// POST /api/approve { id, draft_reply } -> n8n POST /webhook/bizpilot-approve
export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'POST') return methodNotAllowed('POST')

    const body = await readJsonBody(request)
    const id = body?.id
    const draftReply = body?.draft_reply
    if (typeof id !== 'string' || !id.trim()) return badRequest('Champ "id" manquant ou invalide.')
    if (typeof draftReply !== 'string' || !draftReply.trim()) {
      return badRequest('Champ "draft_reply" manquant ou vide.')
    }

    return relayToN8n('/webhook/bizpilot-approve', {
      method: 'POST',
      body: JSON.stringify({ id, draft_reply: draftReply }),
    })
  },
}
