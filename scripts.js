const answerMap = {
  "why does she remember tiny details?": {
    count: "8 / 15 searches",
    answer: "<p>I don't always remember the big things perfectly. But I remember small things. The way someone takes their coffee. A random sentence they said months ago. A song that was playing somewhere. The weather on a particular day.</p><p>Maybe small details feel more honest. Big moments announce themselves. Everyone knows they are important. But the little things quietly become memories before you even realise you're making them.</p>",
    related: ["why does she take pictures of everything?", "why does she get attached to places?", "why does she care so much about memories?"]
  },
  "why does she take pictures of everything?": {
    count: "8 / 15 searches",
    answer: "<p>Because sometimes I know I'll forget. Not completely. I'll remember that something happened, but maybe not the colour of the sky. Or the way the place looked. Or how everyone was sitting around the table.</p><p>A photograph doesn't just keep a moment. It keeps evidence that I was there. That for one second, on one ordinary day, something felt worth remembering.</p>",
    related: ["why does she remember tiny details?", "why does she care so much about memories?", "why does she get attached to places?"]
  },
  "why does she disappear when she's overwhelmed?": {
    count: "8 / 15 searches",
    answer: "<p>I think I become quiet when there is too much happening inside my head. It's not always because I don't want to talk. Sometimes I just don't know where to begin.</p><p>So I disappear for a little while. I organise my thoughts. I become quiet. I come back when everything inside feels slightly less loud. I'm still learning that I don't always have to disappear to find peace.</p>",
    related: ["why does she sometimes need to be alone?", "what is she still figuring out?", "why does she need alone time?"]
  },
  "why does she get attached to places?": {
    count: "8 / 15 searches",
    answer: "<p>Because places remember things differently than people do. A café can remind me of a conversation. A road can remind me of a version of myself. A room can hold an entire period of my life without saying anything about it.</p><p>Sometimes I go back to a place and realise nothing has changed. Except me. Maybe that's why I get attached to places. They become little containers for memories I don't know where else to keep.</p>",
    related: ["why does she care so much about memories?", "why does one song remind her of someone?", "why does she take pictures of everything?"]
  },
  "why does one song remind her of someone?": {
    count: "8 / 15 searches",
    answer: "<p>I don't think songs remember people. I think we leave people inside songs. One day, a particular song is just a song. Then someone enters your life. And suddenly, every time it plays, they're there.</p><p>Years can pass. The person can change. You can change. But somehow, the first few seconds of that song still know exactly where to find the memory.</p>",
    related: ["why does she care so much about memories?", "why does she replay conversations?", "why does she remember tiny details?"]
  },
  "why does she overthink everything?": {
    count: "8 / 15 searches",
    answer: "<p>I wish I could say I don't. But I think my brain likes to explore every possible version of a situation. What did they mean? What if I said this instead? Did I misunderstand? What happens next?</p><p>Sometimes overthinking is exhausting. But I think curiosity and overthinking occasionally live very close to each other. I'm just still learning when to ask another question—and when to let one go.</p>",
    related: ["why is she always curious?", "what is she still figuring out?", "why does she take so long to make decisions?"]
  },
  "why does she notice things other people don't?": {
    count: "8 / 15 searches",
    answer: "<p>Maybe because I spend a lot of time looking. Not necessarily for something important. Just looking. The way people interact with things. The awkwardness in an interface. A strange signboard. A tiny inconvenience everyone has learned to tolerate.</p><p>I think that's probably where designing starts for me. With noticing.</p>",
    related: ["why does she want to design things?", "why does she notice things other people don't?", "why is she always curious?"]
  },
  "why does she want to design things?": {
    count: "8 / 15 searches",
    answer: "<p>Because I like the moment when confusion starts becoming clear. When something complicated slowly turns into: <span class='highlight'>Oh. This makes sense now.</span></p><p>I like asking why something isn't working. I like imagining what could work instead. And honestly? I like the strange process of turning a thought in my head into something another person can actually use.</p>",
    related: ["why does she notice things other people don't?", "why is she always curious?", "what is she still figuring out?"]
  },
  "why does she take so long to make decisions?": {
    count: "8 / 15 searches",
    answer: "<p>Because apparently every decision needs a full internal committee meeting. One version of me says yes. Another version says, “But what if...?” A third version has opened seventeen tabs to research the situation.</p><p>Eventually, I decide. Usually.</p>",
    related: ["why does she overthink everything?", "what is she still figuring out?", "why does she love starting new ideas?"]
  },
  "why does she love starting new ideas?": {
    count: "8 / 15 searches",
    answer: "<p>Because the beginning of an idea is full of possibilities. At the beginning, nothing is wrong yet. The idea could become anything. A website. An app. A story. A design. Something completely unnecessary but interesting.</p><p>The middle is usually messier. But I still keep coming back to beginnings.</p>",
    related: ["why does she want to design things?", "what is she still figuring out?", "why is she always curious?"]
  },
  "why does she sometimes need to be alone?": {
    count: "8 / 15 searches",
    answer: "<p>Because I genuinely enjoy my own company. I like conversations, people and connection. But I also need quiet. A little space where no one needs anything from me. Where I can think without explaining what I'm thinking.</p><p>Being alone doesn't always mean being lonely. Sometimes it just means returning to yourself.</p>",
    related: ["why does she disappear when she's overwhelmed?", "what is she still figuring out?", "why does she care so much about memories?"]
  },
  "why does she care so much about memories?": {
    count: "8 / 15 searches",
    answer: "<p>Because memories are strange. You never know which moment is becoming important while you're living it. The most ordinary day can become something you wish you could visit again.</p><p>That's probably why I take photographs. Why I get attached to places. Why songs mean more than they should. Maybe I'm just afraid of losing the small things.</p>",
    related: ["why does she remember tiny details?", "why does she take pictures of everything?", "why does she get attached to places?"]
  },
  "why is she always curious?": {
    count: "8 / 15 searches",
    answer: "<p>I don't know. But I think “I wonder...” has probably started more of my thoughts than any other sentence. I wonder why people do that. I wonder how this works. I wonder what would happen if this changed. I wonder if there's another way.</p><p>Curiosity has taken me into rabbit holes I absolutely did not need to enter. But it has also led me to some of my favourite ideas. So I think I'll keep wondering.</p>",
    related: ["why does she overthink everything?", "why does she want to design things?", "what is she still figuring out?"]
  },
  "what is she still figuring out?": {
    count: "8 / 15 searches",
    answer: "<p>A lot, actually. How to stop overthinking. How to trust my own decisions. How to let go of things that have already happened. How to become better without constantly feeling like I'm behind. How to enjoy the process instead of worrying about where I'm going.</p><p>But maybe nobody completely figures themselves out. Maybe we just become slightly better at asking the right questions.</p>",
    related: ["why does she overthink everything?", "why does she take so long to make decisions?", "why is she always curious?"]
  },
  "who is she, really?": {
    count: "8 / 15 searches",
    answer: "<p>Honestly? I don't think I have a final answer yet. I'm still becoming. Still changing my mind. Still collecting memories. Still asking questions. Still getting attached to songs, places and little moments. Still noticing things.</p><p>Maybe that's the most honest answer I can give you.</p><p><strong>I'm Nidharnarani.</strong></p><p><strong>And I'm still figuring out who that is.</strong></p>",
    related: ["why does she care so much about memories?", "why does she remember tiny details?", "what is she still figuring out?"]
  }
};

