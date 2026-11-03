import type { HistoryEntry } from '../types'
import { formatDate } from '../utils/format'

export function HistoryTable({ history }: { history: HistoryEntry[] }) {
  const sorted = [...history].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())

  return (
    <section className="card history" aria-labelledby="history-title">
      <h2 id="history-title" className="section-title">
        Historique
      </h2>
      <div className="table-wrap">
        <table className="table">
          <caption className="visually-hidden">Historique des actions de la demande sélectionnée</caption>
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Action</th>
              <th scope="col">Statut</th>
              <th scope="col">Détail</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={4} className="empty">
                  Aucune action enregistrée.
                </td>
              </tr>
            ) : (
              sorted.map((h, i) => (
                <tr key={`${h.at}-${i}`}>
                  <td data-label="Date">
                    <time dateTime={h.at}>{formatDate(h.at)}</time>
                  </td>
                  <td data-label="Action">{h.action}</td>
                  <td data-label="Statut">
                    <span className={`history-status history-status--${h.status}`}>{h.status}</span>
                  </td>
                  <td data-label="Détail">{h.detail}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
