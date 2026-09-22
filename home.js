const WEATHER_TEST_STATE = "normal";
// Switch to "loading" for the loading-state screenshot.
// Switch to "error" for the failure-state screenshot.
// Leave it as "normal" to pull live Delhi weather from Open-Meteo.

const WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast?latitude=28.6139&longitude=77.2090&current=temperature_2m,weather_code,is_day&timezone=auto";

const weatherFooter = document.getElementById('weatherFooter');
const storyTerminal = document.getElementById('storyTerminal');
const storyStartButton = document.getElementById('storyStartButton');
const storyMeta = document.getElementById('storyMeta');
const weatherScene = document.getElementById('weatherScene');
const weatherStatusChip = document.getElementById('weatherStatusChip');
const weatherHeadline = document.getElementById('weatherHeadline');
const weatherCondition = document.getElementById('weatherCondition');
const weatherTemp = document.getElementById('weatherTemp');
const weatherNarrative = document.getElementById('weatherNarrative');
const weatherCodeLabel = document.getElementById('weatherCodeLabel');
const weatherClock = document.getElementById('weatherClock');
const retryButton = document.getElementById('retryButton');

let storyLock = false;
let weatherResult = null;

function setStatusChip(label) {
  if (weatherStatusChip) weatherStatusChip.textContent = label;
}

function makeWeatherScene(type, isDay, temp = '--') {
  const night = Number(isDay) === 0;
  const normalizedType = (type || 'CLEAR').toLowerCase();
  const sceneType = normalizedType === 'foggy' ? 'foggy' : normalizedType;

  return `
    <div class="world world--${sceneType} ${night ? 'world--night' : ''}">
      <div class="world__sky-glow"></div>
      <div class="world__cloud"></div>
      <div class="world__cloud world__cloud--two"></div>
      <div class="world__cloud world__cloud--three"></div>
      <div class="world__sun"></div>
      <div class="world__moon"></div>
      <div class="world__city"></div>
      <div class="world__signal" data-object="signal">signal</div>
      <div class="world__computer" data-object="computer">sky.exe</div>
      <div class="world__character" data-object="character"><span class="limb"></span></div>
      <div class="world__board" data-object="weatherboard">
        <span class="world__board-label">delhi</span>
        <span class="world__board-temp">${temp}</span>
        <span class="world__board-small">outside</span>
      </div>
      <div class="world__ground"></div>
      <div class="world__rain"></div>
      <div class="world__snow"></div>
      <div class="world__fog"></div>
      <div class="world__lightning"></div>
    </div>
  `;
}

function getWeatherCategory(weatherCode, isDay) {
  const code = Number(weatherCode);

  if (code >= 0 && code <= 3) {
    return { category: 'CLEAR', label: Number(isDay) === 1 ? 'CLEAR.' : 'CLEAR NIGHT.', graphic: 'CLEAR' };
  }

  if ([45, 48].includes(code)) {
    return { category: 'FOGGY', label: 'FOG.', graphic: 'FOGGY' };
  }

  if (code >= 51 && code <= 57) {
    return { category: 'DRIZZLE', label: 'DRIZZLE.', graphic: 'DRIZZLE' };
  }

  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return { category: 'RAIN', label: 'RAIN.', graphic: 'RAIN' };
  }

  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return { category: 'SNOW', label: 'SNOW.', graphic: 'SNOW' };
  }

  if (code >= 95 && code <= 99) {
    return { category: 'STORM', label: 'STORM.', graphic: 'STORM' };
  }

  return { category: 'CLEAR', label: Number(isDay) === 1 ? 'CLEAR.' : 'CLEAR NIGHT.', graphic: 'CLEAR' };
}

function getWeatherNarrative(category, isDay) {
  const night = Number(isDay) === 0;
  const stories = {
    CLEAR: night ? 'THE CITY IS STILL AWAKE.' : 'THE SKY ACTUALLY SHOWED UP TODAY.',
    FOGGY: 'EVEN THE SKY DOESN\'T WANT TO BE SEEN TODAY.',
    DRIZZLE: 'THE SKY CAN\'T QUITE MAKE UP ITS MIND.',
    RAIN: 'THE SKY HAS DECIDED TO BE DRAMATIC.',
    SNOW: 'THE SKY IS THROWING CONFETTI.',
    STORM: 'PROBABLY NOT THE DAY FOR A PICNIC.'
  };

  return stories[category] || stories.CLEAR;
}

