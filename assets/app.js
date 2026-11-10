/* OZE — Premium Swiss Chocolate
   One fixed stage. Each scroll, swipe or key press moves one step forward or back. */
(() => {
  'use strict';

  // EmailJS keys. While empty, the form opens WhatsApp with the request already written.
  const EMAILJS = { publicKey: '', serviceId: '', templateId: '' };
  const WHATSAPP = '966551004442';
  const AR = document.documentElement.lang === 'ar';
  const BASE = AR ? '../' : ''; // Arabic page lives in /ar/, so asset paths step up one folder
  const SHOP = { lat: 24.7232009, lng: 46.6520852 };

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const mm = (q) => matchMedia(q).matches;
  const reduced = mm('(prefers-reduced-motion: reduce)');
  const portrait = mm('(max-aspect-ratio: 1/1)');
  const mobile = mm('(max-width: 900px)');
  const fine = mm('(hover: hover) and (pointer: fine)');
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ---------- logo from one traced source ---------- */
  const LG = window.OZE_LOGO, letters = ['O', 'Z', 'E'];
  const sym = $('#oze-logo');
  sym.setAttribute('viewBox', `0 0 ${LG.W} ${LG.H}`);
  sym.innerHTML = letters.map((k) => `<path fill-rule="evenodd" d="${LG[k]}"/>`).join('');
  $$('.intro__mark').forEach((svg) => {
    svg.setAttribute('viewBox', `0 0 ${LG.W} ${LG.H}`);
    svg.innerHTML = letters.map((k) => `<path class="l l${k}" fill-rule="evenodd" d="${LG[k]}"/>`).join('');
  });
  $$('[data-year]').forEach((y) => (y.textContent = new Date().getFullYear()));

  /* ---------- opening hours, live in Riyadh time ---------- */
  const openNow = () => {
    const p = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Riyadh', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date());
    const g = (t) => p.find((x) => x.type === t)?.value;
    const h = (+g('hour') % 24) + (+g('minute')) / 60, opens = g('weekday') === 'Fri' ? 15 : 13;
    return { open: h >= opens && h < 23, text: h >= opens && h < 23 ? (AR ? 'مفتوح الآن حتى 11:00 م' : 'Open now until 11:00 PM') : h >= 23 ? (AR ? 'مغلق الآن، نفتح غداً الساعة 1:00 م' : 'Closed now, opens tomorrow at 1:00 PM') : (AR ? `مغلق الآن، نفتح الساعة ${opens === 15 ? '3' : '1'}:00 م` : `Closed now, opens at ${opens === 15 ? '3' : '1'}:00 PM`) };
  };
  const st = openNow();
  $$('[data-dot]').forEach((d) => d.classList.toggle('is-closed', !st.open));
  $$('[data-status]').forEach((d) => (d.textContent = st.text));

  /* ---------- films ---------- */
  const heroVid = $('.s-hero video'), sealVid = $('.s-seal video');
  [heroVid, sealVid].forEach((v) => { v.muted = true; v.playsInline = true; });
  heroVid.poster = `${BASE}assets/img/pour-poster-${portrait ? 'm' : 'd'}.jpg`;
  heroVid.src = `${BASE}assets/video/pour-${portrait ? 'm' : 'd'}.mp4`;
  sealVid.poster = `${BASE}assets/img/gold-poster-${portrait ? 'm' : 'd'}.jpg`;
  const play = (v) => { const p = v.play(); p && p.catch && p.catch(() => {}); };
  const loadSeal = () => { if (!sealVid.src) { sealVid.src = `${BASE}assets/video/gold-${portrait ? 'm' : 'd'}.mp4`; sealVid.load(); } };

  /* ---------- elements ---------- */
  const S = {
    hero: $('.s-hero'), seal: $('.s-seal'), sig: $('.s-sig'), box: $('.s-box'), bes: $('.s-bespoke'), con: $('.s-contact'),
  };
  const header = $('.header'), dots = $('.dots'), hint = $('.scroll-hint'), veil = $('.veil');
  const figs = $$('.sig__frame figure'), names = $$('.sig__name'), sdescs = $$('.sig__desc');
  const oimgs = $$('.occ__img'), onames = $$('.occ__name'), odescs = $$('.occ__descs p');
  const steps = $$('.step');

  /* ---------- initial states ---------- */
  gsap.set('.hero__title .mask > span', { yPercent: 115 });
  gsap.set('.hero__side', { autoAlpha: 0, y: 24 });
  gsap.set(S.seal, { autoAlpha: 0 });
  gsap.set('.seal', { autoAlpha: 0 });
  gsap.set(['.seal-copy h2', '.seal-copy p'], { autoAlpha: 0, y: 40 });
  gsap.set(S.sig, { clipPath: 'circle(0% at 50% 50%)' });
  gsap.set(['.sig__head', '.sig__text .tlink', '.sig__thumbs'], { autoAlpha: 0 });
  gsap.set(S.box, { xPercent: 100 });
  gsap.set('.occ__img', { visibility: 'hidden' });
  gsap.set('.blinds i', { scaleY: 0 });
  gsap.set(['.bes__head > *', '.bes__cta'], { autoAlpha: 0, y: 40 });
  gsap.set(steps, { autoAlpha: 0, y: 40 });
  gsap.set(S.con, { clipPath: 'inset(0% 50% 0% 50%)' });
  gsap.set(['.s-contact .inner > *', '.c-foot'], { autoAlpha: 0, y: 30 });

  /* ---------- the master timeline ---------- */
  const M = gsap.timeline({ paused: true, defaults: { ease: 'power3.inOut' } });
  const STEPS = [];
  const mark = (label, sec, theme, t) => { M.addLabel(label, t); STEPS.push({ label, sec, theme }); };
  const show = (el, t) => M.set(el, { visibility: 'visible' }, t);
  const hide = (el, t) => M.set(el, { visibility: 'hidden' }, t);
  const clipIn = (el, t, d = 0.75) => M.fromTo(el, { clipPath: 'inset(0% 0% 100% 0%)', y: 40, visibility: 'visible' }, { clipPath: 'inset(0% 0% -20% 0%)', y: 0, duration: d, ease: 'power3.out' }, t);
  const clipOut = (el, t, d = 0.45) => M.to(el, { clipPath: 'inset(-20% 0% 100% 0%)', y: -30, duration: d, ease: 'power2.in' }, t);
  const fadeIn = (el, t, d = 0.6) => M.fromTo(el, { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: d, ease: 'power3.out' }, t);
  const fadeOut = (el, t, d = 0.35) => M.to(el, { autoAlpha: 0, y: -16, duration: d, ease: 'power2.in' }, t);
  let t = 0;

  // 1 · welcome
  mark('hero', 0, 'dark', 0);

  // → 2 · sealed by hand : the camera falls into the chocolate, a seal is pressed
  show(S.seal, t);
  M.to('.s-hero .media', { scale: 1.6, autoAlpha: 0, duration: 1.3, ease: 'power2.in' }, t);
  M.to('.hero__body', { y: -70, autoAlpha: 0, duration: 0.55, ease: 'power2.in' }, t);
  M.fromTo(S.seal, { autoAlpha: 0, scale: 1.3 }, { autoAlpha: 1, scale: 1, duration: 1.2, ease: 'power3.out' }, t + 0.55);
  M.fromTo('.seal', { autoAlpha: 0, scale: 2.8, rotate: -20 }, { autoAlpha: 1, scale: 1, rotate: 0, duration: 0.5, ease: 'power4.in' }, t + 1.15);
  M.to('.seal-wrap', { keyframes: [{ x: -7, duration: 0.05 }, { x: 6, duration: 0.06 }, { x: -3, duration: 0.07 }, { x: 0, duration: 0.08 }], ease: 'none' }, t + 1.65);
  M.fromTo('.seal .ripple', { scale: 0.8, autoAlpha: 1 }, { scale: 2, autoAlpha: 0, duration: 0.9, ease: 'power2.out' }, t + 1.65);
  fadeIn('.seal-copy h2', t + 1.7, 0.7);
  fadeIn('.seal-copy p', t + 1.82, 0.7);
  hide(S.hero, t + 1.75);
  t += 2.5; mark('seal', 1, 'dark', t);

  // → 3 · signatures : a white circle opens from the centre
  show(S.sig, t);
  M.fromTo(S.sig, { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(75% at 50% 50%)', duration: 1.3, ease: 'power3.inOut' }, t);
  M.to('.seal-wrap', { scale: 0.86, autoAlpha: 0, duration: 0.8, ease: 'power2.in' }, t);
  M.fromTo(figs[0], { clipPath: 'inset(100% 0% 0% 0%)', visibility: 'visible' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'power3.inOut' }, t + 0.55);
  M.fromTo($('img', figs[0]), { scale: 1.25 }, { scale: 1, duration: 1.3, ease: 'power3.out' }, t + 0.55);
  fadeIn(['.sig__head', '.sig__text .tlink', '.sig__thumbs'], t + 0.75);
  clipIn(names[0], t + 0.85);
  fadeIn(sdescs[0], t + 1.0);
  M.set(sdescs[0], { visibility: 'visible' }, t + 1.0);
  hide(S.seal, t + 1.3);
  t += 1.85; mark('sig1', 2, 'light', t);
  for (let i = 1; i < 6; i++) {
    M.fromTo(figs[i], { clipPath: 'inset(0% 0% 0% 100%)', visibility: 'visible' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'power3.inOut' }, t);
    M.fromTo($('img', figs[i]), { scale: 1.2, xPercent: 8 }, { scale: 1, xPercent: 0, duration: 1.1, ease: 'power3.out' }, t);
    M.to($('img', figs[i - 1]), { xPercent: -10, duration: 1, ease: 'power3.inOut' }, t);
    hide(figs[i - 1], t + 1);
    clipOut(names[i - 1], t);
    fadeOut(sdescs[i - 1], t);
    clipIn(names[i], t + 0.4);
    M.set(sdescs[i], { visibility: 'visible' }, t + 0.5);
    fadeIn(sdescs[i], t + 0.5);
    t += 1.25; mark('sig' + (i + 1), 2, 'light', t);
  }

  // → 4 · the box : the gallery slides away, the box arrives from the right
  show(S.box, t);
  M.to(S.sig, { xPercent: -100, duration: 1.3, ease: 'power3.inOut' }, t);
  M.fromTo(S.box, { xPercent: 100 }, { xPercent: 0, duration: 1.3, ease: 'power3.inOut' }, t);
  M.fromTo('.gift', { rotate: 8, xPercent: -30 }, { rotate: 0, xPercent: -50, duration: 1.5, ease: 'power3.out' }, t + 0.1);
  hide(S.sig, t + 1.3);
  t += 1.6; mark('box', 3, 'light', t);

  // untie → lid → the first occasion rises out of the box and fills the screen
  const base = $('.gift__base'), occ = $('.occ');
  const rect = () => { const r = base.getBoundingClientRect(), s = S.box.getBoundingClientRect(); return { t: r.top - s.top, l: r.left - s.left, r: s.right - r.right, h: r.height, H: s.height }; };
  const clipLine = () => { const b = rect(); return `inset(${b.t}px ${b.r}px ${b.H - b.t}px ${b.l}px)`; };
  const clipCard = () => { const b = rect(); return `inset(${Math.max(0, b.t - b.h * 1.1)}px ${b.r}px ${b.H - b.t}px ${b.l}px)`; };
  M.set(occ, { clipPath: clipLine }, t);
  M.set(oimgs[0], { visibility: 'visible' }, t);
  M.to('.box-copy', { autoAlpha: 0, y: -40, duration: 0.5, ease: 'power2.in' }, t);
  M.to('.bow .loop--l', { scaleX: 0, rotate: 30, duration: 0.7, ease: 'power2.in' }, t);
  M.to('.bow .loop--r', { scaleX: 0, rotate: -30, duration: 0.7, ease: 'power2.in' }, t);
  M.to('.bow .tail', { y: 46, autoAlpha: 0, duration: 0.55, ease: 'power2.in' }, t + 0.15);
  M.to('.bow .knot', { scale: 0, transformOrigin: '50% 50%', duration: 0.3, ease: 'power2.in' }, t + 0.5);
  M.to('.tag', { rotate: 70, y: () => innerHeight * 0.6, autoAlpha: 0, duration: 0.9, ease: 'power2.in' }, t + 0.1);
  M.to('.gift__lid .ribbon--v', { scaleY: 0, duration: 0.4, ease: 'power2.in' }, t + 0.5);
  M.to('.gift__base .ribbon--v', { scaleY: 0, duration: 0.45, ease: 'power2.in' }, t + 0.55);
  M.to('.gift__base .ribbon--h', { scaleX: 0, duration: 0.45, ease: 'power2.in' }, t + 0.6);
  M.to('.gift__lid', { y: () => -innerHeight * 0.07, rotate: -3, duration: 0.35, ease: 'power2.out' }, t + 1.0);
  M.to('.gift__inside', { autoAlpha: 1, duration: 0.2 }, t + 1.05);
  M.to('.gift__lid', { y: () => -innerHeight * 1.1, x: () => innerWidth * 0.08, rotate: -16, duration: 0.7, ease: 'power2.in' }, t + 1.3);
  M.to(occ, { clipPath: clipCard, duration: 0.6, ease: 'power3.out' }, t + 1.65);
  M.fromTo(oimgs[0], { yPercent: 35 }, { yPercent: 0, duration: 0.7, ease: 'power3.out' }, t + 1.65);
  M.fromTo($('img', oimgs[0]), { scale: 1.3 }, { scale: 1, duration: 1.3, ease: 'power3.inOut' }, t + 1.65);
  M.to(occ, { clipPath: 'inset(0px 0px 0px 0px)', duration: 1, ease: 'power3.inOut' }, t + 2.15);
  M.to('.gift', { y: () => innerHeight * 0.2, autoAlpha: 0, duration: 0.7, ease: 'power2.in' }, t + 2.25);
  M.to('.occ__veil', { autoAlpha: 1, duration: 0.6 }, t + 2.6);
  clipIn(onames[0], t + 2.75);
  M.set(odescs[0], { visibility: 'visible' }, t + 2.9);
  fadeIn(odescs[0], t + 2.9);
  fadeIn('.occ__count', t + 2.9);
  t += 3.5; mark('occ1', 3, 'dark', t);
  for (let i = 1; i < 4; i++) {
    M.fromTo(oimgs[i], { clipPath: 'inset(100% 0% 0% 0%)', visibility: 'visible' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.05, ease: 'power3.inOut' }, t);
    M.fromTo($('img', oimgs[i]), { scale: 1.25, yPercent: 10 }, { scale: 1, yPercent: 0, duration: 1.2, ease: 'power3.out' }, t);
    M.to($('img', oimgs[i - 1]), { scale: 1.08, yPercent: -8, duration: 1.05, ease: 'power3.inOut' }, t);
    hide(oimgs[i - 1], t + 1.05);
    clipOut($('h3', onames[i - 1]).parentElement, t);
    fadeOut(odescs[i - 1], t);
    clipIn(onames[i], t + 0.45);
    M.set(odescs[i], { visibility: 'visible' }, t + 0.6);
    fadeIn(odescs[i], t + 0.6);
    M.to('.occ__count .bar i', { scaleX: (i + 1) / 4, duration: 0.8 }, t + 0.2);
    t += 1.35; mark('occ' + (i + 1), 3, 'dark', t);
  }

  // → 5 · bespoke : golden-edged blinds rise one after another
  show(S.bes, t);
  M.to('.blinds i', { scaleY: 1, duration: 0.75, stagger: 0.07, ease: 'power3.inOut' }, t);
  hide(S.box, t + 1.2);
  fadeIn('.bes__head h2', t + 0.85, 0.8);
  fadeIn('.bes__head p', t + 1.0);
  if (mobile) {
    fadeIn(steps[0], t + 1.1);
    fadeIn('.bes__cta', t + 1.2);
    t += 1.8; mark('bespoke', 4, 'light', t);
    for (let i = 1; i < 3; i++) {
      fadeOut(steps[i - 1], t);
      fadeIn(steps[i], t + 0.3);
      t += 0.95; mark('bes' + (i + 1), 4, 'light', t);
    }
  } else {
    M.to(steps, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out' }, t + 1.1);
    fadeIn('.bes__cta', t + 1.4);
    t += 2.0; mark('bespoke', 4, 'light', t);
  }

  // → 6 · contact : the page opens like a door from the centre
  show(S.con, t);
  M.fromTo(S.con, { clipPath: 'inset(0% 50% 0% 50%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.15, ease: 'power3.inOut' }, t);
  M.to('.s-bespoke .inner', { scale: 0.94, autoAlpha: 0.3, duration: 1, ease: 'power2.in' }, t);
  M.to(['.s-contact .inner > *', '.c-foot'], { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out' }, t + 0.7);
  hide(S.bes, t + 1.15);
  t += 1.75; mark('contact', 5, 'light', t);

  /* ---------- navigation ---------- */
  let idx = 0, busy = false, started = false;
  const firstOf = (sec) => STEPS.findIndex((s) => s.sec === sec);
  const navLinks = $$('.header__nav a'), dotBtns = $$('.dots button');
  function chrome(i) {
    const s = STEPS[i];
    header.classList.toggle('is-light', s.theme === 'light');
    dots.classList.toggle('is-light', s.theme === 'light');
    dotBtns.forEach((b) => b.classList.toggle('on', +b.dataset.go === s.sec));
    navLinks.forEach((a) => a.classList.toggle('on', +a.dataset.go === s.sec));
    gsap.to(hint, { autoAlpha: i === 0 && started ? 1 : 0, duration: 0.5 });
    const sig = s.label.startsWith('sig') ? +s.label.slice(3) : 1;
    $$('[data-sig-n],[data-sig-n2]').forEach((e) => (e.textContent = '0' + sig));
    $$('.th').forEach((b, k) => b.classList.toggle('on', k === sig - 1));
    const o = s.label.startsWith('occ') ? +s.label.slice(3) : 1;
    $('[data-occ-n]').textContent = '0' + o;
    // films only run while they are on screen
    if (s.sec === 0) play(heroVid); else heroVid.pause();
    if (s.sec === 1 || s.label === 'sig1') { loadSeal(); play(sealVid); } else sealVid.pause();
    if (s.sec >= 1) loadSeal();
    if (s.sec === 5) initMap();
  }
  function go(n, jump = false) {
    n = clamp(n, 0, STEPS.length - 1);
    if (n === idx || busy || !started) return;
    busy = true;
    const target = STEPS[n].label;
    const done = () => { busy = false; };
    if (reduced) { M.seek(target); idx = n; chrome(n); done(); return; }
    if (jump && Math.abs(n - idx) > 1 && STEPS[n].sec === STEPS[idx].sec) {
      idx = n; chrome(n);
      M.tweenTo(target, { duration: 1.1, ease: 'power2.inOut', onComplete: done });
      return;
    }
    if (jump && Math.abs(n - idx) > 1) {
      gsap.to(veil, { opacity: 1, duration: 0.4, ease: 'power2.in', onComplete() {
        M.seek(target, false); idx = n; chrome(n);
        gsap.to(veil, { opacity: 0, duration: 0.6, ease: 'power2.out', onComplete: done });
      } });
      return;
    }
    idx = n; chrome(n);
    M.tweenTo(target, { ease: 'none', onComplete: done });
  }
  const next = () => go(idx + 1), prev = () => go(idx - 1);
  const goSection = (sec) => go(firstOf(sec), true);

  // wheel: one gesture = one step, inertia is ignored
  let lastWheel = 0;
  addEventListener('wheel', (e) => {
    if (menu.classList.contains('is-open')) return;
    if (e.target.closest('.map__gl')) return;
    e.preventDefault();
    const now = performance.now(), gap = now - lastWheel; lastWheel = now;
    if (busy || gap < 200 || Math.abs(e.deltaY) < 4) return;
    e.deltaY > 0 ? next() : prev();
  }, { passive: false });

  // touch: a clear vertical swipe
  let ty = 0, tx = 0, tOk = false;
  addEventListener('touchstart', (e) => { const p = e.touches[0]; ty = p.clientY; tx = p.clientX; tOk = !e.target.closest('.map__gl, input, textarea'); }, { passive: true });
  addEventListener('touchmove', (e) => { if (!e.target.closest('.map__gl, input, textarea')) e.preventDefault(); }, { passive: false });
  addEventListener('touchend', (e) => {
    if (!tOk) return;
    const p = e.changedTouches[0], dy = ty - p.clientY, dx = tx - p.clientX;
    if (Math.abs(dy) > 50 && Math.abs(dy) > Math.abs(dx) * 1.2) dy > 0 ? next() : prev();
  }, { passive: true });

  // keys
  addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea')) return;
    if (['ArrowDown', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); next(); }
    if (['ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); prev(); }
    if (e.key === 'Home') goSection(0);
    if (e.key === 'End') goSection(5);
  });

  // links, dots, menu
  const menu = $('.menu');
  const closeMenu = () => { menu.classList.remove('is-open'); menu.setAttribute('aria-hidden', 'true'); };
  $('[data-menu-open]').addEventListener('click', () => { menu.classList.add('is-open'); menu.setAttribute('aria-hidden', 'false'); });
  $('[data-menu-close]').addEventListener('click', closeMenu);
  $$('.th').forEach((b) => b.addEventListener('click', () => go(STEPS.findIndex((s) => s.label === 'sig' + (+b.dataset.sig + 1)), true)));
  $$('[data-go]').forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); closeMenu(); goSection(+b.dataset.go); }));

  // keep geometry right after a resize
  let rz;
  addEventListener('resize', () => {
    clearTimeout(rz);
    rz = setTimeout(() => {
      if (mm('(max-width: 900px)') !== mobile) return location.reload();
      M.invalidate(); M.seek(STEPS[idx].label, false); map && map.resize();
    }, 200);
  });

  /* ---------- intro ---------- */
  function begin() {
    $('.intro').classList.add('is-done');
    started = true;
    chrome(0);
    gsap.to(dots, { opacity: 1, duration: 0.8 });
    setTimeout(loadSeal, 1500);
  }
  function runIntro() {
    heroVid.load();
    if (reduced) {
      gsap.set('.hero__title .mask > span', { yPercent: 0 });
      gsap.set(['.hero__side', '.header__logo'], { autoAlpha: 1, y: 0 });
      play(heroVid); begin(); return;
    }
    $$('.intro__mark path').forEach((p) => { const n = p.getTotalLength(); p.style.strokeDasharray = n; p.style.strokeDashoffset = n; });
    const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
    letters.forEach((k, i) => {
      tl.to(`.intro__mark .l${k}`, { strokeDashoffset: 0, duration: 0.7 }, 0.1 + i * 0.16);
      tl.to(`.intro__mark .l${k}`, { fillOpacity: 1, duration: 0.5, ease: 'power1.out' }, 0.45 + i * 0.16);
    });
    tl.to('.intro__meta', { opacity: 1, duration: 0.5 }, 0.3);
    tl.to('.intro__mark path', { strokeOpacity: 0, duration: 0.3 }, 1.0);
    tl.fromTo('#ozeShine', { attr: { x1: -700, x2: 0 } }, { attr: { x1: 701, x2: 1401 }, duration: 0.9 }, 0.85);
    tl.addLabel('open', 1.55);
    tl.call(() => play(heroVid), null, 'open-=0.2');
    tl.to('.intro__meta', { opacity: 0, duration: 0.25 }, 'open-=0.25');
    tl.set('.intro__seam', { opacity: 1 }, 'open-=0.15');
    tl.fromTo('.intro__seam', portrait ? { width: 0 } : { height: 0 }, { ...(portrait ? { width: '80vw' } : { height: '64vh' }), duration: 0.28, ease: 'power3.out' }, 'open-=0.15');
    tl.to('.intro__seam', { opacity: 0, duration: 0.2 }, 'open+=0.15');
    const out = portrait ? [{ yPercent: -100 }, { yPercent: 100 }] : [{ xPercent: -100 }, { xPercent: 100 }];
    tl.to('.intro__half--a', { ...out[0], duration: 1.05, ease: 'expo.inOut' }, 'open');
    tl.to('.intro__half--b', { ...out[1], duration: 1.05, ease: 'expo.inOut' }, 'open');
    tl.fromTo('.s-hero .media', { scale: 1.2 }, { scale: 1, duration: 1.9, ease: 'expo.out' }, 'open');
    tl.fromTo('.header__logo', { autoAlpha: 0, y: -12 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out' }, 'open+=0.5');
    tl.to('.hero__title .mask > span', { yPercent: 0, duration: 1.1, stagger: 0.09, ease: 'expo.out' }, 'open+=0.5');
    tl.to('.hero__side', { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out' }, 'open+=0.8');
    tl.call(begin, null, 'open+=1.0');
  }

  /* ---------- the map ---------- */
  let map = null, mapTried = false;
  function initMap() {
    if (mapTried) return; mapTried = true;
    const box = $('.map'), el = $('.map__gl');
    const fail = setTimeout(() => box.classList.remove('has-gl'), 7000);
    const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = BASE + 'assets/vendor/maplibre-gl.css'; document.head.appendChild(css);
    const s = document.createElement('script'); s.src = BASE + 'assets/vendor/maplibre-gl.js';
    s.onload = () => {
      try {
        map = new maplibregl.Map({ container: el, style: 'https://tiles.openfreemap.org/styles/liberty', center: [SHOP.lng, SHOP.lat], zoom: 15, pitch: 0, bearing: 0, attributionControl: { compact: true }, cooperativeGestures: false });
        map.scrollZoom.setWheelZoomRate(1 / 600);
        map.on('load', () => {
          clearTimeout(fail);
          box.classList.add('has-gl');
          const pin = document.createElement('div'); pin.className = 'pin';
          pin.innerHTML = '<svg viewBox="0 0 46 58"><path d="M23 57S44 38.6 44 22A21 21 0 0 0 2 22c0 16.6 21 35 21 35Z" fill="url(#ozeGold)"/><circle cx="23" cy="22" r="13" fill="#FFFDF8"/><svg x="13" y="16" width="20" height="12" viewBox="0 0 701 419.2"><use href="#oze-logo" fill="#A8761F"/></svg></svg>';
          new maplibregl.Marker({ element: pin, anchor: 'bottom' }).setLngLat([SHOP.lng, SHOP.lat]).addTo(map);
          map.flyTo({ center: [SHOP.lng, SHOP.lat], zoom: 16.4, pitch: 52, bearing: -18, duration: 3200, essential: true });
        });
      } catch (err) { /* keep the drawn map */ }
    };
    document.head.appendChild(s);
  }

  /* ---------- contact tabs (small screens) ---------- */
  const tabs = $$('.tabs button'), panes = $$('.pane');
  tabs.forEach((b) => b.addEventListener('click', () => {
    tabs.forEach((x) => x.classList.toggle('on', x === b));
    panes.forEach((p) => p.classList.toggle('on', p.dataset.pane === b.dataset.tab));
    if (b.dataset.tab === '2') { initMap(); setTimeout(() => map && map.resize(), 50); }
  }));

  /* ---------- cursor ---------- */
  if (fine && !reduced) {
    const c = $('.cursor'); let mx = innerWidth / 2, my = innerHeight / 2, x = mx, y = my;
    addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
    gsap.ticker.add(() => { x += (mx - x) * 0.2; y += (my - y) * 0.2; c.style.transform = `translate3d(${x}px,${y}px,0)`; });
    document.addEventListener('pointerover', (e) => c.classList.toggle('is-hover', !!e.target.closest('a,button,.chips label,input,textarea')));
  } else $('.cursor').remove();

  /* ---------- request form ---------- */
  const form = $('.form'), note = $('[data-note]');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    const bad = ['name', 'phone'].filter((k) => !String(d[k] || '').trim());
    $$('.field', form).forEach((f) => f.classList.remove('is-error'));
    if (bad.length) { bad.forEach((k) => form.elements[k].closest('.field').classList.add('is-error')); note.textContent = AR ? 'من فضلك أضف اسمك ورقم جوالك.' : 'Please add your name and phone number.'; form.elements[bad[0]].focus(); return; }
    const T = AR ? ['طلب جديد من موقع أوز', 'الاسم', 'الجوال', 'المناسبة', 'التاريخ', 'عدد الضيوف', 'ملاحظات'] : ['New request from the OZE website', 'Name', 'Phone', 'Occasion', 'Date', 'Guests', 'Notes'];
    const lines = [T[0], `${T[1]}: ${d.name}`, `${T[2]}: ${d.phone}`, `${T[3]}: ${d.occasion}`, d.date && `${T[4]}: ${d.date}`, d.guests && `${T[5]}: ${d.guests}`, d.message && `${T[6]}: ${d.message}`].filter(Boolean);
    const btn = form.querySelector('[type=submit]'); btn.disabled = true;
    try {
      if (EMAILJS.publicKey && EMAILJS.serviceId && EMAILJS.templateId) {
        if (!window.emailjs) await new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4.4.1/dist/email.min.js'; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
        window.emailjs.init({ publicKey: EMAILJS.publicKey });
        await window.emailjs.send(EMAILJS.serviceId, EMAILJS.templateId, { ...d, summary: lines.join('\n') });
      } else {
        const a = document.createElement('a'); a.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(lines.join('\n'))}`; a.target = '_blank'; a.rel = 'noopener';
        document.body.appendChild(a); a.click(); a.remove();
      }
      form.classList.add('is-sent');
    } catch (err) { note.textContent = AR ? 'حدث خطأ. يرجى مراسلتنا على واتساب.' : 'Something went wrong. Please message us on WhatsApp.'; }
    finally { btn.disabled = false; }
  });

  /* ---------- for testing ---------- */
  window.__oze = { go: (n) => { M.seek(STEPS[n].label, false); idx = n; chrome(n); }, steps: STEPS.map((s) => s.label), next, prev };

  const startUp = () => requestAnimationFrame(runIntro);
  document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 800))]).then(startUp) : startUp();
})();
