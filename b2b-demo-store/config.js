// Public runtime config for the demo-store form.
// Safe to commit. While apiBase contains "YOUR_", the form runs in MOCK mode
// (no network calls), so the page stays demoable until the VPS is live.
window.DEMO_CONFIG = {
  // VPS API base (Express on the shared Hetzner box, behind Caddy).
  // Go live by setting this to: https://demo-api.synolia.com/api/demo
  apiBase: "https://YOUR_VPS_HOST/api/demo",

  // HubSpot Meetings link for the step-1 booking widget (Alexandre's calendar).
  // Leave the YOUR_ placeholder to keep the "Simulate a booking" button for demos.
  hubspotMeetingUrl: "https://meetings.hubspot.com/YOUR_HANDLE?embed=true",
};
