/* ============================================================
   Campaign Factory — lean tracking module (no GTM).
   - Captures ad click IDs (gclid/gbraid/wbraid/msclkid) + UTMs from the URL,
     persists first-touch + last-touch attribution.
   - Fires page/step/submit events to PostHog (+ optional GA4).
   - Exposes window.CampaignTrack for the form to attach attribution to the lead,
     so the VPS can upload server-side conversions to Google + Microsoft.

   Inert until keys are set in window.CAMPAIGN_CONFIG.analytics — safe to ship
   before the campaign is live. Provider-abstracted so PostHog/GA4 is a config swap.
   ============================================================ */
(function () {
  var CFG = (window.CAMPAIGN_CONFIG = window.CAMPAIGN_CONFIG || {});
  var A = CFG.analytics || {};
  var CLICK_KEYS = ["gclid", "gbraid", "wbraid", "msclkid"];
  var UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];

  function qs() {
    var p = new URLSearchParams(location.search), o = {};
    CLICK_KEYS.concat(UTM_KEYS).forEach(function (k) { var v = p.get(k); if (v) o[k] = v; });
    return o;
  }
  function load(key) { try { return JSON.parse(localStorage.getItem(key) || "null"); } catch (e) { return null; } }
  function save(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} }

  // first-touch is sticky; last-touch updates each ad visit
  var now = new Date().toISOString();
  var current = qs();
  var hasClick = CLICK_KEYS.some(function (k) { return current[k]; }) || current.utm_source;
  var first = load("cf_first_touch");
  if (!first) { first = Object.assign({ ts: now, referrer: document.referrer || "" }, current); save("cf_first_touch", first); }
  if (hasClick) save("cf_last_touch", Object.assign({ ts: now, referrer: document.referrer || "" }, current));
  var last = load("cf_last_touch") || first;

  function attribution() {
    // last-touch click IDs win for conversion upload; keep both for analysis
    return {
      campaign: CFG.campaign || null,
      gclid: last.gclid || first.gclid || null,
      gbraid: last.gbraid || first.gbraid || null,
      wbraid: last.wbraid || first.wbraid || null,
      msclkid: last.msclkid || first.msclkid || null,
      utm: UTM_KEYS.reduce(function (o, k) { o[k] = last[k] || first[k] || null; return o; }, {}),
      first_touch_ts: first.ts, last_touch_ts: last.ts,
      referrer: first.referrer, landing_path: location.pathname
    };
  }

  /* ---------- analytics providers ---------- */
  var ph = null;
  if (A.posthog && A.posthog.key) {
    // load posthog-js (autocapture + session replay + funnels)
    !function (t, e) { var o, n, p, r; e.__SV || (window.posthog = e, e._i = [], e.init = function (i, s, a) { function g(t, e) { var o = e.split("."); 2 == o.length && (t = t[o[0]], e = o[1]), t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))) } } (p = t.createElement("script")).type = "text/javascript", p.async = !0, p.src = s.api_host.replace(".i.posthog.com", "-assets.i.posthog.com") + "/static/array.js", (r = t.getElementsByTagName("script")[0]).parentNode.insertBefore(p, r); var u = e; for (void 0 !== a ? u = e[a] = [] : a = "posthog", u.people = u.people || [], u.toString = function (t) { var e = "posthog"; return "posthog" !== a && (e += "." + a), t || (e += " (stub)"), e }, u.people.toString = function () { return u.toString(1) + ".people (stub)" }, o = "init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "), n = 0; n < o.length; n++)g(u, o[n]); e._i.push([i, s, a]) }, e.__SV = 1) }(document, window.posthog || []);
    window.posthog.init(A.posthog.key, { api_host: A.posthog.host || "https://us.i.posthog.com", capture_pageview: true, session_recording: { maskAllInputs: true } });
    ph = window.posthog;
  }
  if (A.ga4 && A.ga4.id) {
    var s = document.createElement("script"); s.async = 1; s.src = "https://www.googletagmanager.com/gtag/js?id=" + A.ga4.id; document.head.appendChild(s);
    window.dataLayer = window.dataLayer || []; window.gtag = function () { dataLayer.push(arguments); };
    gtag("js", new Date()); gtag("config", A.ga4.id);
  }

  function track(event, props) {
    props = props || {};
    if (ph) ph.capture(event, props);
    if (window.gtag) gtag("event", event.replace(/[^a-z0-9_]/gi, "_"), props);
    (window.dataLayer = window.dataLayer || []).push(Object.assign({ event: event }, props));
  }
  function identify(email, props) {
    if (ph && email) ph.identify(email, props || {});
    if (window.gtag && email) gtag("set", "user_data", { email: email });
  }

  window.CampaignTrack = { attribution: attribution, track: track, identify: identify };
  track("page_view", { campaign: CFG.campaign || null, path: location.pathname });
})();
