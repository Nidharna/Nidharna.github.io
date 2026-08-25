const toggleButton = document.querySelector('.menu-toggle');
const body = document.body;

if (toggleButton) {
  toggleButton.addEventListener('click', () => {
    body.classList.toggle('nav-open');
  });

  document.querySelectorAll('.nav-links a').forEach((link) => {
    link.addEventListener('click', () => {
      body.classList.remove('nav-open');
    });
  });
}

const portrait = document.querySelector('.portrait');
if (portrait) {
  portrait.addEventListener('error', () => {
    portrait.parentElement.classList.add('image-fallback');
    portrait.style.display = 'none';
  });
}

const starLayer = document.getElementById('cursorStars');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (starLayer && !reducedMotion) {
  let lastSpawn = 0;

  function spawnStar(x, y) {
    const star = document.createElement('span');
    const size = 5 + Math.random() * 7;
    const dx = (Math.random() * 38) - 19;
    const dy = (Math.random() * 38) - 19;

    star.className = 'cursor-star';
    star.style.left = `${x}px`;
    star.style.top = `${y}px`;
    star.style.setProperty('--star-size', `${size}px`);
    star.style.setProperty('--dx', `${dx}px`);
    star.style.setProperty('--dy', `${dy}px`);
    star.style.setProperty('--delay', `${Math.random() * 120}ms`);

    starLayer.appendChild(star);
    setTimeout(() => star.remove(), 650);
  }

  document.addEventListener('pointermove', (event) => {
    const now = Date.now();
    if (now - lastSpawn < 18) return;
    lastSpawn = now;
    spawnStar(event.clientX, event.clientY);
  });

  document.addEventListener('click', (event) => {
    for (let i = 0; i < 8; i += 1) {
      const offsetX = (Math.random() * 40) - 20;
      const offsetY = (Math.random() * 40) - 20;
      setTimeout(() => spawnStar(event.clientX + offsetX, event.clientY + offsetY), i * 18);
    }
  });
}