function typeSequence(messages, onComplete, delay = 35) {
  if (!storyTerminal) return;

  const run = (index) => {
    if (index >= messages.length) {
      if (onComplete) onComplete();
      return;
    }

    const line = document.createElement('div');
    line.className = 'story-line story-line--cursor';
    storyTerminal.appendChild(line);

    let charIndex = 0;
    const text = messages[index];

    const timer = setInterval(() => {
      line.textContent = text.slice(0, charIndex);
      charIndex += 1;

      if (charIndex > text.length) {
        clearInterval(timer);
        line.classList.remove('story-line--cursor');
        setTimeout(() => run(index + 1), 260);
      }
    }, delay);
  };

  run(0);
}

function renderIntroStory() {
  if (!storyTerminal || !storyStartButton || !weatherFooter) return;

  storyTerminal.innerHTML = '';
  storyStartButton.hidden = false;
  storyStartButton.textContent = '[ boot sky ]';
  storyStartButton.classList.remove('is-glitching');
  weatherFooter.classList.remove('is-entered');
  storyLock = false;
  setStatusChip('status: cold boot');
  if (storyMeta) storyMeta.textContent = 'kernel waiting';
  if (weatherHeadline) weatherHeadline.textContent = 'the sky says';
  if (weatherCondition) weatherCondition.textContent = '--';
  if (weatherTemp) weatherTemp.textContent = '--°C';
  if (weatherNarrative) weatherNarrative.textContent = 'something is waking up below the page.';
  if (weatherCodeLabel) weatherCodeLabel.textContent = 'code --';
  if (weatherClock) weatherClock.textContent = '--:--';
  if (retryButton) retryButton.hidden = true;
  weatherFooter.classList.remove('has-error');

  const fragments = ['SYS_09', 'SIGNAL: LOW', 'LOCATION: DELHI', 'WORLDCORE // WAITING'];
  fragments.forEach((fragment, index) => {
    const line = document.createElement('div');
    line.className = 'story-line';
    line.textContent = fragment;
    line.style.animationDelay = `${index * 120}ms`;
    storyTerminal.appendChild(line);
  });

  setTimeout(() => {
    typeSequence(['HELLO?', '...', 'IS THIS THING ON?', 'OH.', 'YOU.'], () => {
      if (weatherNarrative) weatherNarrative.textContent = 'the sky finally noticed the cursor.';
    });
  }, 400);
}

function showLoadingBar() {
  if (!storyTerminal) return;

  const bar = document.createElement('div');
  bar.className = 'story-line';
  bar.textContent = '[ listening... ]';
  storyTerminal.appendChild(bar);
  setStatusChip('status: listening');
  if (storyMeta) storyMeta.textContent = 'connecting to sky';
  if (weatherHeadline) weatherHeadline.textContent = 'the sky says';
  if (weatherCondition) weatherCondition.textContent = 'connecting';
}

function renderLoadingState() {
  if (!weatherScene || !storyMeta || !weatherCondition || !weatherTemp) return;

  weatherScene.innerHTML = makeWeatherScene('CLEAR', 1, '--');
  storyMeta.textContent = 'connecting to sky';
  setStatusChip('status: listening');
  weatherCondition.textContent = 'checking';
  weatherTemp.textContent = '—°C';
  if (weatherHeadline) weatherHeadline.textContent = 'the sky says';
}

function renderFailureState() {
  if (!storyTerminal || !weatherScene || !weatherCondition || !weatherNarrative || !weatherTemp || !retryButton) return;

  weatherFooter.classList.remove('is-entered');
  weatherFooter.classList.add('has-error');
  storyTerminal.innerHTML = '';
  typeSequence(['> SIGNAL LOST.', '> OUTSIDE IS NOT ANSWERING.', 'TRY AGAIN.'], () => {
    retryButton.hidden = false;
  });

  weatherScene.innerHTML = `
    <div class="world world--night">
      <div class="world__sky-glow"></div>
      <div class="world__cloud"></div>
      <div class="world__cloud world__cloud--two"></div>
      <div class="world__moon"></div>
      <div class="world__city"></div>
      <div class="world__signal" data-object="signal">sky lost</div>
      <div class="world__computer" data-object="computer">sky.exe</div>
      <div class="world__character" data-object="character"><span class="limb"></span></div>
      <div class="world__ground"></div>
      <div class="world__lightning"></div>
    </div>
  `;

  weatherHeadline.textContent = 'the sky says';
  weatherCondition.textContent = 'signal lost';
  weatherTemp.textContent = 'ERR';
  weatherNarrative.textContent = 'somewhere between here and the sky...';
  storyMeta.textContent = 'retry';
  setStatusChip('status: offline');
  if (weatherCodeLabel) weatherCodeLabel.textContent = 'code 99';
  if (weatherClock) weatherClock.textContent = 'ERR';
}

