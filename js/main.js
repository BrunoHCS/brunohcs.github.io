const THEME_STORAGE_KEY = 'theme';

function setupThemeToggle() {
  const toggle = document.querySelector('.theme-toggle');
  if (!toggle) return;
  const root = document.documentElement;
  const syncPressed = () => toggle.setAttribute('aria-pressed', String(root.dataset.theme === 'light'));

  syncPressed();
  toggle.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem(THEME_STORAGE_KEY, root.dataset.theme);
    syncPressed();
  });
}

function setupMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');
  if (!toggle || !nav) return;

  const setOpen = (isOpen) => {
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
    nav.classList.toggle('is-open', isOpen);
  };

  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setOpen(false);
  });
}

async function copyToClipboard(button) {
  const status = document.getElementById(button.getAttribute('aria-describedby'));
  try {
    await navigator.clipboard.writeText(button.dataset.copy);
    status.textContent = button.dataset.copyLabel ?? 'Copiado!';
  } catch (error) {
    console.error('Falha ao copiar para a área de transferência', error);
    status.textContent = 'Não deu para copiar. Selecione o texto e copie manualmente.';
  }
}

function setupCopyButtons() {
  document.querySelectorAll('[data-copy]').forEach((button) => {
    button.addEventListener('click', () => copyToClipboard(button));
  });
}

// Montado em tempo de execução para o e-mail não aparecer em texto puro no HTML (anti-spam).
const EMAIL_PARTS = ['obrunohenriquetech', 'gmail.com'];

function revealEmail() {
  const email = EMAIL_PARTS.join('@');
  document.querySelectorAll('a[data-email]').forEach((link) => {
    link.href = `mailto:${email}`;
    if (link.hasAttribute('data-email-text')) link.textContent = email;
  });
  document.querySelectorAll('[data-copy-email]').forEach((button) => {
    button.dataset.copy = email;
  });
}

function setFooterYear() {
  document.querySelectorAll('[data-year]').forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });
}

setupThemeToggle();
setupMobileNav();
revealEmail();
setupCopyButtons();
setFooterYear();
