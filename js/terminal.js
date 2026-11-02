const TYPE_DELAY_MS = 70;

// Digita o comando do terminal do hero; o texto completo já vem no HTML (funciona sem JS).
export function typeCommand(element) {
  if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const fullText = element.textContent;
  let visibleChars = 0;
  element.textContent = '';

  const timer = setInterval(() => {
    visibleChars += 1;
    element.textContent = fullText.slice(0, visibleChars);
    if (visibleChars >= fullText.length) clearInterval(timer);
  }, TYPE_DELAY_MS);
}
