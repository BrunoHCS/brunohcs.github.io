import { posts } from './data/posts.js';
import { renderPost, renderEmptyState } from './render.js';
import { setupFilterChips } from './filter-chips.js';

const ALL_TAGS = 'todas';
const filters = { query: '', tag: ALL_TAGS };

function normalize(text) {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

function matchesFilters(post) {
  const matchesTag = filters.tag === ALL_TAGS || post.tags.includes(filters.tag);
  const searchable = normalize(`${post.title} ${post.excerpt} ${post.tags.join(' ')}`);
  return matchesTag && searchable.includes(filters.query);
}

function renderPostList() {
  const sorted = [...posts].sort((a, b) => b.date.localeCompare(a.date));
  const visible = sorted.filter(matchesFilters);

  document.getElementById('post-list').replaceChildren(
    ...(visible.length > 0
      ? visible.map((post) => renderPost(post))
      : [renderEmptyState('Nenhum texto encontrado. Tente outra palavra ou tema.')]),
  );
  const plural = visible.length === 1 ? 'texto' : 'textos';
  document.getElementById('results-count').textContent = `${visible.length} ${plural}`;
}

function setupTagFilter() {
  const tags = [...new Set(posts.flatMap((post) => post.tags))].sort();
  setupFilterChips({
    container: document.getElementById('tag-filter'),
    options: [{ value: ALL_TAGS, label: 'Todas' }, ...tags.map((tag) => ({ value: tag, label: `#${tag}` }))],
    initialValue: ALL_TAGS,
    onChange: (tag) => {
      filters.tag = tag;
      renderPostList();
    },
  });
}

function setupSearch() {
  document.getElementById('post-search').addEventListener('input', (event) => {
    filters.query = normalize(event.target.value);
    renderPostList();
  });
}

setupTagFilter();
setupSearch();
renderPostList();
