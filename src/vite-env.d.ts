/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SITE_URL?: string
  /** Absolute URL to default Open Graph / Twitter image */
  readonly VITE_OG_IMAGE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
