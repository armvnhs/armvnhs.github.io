/* Adapted from Bencho's "Carousel" (MIT, bencho.dev/licence) — React version ported to plain JS for this static site. */
(function () {
  var root = document.querySelector("[data-carousel]");
  if (!root) return;

  var clamp = function (v, lo, hi) { return Math.min(hi, Math.max(lo, v)); };
  var mix = function (a, b, t) { return a + (b - a) * t; };
  var still = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);

  /* The deck never scrolls: it clicks from one card to the next, so the geometry is a pure function of the turn. */
  var STAGE_W = 720, NARROW_W = 400, THRESH = 700;
  var NEAR = 132, FAR = 236, NARROW_STEP = 104;
  var BASE = 760;
  var wide = true;

  var track = root.querySelector(".car-track");
  var cap = document.querySelector(".car-cap-link");
  var slots = [], count = 0;
  var turn = 0, raf = 0, shown = -1;

  function mod(n, m) { return ((n % m) + m) % m; }

  /* How far a card sits from the front, in px. One curve serves the whole glide, so nothing snaps mid-move. */
  function reach(ad, near, far) {
    if (ad <= 1) return ad * near;
    if (ad <= 2) return near + (ad - 1) * (far - near);
    return far + (ad - 2) * (far - near) * 0.85;
  }

  /* Where a card sits is ONE function, read every frame. `d` is how many spots the card is from the front,
     taken the short way round. The front card stands tall and square-on; the ones behind tuck under it. */
  function spot(i) {
    var n = slots.length, raw = i - turn;
    var d = raw - Math.round(raw / n) * n;
    var ad = Math.abs(d), side = d < 0 ? -1 : 1;

    if (!wide) {
      return {
        x: side * reach(ad, NARROW_STEP, NARROW_STEP * 1.6),
        y: Math.min(ad, 1) * 8,
        s: 1 - Math.min(ad, 1) * 0.28 - Math.max(0, ad - 1) * 0.14,
        z: Math.round(100 - ad * 10),
        o: ad <= 1 ? 1 : clamp(1.5 - ad, 0, 1),
        veil: Math.min(0.45, ad * 0.3)
      };
    }
    return {
      x: side * reach(ad, NEAR, FAR),
      y: ad <= 1 ? ad * 12 : 12 + (Math.min(ad, 2) - 1) * 14 + Math.max(0, ad - 2) * 8,
      s: ad <= 1 ? 1 - ad * 0.26 : 0.74 - (Math.min(ad, 2) - 1) * 0.16 - Math.max(0, ad - 2) * 0.12,
      z: Math.round(100 - ad * 10),
      o: ad <= 1 ? 1 : ad <= 2 ? mix(0.94, 0.5, ad - 1) : clamp((2.5 - ad) * 2, 0, 1) * 0.5,
      veil: ad <= 1 ? ad * 0.18 : 0.18 + (Math.min(ad, 2) - 1) * 0.16 + Math.max(0, ad - 2) * 0.22
    };
  }

  function paint() {
    slots.forEach(function (c, i) {
      var sp = spot(i);
      /* The ring is drawn in 3D: cards away from the front turn their faces outwards, so the deck reads as a curve. */
      var ad = Math.abs(i - turn - Math.round((i - turn) / slots.length) * slots.length);
      var side = i - turn < 0 ? -1 : 1;
      var ry = wide ? side * (ad <= 1 ? ad * 11 : 11 + (Math.min(ad, 2) - 1) * 9 + Math.max(0, ad - 2) * 7) : 0;
      c.el.style.transform = "translate(-50%, -50%) translate(" + sp.x.toFixed(2) + "px, " + sp.y.toFixed(2) + "px) scale(" + sp.s.toFixed(4) + ") rotateY(" + ry.toFixed(2) + "deg)";
      c.el.style.zIndex = String(sp.z);
      c.el.style.opacity = sp.o.toFixed(3);
      c.el.style.pointerEvents = sp.o > 0.45 ? "" : "none";
      c.el.style.setProperty("--veil", sp.veil.toFixed(3));
    });
    var f = mod(Math.round(turn), slots.length);
    if (f !== shown) { shown = f; caption(slots[f]); mark(mod(f, count)); }
  }

  /* One dot per project, so the stack says how many there are and can be jumped to. */
  var dots = null;
  function mark(f) {
    if (!dots) return;
    Array.prototype.forEach.call(dots.children, function (d, i) {
      d.classList.toggle("is-on", i === f);
      if (i === f) d.setAttribute("aria-current", "true"); else d.removeAttribute("aria-current");
    });
  }
  function buildDots() {
    if (dots) dots.remove();
    dots = document.createElement("div");
    dots.className = "car-dots";
    slots.slice(0, count).forEach(function (c, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "car-dot";
      b.setAttribute("aria-label", "Show " + (c.title || "project " + (i + 1)));
      b.addEventListener("click", function () {
        /* A short ring repeats cards, so aim at the copy of this project nearest the front. */
        var n = slots.length, at = Math.round(turn), pick = i, far = Infinity;
        for (var k = 0; k < n; k++) {
          if (mod(k, count) !== i) continue;
          var gap = Math.abs(k - at);
          if (gap < far) { far = gap; pick = k; }
        }
        glide(pick);
      });
      dots.appendChild(b);
    });
    root.insertAdjacentElement("afterend", dots);
  }

  function caption(c) {
    if (!cap || !c) return;
    cap.querySelector("b").textContent = c.title;
    cap.querySelector("span").textContent = c.cat;
    if (c.href) { cap.setAttribute("href", c.href); cap.removeAttribute("aria-disabled"); }
    else { cap.removeAttribute("href"); cap.setAttribute("aria-disabled", "true"); }
  }

  /* Quart-out from the live value, so a second click during a settle turns the ring further instead of snapping back. */
  function glide(to) {
    cancelAnimationFrame(raf);
    var from = turn;
    if (still || from === to) { turn = to; paint(); return; }
    var t0 = performance.now();
    var tick = function (now) {
      var p = Math.min(1, (now - t0) / BASE);
      turn = mix(from, to, 1 - Math.pow(1 - p, 5));
      paint();
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }

  function build() {
    var els = Array.prototype.slice.call(track.querySelectorAll(".car-slot"));
    count = els.length;
    /* Four projects cannot pad a five-card desktop row on their own, so the ring repeats a card rather than
       showing an empty side. The copies are decoration only: they add no dots and share their original's data. */
    while (els.length < Math.max(count, 5)) {
      var copy = els[els.length - count].cloneNode(true);
      track.appendChild(copy);
      els.push(copy);
    }
    slots = els.map(function (el) {
      var link = el.querySelector(".car-card"), img = link.querySelector("img");
      var c = { el: el, link: link, title: el.dataset.title, cat: el.dataset.cat, href: el.dataset.href };
      img.addEventListener("error", function () { empty(c); });
      /* The cover may already have failed before this script ran, so check the finished image too. */
      if (img.complete && !img.naturalWidth) empty(c);
      link.addEventListener("click", function (e) {
        /* The click that ends a drag must not navigate away. */
        if (Date.now() - suppressed < 400) { e.preventDefault(); return; }
        var i = slots.indexOf(c);
        if (i === mod(Math.round(turn), slots.length) && c.href) return;
        e.preventDefault();
        var d = mod(i - turn + slots.length / 2, slots.length) - slots.length / 2;
        glide(Math.round(turn + d));
      });
      return c;
    });
    turn = Math.floor((slots.length - 1) / 2);
    buildDots();
  }

  /* A cover that fails to load keeps its place, showing the project's initial instead of a broken image. */
  function empty(c) {
    if (!c || !c.link) return;
    var img = c.link.querySelector("img");
    if (img) img.style.display = "none";
    c.link.dataset.mono = (c.title || " ").charAt(0).toUpperCase();
    c.link.classList.add("is-empty");
  }

  function drop(c) {
    var i = slots.indexOf(c);
    if (i < 0) return;
    c.el.remove();
    slots.splice(i, 1);
    if (!slots.length) { root.closest("section").hidden = true; return; }
    if (count > slots.length) count = slots.length;
    turn = Math.round(turn);
    shown = -1;
    buildDots();
    paint();
  }

  track.addEventListener("keydown", function (e) {
    var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    glide(Math.round(turn) + d);
  });

  /* Dragging across the deck turns the ring: the cards follow the pointer and settle on the nearest one.
     A small movement still counts as a click/navigation, so the front card keeps opening its project. */
  var DRAG_STEP = 150, drag = null, suppressed = 0;

  root.addEventListener("dragstart", function (e) { e.preventDefault(); });

  root.addEventListener("pointerdown", function (e) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    cancelAnimationFrame(raf);
    drag = { id: e.pointerId, x0: e.clientX, t0: turn, moved: false };
  });

  root.addEventListener("pointermove", function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    var dx = e.clientX - drag.x0;
    if (!drag.moved) {
      if (Math.abs(dx) < 6) return;
      drag.moved = true;
      root.classList.add("is-dragging");
      try { root.setPointerCapture(e.pointerId); } catch (err) {}
    }
    var now = performance.now();
    if (drag.lx !== undefined && now - drag.lt > 0) drag.vx = mix(drag.vx || 0, (e.clientX - drag.lx) / (now - drag.lt), 0.6);
    drag.lx = e.clientX; drag.lt = now;
    turn = clamp(drag.t0 - dx / DRAG_STEP, Math.round(drag.t0) - 3, Math.round(drag.t0) + 3);
    paint();
  });

  /* The card in front leans towards the pointer, so the stack behaves like a solid object in the page. */
  function lean(el, x, y) {
    var r = el.getBoundingClientRect();
    if (x < r.left || x > r.right || y < r.top || y > r.bottom) return false;
    var px = (x - r.left) / r.width - 0.5, py = (y - r.top) / r.height - 0.5;
    el.style.setProperty("--hx", (-py * 9).toFixed(2) + "deg");
    el.style.setProperty("--hy", (px * 12).toFixed(2) + "deg");
    return true;
  }
  function flat(el) {
    if (!el) return;
    el.style.setProperty("--hx", "0deg");
    el.style.setProperty("--hy", "0deg");
  }
  var leaned = null;
  root.addEventListener("pointermove", function (e) {
    if (drag && drag.moved) { flat(leaned); return; }
    var f = slots[mod(Math.round(turn), slots.length)];
    if (!f || !f.link) return;
    if (lean(f.link, e.clientX, e.clientY)) leaned = f.link;
    else if (leaned !== f.link) { flat(leaned); leaned = null; }
    else flat(leaned);
  });
  root.addEventListener("pointerleave", function () { flat(leaned); });

  function endDrag(e) {
    if (!drag || (e && e.pointerId !== drag.id)) return;
    var moved = drag.moved, thrown = drag.vx || 0;
    drag = null;
    root.classList.remove("is-dragging");
    if (!moved) return;
    suppressed = Date.now();
    /* A flick carries on for a card or two instead of stopping dead under the pointer. */
    var carry = clamp(-thrown * 0.22, -1.4, 1.4);
    glide(Math.round(turn + carry));
  }
  root.addEventListener("pointerup", endDrag);
  root.addEventListener("pointercancel", endDrag);

  /* The stage is a fixed width per layout so the geometry never changes; a narrower screen scales the whole thing. */
  function fit() {
    wide = root.clientWidth >= THRESH;
    var stage = wide ? STAGE_W : NARROW_W;
    root.style.setProperty("--stage", stage + "px");
    root.style.setProperty("--k", Math.min(1, root.clientWidth / stage).toFixed(4));
    if (slots.length) paint();
  }
  fit();
  addEventListener("resize", fit);

  build();
  if (slots.length) paint();
})();
