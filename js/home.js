import { videos } from './data/videos.js';
import { posts } from './data/posts.js';
import { projects, toolbox } from './data/projects.js';
import { renderVideo, renderPost, renderProject, createTag } from './render.js';
import { typeCommand } from './terminal.js';

const LATEST_POSTS_LIMIT = 3;
function renderFeaturedVideos() {
  const container = document.getElementById('featured-videos');
  const longVideos = videos.filter((video) => video.format === 'long');
  container.replaceChildren(...longVideos.map((video) => renderVideo(video, 'tpl-video-long')));
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
renderLatestPosts();
renderPortfolio();
