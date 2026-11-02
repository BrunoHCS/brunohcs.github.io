// Executado no <head>, antes da renderização, para evitar "piscar" o tema errado.
(function applyInitialTheme() {
  var storedTheme = localStorage.getItem('theme');
  var prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  document.documentElement.dataset.theme = storedTheme || (prefersLight ? 'light' : 'dark');
})();
