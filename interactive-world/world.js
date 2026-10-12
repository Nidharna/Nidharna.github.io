const worldStage = document.getElementById('worldStage');
const worldArt = document.getElementById('worldArt');
const objectNote = document.getElementById('objectNote');
const worldViews = {
  experiments: document.getElementById('experimentsView'),
  garden: document.getElementById('gardenView'),
  archive: document.getElementById('archiveView')
};
let activeView = null;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let draggedObject = null;
let dragOrigin = null;
let activePointerId = null;
let suppressObjectClick = false;
let suppressedObject = null;

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
}

function showView(name, opener, updateHistory = false) {
  const view = worldViews[name];
  if (!view) return;
  activeView = { name, opener, hasHistoryEntry: updateHistory };
  worldStage.hidden = true;
  Object.values(worldViews).forEach((item) => { item.hidden = item !== view; });
  const heading = view.querySelector('h2');
  heading.tabIndex = -1;
  heading.focus({ preventScroll: true });
  if (updateHistory && window.location.hash !== `#${name}`) {
    window.history.pushState({ worldView: name }, '', `#${name}`);
  }
  scrollToTop();
}

function openView(name, opener) {
  showView(name, opener, true);
}

function returnToWorld(fromHistory = false) {
  if (!fromHistory && activeView && activeView.hasHistoryEntry && window.location.hash === `#${activeView.name}`) {
    activeView.hasHistoryEntry = false;
    window.history.back();
    return;
  }

  const opener = activeView && activeView.opener;
  worldStage.hidden = false;
  Object.values(worldViews).forEach((view) => { view.hidden = true; });
  activeView = null;
  if (!fromHistory && window.location.hash) {
    window.history.replaceState({ worldView: null }, '', `${window.location.pathname}${window.location.search}`);
  }
  scrollToTop();
  if (opener) opener.focus({ preventScroll: true });
}

function restoreViewFromHistory() {
  const name = window.location.hash.slice(1);
  if (worldViews[name]) {
    showView(name, null, false);
  } else if (activeView) {
    returnToWorld(true);
  }
}

window.addEventListener('popstate', restoreViewFromHistory);
if (worldViews[window.location.hash.slice(1)]) showView(window.location.hash.slice(1), null, false);

document.querySelectorAll('[data-open-view]').forEach((button) => {
  button.addEventListener('click', () => openView(button.dataset.openView, button));
});

document.querySelectorAll('[data-back-to-world]').forEach((button) => {
  button.addEventListener('click', returnToWorld);
});

worldArt.addEventListener('pointerdown', (event) => {
  const object = event.target.closest('[data-draggable]');
  if (!object || event.button !== 0) return;
  draggedObject = object;
  dragOrigin = { x: event.clientX, y: event.clientY };
  activePointerId = event.pointerId;
  object.classList.add('is-dragging');
});

window.addEventListener('pointermove', (event) => {
  if (!draggedObject || event.pointerId !== activePointerId) return;
  const artBounds = worldArt.getBoundingClientRect();
  const objectBounds = draggedObject.getBoundingClientRect();
  const x = event.clientX - artBounds.left - objectBounds.width / 2;
  const y = event.clientY - artBounds.top - objectBounds.height / 2;
  const safeX = Math.max(0, Math.min(x, artBounds.width - objectBounds.width));
  const safeY = Math.max(0, Math.min(y, artBounds.height - objectBounds.height));
  draggedObject.style.left = `${(safeX / artBounds.width) * 100}%`;
  draggedObject.style.top = `${(safeY / artBounds.height) * 100}%`;
  if (Math.hypot(event.clientX - dragOrigin.x, event.clientY - dragOrigin.y) > 5) suppressObjectClick = true;
});

function finishDrag(event) {
  if (!draggedObject || event.pointerId !== activePointerId) return;
  const movedObject = draggedObject;
  draggedObject.classList.remove('is-dragging');
  draggedObject = null;
  dragOrigin = null;
  activePointerId = null;
  if (suppressObjectClick) {
    suppressedObject = movedObject;
    window.setTimeout(() => {
      if (suppressedObject === movedObject) {
        suppressedObject = null;
        suppressObjectClick = false;
      }
    }, 180);
  }
}

window.addEventListener('pointerup', finishDrag);
window.addEventListener('pointercancel', finishDrag);

worldArt.addEventListener('click', (event) => {
  const object = event.target.closest('.world-object[data-thought]');
  if (object && object === suppressedObject) {
    suppressedObject = null;
    suppressObjectClick = false;
    event.preventDefault();
    return;
  }
  if (!object) return;
  objectNote.textContent = object.dataset.thought;
  object.classList.remove('is-touched');
  void object.offsetWidth;
  object.classList.add('is-touched');
  window.setTimeout(() => object.classList.remove('is-touched'), 500);
});

