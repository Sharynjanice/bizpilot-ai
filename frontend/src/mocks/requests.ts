import type { Request } from '../types'

const now = Date.now()
const minutesAgo = (m: number) => new Date(now - m * 60_000).toISOString()

export function createMockRequests(): Request[] {
  return [
    {
      id: 'req-001',
      channel: 'email',
      from: 'Claire Martin <claire.martin@example.com>',
      replyTo: 'claire.martin@example.com',
      subject: 'Recherche appartement T3 à Lyon',
      receivedAt: minutesAgo(12),
      body:
        "Bonjour,\n\nNous recherchons un appartement T3 à Lyon (idéalement 6e ou 3e arrondissement) avec un budget maximum de 350 000 €. " +
        "Nous aimerions emménager en septembre.\n\nPouvez-vous nous proposer des visites ?\n\nCordialement,\nClaire Martin",
      analysis: {
        summary:
          'Couple à la recherche d’un T3 à Lyon (6e ou 3e), budget max 350 000 €, emménagement souhaité en septembre. Demande de visites.',
        category: 'achat',
        priority: 'high',
        extracted: {
          property_type: 'Appartement T3',
          city: 'Lyon',
          max_budget_eur: 350000,
          preferred_period: 'Septembre',
        },
        missing_information: [],
        draft_reply:
          "Bonjour Madame Martin,\n\nMerci pour votre message. Nous avons actuellement plusieurs T3 dans les 3e et 6e arrondissements de Lyon correspondant à votre budget de 350 000 €.\n\n" +
          "Seriez-vous disponible cette semaine pour une première visite ?\n\nBien cordialement,\nL’équipe de l’agence",
        suggested_action: 'Proposer des créneaux de visite',
        requires_human_approval: true,
      },
      status: 'to_validate',
      error: null,
      history: [
        { at: minutesAgo(12), action: 'Réception', status: 'ok', detail: 'E-mail reçu' },
        { at: minutesAgo(11), action: 'Analyse IA', status: 'ok', detail: 'Catégorie : achat, priorité haute' },
      ],
    },
    {
      id: 'req-002',
      channel: 'email',
      from: 'Karim Benali <k.benali@example.com>',
      replyTo: 'k.benali@example.com',
      subject: 'Location maison',
      receivedAt: minutesAgo(48),
      body: "Bonjour, je cherche une maison à louer. Merci de me recontacter.\nKarim",
      analysis: {
        summary: 'Recherche d’une maison en location, sans précision de ville, de budget ni de date.',
        category: 'location',
        priority: 'medium',
        extracted: {
          property_type: 'Maison',
          city: null,
          max_budget_eur: null,
          preferred_period: null,
        },
        missing_information: ['Ville ou secteur recherché', 'Budget mensuel maximum', 'Date d’emménagement souhaitée'],
        draft_reply:
          "Bonjour Monsieur Benali,\n\nMerci pour votre demande. Afin de vous proposer des biens adaptés, pourriez-vous nous préciser :\n" +
          "- la ville ou le secteur recherché,\n- votre budget mensuel maximum,\n- la date d’emménagement souhaitée ?\n\nBien cordialement,\nL’équipe de l’agence",
        suggested_action: 'Demander les informations manquantes',
        requires_human_approval: true,
      },
      status: 'to_validate',
      error: null,
      history: [
        { at: minutesAgo(48), action: 'Réception', status: 'ok', detail: 'E-mail reçu' },
        { at: minutesAgo(47), action: 'Analyse IA', status: 'ok', detail: '3 informations manquantes' },
      ],
    },
    {
      id: 'req-003',
      channel: 'email',
      from: 'Newsletter Promo <promo@example.net>',
      replyTo: 'promo@example.net',
      subject: 'Offre exceptionnelle sur nos imprimantes',
      receivedAt: minutesAgo(180),
      body: 'Profitez de -30 % sur toute notre gamme d’imprimantes professionnelles jusqu’à dimanche !',
      analysis: {
        summary: 'Message publicitaire sans lien avec une demande immobilière.',
        category: 'hors_sujet',
        priority: 'low',
        extracted: {
          property_type: null,
          city: null,
          max_budget_eur: null,
          preferred_period: null,
        },
        missing_information: [],
        draft_reply: '',
        suggested_action: 'Ignorer',
        requires_human_approval: false,
      },
      status: 'rejected',
      error: null,
      history: [
        { at: minutesAgo(180), action: 'Réception', status: 'ok', detail: 'E-mail reçu' },
        { at: minutesAgo(179), action: 'Analyse IA', status: 'ok', detail: 'Classé hors sujet' },
        { at: minutesAgo(170), action: 'Rejet', status: 'rejected', detail: 'Rejeté par un agent' },
      ],
    },
    {
      id: 'req-004',
      channel: 'email',
      from: 'Sophie Durand <sophie.durand@example.com>',
      replyTo: 'sophie.durand@example.com',
      subject: 'Estimation de mon studio à Bordeaux',
      receivedAt: minutesAgo(320),
      body:
        "Bonjour,\n\nJe souhaiterais faire estimer mon studio de 28 m² situé à Bordeaux, quartier Chartrons, en vue d’une vente au printemps.\n\nMerci,\nSophie Durand",
      analysis: {
        summary: 'Demande d’estimation d’un studio de 28 m² à Bordeaux (Chartrons) en vue d’une vente au printemps.',
        category: 'estimation',
        priority: 'medium',
        extracted: {
          property_type: 'Studio',
          city: 'Bordeaux',
          max_budget_eur: null,
          preferred_period: 'Printemps',
        },
        missing_information: [],
        draft_reply:
          "Bonjour Madame Durand,\n\nMerci pour votre confiance. Nous serions ravis d’estimer votre studio aux Chartrons. Quelles sont vos disponibilités pour une visite d’estimation ?\n\nBien cordialement,\nL’équipe de l’agence",
        suggested_action: 'Planifier une visite d’estimation',
        requires_human_approval: true,
      },
      status: 'error',
      error: 'Échec de l’envoi : le serveur de messagerie a refusé la connexion (SMTP 421).',
      history: [
        { at: minutesAgo(320), action: 'Réception', status: 'ok', detail: 'E-mail reçu' },
        { at: minutesAgo(319), action: 'Analyse IA', status: 'ok', detail: 'Catégorie : estimation' },
        { at: minutesAgo(300), action: 'Approbation', status: 'ok', detail: 'Réponse approuvée' },
        { at: minutesAgo(299), action: 'Envoi', status: 'error', detail: 'SMTP 421 : connexion refusée' },
      ],
    },
  ]
}
