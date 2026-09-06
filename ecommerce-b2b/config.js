/* Public runtime config — Synolia LATAM category funnel.
   Platform-neutral top of funnel. Separate campaign id from the joint
   OroCommerce pages so paid spend and lead quality can be judged apart. */
window.CAMPAIGN_CONFIG = {
  campaign: "latam-ecommerce-b2b",
  intent: "category",
  landingPath: "/ecommerce-b2b",

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