const pointerFine = window.matchMedia('(hover: hover) and (pointer: fine)');

if (pointerFine.matches && !reducedMotion.matches) {
  let pointerFrame = 0;
  worldArt.addEventListener('pointermove', (event) => {
    if (pointerFrame) window.cancelAnimationFrame(pointerFrame);
    pointerFrame = window.requestAnimationFrame(() => {
      const bounds = worldArt.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 8;
      const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 8;
      worldArt.style.setProperty('--pointer-x', `${x.toFixed(1)}px`);
      worldArt.style.setProperty('--pointer-y', `${y.toFixed(1)}px`);
    });
  });
  worldArt.addEventListener('pointerleave', () => {
    worldArt.style.setProperty('--pointer-x', '0px');
    worldArt.style.setProperty('--pointer-y', '0px');
  });
}

const experimentTabs = [...document.querySelectorAll('.experiment-tab')];
const experimentPanels = [...document.querySelectorAll('.experiment-panel')];

function selectExperimentTab(tab, moveFocus = false) {
  experimentTabs.forEach((item) => {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
  });
  experimentPanels.forEach((panel) => {
    panel.hidden = panel.id !== tab.getAttribute('aria-controls');
  });
  if (moveFocus) tab.focus();
}

experimentTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectExperimentTab(tab));
  tab.addEventListener('keydown', (event) => {
    let nextIndex = index;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % experimentTabs.length;
    else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + experimentTabs.length) % experimentTabs.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = experimentTabs.length - 1;
    else return;
    event.preventDefault();
    selectExperimentTab(experimentTabs[nextIndex], true);
  });
});

const shapePlayground = document.getElementById('shapePlayground');
const shapeStatus = document.getElementById('shapeStatus');
let selectedShapeColour = '#e884a6';
let shapeDrag = null;

shapePlayground.addEventListener('pointerdown', (event) => {
  const shape = event.target.closest('[data-shape-object]');
  if (!shape || event.button !== 0) return;
  const bounds = shape.getBoundingClientRect();
  shapeDrag = { shape, pointerId: event.pointerId, offsetX: event.clientX - bounds.left, offsetY: event.clientY - bounds.top };
  shape.classList.add('is-dragging');
});

window.addEventListener('pointermove', (event) => {
  if (!shapeDrag || shapeDrag.pointerId !== event.pointerId) return;
  const playgroundBounds = shapePlayground.getBoundingClientRect();
  const shape = shapeDrag.shape;
  const left = event.clientX - playgroundBounds.left - shapeDrag.offsetX;
  const top = event.clientY - playgroundBounds.top - shapeDrag.offsetY;
  shape.style.left = `${Math.max(0, Math.min(left, shapePlayground.clientWidth - shape.offsetWidth))}px`;
  shape.style.top = `${Math.max(0, Math.min(top, shapePlayground.clientHeight - shape.offsetHeight))}px`;
});

function releaseShape(event) {
  if (!shapeDrag || shapeDrag.pointerId !== event.pointerId) return;
  const { shape, pointerId } = shapeDrag;
  shape.classList.remove('is-dragging');
  shape.classList.add('is-bouncing');
  window.setTimeout(() => shape.classList.remove('is-bouncing'), 460);
  shapeDrag = null;
  shapeStatus.textContent = 'There. It landed somewhere new.';
}

window.addEventListener('pointerup', releaseShape);
window.addEventListener('pointercancel', releaseShape);

document.querySelectorAll('[data-shape-object]').forEach((shape) => {
  shape.addEventListener('click', () => {
    shape.classList.remove('is-bouncing');
    void shape.offsetWidth;
    shape.classList.add('is-bouncing');
    window.setTimeout(() => shape.classList.remove('is-bouncing'), 460);
    shapeStatus.textContent = 'A little shape, a little moment.';
  });

  shape.addEventListener('keydown', (event) => {
    const directions = { ArrowLeft: [-8, 0], ArrowRight: [8, 0], ArrowUp: [0, -8], ArrowDown: [0, 8] };
    if (!directions[event.key]) return;
    event.preventDefault();
    const [deltaX, deltaY] = directions[event.key];
    const left = shape.style.left ? parseFloat(shape.style.left) : shape.offsetLeft;
    const top = shape.style.top ? parseFloat(shape.style.top) : shape.offsetTop;
    shape.style.left = `${Math.max(0, Math.min(left + deltaX, shapePlayground.clientWidth - shape.offsetWidth))}px`;
    shape.style.top = `${Math.max(0, Math.min(top + deltaY, shapePlayground.clientHeight - shape.offsetHeight))}px`;
    shapeStatus.textContent = 'A little nudge, in the direction you chose.';
  });
});

