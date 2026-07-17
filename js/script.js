/* LuxuryRoomDesign — interactions */
(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- sticky header ---------- */
  var header = document.querySelector('.site-header');
  function onScroll() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- mobile nav ---------- */
  var burger = document.querySelector('.burger');
  var nav = document.querySelector('.main-nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('open');
        burger.classList.remove('open');
      });
    });
  }

  /* ---------- reveals ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.14 });
  document.querySelectorAll('.reveal, .reveal-fade').forEach(function (el) { io.observe(el); });

  /* ---------- counters ---------- */
  var cio = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      cio.unobserve(e.target);
      var el = e.target, target = parseFloat(el.getAttribute('data-count')) || 0;
      var suffix = el.getAttribute('data-suffix') || '';
      var dur = 1600, t0 = null;
      function tick(ts) {
        if (!t0) t0 = ts;
        var p = Math.min((ts - t0) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        var val = target * eased;
        el.textContent = (target % 1 === 0 ? Math.round(val) : val.toFixed(1)) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      if (prefersReduced) { el.textContent = target + suffix; }
      else requestAnimationFrame(tick);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-count]').forEach(function (el) { cio.observe(el); });

  /* ---------- FAQ ---------- */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q'), a = item.querySelector('.faq-a');
    if (!q || !a) return;
    q.addEventListener('click', function () {
      var open = item.classList.toggle('open');
      q.setAttribute('aria-expanded', open ? 'true' : 'false');
      a.style.maxHeight = open ? a.scrollHeight + 'px' : '0px';
    });
  });

  /* ============================================================
     DAY / NIGHT ROOM LIGHTING TOGGLE
     ============================================================ */
  var roomPrev = document.getElementById('room-preview');
  if (roomPrev) {
    var switchBtn = roomPrev.querySelector('.light-switch');
    var dayLbl = roomPrev.querySelector('[data-lbl="day"]');
    var nightLbl = roomPrev.querySelector('[data-lbl="night"]');
    var caption = roomPrev.querySelector('.room-caption');
    function setMode(night) {
      roomPrev.classList.toggle('night', night);
      if (dayLbl) dayLbl.classList.toggle('on', !night);
      if (nightLbl) nightLbl.classList.toggle('on', night);
      if (caption) caption.textContent = night ? 'The velvet hour — 7:42 pm' : 'Morning light — 9:15 am';
      switchBtn.setAttribute('aria-pressed', night ? 'true' : 'false');
      if (typeof gtag === 'function') {
        gtag('event', 'room_light_toggle', { event_category: 'engagement', event_label: night ? 'night' : 'day' });
      }
    }
    switchBtn.addEventListener('click', function () {
      setMode(!roomPrev.classList.contains('night'));
    });
    /* gentle auto-demo once, when it first scrolls into view */
    if (!prefersReduced) {
      var demoDone = false;
      var rio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting && !demoDone) {
            demoDone = true;
            rio.unobserve(roomPrev);
            setTimeout(function () { roomPrev.classList.add('night'); nightLbl.classList.add('on'); dayLbl.classList.remove('on'); if (caption) caption.textContent = 'The velvet hour — 7:42 pm'; }, 1600);
            setTimeout(function () { roomPrev.classList.remove('night'); dayLbl.classList.add('on'); nightLbl.classList.remove('on'); if (caption) caption.textContent = 'Morning light — 9:15 am'; }, 3800);
          }
        });
      }, { threshold: 0.5 });
      rio.observe(roomPrev);
    }
  }

  /* ============================================================
     SCROLLYTELLING CASE STUDY — sticky media, step-driven swaps
     ============================================================ */
  var story = document.getElementById('story');
  if (story) {
    var imgs = Array.prototype.slice.call(story.querySelectorAll('.story-media img'));
    var steps = Array.prototype.slice.call(story.querySelectorAll('.story-step'));
    var phase = story.querySelector('.story-phase');
    function activate(idx) {
      imgs.forEach(function (im, i) { im.classList.toggle('active', i === idx); });
      steps.forEach(function (st, i) { st.classList.toggle('active', i === idx); });
      if (phase) phase.textContent = steps[idx].getAttribute('data-phase') || '';
    }
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) activate(steps.indexOf(e.target));
      });
    }, { rootMargin: '-42% 0px -42% 0px', threshold: 0 });
    steps.forEach(function (st) { sio.observe(st); });
    activate(0);
  }

  /* ---------- contact form ---------- */
  var form = document.getElementById('contact-form');
  if (form) {
    function validateField(field) {
      var wrap = field.closest('.field');
      if (!wrap) return true;
      var ok = true;
      var v = field.value.trim();
      if (field.hasAttribute('required') && !v) ok = false;
      if (ok && field.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) ok = false;
      wrap.classList.toggle('invalid', !ok);
      return ok;
    }
    form.querySelectorAll('input, select, textarea').forEach(function (f) {
      f.addEventListener('blur', function () { validateField(f); });
      f.addEventListener('input', function () {
        var w = f.closest('.field');
        if (w && w.classList.contains('invalid')) validateField(f);
      });
    });
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var allOk = true;
      form.querySelectorAll('input, select, textarea').forEach(function (f) {
        if (!validateField(f)) allOk = false;
      });
      if (!allOk) return;
      var ok = document.getElementById('form-ok');
      if (ok) ok.classList.add('show');
      form.reset();
      if (typeof gtag === 'function') {
        gtag('event', 'generate_lead', { event_category: 'form', event_label: 'contact_form' });
      }
      setTimeout(function () { if (ok) ok.classList.remove('show'); }, 6000);
    });
  }

  /* ---------- footer year ---------- */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ============================================================
     COOKIE CONSENT (Consent Mode v2)
     ============================================================ */
  var KEY = 'lrd_cookie_consent';
  var pop = document.getElementById('cookie-pop');
  function applyConsent(granted) {
    if (typeof gtag === 'function') {
      gtag('consent', 'update', {
        analytics_storage: granted ? 'granted' : 'denied',
        ad_storage: granted ? 'granted' : 'denied',
        ad_user_data: granted ? 'granted' : 'denied',
        ad_personalization: granted ? 'granted' : 'denied'
      });
    }
  }
  try {
    var saved = localStorage.getItem(KEY);
    if (saved === 'granted') applyConsent(true);
    else if (saved === 'denied') applyConsent(false);
    else if (pop) setTimeout(function () { pop.classList.add('show'); }, 1200);
  } catch (e) {
    if (pop) setTimeout(function () { pop.classList.add('show'); }, 1200);
  }
  var acceptBtn = document.getElementById('cookie-accept');
  var declineBtn = document.getElementById('cookie-decline');
  if (acceptBtn) acceptBtn.addEventListener('click', function () {
    try { localStorage.setItem(KEY, 'granted'); } catch (e) {}
    applyConsent(true);
    if (pop) pop.classList.remove('show');
  });
  if (declineBtn) declineBtn.addEventListener('click', function () {
    try { localStorage.setItem(KEY, 'denied'); } catch (e) {}
    applyConsent(false);
    if (pop) pop.classList.remove('show');
  });
})();
