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

  /* ---------- ERP rotator ----------
     Cycles the vendor logo in the integration diagram. Every logo is already
     in the DOM; this only moves the .is-on class. If the visitor asked for
     reduced motion, or JS never runs, the rotator falls back to a static chip
     grid showing all of them at once (CSS .static). */
  (function () {
    var rot = document.getElementById("erpRotator");
    if (!rot) return;
    var names = rot.querySelectorAll(".erp-logo");
    if (names.length < 2) return;

    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { rot.classList.add("static"); return; }

    rot.classList.remove("static");
    var i = 0;
    names[0].classList.add("is-on");
    // Sequential swap, not a crossfade: these marks have wildly different
    // widths (Oracle is a wide wordmark, TOTVS is a square), so two of them
    // overlapping at partial opacity looks like a rendering fault. Fade the
    // current one out first, then bring the next one in.
    setInterval(function () {
      names[i].classList.remove("is-on");
      var next = (i + 1) % names.length;
      setTimeout(function () {
        names[next].classList.add("is-on");
        i = next;
      }, 200);
    }, 2100);
  })();

  /* ---------- silent qualification ----------
     Scores sizing signals, not enthusiasm. Deliberately blunt: this only has
     to be good enough to sort the inbox, the real call decides everything. */
  var REVENUE_PTS = { "<5M": 0, "5-10M": 1, "10-50M": 2, "50-200M": 3, ">200M": 3, "": 0 };
  var CUSTOMER_PTS = { "<50": 0, "50-200": 1, "200-1000": 2, ">1000": 2, "": 0 };
  // Already running a portal or a storefront means a replatform, which is a
  // real project with a real budget, not an exploratory conversation.
  var CURRENT_PTS = { "portal-antiguo": 2, "ecommerce-actual": 2, "vendedores": 1, "email-excel": 1, "telefono": 1, "otro": 0, "": 0 };

  function qualify(d) {
    var hasErp = !!(d.erp && d.erp.trim() && !/^(no|ninguno|nada|n\/a)$/i.test(d.erp.trim()));
    var score = (REVENUE_PTS[d.revenue_band] || 0)
              + (CUSTOMER_PTS[d.customer_band] || 0)
              + (CURRENT_PTS[d.current_process] || 0)
              + (hasErp ? 1 : 0);

    // Everything optional left blank means we know nothing, which is NOT the
    // same as knowing they are small. Never let an unqualified lead be filed
    // as a disqualified one.
    if (!d.revenue_band && !d.customer_band && !d.current_process && !hasErp) {
      return { score: score, segment: "unknown",
               routing_hint: "No sizing data given. Qualify on the call before deciding anything." };
    }

    var segment, hint;
    if (d.revenue_band === "<5M") {
      // Alexandre's explicit rule: under the joint-campaign threshold, handle
      // with a lighter solution. A stated number outranks the other signals.
      segment = "smb";
      hint = "Stated under USD 5M. Below the joint-campaign threshold, do not register with OroCommerce.";
      if (score >= 3) hint += " Other signals are strong though (" + score + "/8), worth a look.";
    } else if (score >= 5) {
      segment = "enterprise";
      hint = "Enterprise fit. Candidate to register with OroCommerce.";
    } else if (score >= 3) {
      segment = "mid-market";
      // Keep platform names out of this file: it is served publicly and the
      // page deliberately does not advertise alternatives to OroCommerce.
      hint = "Mid-market. Confirm platform fit on the call, depending on integration depth.";
    } else {
      segment = "smb";
      hint = "Below the joint-campaign threshold. Handle with a lighter solution, do not register.";
    }

    if (!d.revenue_band) hint += " Revenue not disclosed, confirm on the call.";

    return { score: score, segment: segment, routing_hint: hint };
  }

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
      role: form.role.value.trim(),
      country: form.country.value,
      website: normUrl(form.website.value),
      revenue_band: form.revenue_band.value,
      customer_band: form.customer_band.value,
      current_process: form.current_process.value,
      erp: form.erp.value.trim(),
      project: form.project.value.trim(),
      platform: "undecided",
      intent: "category",
      campaign: CFG.campaign || null,
      landing_page: LANDING,
      language: document.documentElement.lang || "es",
      attribution: T.attribution()
    };
    var q = qualify(data);
    data.qualification = q;

    function done() {
      T.identify(email, { company: data.company, country: data.country, segment: q.segment });
      // Segment goes to analytics so paid spend can be judged on qualified
      // leads rather than raw form fills.
      // Google Ads conversion: the signal the campaign bids on.
      T.conversion((CFG.analytics && CFG.analytics.googleAds || {}).leadLabel);
      T.track("lead_submitted", {
        intent: "category", landing_page: LANDING, country: data.country,
        segment: q.segment, score: q.score, revenue_band: data.revenue_band
      });
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