document.querySelectorAll('[data-shape-mode]').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-shape-mode]').forEach((choice) => {
      const selected = choice === button;
      choice.classList.toggle('is-selected', selected);
      choice.setAttribute('aria-pressed', String(selected));
    });
    document.querySelectorAll('[data-shape-object]').forEach((shape) => {
      shape.dataset.form = button.dataset.shapeMode;
    });
    shapeStatus.textContent = `Everything is a little more ${button.dataset.shapeMode}.`;
  });
});

document.querySelectorAll('[data-shape-colour]').forEach((button) => {
  button.addEventListener('click', () => {
    selectedShapeColour = button.dataset.shapeColour;
    document.querySelectorAll('[data-shape-colour]').forEach((swatch) => swatch.setAttribute('aria-pressed', String(swatch === button)));
    document.querySelectorAll('[data-shape-object]').forEach((shape) => shape.style.setProperty('--shape-color', selectedShapeColour));
    shapeStatus.textContent = 'A new colour changes the whole mood.';
  });
});

document.getElementById('resetShapes').addEventListener('click', () => {
  document.querySelectorAll('[data-shape-object]').forEach((shape) => {
    shape.removeAttribute('style');
    shape.dataset.form = 'round';
  });
  document.querySelectorAll('[data-shape-mode]').forEach((button) => {
    const selected = button.dataset.shapeMode === 'round';
    button.classList.toggle('is-selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  document.querySelectorAll('[data-shape-colour]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.shapeColour === '#e884a6')));
  selectedShapeColour = '#e884a6';
  shapeStatus.textContent = 'Back where we started. Ready to play again.';
});

const firstColour = document.getElementById('firstColour');
const secondColour = document.getElementById('secondColour');
const mixedColour = document.getElementById('mixedColour');
const mixedHex = document.getElementById('mixedHex');

function mixColours(first, second) {
  const channels = (hex) => hex.match(/[\da-f]{2}/gi).map((value) => parseInt(value, 16));
  return channels(first).map((value, index) => Math.round((value + channels(second)[index]) / 2).toString(16).padStart(2, '0')).join('');
}

function updateMixedColour() {
  const hex = `#${mixColours(firstColour.value, secondColour.value)}`.toUpperCase();
  mixedColour.style.backgroundColor = hex;
  mixedColour.setAttribute('aria-label', `Mixed colour ${hex}`);
  mixedHex.textContent = hex;
}

firstColour.addEventListener('input', updateMixedColour);
secondColour.addEventListener('input', updateMixedColour);
updateMixedColour();

const planeStage = document.getElementById('planeStage');
const planeStatus = document.getElementById('planeStatus');
const launchPlane = document.getElementById('launchPlane');

launchPlane.addEventListener('click', () => {
  planeStage.classList.remove('is-launched');
  void planeStage.offsetWidth;
  planeStage.classList.add('is-launched');
  planeStatus.textContent = 'Off it goes. I wonder where it will land.';
});

document.getElementById('paperPlane').addEventListener('animationend', (event) => {
  if (event.animationName !== 'plane-flight') return;
  planeStatus.textContent = 'It made it somewhere. You can send it again.';
});

const archiveList = document.querySelector('.archive-list');
const archiveCount = document.getElementById('archiveCount');

document.getElementById('shuffleArchive').addEventListener('click', () => {
  const questions = [...archiveList.children];
  for (let index = questions.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [questions[index], questions[swapIndex]] = [questions[swapIndex], questions[index]];
  }
  questions.forEach((question) => archiveList.appendChild(question));
  archiveCount.textContent = `${questions.length} questions, reshuffled`;
  archiveList.classList.remove('is-shuffling');
  void archiveList.offsetWidth;
  archiveList.classList.add('is-shuffling');
  window.setTimeout(() => archiveList.classList.remove('is-shuffling'), 600);
});

const plantingBed = document.getElementById('plantingBed');
const gardenMessage = document.getElementById('gardenMessage');
const flowerMessages = [
  'A little room to grow is a lovely thing.',
  'This one is for the small details.',
  'Some days, beginning is enough.',
  'A quiet little thing, just because.',
  'Something good can grow from a pause.',
  'This flower made its own kind of day.'
];
const flowerColors = ['#e884a6', '#c1a5db', '#f4ae9c', '#d986a5', '#b6a9d9', '#efc77d'];
let flowerCount = 0;

function makeFlowerPetal(index, color, petalCount, variant) {
  const petal = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
  const angle = index * (360 / petalCount);
  petal.setAttribute('cx', '36');
  petal.setAttribute('cy', variant === 'soft' ? '23' : '21');
  petal.setAttribute('rx', variant === 'point' ? '5' : variant === 'tiny' ? '7' : '6.2');
  petal.setAttribute('ry', variant === 'point' ? '14' : variant === 'tiny' ? '9' : '12');
  petal.setAttribute('fill', color);
  petal.setAttribute('transform', `rotate(${angle} 36 36)`);
  return petal;
}

