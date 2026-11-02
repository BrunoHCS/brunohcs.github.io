const shareButton = document.querySelector('.share-post');
const shareStatus = document.querySelector('.share-post-status');

if (shareButton && shareStatus) {
  shareButton.addEventListener('click', async () => {
    const url = document.querySelector('link[rel="canonical"]')?.href ?? location.href;
    shareButton.disabled = true;

    try {
      if (navigator.share) {
        await navigator.share({ url });
        shareStatus.textContent = 'Link do texto compartilhado.';
      } else {
        await navigator.clipboard.writeText(url);
        shareStatus.textContent = 'Link copiado. Cole onde preferir.';
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Não foi possível compartilhar o link do texto.', error);
        shareStatus.textContent = 'Não foi possível compartilhar. Copie o endereço desta página.';
      }
    } finally {
      shareButton.disabled = false;
    }
  });
}
