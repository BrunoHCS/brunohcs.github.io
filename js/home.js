import { videos, TOPIC_LABELS } from './data/videos.js';
import { posts } from './data/posts.js';
import { projects, toolbox } from './data/projects.js';
import { renderVideo, renderPost, renderProject, renderEmptyState, createTag } from './render.js';
import { setupFilterChips } from './filter-chips.js';
import { typeCommand } from './terminal.js';

const LATEST_POSTS_LIMIT = 3;
const ALL_TOPICS = 'todos';

function renderFeaturedVideos() {
  const container = document.getElementById('featured-videos');
  const longVideos = videos.filter((video) => video.format === 'long');
  container.replaceChildren(...longVideos.map((video) => renderVideo(video, 'tpl-video-long')));
}

function renderShorts(topic) {
  const rail = document.getElementById('shorts-rail');
  const status = document.getElementById('shorts-status');
  const shorts = videos.filter(
    (video) => video.format === 'short' && (topic === ALL_TOPICS || video.topic === topic),
  );

  rail.replaceChildren(
    ...(shorts.length > 0
      ? shorts.map((video) => renderVideo(video, 'tpl-video-short'))
      : [renderEmptyState('Ainda não tem short nesse tema. Em breve!')]),
  );
  status.textContent = `${shorts.length} shorts exibidos`;
}

function setupShortsFilter() {
  const usedTopics = new Set(videos.filter((video) => video.format === 'short').map((video) => video.topic));
  const options = [
    { value: ALL_TOPICS, label: 'Todos' },
    ...[...usedTopics].map((topic) => ({ value: topic, label: TOPIC_LABELS[topic] ?? topic })),
  ];

  setupFilterChips({
    container: document.getElementById('shorts-filter'),
    options,
    initialValue: ALL_TOPICS,
    onChange: renderShorts,
  });
  renderShorts(ALL_TOPICS);
}

function renderLatestPosts() {
  const latest = [...posts].sort((a, b) => b.date.localeCompare(a.date)).slice(0, LATEST_POSTS_LIMIT);
  document.getElementById('latest-posts').replaceChildren(...latest.map((post) => renderPost(post)));
}

function renderPortfolio() {
  document.getElementById('projects').replaceChildren(...projects.map(renderProject));
  document.getElementById('toolbox').replaceChildren(...toolbox.map((tool) => createTag(tool, 'tool')));
}

typeCommand(document.querySelector('[data-typed]'));
renderFeaturedVideos();
setupShortsFilter();
renderLatestPosts();
renderPortfolio();
