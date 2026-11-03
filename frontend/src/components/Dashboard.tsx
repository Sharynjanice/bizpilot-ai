import type { Filter, Request } from '../types'
import { categoryLabel, formatDate, isNew, isProcessed, matchesFilter } from '../utils/format'
import { StatusBadge } from './StatusBadge'

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Toutes' },
  { value: 'to_validate', label: 'À valider' },
  { value: 'processed', label: 'Traitées' },
  { value: 'error', label: 'Erreur' },
]

interface Props {
  requests: Request[]
  filter: Filter
  onFilterChange: (f: Filter) => void
  selectedId: string | null
  onSelect: (id: string) => void
  loading: boolean
}

export function Dashboard({ requests, filter, onFilterChange, selectedId, onSelect, loading }: Props) {
  const counters = [
    { key: 'new', label: 'Nouvelles', value: requests.filter(isNew).length },
    { key: 'to_validate', label: 'À valider', value: requests.filter((r) => matchesFilter(r, 'to_validate')).length },
    { key: 'processed', label: 'Traitées', value: requests.filter(isProcessed).length },
    { key: 'error', label: 'En erreur', value: requests.filter((r) => r.status === 'error').length },
  ]

  const visible = requests
    .filter((r) => matchesFilter(r, filter))
    .sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime())

  return (
    <section className="card dashboard" aria-labelledby="dashboard-title">
      <h2 id="dashboard-title" className="section-title">
        Tableau de bord
      </h2>

      <ul className="counters" aria-label="Compteurs des demandes">
        {counters.map((c) => (
          <li key={c.key} className={`counter counter--${c.key}`}>
            <span className="counter__value">{c.value}</span>
            <span className="counter__label">{c.label}</span>
          </li>
        ))}
      </ul>

      <div className="filters" role="group" aria-label="Filtrer les demandes">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            className="filter-btn"
            aria-pressed={filter === f.value}
            onClick={() => onFilterChange(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="table-wrap">
        <table className="table requests-table">
          <caption className="visually-hidden">
            Liste des demandes clients ({visible.length}). Sélectionnez une ligne pour afficher le détail.
          </caption>
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">Expéditeur</th>
              <th scope="col">Objet</th>
              <th scope="col">Catégorie</th>
              <th scope="col">Statut</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td colSpan={5} className="empty">
                  {loading ? 'Chargement des demandes…' : 'Aucune demande pour ce filtre.'}
                </td>
              </tr>
            )}
            {visible.map((r) => {
              const selected = r.id === selectedId
              return (
                <tr
                  key={r.id}
                  className={selected ? 'is-selected' : undefined}
                  onClick={() => onSelect(r.id)}
                >
                  <td data-label="Date">
                    <time dateTime={r.receivedAt}>{formatDate(r.receivedAt)}</time>
                  </td>
                  <td data-label="Expéditeur" className="cell-truncate">
                    {r.from}
                  </td>
                  <td data-label="Objet">
                    <button
                      type="button"
                      className="link-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelect(r.id)
                      }}
                      aria-current={selected ? 'true' : undefined}
                    >
                      {r.subject || '(sans objet)'}
                    </button>
                  </td>
                  <td data-label="Catégorie">{categoryLabel(r.analysis?.category)}</td>
                  <td data-label="Statut">
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
