// Grupo de botões de filtro com aria-pressed (apenas um ativo por vez).
export function setupFilterChips({ container, options, initialValue, onChange }) {
  const buttons = options.map(({ value, label }) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'chip';
    button.dataset.value = value;
    button.textContent = label;
    button.setAttribute('aria-pressed', String(value === initialValue));
    return button;
  });

  container.replaceChildren(...buttons);
  container.addEventListener('click', (event) => {
    const selected = event.target.closest('.chip');
    if (!selected) return;
    buttons.forEach((button) => button.setAttribute('aria-pressed', String(button === selected)));
    onChange(selected.dataset.value);
  });
}
