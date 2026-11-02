const EMBED_BASE_URL = 'https://www.youtube-nocookie.com/embed/';

// Só carrega o player do YouTube após o clique (página mais leve e sem cookies antecipados).
function loadEmbed(button) {
  const iframe = document.createElement('iframe');
  iframe.src = `${EMBED_BASE_URL}${button.dataset.videoId}?autoplay=1`;
  iframe.title = button.dataset.title;
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
  iframe.allowFullscreen = true;
  button.replaceWith(iframe);
  iframe.focus();
}

document.querySelectorAll('.lite-embed').forEach((button) => {
  button.addEventListener('click', () => loadEmbed(button), { once: true });
});
