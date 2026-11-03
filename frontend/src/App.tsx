import { useCallback, useEffect, useRef, useState } from 'react'
import { Dashboard } from './components/Dashboard'
import { HistoryTable } from './components/HistoryTable'
import { RequestDetail } from './components/RequestDetail'
import { approveRequest, fetchRequests, isMockMode, rejectRequest } from './services/api'
import type { Filter, Request } from './types'

const REFRESH_INTERVAL_MS = 15_000

export default function App() {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  // Brouillons modifiés localement, par demande : non écrasés par le rafraîchissement automatique.
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const fetching = useRef(false)

  const load = useCallback(async () => {
    if (fetching.current) return
    fetching.current = true
    try {
      const data = await fetchRequests()
      setRequests(data)
      setLoadError(null)
      setLastUpdated(new Date().toISOString())
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Impossible de charger les demandes.')
    } finally {
      fetching.current = false
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
    const timer = window.setInterval(() => void load(), REFRESH_INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [load])

  const selected = requests.find((r) => r.id === selectedId) ?? null
  const draft = selected ? (drafts[selected.id] ?? selected.analysis?.draft_reply ?? '') : ''

  const clearDraft = (id: string) =>
    setDrafts((d) => {
      const { [id]: _removed, ...rest } = d
      return rest
    })

  const patchStatus = (id: string, status: Request['status']) =>
    setRequests((list) => list.map((r) => (r.id === id ? { ...r, status } : r)))

  async function handleApprove() {
    if (!selected) return
    const { id, status: previous } = selected
    patchStatus(id, 'sending')
    try {
      await approveRequest(id, draft)
    } catch (e) {
      patchStatus(id, previous)
      throw e
    }
    clearDraft(id)
    await load()
  }

  async function handleReject() {
    if (!selected) return
    await rejectRequest(selected.id)
    clearDraft(selected.id)
    await load()
  }

  return (
    <div className="app">
      <a href="#main" className="skip-link">
        Aller au contenu principal
      </a>
      <header className="topbar">
        <div className="topbar__brand">
          <span className="logo" aria-hidden="true">
            B
          </span>
          <div>
            <h1>BizPilot AI</h1>
            <p className="topbar__subtitle">Assistant de gestion des demandes clients</p>
          </div>
        </div>
        <div className="topbar__status">
          {isMockMode && <span className="mock-pill">Mode démo</span>}
          <span className="refresh-info" aria-live="polite">
            {lastUpdated
              ? `Mis à jour à ${new Date(lastUpdated).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
              : 'Chargement…'}
          </span>
          <button type="button" className="btn btn--light" onClick={() => void load()}>
            Actualiser
          </button>
        </div>
      </header>

      <main id="main" className="layout">
        {loadError && (
          <div className="alert alert--error layout__full" role="alert">
            {loadError} Nouvelle tentative automatique dans 15 secondes.
          </div>
        )}

        <div className="layout__main">
          <Dashboard
            requests={requests}
            filter={filter}
            onFilterChange={setFilter}
            selectedId={selectedId}
            onSelect={setSelectedId}
            loading={loading}
          />
          {selected && <HistoryTable history={selected.history} />}
        </div>

        <aside className="layout__side" aria-label="Détail de la demande">
          {selected ? (
            <RequestDetail
              key={selected.id}
              request={selected}
              draft={draft}
              onDraftChange={(v) => setDrafts((d) => ({ ...d, [selected.id]: v }))}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ) : (
            <div className="card placeholder">
              <p>Sélectionnez une demande dans la liste pour afficher son détail.</p>
            </div>
          )}
        </aside>
      </main>
    </div>
  )
}
