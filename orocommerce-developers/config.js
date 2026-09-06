/* Public runtime config — ORO × Synolia LATAM campaign.
   Safe to commit. Same lead API and analytics as the demo landers. */
window.CAMPAIGN_CONFIG = {
  campaign: "oro-latam-developers",
  intent: "developers",
  landingPath: "/orocommerce-developers",

  // Lead API (Express on the shared VPS). POST /save with notify:true.
  leadApiBase: "https://demo-api.us.synolia.com/api/demo",

  analytics: {
    posthog: { key: "phc_omNAVDPJu6Su8Fvpe58DUDyRPsx6yEpKqj7Mi9eU6pc9", host: "https://us.i.posthog.com" },
    ga4: { id: "G-NMHQNLNV94" },
    googleAds: { id: "AW-10953719087", leadLabel: "QBa5CK391O8cEK_6keco" }
  },

  i18n: {
    sending: "Sending…",
    netError: "We could not send this. Check your connection and try again."
  }
};
