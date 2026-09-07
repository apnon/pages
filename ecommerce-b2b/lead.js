/* ============================================================
   Category funnel (/ecommerce-b2b/) — lead capture + silent qualification.

   Difference from the OroCommerce landers: this is Synolia's own funnel,
   not the joint campaign. There is NO "share with OroCommerce" consent box.
   A lead is registered with the vendor only after Alexandre decides the
   platform, which is the whole point of keeping this page neutral.

   The form collects four sizing answers and derives a segment + a platform
   hint. Both are INTERNAL ONLY: they ride along with the lead so the
   notification email is already triaged. The prospect is never shown a
   score, never told they are "too small", and never sees a platform
   recommendation here. That conversation happens on the call.
   ============================================================ */
(function () {
  var CFG = window.CAMPAIGN_CONFIG || {};
  var API = CFG.leadApiBase || "";
  var LANDING = CFG.landingPath || location.pathname;
  var T = window.CampaignTrack || { attribution: function () { return {}; }, track: function () {}, identify: function () {}, conversion: function () {} };
  var L = CFG.i18n || {};
  var MSG_NET = L.netError || "No pudimos enviar tus datos. Revisa tu conexión e inténtalo de nuevo.";
  var MSG_SENDING = L.sending || "Enviando…";

  /* ---------- objection bubbles ----------
     Markup ships with every answer panel visible and stacked, so with JS off
     or for a crawler the whole section still reads as plain content. Adding
     .js switches the panel area to one-at-a-time and the bubbles become the
     selector. */
  (function () {
    var stage = document.getElementById("obStage");
    var panels = document.getElementById("obAnswers");
    if (!stage || !panels) return;

    var bubbles = Array.prototype.slice.call(stage.querySelectorAll(".ob-bubble"));
    var answers = Array.prototype.slice.call(panels.querySelectorAll(".ob-answer"));
    if (bubbles.length !== answers.length || !bubbles.length) return;

    panels.classList.add("js");
    stage.classList.add("has-active");

    function select(i, track) {
      bubbles.forEach(function (b, n) {
        b.classList.toggle("is-on", n === i);
        b.setAttribute("aria-expanded", n === i ? "true" : "false");
      });
      answers.forEach(function (a, n) {
        a.classList.toggle("is-on", n === i);
      });
      if (track) {
        T.track("doubt_opened", {
          landing_page: LANDING,
          doubt: (bubbles[i].querySelector(".ob-tag") || {}).textContent || null
        });
      }
    }

    bubbles.forEach(function (b, i) {
      b.setAttribute("aria-expanded", "false");
      b.addEventListener("click", function () { select(i, true); });
    });

    select(0, false);
  })();

  /* ---------- booking + fallback form toggle ----------
     The HubSpot scheduler is the primary path. The short form ships visible in
     the HTML and is collapsed here, so it still works with JS off. */
  (function () {
    var toggle = document.getElementById("altToggle");
    var panel = document.getElementById("leadPanel");
    if (!toggle || !panel) return;
    panel.classList.add("alt-hidden");
    toggle.addEventListener("click", function () {
      var open = panel.classList.toggle("alt-hidden") === false;
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) {
        panel.scrollIntoView({ behavior: "smooth", block: "center" });
        var f = panel.querySelector("input"); if (f) f.focus({ preventScroll: true });
      }
    });
  })();

  /* ---------- HubSpot booking = a conversion too ----------
     A booked meeting is worth more than a form fill, so it must reach Google Ads
     as the same conversion; otherwise bidding only ever learns from the weaker
     path. HubSpot's embed posts a message on success. */
  (function () {
    window.addEventListener("message", function (e) {
      if (!e || !e.data) return;
      var d = e.data;
      var booked = d.meetingBookSucceeded === true ||
                   (typeof d === "object" && d.meetingsPayload &&
                    d.meetingsPayload.meetingBookSucceeded === true);
      if (!booked) return;
      T.conversion((CFG.analytics && CFG.analytics.googleAds || {}).leadLabel);
      T.track("lead_submitted", { intent: "category", landing_page: LANDING, path: "hubspot_booking" });
    }, false);
  })();

  /* ---------- form ---------- */
  var form = document.getElementById("leadForm");
  if (!form) return;
  var panelEl = document.getElementById("leadPanel");
  var successEl = document.getElementById("leadSuccess");
  var errEl = document.getElementById("leadError");
  var sendBtn = document.getElementById("leadSend");
  var inFlight = false;

  function emailValid(v) { return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test((v || "").trim()); }
  function setBusy(busy) {
    if (busy) { if (sendBtn.dataset.orig == null) sendBtn.dataset.orig = sendBtn.innerHTML; sendBtn.disabled = true; sendBtn.textContent = MSG_SENDING; }
    else { sendBtn.disabled = false; if (sendBtn.dataset.orig != null) { sendBtn.innerHTML = sendBtn.dataset.orig; delete sendBtn.dataset.orig; } }
  }
  function normUrl(v) { v = (v || "").trim(); if (v && !/^https?:\/\//i.test(v)) v = "https://" + v; return v; }

  function apiPost(path, body, timeoutMs) {
    var ctrl = ("AbortController" in window) ? new AbortController() : null;
    var timedOut = false, timer = null;
    if (ctrl) timer = setTimeout(function () { timedOut = true; ctrl.abort(); }, timeoutMs || 15000);
    return fetch(API + path, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body), signal: ctrl ? ctrl.signal : undefined
    }).then(function (r) {
      return r.text().then(function (txt) {
        if (timer) clearTimeout(timer);
        var j = {};
        if (txt) { try { j = JSON.parse(txt); } catch (e) { j = null; } }
        if (!r.ok) throw new Error("http_" + r.status);
        if (j === null) throw new Error("bad_body");
        if (j.ok === false) throw new Error(j.error || "server_error");
        return j;
      });
    }, function () {
      if (timer) clearTimeout(timer);
      throw new Error(timedOut ? "timeout" : "network");
    });
  }

  sendBtn.addEventListener("click", function () {
    if (inFlight) return;
    errEl.classList.remove("show");

    var nameF = form.querySelector('.field[data-validate="text"]');
    var emailF = form.querySelector('.field[data-validate="email"]');
    var ok = true;
    if (!form.fullname.value.trim()) { nameF.classList.add("invalid"); ok = false; } else nameF.classList.remove("invalid");
    if (!emailValid(form.email.value)) { emailF.classList.add("invalid"); ok = false; } else emailF.classList.remove("invalid");
    if (!ok) { (form.fullname.value.trim() ? form.email : form.fullname).focus(); return; }

    var email = form.email.value.trim();
    var data = {
      fullname: form.fullname.value.trim(),
      email: email,
      company: form.company.value.trim(),
      project: form.project.value.trim(),
      platform: "undecided",
      intent: "category",
      campaign: CFG.campaign || null,
      landing_page: LANDING,
      language: document.documentElement.lang || "es",
      // Ask the API to send the prospect a confirmation. People who book through
      // HubSpot get its invite; people who use this fallback form previously got
      // nothing back at all.
      confirm: true,
      attribution: T.attribution()
    };

    function done() {
      T.identify(email, { company: data.company });
      // Google Ads conversion: the signal the campaign bids on.
      T.conversion((CFG.analytics && CFG.analytics.googleAds || {}).leadLabel);
      T.track("lead_submitted", { intent: "category", landing_page: LANDING, path: "form" });
      panelEl.style.display = "none";
      successEl.classList.add("show");
      successEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    if (!API) { done(); return; }

    inFlight = true; setBusy(true);
    apiPost("/save", { notify: true, step: 1, data: data }, 15000)
      .then(function () { inFlight = false; setBusy(false); done(); })
      .catch(function () {
        inFlight = false; setBusy(false);
        errEl.textContent = MSG_NET; errEl.classList.add("show");
      });
  });
})();
