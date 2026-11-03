import { useId, useRef, useState } from 'react'
import type { Request } from '../types'
import { actionLabel, categoryLabel, formatDate, formatEuro, priorityLabel } from '../utils/format'
import { ConfirmDialog } from './ConfirmDialog'
import { StatusBadge } from './StatusBadge'

interface Props {
  request: Request
  draft: string
  onDraftChange: (value: string) => void
  onApprove: () => Promise<void>
  onReject: () => Promise<void>
}

type Pending = 'approve' | 'reject' | null

export function RequestDetail({ request, draft, onDraftChange, onApprove, onReject }: Props) {
  const [pending, setPending] = useState<Pending>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
  const draftId = useId()
  const inFlight = useRef(false)

  const { analysis } = request
  const canAct = request.status === 'to_validate' || request.status === 'error'
  const busy = pending !== null
  const approveDisabled = busy || !canAct || !analysis || draft.trim().length === 0

  async function run(kind: Exclude<Pending, null>) {
    if (inFlight.current) return // garde anti double clic (synchrone)
    inFlight.current = true
    setPending(kind)
    setActionError(null)
    setActionSuccess(null)
    try {
      if (kind === 'approve') {
        await onApprove()
        setActionSuccess('La réponse a bien été envoyée.')
      } else {
        await onReject()
        setActionSuccess('La demande a été rejetée.')
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erreur inconnue.'
      setActionError(
        kind === 'approve'
          ? `L’envoi de la réponse a échoué : ${msg} Votre brouillon est conservé, vous pouvez réessayer.`
          : `Le rejet de la demande a échoué : ${msg}`,
      )
    } finally {
      inFlight.current = false
      setPending(null)
    }
  }

  const extracted = analysis?.extracted
  const fields: { label: string; value: string | null }[] = [
    { label: 'Type de bien', value: extracted?.property_type ?? null },
    { label: 'Ville', value: extracted?.city ?? null },
    { label: 'Budget max.', value: formatEuro(extracted?.max_budget_eur ?? null) },
    { label: 'Période souhaitée', value: extracted?.preferred_period ?? null },
  ]

  return (
    <article className="card detail" aria-labelledby="detail-title">
      <header className="detail__header">
        <div>
          <h2 id="detail-title" className="detail__title">
            {request.subject || '(sans objet)'}
          </h2>
          <p className="detail__meta">
            De <strong>{request.from}</strong> · <time dateTime={request.receivedAt}>{formatDate(request.receivedAt)}</time>{' '}
            · {request.channel}
          </p>
        </div>
        <StatusBadge status={request.status} />
      </header>

      {request.status === 'error' && request.error && (
        <div className="alert alert--error" role="alert">
          <strong>Erreur :</strong> {request.error}
        </div>
      )}

      <section className="detail__section" aria-labelledby="original-title">
        <h3 id="original-title">Message original</h3>
        <div className="original-message" tabIndex={0} aria-label="Message original">
          {request.body}
        </div>
      </section>

      {!analysis ? (
        <div className="alert alert--info" role="status">
          Cette demande n’a pas encore été analysée par l’IA.
        </div>
      ) : (
        <>
          <section className="detail__section" aria-labelledby="summary-title">
            <h3 id="summary-title">Résumé IA</h3>
            <p className="summary">{analysis.summary}</p>
            <dl className="tags">
              <div>
                <dt>Catégorie</dt>
                <dd>
                  <span className="tag tag--category">{categoryLabel(analysis.category)}</span>
                </dd>
              </div>
              <div>
                <dt>Priorité</dt>
                <dd>
                  <span className={`tag tag--priority-${analysis.priority}`}>{priorityLabel(analysis.priority)}</span>
                </dd>
              </div>
              <div>
                <dt>Action suggérée</dt>
                <dd>{actionLabel(analysis.suggested_action)}</dd>
              </div>
            </dl>
          </section>

          <section className="detail__section" aria-labelledby="extracted-title">
            <h3 id="extracted-title">Champs extraits</h3>
            <dl className="fields">
              {fields.map((f) => (
                <div key={f.label} className="field">
                  <dt>{f.label}</dt>
                  <dd className={f.value ? undefined : 'muted'}>{f.value ?? 'Non renseigné'}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="detail__section" aria-labelledby="missing-title">
            <h3 id="missing-title">Informations manquantes</h3>
            {analysis.missing_information.length === 0 ? (
              <p className="muted">Aucune information manquante.</p>
            ) : (
              <ul className="missing-list">
                {analysis.missing_information.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            )}
          </section>

          <section className="detail__section" aria-labelledby="draft-title">
            <h3 id="draft-title">
              <label htmlFor={draftId}>Brouillon de réponse</label>
            </h3>
            <p className="hint" id={`${draftId}-hint`}>
              Destinataire : {request.replyTo}. Vous pouvez modifier le texte avant l’envoi.
            </p>
            <textarea
              id={draftId}
              className="draft"
              rows={10}
              value={draft}
              onChange={(e) => onDraftChange(e.target.value)}
              disabled={busy || !canAct}
              aria-describedby={`${draftId}-hint`}
            />
          </section>
        </>
      )}

      <div aria-live="polite" className="detail__feedback">
        {actionError && (
          <div className="alert alert--error" role="alert">
            {actionError}
          </div>
        )}
        {actionSuccess && <div className="alert alert--success">{actionSuccess}</div>}
      </div>

      <div className="detail__actions">
        <button
          type="button"
          className="btn btn--ghost btn--danger"
          onClick={() => run('reject')}
          disabled={busy || !canAct}
          aria-busy={pending === 'reject'}
        >
          {pending === 'reject' ? 'Rejet…' : 'Rejeter'}
        </button>
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => setConfirmOpen(true)}
          disabled={approveDisabled}
          aria-busy={pending === 'approve'}
        >
          {pending === 'approve' ? (
            <>
              <span className="spinner" aria-hidden="true" /> Envoi en cours…
            </>
          ) : (
            'Approuver et envoyer'
          )}
        </button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Confirmer l’envoi"
        message={`La réponse sera envoyée à ${request.replyTo}. Cette action est définitive. Voulez-vous continuer ?`}
        confirmLabel="Envoyer la réponse"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false)
          void run('approve')
        }}
      />
    </article>
  )
}
