import { methodNotAllowed, relayToN8n } from './_n8n.js'

// GET /api/requests -> n8n GET /webhook/bizpilot-requests
export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'GET') return methodNotAllowed('GET')
    return relayToN8n('/webhook/bizpilot-requests', { method: 'GET' })
  },
}
