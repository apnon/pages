/* Public runtime config — Synolia LATAM, comparison intent.
   Separate campaign id from /ecommerce-b2b/ so the two intents can be
   judged apart on cost per qualified lead. */
window.CAMPAIGN_CONFIG = {
  campaign: "latam-comparar-plataformas",
  intent: "comparison",
  landingPath: "/comparar-plataformas-b2b",

  leadApiBase: "https://demo-api.us.synolia.com/api/demo",

  analytics: {
    posthog: { key: "phc_omNAVDPJu6Su8Fvpe58DUDyRPsx6yEpKqj7Mi9eU6pc9", host: "https://us.i.posthog.com" },
    ga4: { id: "G-NMHQNLNV94" }
  },

  i18n: {
    sending: "Enviando…",
    netError: "No pudimos enviar tus datos. Revisa tu conexión e inténtalo de nuevo."
  }
};
