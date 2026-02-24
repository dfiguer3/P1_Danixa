(function(){
  var T = ['NO TRANSLATION NEEDED','PAS BESOIN DE TRADUCTION','KEINE ÜBERSETZUNG NÖTIG','NO SE NECESITA TRADUCCIÓN','NESSUNA TRADUZIONE NECESSARIA','NENHUMA TRADUÇÃO NECESSÁRIA','翻译不需要','翻訳不要'];
  var L = document.querySelectorAll('.bg-line');
  setInterval(function(){
    var eng = 0|(Math.random()*L.length);
    for(var i=0;i<L.length;i++) L[i].textContent = T[i===eng?0:1+Math.floor(Math.random()*(T.length-1))];
  }, 2000);
})();

// when language changes to a longer string (index.html only)
var bgText = document.querySelector('.bg-text');
if (bgText) {
  bgText.classList.add('wrap-text');
  bgText.classList.remove('wrap-text');
}

// Heart dot positions
const dots = [
  {x:200, y:338}, {x:143, y:277}, {x:88,  y:218},
  {x:80,  y:155}, {x:107, y:108}, {x:158, y:88 },
  {x:200, y:118}, {x:242, y:88 }, {x:293, y:108},
  {x:320, y:155}, {x:312, y:218}, {x:257, y:277}
];

const circleNums = ['①','②','③','④','⑤','⑥','⑦','⑧','⑨','⑩','⑪','⑫'];

const canvas = document.getElementById('canvas');
const ctx    = canvas.getContext('2d');

let nextDot    = 0;
let lines      = [];
let complete   = false;

// ── Draw ──────────────────────────────────────────────────────────────────

function draw() {
  // Paper background + dot grid
  ctx.fillStyle = '#fffdf9';
  ctx.fillRect(0, 0, 400, 400);
  ctx.fillStyle = 'rgba(190,175,200,0.09)';
  for (let x = 20; x < 400; x += 20)
    for (let y = 20; y < 400; y += 20) {
      ctx.beginPath(); ctx.arc(x, y, 0.8, 0, Math.PI*2); ctx.fill();
    }

  // Lines
  lines.forEach(({ from, to, done }) => {
    const a = dots[from], b = dots[to];
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.strokeStyle = done ? '#8aacca' : '#c9748a';
    ctx.lineWidth   = 2;
    ctx.lineCap     = 'round';
    ctx.globalAlpha = done ? 0.85 : 1;
    ctx.stroke();
    ctx.globalAlpha = 1;
  });

  // Dots
  dots.forEach((dot, i) => {
    const isDone = i < nextDot;
    const isNext = i === nextDot && !complete;

    // Glow ring on next dot
    if (isNext) {
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, 16, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(201,116,138,0.14)';
      ctx.fill();
    }

    // Circle
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, isDone ? 7 : 8.5, 0, Math.PI*2);
    ctx.fillStyle   = isDone ? '#e0eef8' : '#fce8ee';
    ctx.strokeStyle = isDone ? '#8aacca' : '#c9748a';
    ctx.lineWidth   = 1.8;
    ctx.fill();
    ctx.stroke();

    // Number
    ctx.fillStyle    = isDone ? '#8aacca' : '#c9748a';
    ctx.font         = `bold ${isDone ? 9 : 10}px beth ellen, cursive`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(i + 1, dot.x, dot.y + 0.5);

    // Hint sparkle above next dot
    if (isNext) {
      ctx.globalAlpha = 0.35;
      ctx.font = '12px beth ellen, cursive';
      ctx.fillStyle = '#c9748a';
      ctx.fillText('✦', dot.x, dot.y - 22);
      ctx.globalAlpha = 1;
    }
  });
}

// ── Click handler ─────────────────────────────────────────────────────────

