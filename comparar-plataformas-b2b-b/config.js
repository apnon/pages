/* Public runtime config: Synolia LATAM, comparison intent, form-first variant.
   Own campaign id so leads, abandoned step-1 selections and paid spend can be
   judged apart from /comparar-plataformas-b2b/ (variant A). */
window.CAMPAIGN_CONFIG = {
  campaign: "latam-comparar-plataformas-b",
  variant: "b",
  intent: "comparison",
  landingPath: "/comparar-plataformas-b2b-b",

  leadApiBase: "https://demo-api.us.synolia.com/api/demo",

  analytics: {
    posthog: { key: "phc_omNAVDPJu6Su8Fvpe58DUDyRPsx6yEpKqj7Mi9eU6pc9", host: "https://us.i.posthog.com" },
    ga4: { id: "G-NMHQNLNV94" },
    googleAds: { id: "AW-10953719087", leadLabel: "QBa5CK391O8cEK_6keco" }
  },

  i18n: {
    sending: "Enviando…",
    netError: "No pudimos enviar tus datos. Revisa tu conexión e inténtalo de nuevo."
  }
};
