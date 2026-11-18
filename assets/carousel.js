/* Adapted from Bencho's "Carousel" (MIT, bencho.dev/licence) — React version ported to plain JS for this static site. */
(function () {
  var root = document.querySelector("[data-carousel]");
  if (!root) return;

  var clamp = function (v, lo, hi) { return Math.min(hi, Math.max(lo, v)); };
  var mix = function (a, b, t) { return a + (b - a) * t; };
  var still = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);

  /* The numbers keep Bencho's tuned values: knobs at 50 are the middle of every range. */
  var STAGE_W = 720, NARROW_W = 400, THRESH = 700, STEP = 150, GAP = 116, PULL = 140, TOSS = 150, MOST = 2, BASE = 620;
  var wide = true;
  var FLOAT = 15, SINK = 50, CORNER = 20;
  var PERIOD = [4.7, 5.9, 6.7, 5.3, 7.1, 6.1];
  /* Spring at tune 50: stiffness 0.16, decay 0.72, zeta about 0.41 — an overshoot you can see, not one that rings. */
  var K = 0.16, D = 0.72;

  var track = root.querySelector(".car-track");
  var cap = document.querySelector(".car-cap-link");
  var slots = [], count = 0;
  var turn = 0, raf = 0, held = false, drag = null, shown = -1;

  function mod(n, m) { return ((n % m) + m) % m; }

  /* Where a card sits is ONE function: first paint and drag both read it. `d` is how many spots the card is
     from the front, taken the short way round so a drag never sends a card across the whole stack.
     The front card stands tall and square-on; the ones behind shrink, tuck underneath it and go pale. */
  /* Wide screens show two cards each side so the row fills the column; narrow ones fall back to one each side. */
  function spot(i) {
    var n = slots.length, raw = i - turn;
    var d = raw - Math.round(raw / n) * n;
    var ad = Math.abs(d), near = Math.min(ad, 1), side = d < 0 ? -1 : 1;
    if (!wide) {
      return {
        x: d * GAP,
        y: near * 8,
        s: 1 - near * 0.3,
        z: Math.round(100 - ad * 10),
        o: ad < 1 ? 1 : Math.max(0, Math.min(1, 1.9 - ad)),
        veil: Math.min(0.35, ad * 0.35)
      };
    }
    var far = ad >= 2;
    return {
      x: side * Math.min(ad, 3) * STEP,
      y: far ? 24 : near * 10,
      s: ad < 1 ? 1 : far ? 0.56 : 0.72,
      z: Math.round(100 - ad * 10),
      o: far ? 0.55 : ad < 1 ? 1 : 0.94,
      veil: far ? 0.4 : near * 0.2
    };
  }

  function paint() {
    slots.forEach(function (c, i) {
      var sp = spot(i);
      c.el.style.transform = "translate(-50%, -50%) translate(" + sp.x.toFixed(2) + "px, " + sp.y.toFixed(2) + "px) scale(" + sp.s.toFixed(4) + ")";
      c.el.style.zIndex = String(sp.z);
      c.el.style.opacity = sp.o.toFixed(3);
      c.el.style.pointerEvents = sp.o > 0.5 ? "" : "none";
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

  /* Quart-out from the live value, so a second swipe during a settle turns the ring further instead of snapping back. */
  function glide(to) {
    cancelAnimationFrame(raf);
    var from = turn;
    if (still || from === to) { turn = to; paint(); return; }
    var t0 = performance.now();
    var tick = function (now) {
      var p = Math.min(1, (now - t0) / BASE);
      turn = mix(from, to, 1 - Math.pow(1 - p, 4));
      paint();
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }

  /* One shared spring loop that parks itself the moment everything has settled. */
  var live = new Set(), loop = 0;
  function run() {
    if (loop) return;
    var prev = 0;
    var tick = function (t) {
      var dt = prev ? clamp((t - prev) / 16.67, 0, 2.5) : 1;
      prev = t;
      var alive = false;
      live.forEach(function (c) { if (c.step(dt)) alive = true; else live.delete(c); });
      loop = alive ? requestAnimationFrame(tick) : 0;
    };
    loop = requestAnimationFrame(tick);
  }

  /* The press sinks, it does not lift: the point under the pointer goes away and the far side comes up. */
  function Tilt(card, sheen) {
    var S = { x: { c: 0, v: 0, t: 0 }, y: { c: 0, v: 0, t: 0 }, l: { c: 0, v: 0, t: 0 } };
    var deep = SINK / 100, self = this;
    function one(s, dt) {
      s.v += (s.t - s.c) * K * dt;
      s.v *= Math.pow(D, dt);
      s.c += s.v * dt;
      if (Math.abs(s.t - s.c) < 0.02 && Math.abs(s.v) < 0.02) { s.c = s.t; s.v = 0; return false; }
      return true;
    }
    function draw() {
      var px = ((S.x.c + 1) / 2) * 100, py = ((S.y.c + 1) / 2) * 100;
      var dark = deep * 0.5 * S.l.c, rim = deep * 0.16 * S.l.c;
      card.style.transform = "translateZ(" + (-10 * deep * S.l.c).toFixed(2) + "px) rotateX(" + (-S.y.c * deep * 13).toFixed(2) + "deg) rotateY(" + (S.x.c * deep * 13).toFixed(2) + "deg)";
      sheen.style.backgroundImage = "radial-gradient(44% 36% at " + px.toFixed(1) + "% " + py.toFixed(1) + "%, rgba(9,14,28," + dark.toFixed(3) + ") 0%, rgba(9,14,28,0) 100%), radial-gradient(54% 44% at " + (100 - px).toFixed(1) + "% " + (100 - py).toFixed(1) + "%, rgba(255,255,255," + rim.toFixed(3) + ") 0%, rgba(255,255,255,0) 100%)";
    }
    this.step = function (dt) { var a = one(S.x, dt), b = one(S.y, dt), c = one(S.l, dt); draw(); return a || b || c; };
    this.aim = function (x, y, on) { S.x.t = on ? x : 0; S.y.t = on ? y : 0; S.l.t = on ? 1 : 0; live.add(self); run(); };
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
    slots = els.map(function (el, i) {
      var link = el.querySelector(".car-card"), img = link.querySelector("img"), sheen = link.querySelector(".car-sheen");
      var c = { el: el, link: link, title: el.dataset.title, cat: el.dataset.cat, href: el.dataset.href, tilt: new Tilt(link, sheen) };
      el.querySelector(".car-float").style.animationDuration = PERIOD[i % PERIOD.length] + "s";
      img.addEventListener("error", function () { drop(c); });
      link.addEventListener("pointermove", function (e) {
        if (held || still || e.pointerType === "touch") return;
        var b = link.getBoundingClientRect();
        c.tilt.aim(clamp(((e.clientX - b.left) / b.width) * 2 - 1, -1, 1), clamp(((e.clientY - b.top) / b.height) * 2 - 1, -1, 1), true);
      });
      link.addEventListener("pointerout", function (e) { if (!e.relatedTarget || !link.contains(e.relatedTarget)) c.tilt.aim(0, 0, false); });
      link.addEventListener("click", function (e) {
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

  /* A cover that fails to load takes its card with it, rather than leaving a blank one on the ring. */
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

  /* Pointer capture waits until the drag is real, so a plain tap still reaches the link underneath. */
  track.addEventListener("pointerdown", function (e) {
    cancelAnimationFrame(raf);
    drag = { x0: e.clientX, t0: turn, last: e.clientX, t: e.timeStamp, vx: 0, moved: false };
  });
  track.addEventListener("pointermove", function (e) {
    if (!drag) return;
    var dx = e.clientX - drag.x0;
    if (!drag.moved && Math.abs(dx) > 3) {
      drag.moved = true; held = true;
      slots.forEach(function (c) { c.tilt.aim(0, 0, false); });
      try { track.setPointerCapture(e.pointerId); } catch (err) { /* not a live pointer */ }
    }
    var dt = Math.max(1, e.timeStamp - drag.t);
    drag.vx = (drag.vx + (e.clientX - drag.last) / dt) / 2;
    drag.last = e.clientX; drag.t = e.timeStamp;
    if (drag.moved) { turn = drag.t0 - dx / PULL; paint(); }
  });
  function up() {
    if (!drag) return;
    var g = drag; drag = null; held = false;
    if (!g.moved) return;
    var carry = clamp((-g.vx * TOSS) / PULL, -MOST, MOST);
    glide(Math.round(turn + carry));
  }
  track.addEventListener("pointerup", up);
  track.addEventListener("pointercancel", up);
  track.addEventListener("keydown", function (e) {
    var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    glide(Math.round(turn) + d);
  });

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
