/* HUHUTECH site interactions */
(function () {
  "use strict";

  /* ---- mobile nav ---- */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      links.classList.toggle("open");
      var open = links.classList.contains("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") links.classList.remove("open");
    });
  }

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- scroll reveal + count-up + bars ---- */
  var nodes = document.querySelectorAll("[data-reveal],[data-count],.bar-fill");

  function revealNow(el){
    el.classList.add("in");
    if (el.hasAttribute("data-count")) countUp(el);
    if (el.classList.contains("bar-fill")) el.style.width = el.getAttribute("data-w") + "%";
  }

  if (!("IntersectionObserver" in window)) {
    /* unsupported browser: just show everything */
    nodes.forEach(revealNow);
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      revealNow(en.target);
      io.unobserve(en.target);
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });

  nodes.forEach(function (el) {
    if (el.classList.contains("bar-fill") && reduce) { el.style.width = el.getAttribute("data-w") + "%"; }
    if (el.hasAttribute("data-count") && !reduce) {
      var dec0 = parseInt(el.getAttribute("data-dec") || "0", 10);
      el.textContent = (el.getAttribute("data-prefix") || "") + (0).toFixed(dec0) + (el.getAttribute("data-suffix") || "");
    }
    io.observe(el);
  });

  /* failsafe: after full load, force-reveal anything still hidden inside the viewport
     or above it (covers edge cases where the observer never fired) */
  window.addEventListener("load", function () {
    setTimeout(function () {
      nodes.forEach(function (el) {
        if (el.classList.contains("in")) return;
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 1.1) { revealNow(el); io.unobserve(el); }
      });
    }, 400);
  });

  function countUp(el) {
    if (reduce) { el.textContent = el.getAttribute("data-final"); return; }
    var target = parseFloat(el.getAttribute("data-count"));
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    var dec = parseInt(el.getAttribute("data-dec") || "0", 10);
    var dur = 1100, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = target * eased;
      el.textContent = prefix + val.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = prefix + target.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suffix;
    }
    requestAnimationFrame(step);
  }

  /* ---- year ---- */
  var y = document.getElementById("yr");
  if (y) y.textContent = new Date().getFullYear();

  /* ---- contact / alerts: client-side validation + mailto handoff ---- */
  document.querySelectorAll("form[data-mailto]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var to = f.getAttribute("data-mailto");
      var subj = encodeURIComponent(f.getAttribute("data-subject") || "Website inquiry");
      var lines = [];
      f.querySelectorAll("input,textarea,select").forEach(function (inp) {
        if (inp.name && inp.value) lines.push(inp.previousElementSibling ? inp.previousElementSibling.textContent + ": " + inp.value : inp.value);
      });
      var body = encodeURIComponent(lines.join("\n"));
      var note = f.querySelector(".form-note");
      if (note) { note.textContent = "Opening your email client…"; note.style.color = "var(--green)"; }
      window.location.href = "mailto:" + to + "?subject=" + subj + "&body=" + body;
    });
  });
})();