function renderLoadedWeather(data) {
  if (!weatherScene || !weatherCondition || !weatherTemp || !weatherNarrative || !weatherCodeLabel || !weatherClock || !storyMeta) return;

  const temp = Math.round(data?.current?.temperature_2m ?? 0);
  const code = Number(data?.current?.weather_code ?? 0);
  const isDay = Number(data?.current?.is_day ?? 1);
  const resolved = getWeatherCategory(code, isDay);

  weatherScene.innerHTML = makeWeatherScene(resolved.graphic, isDay, temp);
  weatherHeadline.textContent = 'the sky says';
  weatherCondition.textContent = resolved.label;
  weatherTemp.textContent = `${temp}°C`;
  weatherNarrative.textContent = getWeatherNarrative(resolved.category, isDay);
  storyMeta.textContent = 'the world is listening';
  setStatusChip('status: online');
  weatherCodeLabel.textContent = `code ${String(code).padStart(2, '0')}`;
  weatherClock.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

  if (weatherFooter) {
    weatherFooter.classList.add('is-entered');
    weatherFooter.classList.remove('has-error');
  }
}

function fetchWeather() {
  if (WEATHER_TEST_STATE === 'loading') {
    renderLoadingState();
    return;
  }

  if (WEATHER_TEST_STATE === 'error') {
    renderFailureState();
    return;
  }

  showLoadingBar();
  renderLoadingState();

  fetch(WEATHER_API_URL)
    .then((response) => {
      if (!response.ok) throw new Error('Weather request failed');
      return response.json();
    })
    .then((data) => {
      weatherResult = data;
      setTimeout(() => { renderLoadedWeather(data); }, 1000);
    })
    .catch(() => {
      setTimeout(() => { renderFailureState(); }, 900);
    });
}

function triggerSkyClick(option = 'signal') {
  if (!weatherFooter) return;

  weatherFooter.classList.add('is-humming');
  const messages = {
    signal: 'THE SKY IS STILL LISTENING.',
    computer: 'WHY ARE YOU MESSING WITH MY COMPUTER?',
    character: 'HEY. YOU\'RE STILL HERE?',
    weatherboard: 'YES. THAT IS THE ACTUAL TEMPERATURE.'
  };

  if (weatherNarrative) weatherNarrative.textContent = messages[option] || 'THE SKY IS STILL LISTENING.';
  setTimeout(() => weatherFooter.classList.remove('is-humming'), 500);
}

function retryWeather() {
  if (retryButton) retryButton.hidden = true;
  weatherFooter.classList.remove('has-error');
  if (storyTerminal) storyTerminal.innerHTML = '';
  weatherResult = null;
  renderIntroStory();
  fetchWeather();
}

if (storyStartButton) {
  storyStartButton.addEventListener('click', () => {
    if (storyLock) return;
    storyLock = true;
    storyStartButton.classList.add('is-glitching');
    storyStartButton.textContent = '[ booting... ]';

    setTimeout(() => { storyStartButton.textContent = '[ connected ]'; }, 260);

    setTimeout(() => {
      storyStartButton.hidden = true;
      if (storyTerminal) storyTerminal.innerHTML = '';
      renderIntroStory();
      fetchWeather();
    }, 1000);
  });
}

if (retryButton) {
  retryButton.addEventListener('click', retryWeather);
}

if (weatherScene) {
  weatherScene.addEventListener('click', (event) => {
    const node = event.target.closest('[data-object]');
    if (!node) return;
    triggerSkyClick(node.dataset.object);
  });
}

if (weatherFooter) {
  weatherFooter.addEventListener('click', (event) => {
    if (event.target.closest('button')) return;
    if (event.target.closest('[data-object]')) return;
    triggerSkyClick('signal');
  });
}

function initialiseWeather() {
  if (!weatherFooter) return;

  if (WEATHER_TEST_STATE === 'loading') {
    renderIntroStory();
    renderLoadingState();
    return;
  }

  if (WEATHER_TEST_STATE === 'error') {
    renderIntroStory();
    renderFailureState();
    return;
  }

  renderIntroStory();
}

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

initialiseWeather();
