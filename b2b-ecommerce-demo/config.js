/* Public runtime config for the B2B ecommerce comparison lander.
   Safe to commit. Same PostHog + GA4 keys as the platform pages so this
   page shares the campaign's analytics. This page has no form (links only). */
window.CAMPAIGN_CONFIG = {
  campaign: "b2b-ecommerce-demo",

  // Lead API (unused here, kept for parity with the other pages).
  leadApiBase: "https://demo-api.us.synolia.com/api/demo",

  analytics: {
    posthog: { key: "phc_omNAVDPJu6Su8Fvpe58DUDyRPsx6yEpKqj7Mi9eU6pc9", host: "https://us.i.posthog.com" },
    ga4: { id: "G-NMHQNLNV94" }
  }
};