const input = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const resultTitle = document.getElementById('resultTitle');
const resultBody = document.getElementById('resultBody');
const resultCount = document.getElementById('resultCount');
const relatedSearches = document.getElementById('relatedSearches');
const resultCard = document.querySelector('.result-card');
const searchPanel = document.getElementById('search-area');
const resetButton = document.getElementById('resetButton');
const soundToggle = document.getElementById('soundToggle');

const audio = {
  context: null,
  enabled: false
};

function ensureAudioContext() {
  const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextConstructor) return null;

  if (!audio.context) {
    audio.context = new AudioContextConstructor();
  }

  if (audio.context.state === 'suspended') {
    audio.context.resume();
  }

  return audio.context;
}

function playTone(type = 'search') {
  if (!audio.enabled) return;

  const ctx = ensureAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  const configs = {
    search: { freq: 640, end: 820, gain: 0.018, filter: 1500, duration: 0.045 },
    searchResult: { freq: 740, end: 1120, gain: 0.022, filter: 1800, duration: 0.075 },
    memory: { freq: 530, end: 700, gain: 0.016, filter: 1300, duration: 0.080 },
    photo: { freq: 580, end: 860, gain: 0.019, filter: 1400, duration: 0.050 },
    chime: { freq: 760, end: 1280, gain: 0.024, filter: 2000, duration: 0.120 },
    quiet: { freq: 420, end: 520, gain: 0.012, filter: 850, duration: 0.090 }
  };

  const config = configs[type] || configs.search;
  osc.type = type === 'photo' ? 'square' : 'triangle';
  osc.frequency.setValueAtTime(config.freq, now);
  osc.frequency.linearRampToValueAtTime(config.end, now + config.duration);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(config.filter, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(config.gain, now + 0.012);
  gain.gain.linearRampToValueAtTime(0.0001, now + config.duration);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + config.duration + 0.015);
}

