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

  /* ---------- platform picker ----------
     The label carries the checked state as a class so the styling does not
     depend on :has(), and each change is tracked: even someone who never
     submits tells us which platforms are in play. */
  function pickedPlatforms() {
    return Array.prototype.map.call(
      document.querySelectorAll('input[name="platforms"]:checked'),
      function (el) { return el.value; });
  }

  (function () {
    var boxes = document.querySelectorAll('input[name="platforms"]');
    if (!boxes.length) return;
    Array.prototype.forEach.call(boxes, function (el) {
      el.addEventListener("change", function () {
        var item = el.closest(".pp-item");
        if (item) item.classList.toggle("is-on", el.checked);
        T.track("platform_picked", {
          platform: el.value, checked: el.checked,
          selection: pickedPlatforms(), landing_page: LANDING
        });
      });
    });
  })();

  /* ---------- booking (secondary path) ----------
     Same shape as /ecommerce-b2b/: HubSpot is fetched when the visitor
     approaches or reaches for the button, so the click does not land on an
     empty box, and a skeleton covers whatever gap is left. */
  (function () {
    var open = document.getElementById("bookOpen");
    var slot = document.getElementById("bookSlot");
    var skel = document.getElementById("bookSkeleton");
    var box = document.querySelector(".book-or");
    if (!open || !slot) return;

    var requested = false;
    function loadHubSpot() {
      if (requested) return;
      requested = true;
      var s = document.createElement("script");
      s.src = "https://static.hsappstatic.net/MeetingsEmbed/ex/MeetingsEmbedCode.js";
      s.async = true;
      document.body.appendChild(s);
      var host = slot.querySelector(".meetings-iframe-container");
      if (!host || !skel) return;
      var stop = setInterval(function () {
        var f = host.querySelector("iframe");
        if (!f) return;
        // A hidden slot gives the iframe no layout, so height only means
        // anything once the slot is visible.
        var ready = slot.hidden ? true : f.getBoundingClientRect().height > 100;
        if (ready) { skel.remove(); skel = null; clearInterval(stop); }
      }, 150);
      setTimeout(function () { clearInterval(stop); }, 20000);
    }

    if ("IntersectionObserver" in window && box) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { loadHubSpot(); io.disconnect(); }
        });
      }, { rootMargin: "600px 0px" });
      io.observe(box);
    } else {
      loadHubSpot();
    }
    open.addEventListener("mouseenter", loadHubSpot);
    open.addEventListener("focus", loadHubSpot);

    open.addEventListener("click", function () {
      loadHubSpot();
      if (!slot.hidden) {
        slot.hidden = true;
        open.setAttribute("aria-expanded", "false");
        return;
      }
      slot.hidden = false;
      open.setAttribute("aria-expanded", "true");
      T.track("booking_opened", { landing_page: LANDING, platforms: pickedPlatforms() });
      if (box) box.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    var direct = document.getElementById("bookDirect");
    if (direct) direct.addEventListener("click", function () {
      T.track("booking_opened", { landing_page: LANDING, path: "new_tab" });
    });
  })();

  /* ---------- a booked meeting is a conversion too ----------
     Worth more than a form fill, so it has to reach Google Ads as the same
     conversion or bidding only ever learns from the weaker path. */
  (function () {
    window.addEventListener("message", function (e) {
      if (!e || !e.data) return;
      var d = e.data;
      var booked = d.meetingBookSucceeded === true ||
                   (typeof d === "object" && d.meetingsPayload &&
                    d.meetingsPayload.meetingBookSucceeded === true);
      if (!booked) return;
      T.conversion((CFG.analytics && CFG.analytics.googleAds || {}).leadLabel);
      T.track("lead_submitted", {
        intent: "comparison", landing_page: LANDING, path: "hubspot_booking",
        platforms: pickedPlatforms()
      });
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
      // What they are weighing us against. More useful than a score we invent:
      // it says which platforms we actually compete with, per campaign and per
      // keyword, and it decides which environments are worth building.
      platforms: pickedPlatforms(),
      project: form.project.value.trim(),
      platform: "undecided",
      intent: "comparison",
      campaign: CFG.campaign || null,
      landing_page: LANDING,
      language: document.documentElement.lang || "es",
      confirm: true,
      attribution: T.attribution()
    };

    function done() {
      T.identify(email, { company: data.company });
      // Segment goes to analytics so paid spend can be judged on qualified
      // leads rather than raw form fills.
      // Google Ads conversion: the signal the campaign bids on.
      T.conversion((CFG.analytics && CFG.analytics.googleAds || {}).leadLabel);
      T.track("lead_submitted", {
        intent: "comparison", landing_page: LANDING, path: "form",
        platforms: data.platforms, platform_count: data.platforms.length
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
