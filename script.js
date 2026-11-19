/* ==========================================================
   Niyas & Dhiya — Wedding Reception
   Envelope opening · music · countdown · calendar · reveals · gallery lightbox
   ========================================================== */

/* ---------- Event configuration (edit here) ----------
   THE DATE HAS NOT BEEN CONFIRMED YET.
   When it is, put it in `date` as 'YYYY-MM-DD' (for example '2027-01-31').
   That single change will automatically:
     • show the date in the reception panel,
     • start the Days / Hours / Minutes / Seconds countdown (Asia/Kolkata time),
     • enable the "Add to Calendar" button.
   While `date` is empty, all date-dependent features stay hidden / disabled. */
const CONFIG = {
  couple: { groom: 'Niyas', bride: 'Dhiya' },
  event: {
    name: 'Wedding Reception',
    date: '',                    // ← 'YYYY-MM-DD' once confirmed. Leave '' until then.
    startTime: '17:00',          // 24-hour clock, Asia/Kolkata
    timeLabel: '5:00 PM onwards',
    calendarHours: 4,            // length of the calendar entry only (no end time was supplied)
    utcOffset: '+05:30',         // Asia/Kolkata (India has no daylight saving)
    timeZone: 'Asia/Kolkata',
  },
  venue: {
    name: 'Rockdale Resort',
    address: 'Vadapuram, behind HiLITE Mall, Malappuram, Kerala',
    mapsUrl: 'https://maps.app.goo.gl/fGqiztXiYJxjDmhS6?g_st=iw',
  },
  musicVolume: 0.45,
};

