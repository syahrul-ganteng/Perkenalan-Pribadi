(function () {
  var root = document.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)');
  var dark = matchMedia('(prefers-color-scheme: dark)');
  var themeBtn = document.getElementById('theme');

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (themeBtn) {
      themeBtn.setAttribute('aria-pressed', String(theme === 'dark'));
      themeBtn.setAttribute('aria-label', theme === 'dark' ? 'Ganti ke tema terang' : 'Ganti ke tema gelap');
    }
    document.dispatchEvent(new Event('themechange'));
  }

  function isDark() {
    var t = root.getAttribute('data-theme');
    return t ? t === 'dark' : dark.matches;
  }

  /* Tema */
  try {
    var saved = localStorage.getItem('syahrul-theme');
    if (saved === 'dark' || saved === 'light') root.setAttribute('data-theme', saved);
  } catch (e) {}

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = isDark() ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('syahrul-theme', next); } catch (e) {}
      applyTheme(next);
    });
  }

  if (dark.addEventListener) {
    dark.addEventListener('change', function () {
      if (!localStorage.getItem('syahrul-theme')) {
        applyTheme(dark.matches ? 'dark' : 'light');
      }
    });
  }

  /* Reveal */
  var els = document.querySelectorAll('.reveal');
  if (reduce.matches || !('IntersectionObserver' in window)) {
    els.forEach(function (el) { el.classList.add('in'); });
  } else {
    var lastScrollY = window.scrollY;
    var scrollDirection = 'down';
    window.addEventListener('scroll', function () {
      var currentScrollY = window.scrollY;
      if (currentScrollY !== lastScrollY) {
        scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';
        lastScrollY = currentScrollY;
      }
    }, { passive: true });

    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          var group = e.target.closest('.sec, .hero') || document;
          var siblings = group.querySelectorAll('.reveal');
          var index = Array.prototype.indexOf.call(siblings, e.target);
          e.target.style.setProperty('--reveal-delay', Math.min(index * 90, 360) + 'ms');
          e.target.style.setProperty('--reveal-offset', scrollDirection === 'down' ? '18px' : '-18px');
          e.target.classList.add('in');
        } else {
          e.target.classList.remove('in');
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  /* Tilt 3D */
  if (!reduce.matches) {
    document.querySelectorAll('[data-tilt]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse') return;
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty('--ry', (x * 9).toFixed(2) + 'deg');
        el.style.setProperty('--rx', (-y * 9).toFixed(2) + 'deg');
        el.style.setProperty('--mx', ((x + 0.5) * 100).toFixed(1) + '%');
        el.style.setProperty('--my', ((y + 0.5) * 100).toFixed(1) + '%');
      });
      el.addEventListener('pointerleave', function () {
        el.style.setProperty('--rx', '0deg');
        el.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* Partikel */
  var c = document.getElementById('fx');
  if (c && c.getContext) {
    var ctx = c.getContext('2d');
    var hero = c.parentElement;
    var w = 0, h = 0, pts = [], rgb = '255,180,84', running = false, raf = 0;
    var mouse = { x: -999, y: -999 };
    function readColor() {
      var v = getComputedStyle(root).getPropertyValue('--part-rgb').trim();
      if (v) rgb = v;
      if (!running) draw(false);
    }
    function size() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var r = hero.getBoundingClientRect();
      w = r.width; h = r.height;
      c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.min(90, Math.round((w * h) / 14000));
      pts = [];
      for (var i = 0; i < n; i++) {
        pts.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35, r: Math.random() * 1.4 + 0.6 });
      }
      draw(false);
    }
    function draw(step) {
      ctx.clearRect(0, 0, w, h);
      var i, j, p, q, dx, dy, d;
      for (i = 0; i < pts.length; i++) {
        p = pts[i];
        if (step) {
          dx = p.x - mouse.x; dy = p.y - mouse.y; d = Math.sqrt(dx * dx + dy * dy);
          if (d < 130 && d > 0) { p.x += (dx / d) * 0.9; p.y += (dy / d) * 0.9; }
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0) p.x = w; else if (p.x > w) p.x = 0;
          if (p.y < 0) p.y = h; else if (p.y > h) p.y = 0;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.2832);
        ctx.fillStyle = 'rgba(' + rgb + ',0.75)';
        ctx.fill();
        for (j = i + 1; j < pts.length; j++) {
          q = pts[j]; dx = p.x - q.x; dy = p.y - q.y; d = dx * dx + dy * dy;
          if (d < 14400) {
            ctx.strokeStyle = 'rgba(' + rgb + ',' + (0.22 * (1 - d / 14400)).toFixed(3) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
      }
    }
    function loop() {
      if (!running) return;
      draw(true);
      raf = requestAnimationFrame(loop);
    }
    function start() {
      if (running || reduce.matches || document.hidden) return;
      running = true; raf = requestAnimationFrame(loop);
    }
    function stop() { running = false; cancelAnimationFrame(raf); }

    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    hero.addEventListener('pointerleave', function () { mouse.x = -999; mouse.y = -999; });
    document.addEventListener('themechange', readColor);
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
    if ('ResizeObserver' in window) new ResizeObserver(size).observe(hero); else window.addEventListener('resize', size);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { es[0].isIntersecting ? start() : stop(); }).observe(hero);
    } else { start(); }
    readColor();
    size();
  }

  /* Salin email */
  var btn = document.getElementById('copy');
  var em = document.getElementById('email');
  if (btn && em) {
    btn.addEventListener('click', function () {
      function done(msg) { btn.textContent = msg; setTimeout(function () { btn.textContent = 'Salin'; }, 1800); }
      function fallback() {
        var r = document.createRange(); r.selectNodeContents(em);
        var s = getSelection(); s.removeAllRanges(); s.addRange(r);
        done('Teks terpilih');
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(em.textContent.trim()).then(function () { done('Tersalin'); }, fallback);
      } else { fallback(); }
    });
  }

  /* Contact form: prepare an email in the visitor's mail app. */
  var contactForm = document.getElementById('contact-form');
  if (contactForm && em) {
    contactForm.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!contactForm.reportValidity()) return;

      var formData = new FormData(contactForm);
      var subject = 'Pesan portfolio dari ' + formData.get('name');
      var body = [
        'Nama: ' + formData.get('name'),
        'Email: ' + formData.get('email'),
        '',
        formData.get('message')
      ].join('\n');
      var mailto = 'mailto:' + em.textContent.trim() +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);

      window.location.href = mailto;
    });
  }
})();