canvas.addEventListener('click', e => {
  if (complete) return;

  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left) * (400 / rect.width);
  const my = (e.clientY - rect.top)  * (400 / rect.height);

  if (Math.hypot(mx - dots[nextDot].x, my - dots[nextDot].y) > 32) return;

  if (nextDot > 0) lines.push({ from: nextDot - 1, to: nextDot });
  nextDot++;

  // Close the heart on last dot
  if (nextDot >= dots.length) {
    lines.push({ from: dots.length - 1, to: 0 });
    lines = lines.map(l => ({ ...l, done: true }));
    complete = true;
    showComplete();
  }

  draw();
  updateProgress();
  updateProgressDots();
});

// ── Completion ────────────────────────────────────────────────────────────

function showComplete() {
  var banner = document.getElementById('completeBanner');
  if (banner) banner.classList.add('show');
  var msg = document.querySelector('.complete-msg');
  if (msg) msg.textContent = '♡ love connects us all ♡';
  const pt = document.getElementById('progressText');
  pt.textContent = '✦ well done!';
  pt.style.color = '#8aacca';

  // Scatter earth and country flags on the card
  const card = document.getElementById('paperCard');
  const symbols = ['🌍','🌎','🌏','🇺🇸','🇲🇽','🇯🇵','🇫🇷','🇩🇪','🇧🇷','🇮🇳','🇨🇦','🇦🇺','🇰🇷','🇬🇧','🏳️‍🌈'];
  for (let i = 0; i < 8; i++) {
    const s = document.createElement('span');
    s.style.cssText = `position:absolute;font-size:${1.2+Math.random()*0.6}rem;
      left:${10+Math.random()*80}%;top:${10+Math.random()*80}%;
      opacity:0;pointer-events:none;
      transition:opacity 0.4s ${i*0.07}s,transform 0.6s ${i*0.07}s;
      transform:scale(0);`;
    s.textContent = symbols[i % symbols.length];
    card.appendChild(s);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      s.style.opacity   = '0.35';
      s.style.transform = `scale(1) rotate(${-20+Math.random()*40}deg)`;
    }));
  }
}

// ── Progress bar ──────────────────────────────────────────────────────────

function updateProgress() {
  if (complete) return;
  const el = document.getElementById('progressText');
  el.textContent = nextDot === 0
    ? 'click dot ① to begin'
    : `nice! now click dot ${circleNums[nextDot] || nextDot + 1}`;
}

function buildProgressDots() {
  const container = document.getElementById('progressDots');
  dots.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'pdot';
    d.id = `pd-${i}`;
    container.appendChild(d);
  });
}

function updateProgressDots() {
  dots.forEach((_, i) => {
    const el = document.getElementById(`pd-${i}`);
    el.className = complete ? 'pdot done' : i < nextDot ? 'pdot filled' : 'pdot';
  });
}

// ── Restart ───────────────────────────────────────────────────────────────

function restartShape() {
  nextDot  = 0;
  lines    = [];
  complete = false;
  var b = document.getElementById('completeBanner');
  if (b) b.classList.remove('show');
  document.getElementById('progressText').textContent = 'click dot ① to begin';
  document.getElementById('progressText').style.color = '#c9748a';
  document.querySelectorAll('#paperCard > span').forEach(s => s.remove());
  buildProgressDots();
  updateProgressDots();
  draw();
}

// ── Init ──────────────────────────────────────────────────────────────────

var sl = document.getElementById('shapeLabel');
if (sl) sl.textContent = 'we are all connected - just like the dots';
buildProgressDots();
draw();


// ── music buttons ──────────────────────────────────────────────────────────────────
document.addEventListener('click', function(e) {
  if (!e.target.closest('.audio-player') && !e.target.closest('.music-buttons')) {
    document.querySelectorAll('input[type="radio"]').forEach(function(radio) {
      radio.checked = false;
    });
  }
});

document.querySelectorAll('.music-buttons label').forEach(function(label) {
  label.addEventListener('click', function() {
    const radio = document.getElementById(label.getAttribute('for'));
    if (radio && radio.checked) {
      setTimeout(function() {
        radio.checked = false;
      }, 10);
    }
  });
});