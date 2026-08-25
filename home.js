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
