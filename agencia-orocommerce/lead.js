/* ============================================================
   ORO × Synolia LATAM campaign — single-step lead panel.
   Shared by the four keyword landing pages. Copy per folder so
   each page stays self-contained, like the demo landers.

   Posts to the same lead API as the demo landers:
     POST {leadApiBase}/save  { notify:true, step:1, data:{...} }
   Attribution (gclid / utm) is attached by track.js so the VPS can
   push server-side conversions back to Google Ads.

   Strings come from window.CAMPAIGN_CONFIG.i18n so the Spanish page
   reuses this file untouched.
   ============================================================ */
(function () {
  var CFG = window.CAMPAIGN_CONFIG || {};
  var API = CFG.leadApiBase || "";
  var INTENT = CFG.intent || "partner";
  var LANDING = CFG.landingPath || location.pathname;
  var T = window.CampaignTrack || { attribution: function () { return {}; }, track: function () {}, identify: function () {} };
  var L = CFG.i18n || {};
  var MSG_NET = L.netError || "We could not send this. Check your connection and try again.";
  var MSG_SENDING = L.sending || "Sending…";

  /* ---------- copy-to-clipboard (demo credentials) ---------- */
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement("textarea");
        ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select(); document.execCommand("copy");
        document.body.removeChild(ta); resolve();
      } catch (e) { reject(e); }
    });
  }
  document.querySelectorAll(".copy-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      copyText(btn.getAttribute("data-copy")).then(function () {
        btn.classList.add("copied");
        setTimeout(function () { btn.classList.remove("copied"); }, 1600);
      }).catch(function () {});
    });
  });

  /* ---------- live-demo CTA ---------- */
  document.querySelectorAll("[data-demo-cta]").forEach(function (a) {
    a.addEventListener("click", function () { T.track("demo_opened", { intent: INTENT, landing_page: LANDING, href: a.href }); });
  });

  /* ---------- lead form ---------- */
  var form = document.getElementById("leadForm");
  if (!form) return;
  var panelEl = document.getElementById("leadPanel");
  var successEl = document.getElementById("leadSuccess");
  var errEl = document.getElementById("leadError");
  var sendBtn = document.getElementById("leadSend");
  var inFlight = false;

  function emailValid(v) { return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test((v || "").trim()); }
  function markInvalid(field, bad) { if (bad) field.classList.add("invalid"); else field.classList.remove("invalid"); }
  function setBusy(busy) {
    if (busy) { if (sendBtn.dataset.orig == null) sendBtn.dataset.orig = sendBtn.innerHTML; sendBtn.disabled = true; sendBtn.textContent = MSG_SENDING; }
    else { sendBtn.disabled = false; if (sendBtn.dataset.orig != null) { sendBtn.innerHTML = sendBtn.dataset.orig; delete sendBtn.dataset.orig; } }
  }
  function normUrl(v) { v = (v || "").trim(); if (v && !/^https?:\/\//i.test(v)) v = "https://" + v; return v; }

  /* Hardened POST: network failure, non-2xx and unparseable bodies all surface. */
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

  function showSuccess() {
    panelEl.style.display = "none";
    successEl.classList.add("show");
    successEl.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  sendBtn.addEventListener("click", function () {
    if (inFlight) return;
    errEl.classList.remove("show");

    var nameF = form.querySelector('.field[data-validate="text"]');
    var emailF = form.querySelector('.field[data-validate="email"]');
    var ok = true;
    if (!form.fullname.value.trim()) { markInvalid(nameF, true); ok = false; } else markInvalid(nameF, false);
    if (!emailValid(form.email.value)) { markInvalid(emailF, true); ok = false; } else markInvalid(emailF, false);
    if (!ok) { (form.fullname.value.trim() ? form.email : form.fullname).focus(); return; }

    var email = form.email.value.trim();
    var data = {
      fullname: form.fullname.value.trim(),
      email: email,
      company: form.company.value.trim(),
      role: form.role.value.trim(),
      country: form.country.value,
      website: normUrl(form.website.value),
      project: form.project.value.trim(),
      share_with_oro: !!form.share_with_oro.checked,
      platform: "orocommerce",
      intent: INTENT,
      campaign: CFG.campaign || null,
      landing_page: LANDING,
      language: document.documentElement.lang || "en",
      attribution: T.attribution()
    };

    function done() {
      T.identify(email, { company: data.company, country: data.country });
      T.track("lead_submitted", { intent: INTENT, landing_page: LANDING, country: data.country, share_with_oro: data.share_with_oro });
      showSuccess();
    }

    if (!API) { done(); return; }   // no backend wired: still record the conversion

    inFlight = true; setBusy(true);
    apiPost("/save", { notify: true, step: 1, data: data }, 15000)
      .then(function () { inFlight = false; setBusy(false); done(); })
      .catch(function () {
        inFlight = false; setBusy(false);
        errEl.textContent = MSG_NET; errEl.classList.add("show");
      });
  });
})();