function soundOn() {
  const nextState = true;
  audio.enabled = nextState;
  const ctx = ensureAudioContext();
  if (ctx) {
    playTone('chime');
  }
}

function soundOff() {
  audio.enabled = false;
}

function renderRelated(items) {
  relatedSearches.innerHTML = '';

  items.forEach((item) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'related-link';
    button.dataset.query = item;
    button.textContent = item;
    button.addEventListener('click', () => {
      input.value = item;
      performSearch(item);
      input.focus();
      playTone('searchResult');
    });
    relatedSearches.appendChild(button);
  });
}

function normalize(query) {
  return query.trim().toLowerCase();
}

function getMatch(query) {
  const value = normalize(query);

  if (answerMap[value]) {
    return answerMap[value];
  }

  const words = value.split(/\s+/);
  const expanded = Object.entries(answerMap);

  for (const [question, result] of expanded) {
    const questionText = normalize(question);
    if (questionText.includes(value) || value.includes(questionText)) {
      return result;
    }

    const overlaps = words.filter((w) => questionText.includes(w));
    if (overlaps.length >= 2) {
      return result;
    }
  }

  return {
    count: 'No result found',
    answer: "<p>Hmm. I haven't figured that one out yet.</p><p>Maybe ask me something else.</p>",
    related: ['why does she remember tiny details?', 'why does she take pictures of everything?', 'why is she always curious?']
  };
}

function performSearch(query) {
  const value = normalize(query);

  if (!value) {
    resultTitle.textContent = 'what would you like to know?';
    resultCount.textContent = '8 / 15 searches';
    resultBody.innerHTML = '<p>Type a thought and press enter to see what the page reveals.</p>';
    renderRelated(['why does she remember tiny details?', 'why does she take pictures of everything?']);
    resultCard.classList.add('is-active');
    return;
  }

  const selected = getMatch(value);
  resultTitle.textContent = query.trim();
  resultCount.textContent = selected.count;
  resultBody.innerHTML = selected.answer;
  renderRelated(selected.related);
  resultCard.classList.add('is-active');
  playTone('searchResult');
}

function openSuggestions() {
  searchPanel.classList.add('is-open');
}

function closeSuggestions() {
  if (!input.value.trim()) {
    searchPanel.classList.remove('is-open');
  }
}

function updateSearchSuggestions() {
  const query = normalize(input.value);
  const suggestionButtons = document.querySelectorAll('.chip, .archive-card, .stack-button');

  suggestionButtons.forEach((buttonItem) => {
    const text = (buttonItem.dataset.query || '').toLowerCase();
    const visible = !query || text.includes(query);
    buttonItem.style.display = visible ? '' : 'none';
  });
}

searchButton.addEventListener('click', () => {
  playTone('search');
  performSearch(input.value);
});

input.addEventListener('focus', () => {
  openSuggestions();
  updateSearchSuggestions();
});

