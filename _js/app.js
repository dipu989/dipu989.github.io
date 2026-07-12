document.addEventListener('DOMContentLoaded', function () {
  var preloader = document.getElementById('preloader');
  if (preloader) {
    setTimeout(function () {
      preloader.style.opacity = '0';
      setTimeout(function () {
        preloader.remove();
      }, 400);
    }, 300);
  }

  drawContour();
  initThemeToggle();

  if (window.AOS) {
    AOS.init({
      disable: 'mobile',
      offset: 150,
      duration: 800,
      easing: 'ease-out-cubic',
      delay: 50,
      once: true
    });
  }
});

/* Theme toggle — persists an explicit override in localStorage, falls
   back to the OS preference (prefers-color-scheme) when unset */

function currentTheme() {
  var explicit = document.documentElement.getAttribute('data-theme');
  if (explicit === 'dark' || explicit === 'light') return explicit;
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function initThemeToggle() {
  var toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  renderThemeToggle();

  toggle.addEventListener('click', function () {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem('theme', next);
    } catch (e) {}
    renderThemeToggle();
    drawContour();
  });
}

function renderThemeToggle() {
  var toggle = document.getElementById('theme-toggle');
  if (!toggle) return;
  var theme = currentTheme();
  toggle.textContent = theme === 'dark' ? 'Light' : 'Dark';
  toggle.setAttribute('aria-label', 'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' theme');
}

/* Contour-line hero background, drawn from the page's current --accent token */

function drawContour() {
  var canvas = document.getElementById('contour');
  if (!canvas) return;
  var parent = canvas.parentElement;
  var rect = parent.getBoundingClientRect();
  var dpr = window.devicePixelRatio || 1;

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  var ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, rect.width, rect.height);

  var accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#3f6a4f';
  ctx.strokeStyle = hexToRgba(accent, 0.35);
  ctx.lineWidth = 1;

  var w = rect.width;
  var h = rect.height;
  var lines = 9;

  for (var i = 0; i < lines; i++) {
    var baseY = (h / (lines + 1)) * (i + 1);
    ctx.beginPath();
    for (var x = 0; x <= w; x += 6) {
      var y = baseY
        + Math.sin(x * 0.006 + i * 0.9) * (h * 0.05)
        + Math.sin(x * 0.017 + i * 1.7) * (h * 0.025);
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  }
}

function hexToRgba(hex, alpha) {
  hex = hex.replace('#', '');
  var r = parseInt(hex.substring(0, 2), 16);
  var g = parseInt(hex.substring(2, 4), 16);
  var b = parseInt(hex.substring(4, 6), 16);
  return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
}

var contourResizeTimer;
window.addEventListener('resize', function () {
  clearTimeout(contourResizeTimer);
  contourResizeTimer = setTimeout(drawContour, 200);
});

if (window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
    drawContour();
    renderThemeToggle();
  });
}
