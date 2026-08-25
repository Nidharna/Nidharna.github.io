const answerMap = {
  "why does she smile so much?": {
    count: "About 1,240 results",
    answer: "<p>Because smiling is easier than explaining how tired she is of being misunderstood.</p>",
    related: ["why does she hide behind jokes?", "what makes her feel safe?"]
  },
  "why does she take pictures of everything?": {
    count: "About 847 results",
    answer: "<p>Because sometimes she is afraid that a moment will become ordinary once it is over.</p><p>So she photographs the sky.</p><p>The table after everyone leaves.</p><p>A friend’s hand holding a coffee cup.</p><p>The strange light coming through a hostel window.</p><p>Things that nobody else would think were worth keeping.</p><p>Maybe photographs aren’t really about remembering.</p><p>Maybe they’re about proving that something happened.</p>",
    related: ["why does she keep old things?", "why does she remember small details?"]
  },
  "what does she study?": {
    count: "About 3,900 results",
    answer: "<p>She studies people, mostly.</p><p>The way they pause before answering.</p><p>The way they say “I’m fine” with a smile that doesn’t reach their eyes.</p><p>She notices more than she lets on.</p>",
    related: ["why does she overthink?", "what makes her feel understood?"]
  },
  "why does she remember tiny details?": {
    count: "About 5,100 results",
    answer: "<p>Because when a person is kind to her, she keeps the exact shape of that kindness.</p><p>Not just the words, but the silence before them.</p><p>The weather. The music in the room.</p><p>She remembers the texture of a moment more than the name of it.</p>",
    related: ["why does she keep screenshots?", "what does she remember most?"]
  },
  "why does she keep screenshots?": {
    count: "About 2,060 results",
    answer: "<p>Because sometimes a message feels too precious to leave alone in the middle of a scrolling timeline.</p><p>She saves the parts that made her feel seen.</p><p>Not to revisit them loudly.</p><p>Just to make sure the feeling had a place to live.</p>",
    related: ["why does she save old conversations?", "why does she keep old things?"]
  },
  "why does she replay conversations?": {
    count: "About 6,740 results",
    answer: "<p>Because she knows exactly how a sentence sounded.</p><p>She hears the tiny changes in tone.</p><p>The pause before someone said “I’m okay.”</p><p>And then she lives there for a while.</p>",
    related: ["why does she overthink?", "who does she trust?"]
  },
  "who does she trust?": {
    count: "About 4,180 results",
    answer: "<p>Not many people at first.</p><p>But once she trusts you, she is almost embarrassingly honest.</p><p>She starts telling the small truths and the ones she never meant to say out loud.</p>",
    related: ["what makes her stay?", "why does she miss people quietly?"]
  },
  "what makes her stay?": {
    count: "About 3,500 results",
    answer: "<p>Gentleness.</p><p>Consistency.</p><p>The kind of affection that doesn’t need to be announced in public.</p><p>And someone who stays long enough for her to believe it.</p>",
    related: ["why does she collect memories?", "what makes her happy?"]
  },
  "why does she miss people quietly?": {
    count: "About 2,920 results",
    answer: "<p>Because she has learned that silence is sometimes the only way to love without making it a performance.</p><p>She does not always call.</p><p>But she remembers.</p>",
    related: ["who does she miss?", "why does she keep old things?"]
  },
  "why wasn't I enough?": {
    count: "No results found",
    answer: "<p>Not the kind of question that gets a clean answer.</p><p>Sometimes the real truth is just this: some people leave before the wound learns how to name itself.</p>",
    related: ["will they come back?", "does anyone remember me the way I remember them?"]
  },
  "will they come back?": {
    count: "No results found",
    answer: "<p>Maybe.</p><p>Maybe not.</p><p>And maybe that is the part that keeps her awake.</p>",
    related: ["why does she keep old things?", "why does she replay conversations?"]
  },
  "does anyone remember me the way I remember them?": {
    count: "No results found",
    answer: "<p>Some searches are better left unanswered.</p><p>Some absences are too loud to be named out loud.</p>",
    related: ["who does she miss?", "why doesn't she say it directly?"]
  },
  "why does she disappear sometimes?": {
    count: "About 812 results",
    answer: "<p>Because replying “I’m fine” requires less energy than explaining why she isn’t.</p>",
    related: ["what makes her feel safe?", "why does she need alone time?"]
  },
  "what happens when she's hungry?": {
    count: "Search results unavailable",
    answer: "<p>Search results unavailable.</p><p>Please try again after feeding her.</p>",
    related: ["what makes her happy?", "why does she smile so much?"]
  },
  "who is she thinking about right now?": {
    count: "No results found",
    answer: "<p>No results found.</p><p>Some searches are better left unanswered.</p>",
    related: ["who does she miss?", "what makes her feel safe?"]
  },
  "who is she?": {
    count: "About 0 results",
    answer: "<p>Maybe that’s the problem with trying to understand a person.</p><p>You can collect their photographs.</p><p>Read their messages.</p><p>Know their favourite songs.</p><p>Memorise the things they love.</p><p>And still never completely know them.</p><p><strong>Maybe a person isn’t something you find.</strong></p><p><strong>Maybe they’re something you keep discovering.</strong></p>",
    related: ["why does she remember everything?", "why does she take pictures of everything?"]
  },
  "why does she remember everything?": {
    count: "About 1,980 results",
    answer: "<p>Because some things stay with her like a favorite song she never stopped hearing.</p><p>She remembers the exact tone of a goodbye.</p><p>The shape of someone’s laugh in a crowded room.</p><p>And the strange comfort of knowing she was there long enough to notice.</p>",
    related: ["what does she remember most?", "why does she keep old pictures?"]
  },
  "why does she keep old pictures?": {
    count: "About 987 results",
    answer: "<p>Because she is trying to hold on to the softness of a moment that already slipped past her.</p><p>There are faces in those photos that feel more alive than the people who left them behind.</p>",
    related: ["why does she keep old things?", "why does she remember tiny details?"]
  },
  "what does she remember most?": {
    count: "About 2,410 results",
    answer: "<p>The way people looked at her.</p><p>The way they stayed when it was inconvenient.</p><p>The moments that felt gentle enough to keep forever.</p>",
    related: ["who does she trust?", "what makes her happy?"]
  },
  "why does she take so many pictures?": {
    count: "About 640 results",
    answer: "<p>Because she is trying to save the feeling before it disappears into time.</p><p>Some moments are so small they do not seem important until they are already gone.</p>",
    related: ["why does she keep old pictures?", "why does she remember tiny details?"]
  },
  "why does she love rainy days?": {
    count: "About 1,140 results",
    answer: "<p>Because the rain gives her permission to slow down.</p><p>It makes everything feel less urgent.</p><p>Like the world is finally quiet enough to hear itself.</p>",
    related: ["why does one song change her mood?", "what makes her happy?"]
  },
  "why does one song change her mood?": {
    count: "About 2,700 results",
    answer: "<p>Because memory is a tiny machine.</p><p>One chord, one phrase, and suddenly the whole room becomes a different version of the past.</p>",
    related: ["why does she replay conversations?", "what does she remember most?"]
  },
  "why does she need alone time?": {
    count: "About 1,630 results",
    answer: "<p>Because her mind gets loud.</p><p>And stillness is the only place where she can hear herself clearly again.</p>",
    related: ["why does she disappear sometimes?", "what makes her feel safe?"]
  },
  "what makes her happy?": {
    count: "About 5,600 results",
    answer: "<p>Small, honest things.</p><p>Good light. Familiar voices. Laughter that feels like a relief.</p><p>The kind of comfort that does not ask anything from her.</p>",
    related: ["why does she smile so much?", "why does she love rainy days?"]
  },
  "why does she overthink?": {
    count: "About 3,240 results",
    answer: "<p>Because she has already imagined every version of the moment before it even has a chance to happen.</p><p>And then she spends the next hour trying not to make it true.</p>",
    related: ["why does she replay conversations?", "why does she disappear sometimes?"]
  },
  "who does she love?": {
    count: "About 4,980 results",
    answer: "<p>Not in a dramatic, movie-kind of way.</p><p>Just in the quiet, steady way that makes a room feel like home.</p>",
    related: ["who does she miss?", "what makes her stay?"]
  },
  "who does she miss?": {
    count: "About 2,330 results",
    answer: "<p>Someone she never stopped carrying in the back of her mind.</p><p>Even when she learned how to smile around the silence.</p>",
    related: ["why does she miss people quietly?", "does anyone remember me the way I remember them?"]
  },
  "why does friendship matter to her?": {
    count: "About 1,810 results",
    answer: "<p>Because it is one of the few things that keeps her from feeling too far away from herself.</p><p>Friendship is not a luxury to her.</p><p>It is a kind of shelter.</p>",
    related: ["who does she trust?", "what makes her stay?"]
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
    });
    relatedSearches.appendChild(button);
  });
}

