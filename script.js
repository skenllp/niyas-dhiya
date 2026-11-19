/* =========================================================
   Asber & Jennifer — Wedding Invitation
   GSAP + ScrollTrigger are progressive enhancements: if the CDN
   fails, everything below still works (countdown, music, buttons).
   ========================================================= */
(() => {
  'use strict';

  /* ---------------- CONFIG — edit these values ---------------- */
  const CONFIG = {
    // 2 January 2027, 11:30 AM India Standard Time (UTC+05:30)
    eventISO: '2027-01-02T11:30:00+05:30',

    // Verified Google Maps share link. Leave empty to use the search link built from the venue name + address.
    mapsUrl: '',
    venueQuery: 'Parappan Square International Convention Centre, Parapan Square Road, NH 66, Venniyur, Malappuram, Kerala 676508',

    // Contact numbers are written directly in index.html (Contact section).
    // RSVP is commented out in index.html; set a link here when you bring it back.
    rsvpUrl: ''
  };

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;

  /* ---------------- Fit text safely inside frames ---------------- */
  function fitAll() {
    $$('[data-fit]').forEach(wrap => {
      const box = $('.fit-box', wrap);
      const content = $('.fit-content', wrap);
      if (!box || !content || !box.clientHeight) return;
      // Start slightly larger than the base size, then shrink until the text sits inside the frame.
      let fit = parseFloat(wrap.dataset.fitMax) || 1.3;
      content.style.setProperty('--fit', fit);
      let guard = 0;
      while (guard++ < 60 && fit > 0.5 &&
        (content.offsetHeight > box.clientHeight * 0.97 || content.scrollWidth > box.clientWidth + 1)) {
        fit = Math.round((fit - 0.02) * 1000) / 1000;
        content.style.setProperty('--fit', fit);
      }
    });
  }
  let fitTimer;
  window.addEventListener('resize', () => { clearTimeout(fitTimer); fitTimer = setTimeout(fitAll, 120); });
  window.addEventListener('load', fitAll);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitAll);
  fitAll();

  /* ---------------- Links: map / RSVP / contact ---------------- */
  const mapBtn = $('#mapBtn');
  if (mapBtn) {
    mapBtn.href = CONFIG.mapsUrl ||
      'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(CONFIG.venueQuery);
  }

  function enable(a, href) { a.href = href; a.removeAttribute('aria-disabled'); a.removeAttribute('tabindex'); }

  const rsvpBtn = $('#rsvpBtn');
  if (rsvpBtn && CONFIG.rsvpUrl) {
    enable(rsvpBtn, CONFIG.rsvpUrl);
    rsvpBtn.target = '_blank'; rsvpBtn.rel = 'noopener noreferrer';
    $('#rsvpNote').hidden = true;
  }

  /* ---------------- Countdown ---------------- */
  const target = new Date(CONFIG.eventISO).getTime();
  const cd = { d: $('#cdDays'), h: $('#cdHours'), m: $('#cdMinutes'), s: $('#cdSeconds') };
  const pad = n => String(n).padStart(2, '0');

  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      $('#countGrid').hidden = true;
      $('#countDone').hidden = false;
      return false;
    }
    const s = Math.floor(diff / 1000);
    cd.d.textContent = pad(Math.floor(s / 86400));
    cd.h.textContent = pad(Math.floor(s % 86400 / 3600));
    cd.m.textContent = pad(Math.floor(s % 3600 / 60));
    cd.s.textContent = pad(s % 60);
    return true;
  }
  if (tick()) {
    const id = setInterval(() => { if (!tick()) clearInterval(id); }, 1000);
  }

  /* ---------------- Music player ---------------- */
  const audio = $('#bgm');
  const musicBtn = $('#musicBtn');
  const player = $('.player');
  const note = $('#musicNote');
  let noteTimer;

  function setPlaying(on) {
    musicBtn.classList.toggle('is-playing', on);
    player.classList.toggle('is-playing', on);
    musicBtn.setAttribute('aria-pressed', String(on));
    musicBtn.setAttribute('aria-label', on ? 'Pause wedding music' : 'Play wedding music');
  }
  function say(msg) {
    note.textContent = msg;
    clearTimeout(noteTimer);
    noteTimer = setTimeout(() => { note.textContent = ''; }, 4000);
  }
  function playMusic() {
    if (!audio) return Promise.resolve();
    return audio.play().then(() => setPlaying(true)).catch(err => {
      setPlaying(false);
      if (err && err.name !== 'AbortError') {
        // Most likely the file hasn't been added yet (assets/wedding-music.mp3).
        console.warn('[music] Could not play assets/wedding-music.mp3 —', err.message);
        say('Music is unavailable right now.');
      }
    });
  }
  function pauseMusic() { audio.pause(); setPlaying(false); }

  if (musicBtn && audio) {
    musicBtn.addEventListener('click', () => (audio.paused ? playMusic() : pauseMusic()));
    audio.addEventListener('ended', () => setPlaying(false));
    audio.addEventListener('error', () => setPlaying(false));
  }

  /* ---------------- Back to top ---------------- */
  $('#toTop').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  });

  /* ---------------- Opening + animations ---------------- */
  const intro = $('#intro');
  const enterBtn = $('#enterBtn');
  const hasGSAP = typeof window.gsap !== 'undefined';
  let entered = false;

  root.classList.add('is-locked');

  function finishIntro() {
    intro.classList.add('is-gone');
    intro.setAttribute('aria-hidden', 'true');
    root.classList.remove('is-locked');
    window.scrollTo(0, 0);
    setTimeout(() => { intro.style.display = 'none'; enterBtn.blur(); }, 1100);
    const h1 = $('#heroTitle'); if (h1) h1.setAttribute('tabindex', '-1');
  }

  function enter() {
    if (entered) return;
    entered = true;
    playMusic();                       // allowed: this is a user gesture

    if (!hasGSAP || reduced) {
      finishIntro();
      return;
    }
    intro.style.transition = 'none';   // GSAP drives the fade
    const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
    tl.to('.intro__content', { opacity: 0, y: -10, duration: 0.9 })
      .add(() => { root.classList.remove('is-locked'); window.scrollTo(0, 0); }, '<0.2')
      .to('#intro', { opacity: 0, duration: 1, onComplete: () => { intro.classList.add('is-gone'); intro.style.display = 'none'; } }, '-=0.5')
      .add(heroIn(), '-=0.7');
    intro.setAttribute('aria-hidden', 'true');
  }
  enterBtn.addEventListener('click', enter);



  function heroIn() {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.to('.hero__label', { opacity: 1, y: 0, duration: 1 })
      .to('.hero__names .n, .hero__names .amp', { opacity: 1, y: 0, duration: 1.2, stagger: 0.18 }, '-=0.6')
      .to('.hero__date', { opacity: 1, y: 0, duration: 1 }, '-=0.7')
      .to('.hero__mansion', { opacity: 1, y: 0, duration: 1.3 }, '-=0.6')
      .to('.player', { opacity: 1, y: 0, duration: 1.1 }, '-=0.9');
    return tl;
  }

  if (!hasGSAP || reduced) return;   // everything stays visible and static

  if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  const hasST = !!window.ScrollTrigger;

  /* --- Scene 1 intro sequence --- */
  gsap.set(['.intro__label', '.intro__names span', '.intro__enter'], { opacity: 0, y: 14 });
  gsap.set('.intro__scene', { opacity: 0 });

  gsap.timeline({ defaults: { ease: 'power2.out' }, delay: 0.2 })
    .to('.intro__scene', { opacity: 1, duration: 1.6 })
    .to('.intro__label', { opacity: 1, y: 0, duration: 1 }, '-=0.5')
    .to('.intro__names span', { opacity: 1, y: 0, duration: 1.1, stagger: 0.22 }, '-=0.5')
    .to('.intro__enter', { opacity: 1, y: 0, duration: 0.9 }, '-=0.3');

  /* --- Hero starting state (revealed on Enter) --- */
  gsap.set(['.hero__label', '.hero__names .n', '.hero__names .amp', '.hero__date', '.hero__mansion', '.player'], { opacity: 0, y: 22 });

  if (!hasST) {
    // Without ScrollTrigger just make sure nothing stays hidden after Enter.
    return;
  }

  /* --- Parallax on the countryside painting --- */
  $$('.hero .bg img, .invite .bg img, .flow .bg img, .closing .bg img').forEach(img => {
    gsap.fromTo(img, { yPercent: -4 }, {
      yPercent: 4, ease: 'none',
      scrollTrigger: { trigger: img.closest('section'), start: 'top bottom', end: 'bottom top', scrub: true }
    });
  });

  /* --- Generic reveals --- */
  $$('[data-reveal]').forEach(el => {
    gsap.from(el, {
      opacity: 0, y: 26, duration: 1.1, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true }
    });
  });

  /* --- Invitation: frame, flowers, then lines in order --- */
  const inv = $('#inviteCard');
  gsap.from(inv, { opacity: 0, y: 40, scale: 0.97, duration: 1.4, ease: 'power2.out',
    scrollTrigger: { trigger: inv, start: 'top 85%', once: true } });
  gsap.from('.il', { opacity: 0, y: 14, duration: 0.9, ease: 'power2.out', stagger: 0.12, delay: 0.35,
    scrollTrigger: { trigger: inv, start: 'top 70%', once: true } });
  gsap.from('.invite__rose', { opacity: 0, x: (i) => (i === 0 ? -40 : 40), duration: 1.6, ease: 'power2.out', stagger: 0.2,
    scrollTrigger: { trigger: '#invitation', start: 'top 60%', once: true } });

  /* --- Venue illustration entrance --- */
  gsap.from('[data-venue-art]', { opacity: 0, y: 34, scale: 0.96, duration: 1.5, ease: 'power2.out',
    scrollTrigger: { trigger: '[data-venue-art]', start: 'top 88%', once: true } });

  /* --- Timeline: line draws, then items stagger --- */
  const timeline = $('#timeline');
  gsap.from(['.tl-orn--top', '.tl-dot', '.tl-text > *', '.tl-art', '.tl-orn--bottom'], {
    opacity: 0, y: 22, duration: 0.9, ease: 'power2.out', stagger: 0.14,
    scrollTrigger: { trigger: timeline, start: 'top 75%', once: true }
  });

  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
