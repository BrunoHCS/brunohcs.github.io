// Executado no <head>, antes da renderização, para evitar "piscar" o tema errado.
(function applyInitialTheme() {
  var storedTheme = localStorage.getItem('theme');
  var prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  document.documentElement.dataset.theme = storedTheme || (prefersLight ? 'light' : 'dark');
  var themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) themeColor.content = document.documentElement.dataset.theme === 'light' ? '#edf2f4' : '#0b1119';
})();