function getMatch(query) {
  const value = query.trim();
  const lowered = value.toLowerCase();

  const direct = Object.keys(answerMap).find((item) => item.toLowerCase() === lowered);
  if (direct) return answerMap[direct];

  const fallback = Object.entries(answerMap).find(([key]) => {
    const guess = key.toLowerCase();

    return (
      (lowered.includes('remember') && guess.includes('remember')) ||
      (lowered.includes('picture') && guess.includes('picture')) ||
      (lowered.includes('miss') && guess.includes('miss')) ||
      (lowered.includes('rain') && guess.includes('rain')) ||
      (lowered.includes('song') && guess.includes('song')) ||
      (lowered.includes('alone') && guess.includes('alone')) ||
      (lowered.includes('happy') && guess.includes('happy')) ||
      (lowered.includes('overthink') && guess.includes('overthink'))
    );
  });

  return fallback ? fallback[1] : {
    count: 'About 0 results',
    answer: '<p>There is a pause here, a little not-quite-said answer, and a memory waiting to be found.</p>',
    related: ['why does she remember tiny details?', 'why does she take pictures of everything?']
  };
}

function performSearch(query) {
  const value = query.trim();

  if (!value) {
    resultTitle.textContent = 'what would you like to know?';
    resultCount.textContent = 'About 12,400 results';
    resultBody.innerHTML = '<p>Type a thought and press enter to see what the page reveals.</p>';
    renderRelated(['why does she remember tiny details?', 'why does she take pictures of everything?']);
    resultCard.classList.add('is-active');
    return;
  }

  const selected = getMatch(value);
  resultTitle.textContent = value;
  resultCount.textContent = selected.count;
  resultBody.innerHTML = selected.answer;
  renderRelated(selected.related);
  resultCard.classList.add('is-active');
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
  const query = input.value.trim().toLowerCase();
  const suggestionButtons = document.querySelectorAll('.suggestion, .chip');

  suggestionButtons.forEach((buttonItem) => {
    const text = (buttonItem.dataset.query || '').toLowerCase();
    const visible = !query || text.includes(query);
    buttonItem.style.display = visible ? '' : 'none';
  });
}

searchButton.addEventListener('click', () => performSearch(input.value));

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
    performSearch(input.value);
    closeSuggestions();
  }
});

document.querySelectorAll('.chip, .suggestion, .archive-card').forEach((buttonItem) => {
  buttonItem.addEventListener('click', () => {
    const query = buttonItem.dataset.query;
    input.value = query;
    performSearch(query);
    updateSearchSuggestions();
    input.focus();
  });
});

const defaultQuery = 'why does she remember tiny details?';
input.value = defaultQuery;
performSearch(defaultQuery);