input.addEventListener('input', () => {
  openSuggestions();
  updateSearchSuggestions();
});

input.addEventListener('blur', closeSuggestions);

input.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    playTone('search');
    performSearch(input.value);
    closeSuggestions();
  }
});

document.querySelectorAll('.chip, .archive-card, .stack-button').forEach((buttonItem) => {
  buttonItem.addEventListener('click', () => {
    const query = buttonItem.dataset.query;
    input.value = query;
    performSearch(query);
    updateSearchSuggestions();
    openSuggestions();
    playTone('searchResult');
    input.focus();
  });
});

if (soundToggle) {
  soundToggle.addEventListener('click', () => {
    const isOn = soundToggle.getAttribute('aria-pressed') === 'true';
    const nextState = !isOn;

    soundToggle.setAttribute('aria-pressed', String(nextState));
    soundToggle.querySelector('.sound-icon').textContent = nextState ? '🔊' : '🔇';
    soundToggle.querySelector('.sound-text').textContent = nextState ? 'sound on' : 'sound off';

    if (nextState) {
      soundOn();
    } else {
      soundOff();
    }
  });
}

const memoryFragments = document.querySelectorAll('.memory-fragment');
memoryFragments.forEach((frag) => {
  frag.addEventListener('click', () => {
    const note = document.createElement('div');
    note.className = 'fragment-note';
    note.textContent = 'Funny what the brain decides to keep.';
    note.style.cssText = 'font-family: var(--font-caveat); color: var(--deep-berry); font-size:22px; margin-top: 12px;';
    frag.parentElement.appendChild(note);
    frag.classList.add('is-open');
    playTone('memory');
  });
});

document.querySelectorAll('.photo-card').forEach((card) => {
  card.addEventListener('click', () => {
    card.classList.add('photo-remembered');
    playTone('photo');
  });
});

document.querySelectorAll('.archive-card').forEach((card) => {
  card.addEventListener('mouseenter', () => playTone('search'));
});

document.querySelectorAll('.chip').forEach((chip) => {
  chip.addEventListener('mouseenter', () => playTone('search'));
});

document.querySelectorAll('.place-card').forEach((place) => {
  place.addEventListener('click', () => {
    place.classList.toggle('open');
    playTone('memory');
  });
});

document.querySelectorAll('.pause-button').forEach((btn) => {
  btn.addEventListener('click', () => {
    const message = btn.nextElementSibling;
    message.classList.toggle('is-visible');
    playTone('quiet');
  });
});

document.querySelectorAll('.close-tabs').forEach((btn) => {
  btn.addEventListener('click', () => {
    const msg = btn.nextElementSibling;
    msg.classList.toggle('is-visible');
    playTone('search');
  });
});

document.querySelectorAll('.decision-button').forEach((btn) => {
  btn.addEventListener('click', () => {
    const msg = btn.closest('.decision-panel').nextElementSibling;
    if (msg) msg.classList.add('is-visible');
    playTone('searchResult');
  });
});

document.querySelectorAll('.idea-card').forEach((card) => {
  card.addEventListener('click', () => {
    card.textContent = card.dataset.idea;
    playTone('memory');
  });
});

const quietButton = document.getElementById('quietToggle');
if (quietButton) {
  quietButton.addEventListener('click', () => {
    const label = quietButton.closest('.quiet-toggle').querySelector('.quiet-label');
    if (label.textContent.trim() === 'PEOPLE AROUND ME') {
      label.textContent = 'QUIET MODE';
      quietButton.textContent = '○';
    } else {
      label.textContent = 'PEOPLE AROUND ME';
      quietButton.textContent = '●';
    }
    playTone('quiet');
  });
}

const wonderButton = document.getElementById('wonderButton');
const wonderText = document.getElementById('wonderText');
if (wonderButton && wonderText) {
  wonderButton.addEventListener('click', () => {
    wonderText.textContent = 'I WONDER WHY... WHAT IF... HOW DOES THAT WORK?';
    playTone('chime');
  });
}

const defaultQuery = 'why does she remember tiny details?';
input.value = defaultQuery;
performSearch(defaultQuery);
