/* Public runtime config for the OroCommerce demo lander.
   Safe to commit. Analytics keys are intentionally EMPTY, so track.js stays
   inert (no PostHog / GA4 requests) until the campaign goes live. Fill the
   keys in to activate tracking; the lead API below is already live. */
window.CAMPAIGN_CONFIG = {
  campaign: "orocommerce-demo-b",

  // Lead API (Express on the shared VPS). Endpoints: POST /save, POST /submit.
  leadApiBase: "https://demo-api.us.synolia.com/api/demo",

  analytics: {
    posthog: { key: "", host: "https://us.i.posthog.com" },
    ga4: { id: "" }
  }
};