function plantFlower(leftPercent) {
  flowerCount += 1;
  const variants = ['sun', 'soft', 'point', 'tiny'];
  const variant = variants[(flowerCount - 1) % variants.length];
  const color = flowerColors[(flowerCount - 1) % flowerColors.length];
  const flower = document.createElement('button');
  flower.type = 'button';
  flower.className = `garden-flower flower-${variant}`;
  flower.dataset.variant = variant;
  flower.style.left = '50%';
  flower.setAttribute('aria-label', `Flower ${flowerCount}. Click to read its thought.`);
  flower.dataset.message = flowerMessages[(flowerCount - 1) % flowerMessages.length];

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 72 140');
  svg.setAttribute('aria-hidden', 'true');
  const stem = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  stem.setAttribute('class', 'flower-stem');
  stem.setAttribute('d', 'M36 49 C34 77 40 104 36 135');
  const leftLeaf = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  leftLeaf.setAttribute('class', 'flower-leaf');
  leftLeaf.setAttribute('d', 'M35 91 C17 73 10 84 31 98 Z');
  const rightLeaf = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  rightLeaf.setAttribute('class', 'flower-leaf');
  rightLeaf.setAttribute('d', 'M37 108 C53 89 62 98 40 116 Z');
  const blossom = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  blossom.setAttribute('transform', 'translate(0 -4)');
  const petalCount = variant === 'soft' ? 6 : variant === 'point' ? 10 : variant === 'tiny' ? 7 : 8;
  for (let petalIndex = 0; petalIndex < petalCount; petalIndex += 1) blossom.appendChild(makeFlowerPetal(petalIndex, color, petalCount, variant));
  const center = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  center.setAttribute('class', 'flower-center');
  center.setAttribute('cx', '36');
  center.setAttribute('cy', '36');
  center.setAttribute('r', '6.5');
  blossom.appendChild(center);
  svg.append(stem, leftLeaf, rightLeaf, blossom);
  flower.appendChild(svg);
  flower.addEventListener('animationend', (event) => {
    if (event.animationName === 'flower-grow') flower.classList.add('is-grown');
  });
  plantingBed.appendChild(flower);
  const edgePadding = (flower.offsetWidth / plantingBed.clientWidth) * 50;
  flower.style.left = `${Math.max(edgePadding, Math.min(leftPercent, 100 - edgePadding))}%`;
  gardenMessage.textContent = 'Something is growing. Click a flower if you want to hear its thought.';
}

plantingBed.addEventListener('click', (event) => {
  if (event.target.closest('.garden-flower')) return;
  const bounds = plantingBed.getBoundingClientRect();
  const leftPercent = Math.max(0, Math.min(((event.clientX - bounds.left) / bounds.width) * 100, 100));
  plantFlower(leftPercent);
});

plantingBed.addEventListener('keydown', (event) => {
  if (event.target !== plantingBed || (event.key !== 'Enter' && event.key !== ' ')) return;
  event.preventDefault();
  plantFlower(50);
});

const plantFlowerButton = document.getElementById('plantFlowerButton');
plantFlowerButton.addEventListener('click', () => plantFlower(50));
plantFlowerButton.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  event.preventDefault();
  plantFlower(50);
});

plantingBed.addEventListener('click', (event) => {
  const flower = event.target.closest('.garden-flower');
  if (!flower) return;
  event.stopPropagation();
  gardenMessage.textContent = flower.dataset.message;
});

document.getElementById('resetGarden').addEventListener('click', () => {
  plantingBed.querySelectorAll('.garden-flower').forEach((flower) => flower.remove());
  flowerCount = 0;
  gardenMessage.textContent = 'Nothing has bloomed yet. That’s a perfectly good place to begin.';
  plantingBed.focus();
});

const reflectionDialog = document.getElementById('reflectionDialog');
let archiveOpener = null;

document.querySelectorAll('[data-reflection]').forEach((button) => {
  button.addEventListener('click', () => {
    archiveOpener = button;
    document.getElementById('reflectionQuestion').textContent = button.textContent.replace('↗', '').trim();
    document.getElementById('reflectionText').textContent = button.dataset.reflection;
    reflectionDialog.showModal();
  });
});

document.querySelector('.dialog-close').addEventListener('click', () => {
  const opener = archiveOpener;
  archiveOpener = null;
  reflectionDialog.close();
  if (opener) window.setTimeout(() => opener.focus({ preventScroll: true }), 0);
});

reflectionDialog.addEventListener('close', () => {
  const opener = archiveOpener;
  archiveOpener = null;
  if (opener) window.setTimeout(() => opener.focus({ preventScroll: true }), 60);
});

reflectionDialog.addEventListener('click', (event) => {
  if (event.target === reflectionDialog) reflectionDialog.close();
});