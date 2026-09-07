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
