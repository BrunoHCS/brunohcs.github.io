# Bruno Henrique Tech — blog & portfólio

Site pessoal (blog + portfólio) feito só com **HTML, CSS e JavaScript**, sem framework e sem etapa de build. Pronto para o **GitHub Pages**.

## Estrutura

| Caminho               | O que é                                                               |
| --------------------- | --------------------------------------------------------------------- |
| `index.html`          | Home: hero, temas, vídeos, posts recentes, portfólio, sobre e contato |
| `blog.html`           | Lista de posts com busca e filtro por tag                             |
| `apoie.html`          | Página de apoio via Pix (QR Code + chave)                             |
| `posts/*.html`        | Um arquivo por post (`posts/_modelo.html` é o modelo)                 |
| `404.html`            | Página de erro (o GitHub Pages usa automaticamente)                   |
| `css/style.css`       | Estilos e tokens de design (cores, fontes, espaçamentos)              |
| `css/fonts.css`       | Fontes hospedadas localmente (`assets/fonts/`, sem Google Fonts)      |
| `_headers`            | Cabeçalhos de segurança para Cloudflare Pages/Netlify                 |
| `js/data/videos.js`   | Lista de vídeos e shorts do YouTube                                   |
| `js/data/posts.js`    | Metadados dos posts (título, resumo, data, tags)                      |
| `js/data/projects.js` | Cards do portfólio e “caixa de ferramentas”                           |
| `js/*.js`             | Comportamento (tema, menu, filtros, embed de vídeo)                   |

## Rodar localmente

O site usa ES Modules, então precisa ser servido por HTTP (abrir com `file://` não funciona):

```bash
python3 -m http.server 8000
# abra http://localhost:8000
```

## Publicar no GitHub Pages

1. Crie um repositório no GitHub:
   - `SEU-USUARIO.github.io` → o site fica em `https://SEU-USUARIO.github.io/`
   - qualquer outro nome (ex.: `site`) → fica em `https://SEU-USUARIO.github.io/site/`
2. Envie os arquivos:

   ```bash
   git init
   git add index.html blog.html apoie.html 404.html README.md _headers assets css js posts
   git commit -m "feat: primeira versão do site"
   git branch -M main
   git remote add origin git@github.com:SEU-USUARIO/SEU-REPO.git
   git push -u origin main
   ```

3. No GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main` / `(root)`** → Save.
4. Em 1–2 minutos o site estará no ar.

**Domínio próprio (opcional):** em _Settings → Pages → Custom domain_, informe o domínio e crie no seu provedor de DNS um `CNAME` apontando para `SEU-USUARIO.github.io`.

## Atualizar conteúdo

### Pix (página Apoie)

Em `apoie.html` há um comentário `PIX — como preencher` com o passo a passo:

1. Salve o QR Code em `assets/img/pix-qrcode.png` e troque o bloco de placeholder pelo `<img>` comentado.
2. Substitua `[SUA CHAVE PIX]` nos dois lugares (botão de copiar e texto exibido).

Prefira chave aleatória ou e-mail — evite expor CPF ou telefone.

### Novo vídeo

Adicione um item no topo de `js/data/videos.js`:

```js
{ id: 'ID_DO_VIDEO', title: 'Título', format: 'short', topic: 'carreira', date: 'AAAA-MM-DD' },
```

- `id`: o código depois de `watch?v=` ou `shorts/` na URL.
- `format`: `'short'` ou `'long'` (vídeos `long` aparecem em destaque e aceitam `description`).
- `topic`: `carreira`, `curriculo`, `areas` ou `bem-estar` (novos temas vão em `TOPIC_LABELS`).

### Novo post

1. Copie `posts/_modelo.html` para `posts/meu-post.html` e preencha os `[COLCHETES]`.
2. Adicione em `js/data/posts.js`:

   ```js
   { slug: 'meu-post', title: '...', excerpt: '...', date: 'AAAA-MM-DD', readingMinutes: 5, tags: ['carreira'] },
   ```

### Portfólio

Edite `js/data/projects.js` — cada card tem `kind`, `title`, `description`, `url` e `cta`. A lista `toolbox` mostra as tecnologias que você usa.

## Personalizar o visual

As cores ficam em `css/style.css`, nos blocos `[data-theme='dark']` e `[data-theme='light']`. O azul `#1ea7ff` é o mesmo do logo do canal.

## Segurança

**Já aplicado no código**

- CSP (`<meta http-equiv="Content-Security-Policy">`) e `Referrer-Policy` em todas as páginas.
- Fontes locais — nenhum recurso de terceiros além de miniaturas (`i.ytimg.com`) e player do YouTube (`youtube-nocookie.com`).
- E-mail montado via JavaScript (`EMAIL_PARTS` em `js/main.js`), fora do HTML em texto puro.
- Links do portfólio aceitam apenas `https://`.
- Página Apoie orienta o visitante a conferir o nome do recebedor no app do banco.

> Ao adicionar um recurso externo novo (imagem, vídeo, script), libere o domínio na CSP de **todas** as páginas e no `_headers`, senão o navegador bloqueia.

**Faça no GitHub (não dá para fazer via código)**

- Ative 2FA na conta (chave de segurança ou app autenticador).
- _Settings → Branches_: proteja a `main` (sem force push).
- _Settings → Pages_: marque **Enforce HTTPS**. Com domínio próprio, verifique-o em _Settings (do perfil) → Pages → Verified domains_ e remova o DNS se desativar o site.

**Hospedagem paga**

- Cloudflare Pages e Netlify leem o `_headers` automaticamente (inclui proteção contra clickjacking e HSTS).
- VPS/servidor próprio: publique só os arquivos do site (nunca a pasta `.git`), desative a listagem de diretórios e replique os cabeçalhos do `_headers` no Nginx/Apache.
