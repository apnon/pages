/* Public runtime config for the Medusa B2B demo lander.
   Safe to commit. Analytics keys are intentionally EMPTY, so track.js stays
   inert (no PostHog / GA4 requests) until the campaign goes live. Fill the
   keys in to activate tracking; the lead API below is already live. */
window.CAMPAIGN_CONFIG = {
  campaign: "medusa-b2b-demo-b",

  // Lead API (Express on the shared VPS). Endpoints: POST /save, POST /submit.
  leadApiBase: "https://demo-api.us.synolia.com/api/demo",

  analytics: {
    posthog: { key: "phc_omNAVDPJu6Su8Fvpe58DUDyRPsx6yEpKqj7Mi9eU6pc9", host: "https://us.i.posthog.com" },
    ga4: { id: "G-NMHQNLNV94" }
  }
};
