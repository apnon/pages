/* ============================================================
   /ecommerce-b2b-b/: form-first variant of the category page.

   Variant A asks the visitor to read the page and then book a call. In its
   first 25 days of paid traffic 289 clicks produced one booking. Here the
   doubt picker is the hero and the first step, the same shape as
   /comparar-plataformas-b2b-b/:

   1. The step-1 answer is data in its own right. Which doubts stop people,
      per keyword, is worth knowing even from visitors who never leave an
      email. So "Siguiente" saves the selection to the lead API right away
      (POST /save, no notify, no confirm: nobody gets an email), and the row
      is kept whether or not step 2 is ever sent. In the lead database those
      rows are the ones with current_step = 1 and no email.

   2. Step 2 updates that same row through its session_token, so one visitor
      is one row. Only step 2 notifies us, emails the prospect a confirmation
      and fires the Google Ads conversion.

   Same neutrality rules as variant A: no "share with OroCommerce" consent
   box, no commerce platform named, nothing shown back to the prospect beyond
   what they chose.
   ============================================================ */
(function () {
  var CFG = window.CAMPAIGN_CONFIG || {};
  var API = CFG.leadApiBase || "";
  var LANDING = CFG.landingPath || location.pathname;
  var VARIANT = CFG.variant || "b";
  var T = window.CampaignTrack || { attribution: function () { return {}; }, track: function () {}, identify: function () {}, conversion: function () {} };
  var L = CFG.i18n || {};
  var MSG_NET = L.netError || "No pudimos enviar tus datos. Revisa tu conexión e inténtalo de nuevo.";
  var MSG_SENDING = L.sending || "Enviando…";

  /* ---------- doubt picker ---------- */
  function pickedBoxes() {
    return Array.prototype.slice.call(document.querySelectorAll('input[name="doubts"]:checked'));
  }
  function pickedDoubts() {
    return pickedBoxes().map(function (el) { return el.value; });
  }
  // Short human labels ("Precios", "Integración ERP"), for the step-2 recap
  // and for the alert email.
  function pickedTags() {
    return pickedBoxes().map(function (el) { return el.getAttribute("data-tag") || el.value; });
  }

  (function () {
    var boxes = document.querySelectorAll('input[name="doubts"]');
    Array.prototype.forEach.call(boxes, function (el) {
      el.addEventListener("change", function () {
        var item = el.closest(".pp-item");
        if (item) item.classList.toggle("is-on", el.checked);
        var f = document.getElementById("doubtField");
        if (f && el.checked) f.classList.remove("invalid");
        T.track("doubt_picked", {
          doubt: el.value, checked: el.checked, variant: VARIANT,
          selection: pickedDoubts(), landing_page: LANDING
        });
      });
    });
  })();

  /* ---------- objection bubbles ----------
     Markup ships with every answer panel visible and stacked, so with JS off
     the whole section still reads as plain content. Adding .js switches the
     panel area to one-at-a-time and the bubbles become the selector. */
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
          landing_page: LANDING, variant: VARIANT,
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

  /* ---------- booking (secondary path) ----------
     HubSpot's embed is ~66 requests and a full tracking stack. On variant A
     it is prefetched when the visitor scrolls near the button; here the
     button sits in the hero, so that would load it for every visitor on
     arrival. Instead it loads when someone reaches for the button (hover,
     focus, touch) or reaches step 2, and a skeleton covers the gap. */
  var loadBooking = function () {};
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
        var ready = slot.hidden ? true : f.getBoundingClientRect().height > 100;
        if (ready) { skel.remove(); skel = null; clearInterval(stop); }
      }, 150);
      setTimeout(function () { clearInterval(stop); }, 20000);
    }

    loadBooking = loadHubSpot;
    open.addEventListener("mouseenter", loadHubSpot);
    open.addEventListener("focus", loadHubSpot);
    open.addEventListener("touchstart", loadHubSpot, { passive: true });

    open.addEventListener("click", function () {
      loadHubSpot();
      if (!slot.hidden) {
        slot.hidden = true;
        open.setAttribute("aria-expanded", "false");
        return;
      }
      slot.hidden = false;
      open.setAttribute("aria-expanded", "true");
      T.track("booking_opened", { landing_page: LANDING, variant: VARIANT, doubts: pickedDoubts() });
      if (box) box.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    var direct = document.getElementById("bookDirect");
    if (direct) direct.addEventListener("click", function () {
      T.track("booking_opened", { landing_page: LANDING, variant: VARIANT, path: "new_tab" });
    });
  })();

  /* ---------- a booked meeting is a conversion too ---------- */
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
        intent: "category", landing_page: LANDING, variant: VARIANT, path: "hubspot_booking",
        doubts: pickedDoubts()
      });
    }, false);
  })();

  /* ---------- form ---------- */
  var form = document.getElementById("leadForm");
  if (!form) return;
  var panelEl = document.getElementById("leadPanel");
  var successEl = document.getElementById("leadSuccess");
  var errEl = document.getElementById("leadError");
  var nextBtn = document.getElementById("stepNext");
  var backBtn = document.getElementById("stepBack");
  var editBtn = document.getElementById("pickedEdit");
  var sendBtn = document.getElementById("leadSend");
  var doubtField = document.getElementById("doubtField");
  var chipsEl = document.getElementById("pickedChips");
  var inFlight = false;

  // One visitor, one row: the token comes back from the first save and is
  // sent with every later one. `saving` chains the saves so a quick double
  // click, or a step-2 send while step 1 is still in flight, reuses the token
  // instead of creating a second row.
  var token = null;
  var saving = Promise.resolve(null);

  form.addEventListener("submit", function (e) { e.preventDefault(); });

  function emailValid(v) { return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test((v || "").trim()); }

  /* ---------- work email, or a personal one plus the company ----------
     There is no company field up front: a work-email domain already says who
     they are. Until 7 Oct 2026 personal mailboxes were refused outright, and
     in the first week of paid traffic that turned away 3 of the 6 visitors
     who reached step 2 on the two form-first pages (all on mobile, Bolivia
     and Argentina), for 0 leads.
     So a personal mailbox is now accepted on one condition: a company name
     or website, asked in a field that only appears for those addresses.

     Personal includes the LatAm variants (hotmail.com.ar, yahoo.com.mx,
     outlook.es, terra.com.br...). A provider name only counts as the mailbox
     itself: "gmail.com", "gmail.con" or "hotmail.com.ar", never a company
     subdomain like "live.acme.com" or "mail.acme.cl". This is a UX rule, not
     security: the API still accepts whatever is posted to it. */
  var FREE_PROVIDERS = ("gmail googlemail hotmail outlook live msn windowslive yahoo ymail " +
    "rocketmail icloud aol protonmail proton gmx yandex zohomail fastmail tutanota tuta " +
    "hushmail terra uol bol prodigy latinmail yopmail mailinator guerrillamail sharklasers " +
    "10minutemail tempmail temp-mail trashmail dispostable getnada maildrop").split(" ");
  var FREE_EXACT = ("mail.com mail.ru me.com mac.com pm.me ig.com.br vtr.net " +
    "fibertel.com.ar speedy.com.ar arnet.com.ar").split(" ");

  function emailDomain(v) { return ((v || "").trim().split("@")[1] || "").toLowerCase(); }
  function isPersonalEmail(v) {
    var d = emailDomain(v);
    if (!d) return false;
    if (FREE_EXACT.indexOf(d) !== -1) return true;
    var parts = d.split(".");
    if (FREE_PROVIDERS.indexOf(parts[0]) === -1) return false;
    return parts.length === 2 ||
      (parts.length === 3 && ["com", "net", "org", "co"].indexOf(parts[1]) !== -1);
  }
  function needsCompany() { return emailValid(form.email.value) && isPersonalEmail(form.email.value); }

  var MSG_EMAIL_FORMAT = "Ingresa un correo válido.";
  var companyF = document.getElementById("companyField");

  // Shows the company field for a personal mailbox and hides it otherwise.
  // Only once the address is well formed, so it does not flicker while typing.
  function syncCompany() {
    if (!companyF || !emailValid(form.email.value)) return;
    var need = isPersonalEmail(form.email.value);
    companyF.hidden = !need;
    if (!need) companyF.classList.remove("invalid");
  }

  // Once per provider, only the provider and never the address: tells us how
  // many leads come in on a personal mailbox, and from which.
  var reportedProviders = {};
  function reportPersonal() {
    if (!needsCompany()) return;
    var provider = emailDomain(form.email.value);
    if (reportedProviders[provider]) return;
    reportedProviders[provider] = true;
    T.track("personal_email_used", { landing_page: LANDING, variant: VARIANT, provider: provider });
  }

  function checkEmail() {
    var f = form.querySelector('.field[data-validate="email"]');
    var msg = document.getElementById("emailErr");
    syncCompany();
    if (!emailValid(form.email.value)) { msg.textContent = MSG_EMAIL_FORMAT; f.classList.add("invalid"); return false; }
    f.classList.remove("invalid");
    return true;
  }
  function companyValue() { return companyF && !companyF.hidden ? form.company.value.trim() : ""; }
  function checkCompany() {
    if (!needsCompany()) return true;
    var ok = companyValue().length >= 2;
    companyF.classList.toggle("invalid", !ok);
    return ok;
  }
  // "andes.cl" or "https://www.andes.cl" reads as a website, "Andes SpA" as a name.
  function looksLikeSite(v) { return /^(https?:\/\/)?(www\.)?[^\s\/]+\.[a-z]{2,}(\/\S*)?$/i.test(v); }

  function setBusy(busy) {
    if (busy) { if (sendBtn.dataset.orig == null) sendBtn.dataset.orig = sendBtn.innerHTML; sendBtn.disabled = true; sendBtn.textContent = MSG_SENDING; }
    else { sendBtn.disabled = false; if (sendBtn.dataset.orig != null) { sendBtn.innerHTML = sendBtn.dataset.orig; delete sendBtn.dataset.orig; } }
  }

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

  // Each save carries the whole record: the API replaces the stored data on
  // every call, so step 2 must resend what step 1 collected.
  function save(step, data, extra, timeoutMs) {
    var run = function () {
      var body = { step: step, data: data };
      if (token) body.session_token = token;
      for (var k in extra) body[k] = extra[k];
      return apiPost("/save", body, timeoutMs).then(function (j) {
        if (j && j.session_token) token = j.session_token;
        return j;
      });
    };
    var p = saving.then(run, run);
    saving = p.then(function () { return null; }, function () { return null; });
    return p;
  }

  // The alert email prints a fixed list of fields and `doubts` is not one of
  // them, but `project` is ("What they want to solve"). So the selection is
  // also written there in words, ahead of whatever the visitor typed. The raw
  // note is kept on its own in `notes`.
  function projectText(notes) {
    var tags = pickedTags();
    var head = tags.length ? "Dudas: " + tags.join(", ") + "." : "";
    return (head + (notes ? " " + notes : "")).trim();
  }

  function baseData() {
    var notes = form.project.value.trim();
    return {
      // What stops them: the doubts people arrive with, per campaign and per keyword.
      doubts: pickedDoubts(),
      notes: notes,
      project: projectText(notes),
      platform: "undecided",
      intent: "category",
      campaign: CFG.campaign || null,
      variant: VARIANT,
      landing_page: LANDING,
      language: document.documentElement.lang || "es",
      attribution: T.attribution()
    };
  }

  function setDots(n) {
    Array.prototype.forEach.call(document.querySelectorAll(".wiz-dot"), function (d) {
      var i = +d.getAttribute("data-dot");
      d.classList.toggle("active", i === n);
      d.classList.toggle("done", i < n);
    });
  }

  function go(n) {
    Array.prototype.forEach.call(form.querySelectorAll(".wiz-step"), function (s) {
      s.classList.toggle("active", +s.getAttribute("data-step") === n);
    });
    setDots(n);
    var r = panelEl.getBoundingClientRect();
    if (r.top < 0 || r.top > window.innerHeight * 0.4) panelEl.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderChips() {
    chipsEl.innerHTML = "";
    pickedTags().forEach(function (tag) {
      var c = document.createElement("span");
      c.className = "ff-chip";
      c.textContent = tag;
      chipsEl.appendChild(c);
    });
  }

  function toStep1() {
    errEl.classList.remove("show");
    go(1);
  }
  backBtn.addEventListener("click", toStep1);
  editBtn.addEventListener("click", toStep1);

  nextBtn.addEventListener("click", function () {
    var picked = pickedDoubts();
    if (!picked.length) {
      doubtField.classList.add("invalid");
      doubtField.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    doubtField.classList.remove("invalid");
    var data = baseData();

    // GA4 flattens arrays badly, so the selection also goes as a plain string.
    T.track("doubts_submitted", {
      landing_page: LANDING, variant: VARIANT,
      doubts: picked, doubts_csv: picked.join(","), doubt_count: picked.length,
      has_notes: !!data.notes
    });

    // Fire and forget: a failed save must never stand between the visitor
    // and step 2. Step 2 resends everything anyway.
    if (API) save(1, data, {}, 10000).catch(function () {});

    renderChips();
    go(2);
    loadBooking();
    setTimeout(function () { try { form.fullname.focus({ preventScroll: true }); } catch (e) {} }, 250);
  });

  // Say it on leaving the field, not only after they press send.
  form.email.addEventListener("blur", function () {
    if (!form.email.value.trim()) return;
    checkEmail();
    reportPersonal();
  });
  form.email.addEventListener("input", function () {
    var f = form.querySelector('.field[data-validate="email"]');
    syncCompany();
    if (f.classList.contains("invalid") && emailValid(form.email.value)) f.classList.remove("invalid");
  });
  if (form.company) form.company.addEventListener("input", function () {
    if (companyF.classList.contains("invalid") && form.company.value.trim().length >= 2) companyF.classList.remove("invalid");
  });

  sendBtn.addEventListener("click", function () {
    if (inFlight) return;
    errEl.classList.remove("show");

    var nameF = form.querySelector('.field[data-validate="text"]');
    var ok = true;
    if (!form.fullname.value.trim()) { nameF.classList.add("invalid"); ok = false; } else nameF.classList.remove("invalid");
    var emailOk = checkEmail();
    if (!emailOk) ok = false;
    reportPersonal();
    if (emailOk && !checkCompany()) ok = false;
    if (!ok) {
      (!form.fullname.value.trim() ? form.fullname : !emailOk ? form.email : form.company).focus();
      return;
    }

    var email = form.email.value.trim();
    var data = baseData();
    data.fullname = form.fullname.value.trim();
    data.email = email;
    // A work-email domain stands in for the company. A personal mailbox comes
    // with the company or its website instead, and that also goes at the head
    // of `project`: the alert email prints a fixed list of fields and shows
    // `project` for sure, so the company is never lost on a gmail lead.
    data.email_domain = emailDomain(email);
    data.email_type = isPersonalEmail(email) ? "personal" : "work";
    var company = companyValue();
    if (company) {
      data.company = company;
      if (looksLikeSite(company)) data.website = company;
      data.project = ("Empresa: " + company.replace(/[.\s]+$/, "") + "." + (data.project ? " " + data.project : "")).trim();
    }
    data.confirm = true;

    function done() {
      T.identify(email, { email_domain: data.email_domain, email_type: data.email_type, company: data.company || null });
      // Google Ads conversion: the signal the campaign bids on.
      T.conversion((CFG.analytics && CFG.analytics.googleAds || {}).leadLabel);
      T.track("lead_submitted", {
        intent: "category", landing_page: LANDING, variant: VARIANT, path: "form",
        email_type: data.email_type, has_company: !!data.company,
        doubts: data.doubts, doubts_csv: data.doubts.join(","),
        doubt_count: data.doubts.length
      });
      panelEl.style.display = "none";
      successEl.classList.add("show");
      successEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    if (!API) { done(); return; }

    inFlight = true; setBusy(true);
    save(2, data, { notify: true }, 15000)
      .then(function () { inFlight = false; setBusy(false); done(); })
      .catch(function () {
        inFlight = false; setBusy(false);
        errEl.textContent = MSG_NET; errEl.classList.add("show");
      });
  });
})();
