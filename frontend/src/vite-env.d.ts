/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** "true" pour utiliser les données fictives sans aucun appel réseau. */
  readonly VITE_USE_MOCK?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
