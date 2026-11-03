export type RequestStatus = 'to_validate' | 'sending' | 'sent' | 'rejected' | 'error'

export type Priority = 'low' | 'medium' | 'high' | (string & {})

export interface ExtractedFields {
  property_type: string | null
  city: string | null
  max_budget_eur: number | null
  preferred_period: string | null
}

export interface Analysis {
  summary: string
  category: string
  priority: Priority
  extracted: ExtractedFields
  missing_information: string[]
  draft_reply: string
  suggested_action: string
  requires_human_approval: boolean
}

export interface HistoryEntry {
  at: string
  action: string
  status: string
  detail: string
}

export interface Request {
  id: string
  channel: string
  from: string
  replyTo: string
  subject: string
  receivedAt: string
  body: string
  analysis: Analysis | null
  status: RequestStatus
  error: string | null
  history: HistoryEntry[]
}

export interface RequestsResponse {
  requests: Request[]
}

export type ApproveResponse = { ok: true } | { error: string }
export type RejectResponse = { ok: true } | { error: string }

export type Filter = 'all' | 'to_validate' | 'processed' | 'error'