(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- Event date (null until a valid date is configured) ---------- */
  function eventStart() {
    const d = String(CONFIG.event.date || '').trim();
    const t = String(CONFIG.event.startTime || '').trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || !/^\d{2}:\d{2}$/.test(t)) return null;
    const dt = new Date(`${d}T${t}:00${CONFIG.event.utcOffset}`);
    if (Number.isNaN(dt.getTime())) return null;
    // reject impossible calendar days such as 2027-02-31
    const check = new Intl.DateTimeFormat('en-CA', { timeZone: CONFIG.event.timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(dt);
    return check === d ? dt : null;
  }
  const START = eventStart();
  const END = START ? new Date(START.getTime() + CONFIG.event.calendarHours * 3600e3) : null;

  /* ---------- Apply CONFIG text / links ---------- */
  function applyConfig() {
    $$('[data-bind="maps"]').forEach((a) => { a.href = CONFIG.venue.mapsUrl; });
    $$('[data-bind="time"]').forEach((el) => { el.textContent = CONFIG.event.timeLabel; el.setAttribute('datetime', CONFIG.event.startTime); });
    $$('[data-bind="venue-name"]').forEach((el) => { el.textContent = CONFIG.venue.name; });

    if (!START) return;
    const tz = CONFIG.event.timeZone;
    $('#date-weekday').textContent = new Intl.DateTimeFormat('en-IN', { timeZone: tz, weekday: 'long' }).format(START);
    const dv = $('#date-value');
    dv.textContent = new Intl.DateTimeFormat('en-IN', { timeZone: tz, day: 'numeric', month: 'long', year: 'numeric' }).format(START);
    dv.setAttribute('datetime', `${CONFIG.event.date}T${CONFIG.event.startTime}${CONFIG.event.utcOffset}`);
    $('#date-block').hidden = false;
    $('#date-pending').hidden = true;
  }

  /* ---------- Music ---------- */
  function initMusic() {
    const audio = $('#bgm');
    const btn = $('#music-toggle');
    if (!audio || !btn) return { start() {} };
    let fade = null, wantPlaying = false, hiddenPause = false;

    const render = () => {
      const on = wantPlaying && !audio.paused;
      btn.classList.toggle('is-playing', on);
      btn.setAttribute('aria-pressed', String(on));
      btn.setAttribute('aria-label', on ? 'Mute music' : 'Play music');
    };
    function fadeTo(target, ms, done) {
      window.clearInterval(fade);
      const from = audio.volume, steps = Math.max(1, Math.round(ms / 50)); let i = 0;
      fade = window.setInterval(() => {
        i++; audio.volume = Math.min(1, Math.max(0, from + (target - from) * (i / steps)));
        if (i >= steps) { window.clearInterval(fade); if (done) done(); }
      }, 50);
    }
    function play() {
      wantPlaying = true; audio.volume = 0;
      let p;
      try { p = audio.play(); } catch (e) { wantPlaying = false; render(); return; }
      const ok = () => { fadeTo(CONFIG.musicVolume, 2200); render(); };
      if (p && p.then) p.then(ok).catch(() => { wantPlaying = false; render(); }); else ok();
    }
    function mute() { wantPlaying = false; fadeTo(0, 700, () => { audio.pause(); render(); }); render(); }

    btn.addEventListener('click', () => { hiddenPause = false; (wantPlaying && !audio.paused) ? mute() : play(); });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (wantPlaying && !audio.paused) { hiddenPause = true; window.clearInterval(fade); audio.pause(); }
      } else if (hiddenPause) {
        hiddenPause = false; audio.volume = 0;
        audio.play().then(() => fadeTo(CONFIG.musicVolume, 1500)).catch(render);
      }
      render();
    });
    audio.addEventListener('pause', render); audio.addEventListener('play', render);
    render();
    return { start: play };
  }

  /* ---------- Envelope ---------- */
  function initOpening(music) {
    const root = document.documentElement;
    const opening = $('#opening'), seal = $('#open-btn'), main = $('#invitation');
    if (!opening || !seal || !main) { root.classList.add('is-open'); root.classList.remove('is-locked'); initReveal(); return; }
    main.inert = true;
    let busy = false;
    const finish = () => {
      root.classList.add('is-open'); root.classList.remove('is-locked');
      main.inert = false; window.scrollTo(0, 0); main.focus({ preventScroll: true });
      initReveal();
      window.setTimeout(() => { opening.hidden = true; }, reduced.matches ? 50 : 1500);
    };
    seal.addEventListener('click', () => {
      if (busy) return; busy = true;
      seal.disabled = true;
      music.start();                                                     // inside the tap, so browsers allow playback
      if (reduced.matches) { finish(); return; }
      root.classList.add('is-unfolding');                                // seal stops breathing, flap hinges open
      window.setTimeout(() => root.classList.add('is-washing'), 1500);   // seal fades, ivory wash rises
      window.setTimeout(finish, 2250);                                   // wash dissolves into the hero photograph
    });
  }

  /* ---------- Scroll reveals + gentle parallax ---------- */
  function initReveal() {
    const items = $$('.reveal'), panels = $$('.venue-panel');
    if (!('IntersectionObserver' in window) || reduced.matches) {
      items.forEach((e) => e.classList.add('is-visible')); panels.forEach((p) => p.classList.add('is-in'));
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); } });
      }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
      items.forEach((e) => io.observe(e));
      const pio = new IntersectionObserver((entries) => {
        entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); pio.unobserve(en.target); } });
      }, { threshold: 0.2 });
      panels.forEach((p) => pio.observe(p));
    }
    if (!reduced.matches) initParallax();
  }

  function initParallax() {
    const els = $$('[data-parallax]');
    if (!els.length) return;
    let ticking = false, visible = new Set(els);
    if ('IntersectionObserver' in window) {
      visible = new Set();
      const vio = new IntersectionObserver((entries) => entries.forEach((en) => (en.isIntersecting ? visible.add(en.target) : visible.delete(en.target))), { rootMargin: '120px 0px' });
      els.forEach((el) => vio.observe(el));
    }
    const update = () => {
      ticking = false;
      const vh = window.innerHeight;
      visible.forEach((el) => {
        const k = el.dataset.parallax;
        if (k === 'garland') {
          // the hero garland drifts down a little as the page scrolls away, as in the original
          el.style.setProperty('--py', `${Math.min(window.scrollY, 800) * 0.12}px`);
        } else {
          const r = el.getBoundingClientRect();
          // the image inside is scaled ~8%, so the drift is capped to stay within that margin (the child img inherits --py)
          const lim = r.height * 0.035;
          const off = Math.max(-lim, Math.min(lim, ((r.top + r.height / 2) - vh / 2) * -parseFloat(k)));
          el.style.setProperty('--py', `${off.toFixed(1)}px`);
        }
      });
    };
    const onScroll = () => { if (!ticking) { ticking = true; window.requestAnimationFrame(update); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
  }

  /* ---------- Countdown (hidden until a confirmed date exists) ---------- */
  function initCountdown() {
    const grid = $('#countdown'), done = $('#countdown-done');
    if (!grid || !done || !START) return;
    const target = START.getTime();
    const u = { days: $('[data-unit="days"]', grid), hours: $('[data-unit="hours"]', grid), minutes: $('[data-unit="minutes"]', grid), seconds: $('[data-unit="seconds"]', grid) };
    const pad = (n) => String(n).padStart(2, '0');
    let timer;
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) { grid.hidden = true; done.hidden = false; window.clearInterval(timer); return; }
      grid.hidden = false;
      const s = Math.floor(diff / 1000);
      u.days.textContent = pad(Math.floor(s / 86400));
      u.hours.textContent = pad(Math.floor((s % 86400) / 3600));
      u.minutes.textContent = pad(Math.floor((s % 3600) / 60));
      u.seconds.textContent = pad(s % 60);
    };
    tick(); timer = window.setInterval(tick, 1000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });
  }

  /* ---------- Add to calendar (.ics) — only with a confirmed date ---------- */
  function initCalendar() {
    const btn = $('#calendar-btn'), note = $('#calendar-note');
    if (!btn) return;
    if (!START || END.getTime() < Date.now()) { btn.disabled = true; return; }
    btn.disabled = false; btn.removeAttribute('aria-describedby');
    if (note) note.hidden = true;
    const utc = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const esc = (t) => String(t).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
    btn.addEventListener('click', () => {
      const { groom, bride } = CONFIG.couple;
      const ics = [
        'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Niyas & Dhiya//Wedding Reception//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:reception-niyas-dhiya-${utc(START)}@invitation`,
        `DTSTAMP:${utc(new Date())}`,
        `DTSTART:${utc(START)}`,
        `DTEND:${utc(END)}`,
        `SUMMARY:${esc(`${CONFIG.event.name} of ${groom} & ${bride}`)}`,
        `LOCATION:${esc(`${CONFIG.venue.name}, ${CONFIG.venue.address}`)}`,
        `DESCRIPTION:${esc(`${CONFIG.event.name} of ${groom} & ${bride}, ${CONFIG.event.timeLabel}. Directions: ${CONFIG.venue.mapsUrl}`)}`,
        `URL:${CONFIG.venue.mapsUrl}`,
        'END:VEVENT', 'END:VCALENDAR',
      ].join('\r\n');
      const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'niyas-dhiya-wedding-reception.ics';
      document.body.appendChild(a); a.click(); a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 4000);
    });
  }

  /* ---------- Gallery lightbox ---------- */
  function initLightbox() {
    const box = $('#lightbox'), img = $('#lb-img'), count = $('#lb-count');
    const btns = $$('.g-btn');
    if (!box || !img || !btns.length) return;
    const shots = btns.map((b) => ({ src: b.dataset.full, alt: (b.querySelector('img') || {}).alt || '' }));
    const root = document.documentElement, main = $('#invitation'), music = $('#music-toggle');
    let index = 0, opener = null, closeTimer = null;

    const preload = (i) => { const s = shots[(i + shots.length) % shots.length]; const p = new Image(); p.src = s.src; };
    function show(i, animate) {
      index = (i + shots.length) % shots.length;
      const s = shots[index];
      const set = () => { img.src = s.src; img.alt = s.alt; count.textContent = `${index + 1} / ${shots.length}`; };
      if (animate && !reduced.matches) {
        img.classList.add('is-swapping');
        window.setTimeout(() => { set(); const fin = () => img.classList.remove('is-swapping'); if (img.complete) fin(); else { img.onload = fin; img.onerror = fin; } }, 180);
      } else set();
      preload(index + 1); preload(index - 1);
    }
    function open(i, from) {
      window.clearTimeout(closeTimer);
      opener = from; show(i, false);
      box.hidden = false; root.classList.add('lb-open');
      main.inert = true; if (music) music.inert = true;
      window.requestAnimationFrame(() => box.classList.add('is-active'));
      $('#lb-close').focus();
    }
    function close() {
      box.classList.remove('is-active'); root.classList.remove('lb-open');
      main.inert = false; if (music) music.inert = false;
      closeTimer = window.setTimeout(() => { box.hidden = true; img.removeAttribute('src'); }, reduced.matches ? 0 : 350);
      if (opener) opener.focus({ preventScroll: true });
    }
    btns.forEach((b, i) => b.addEventListener('click', () => open(i, b)));
    $('#lb-close').addEventListener('click', close);
    $('#lb-prev').addEventListener('click', () => show(index - 1, true));
    $('#lb-next').addEventListener('click', () => show(index + 1, true));
    box.addEventListener('click', (e) => { if (e.target === box) close(); });
    box.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1, true); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); show(index - 1, true); }
      else if (e.key === 'Tab') {                                   // keep focus inside the dialog
        const f = $$('button', box); const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    // swipe left / right on touch screens
    let sx = 0, sy = 0, tracking = false;
    box.addEventListener('touchstart', (e) => { if (e.touches.length !== 1) return; tracking = true; sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    box.addEventListener('touchend', (e) => {
      if (!tracking) return; tracking = false;
      const t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) show(index + (dx < 0 ? 1 : -1), true);
      else if (dy > 90 && Math.abs(dy) > Math.abs(dx) * 1.5) close();
    }, { passive: true });
  }

  applyConfig();
  initOpening(initMusic());
  initCountdown();
  initCalendar();
  initLightbox();
})();
