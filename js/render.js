import { TOPIC_LABELS } from './data/videos.js';

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

function cloneTemplate(templateId) {
  const template = document.getElementById(templateId);
  if (!template) {
    throw new Error(`Template "#${templateId}" não encontrado na página.`);
  }
  return template.content.firstElementChild.cloneNode(true);
}

function setText(root, selector, text) {
  const element = root.querySelector(selector);
  if (element) element.textContent = text;
}

// Bloqueia esquemas perigosos (ex.: javascript:) caso um link errado entre em js/data.
function safeExternalUrl(url) {
  try {
    if (new URL(url).protocol === 'https:') return url;
  } catch (error) {
    console.error(`URL inválida em js/data: "${url}"`, error);
    return '#';
  }
  console.error(`URL bloqueada (use https://) em js/data: "${url}"`);
  return '#';
}

export function videoUrl(video) {
  return video.format === 'short'
    ? `https://www.youtube.com/shorts/${video.id}`
    : `https://www.youtube.com/watch?v=${video.id}`;
}

export function formatDate(isoDate) {
  return dateFormatter.format(new Date(`${isoDate}T12:00:00`));
}

export function createTag(label, className = 'tag') {
  const item = document.createElement('li');
  item.className = className;
  item.textContent = label;
  return item;
}

export function renderVideo(video, templateId) {
  const node = cloneTemplate(templateId);
  node.querySelector('.video-link').href = videoUrl(video);
  node.querySelector('img').src = `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;
  setText(node, '.video-topic', TOPIC_LABELS[video.topic] ?? video.topic);
  setText(node, '.video-title', video.title);
  setText(node, '.video-desc', video.description ?? '');
  return node;
}

export function renderPost(post, basePath = '') {
  const node = cloneTemplate('tpl-post');
  const link = node.querySelector('.card-link');
  link.href = `${basePath}posts/${post.slug}.html`;
  link.textContent = post.title;
  const time = node.querySelector('time');
  time.dateTime = post.date;
  time.textContent = formatDate(post.date);
  setText(node, '.post-reading', `${post.readingMinutes} min de leitura`);
  setText(node, '.post-excerpt', post.excerpt);
  node.querySelector('.tag-list').append(...post.tags.map((tag) => createTag(`#${tag}`)));
  return node;
}

export function renderProject(project) {
  const node = cloneTemplate('tpl-project');
  const link = node.querySelector('.card-link');
  link.href = safeExternalUrl(project.url);
  link.textContent = project.title;
  setText(node, '.project-kind', project.kind);
  setText(node, '.project-desc', project.description);
  setText(node, '.project-cta', `${project.cta} →`);
  return node;
}

export function renderEmptyState(message) {
  const item = document.createElement('li');
  item.className = 'empty-state';
  item.textContent = message;
  return item;
}
