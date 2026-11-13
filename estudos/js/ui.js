function icon(name) {
  const paths = {
    edit: '<path d="m14 5 5 5M4 20l4.2-.8L19 8.4a2.1 2.1 0 0 0-3-3L5.2 16.2 4 20Z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
    delete: '<path d="M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>',
    open: '<path d="M14 4h6v6M20 4l-9 9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    book: '<path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H20v16H7.5A2.5 2.5 0 0 0 5 21.5v-16Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M5 5.5v16M9 7h7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>'
  };
  return `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">${paths[name]}</svg>`;
}
function updateSummary() {
  const total = videos.length;
  const watched = videos.filter(video => video.watched).length;
  const remaining = total - watched;
  const percent = total ? Math.round((watched / total) * 100) : 0;
  document.getElementById('total-count').textContent = total;
  document.getElementById('watched-count').textContent = watched;
  document.getElementById('remaining-count').textContent = remaining;
  document.getElementById('progress-percent').textContent = `${percent}%`;
  document.getElementById('progress-fill').style.width = `${percent}%`;
  const bar = document.getElementById('progress-bar');
  bar.setAttribute('aria-valuenow', String(percent));
}
function updateCourseOptions() {
  const selected = courseFilter.value || 'all';
  const courses = activeCourses();
  const hasUnassigned = videos.some(video => !video.courseId);
  courseFilter.innerHTML = '<option value="all">Todos os cursos</option>' +
    courses.map(course => `<option value="${escapeHtml(course.id)}">${escapeHtml(course.name)}</option>`).join('') +
    (hasUnassigned ? '<option value="__sem_curso__">Sem curso</option>' : '');
  if ([...courseFilter.options].some(option => option.value === selected)) courseFilter.value = selected;
}
function render() {
  updateSummary();
  updateCourseOptions();
  renderPomodoro();
  const query = search.value.trim().toLocaleLowerCase('pt-BR');
  const mode = filter.value;
  const selectedCourse = courseFilter.value;
  const filtered = videos.filter(video => {
    if (mode === 'watched' && !video.watched) return false;
    if (mode === 'remaining' && video.watched) return false;
    if (selectedCourse === '__sem_curso__' && video.courseId) return false;
    if (selectedCourse !== 'all' && selectedCourse !== '__sem_curso__' && video.courseId !== selectedCourse) return false;
    const course = getCourseById(video.courseId)?.name || video.course || '';
    const haystack = `${video.title} ${course} ${video.module || ''} ${video.notes || ''}`.toLocaleLowerCase('pt-BR');
    return haystack.includes(query);
  });
  document.getElementById('visible-count').textContent = `${filtered.length} ${filtered.length === 1 ? 'aula' : 'aulas'}`;
  if (!filtered.length) {
    const searching = query || mode !== 'all' || selectedCourse !== 'all';
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">${icon('book')}</div><h3>${searching ? 'Nenhuma aula encontrada' : 'Sua lista começa aqui'}</h3><p>${searching ? 'Tente mudar a busca ou o filtro.' : 'Adicione a primeira vídeo aula usando o formulário ao lado. Você poderá marcar quando assistir.'}</p></div>`;
    return;
  }
  const visibleByCourse = new Map();
  filtered.forEach(video => {
    const key = video.courseId || '__sem_curso__';
    if (!visibleByCourse.has(key)) visibleByCourse.set(key, []);
    visibleByCourse.get(key).push(video);
  });
  const orderedCourseIds = [...visibleByCourse.keys()].sort((a, b) => {
    if (a === '__sem_curso__') return 1;
    if (b === '__sem_curso__') return -1;
    return (getCourseById(a)?.name || '').localeCompare(getCourseById(b)?.name || '', 'pt-BR', { sensitivity: 'base' });
  });
  const cardMarkup = video => {
    const link = safeLink(video.url);
    const course = getCourseById(video.courseId);
    const allLessons = videos.filter(item => item.courseId === video.courseId && moduleKey(item) === moduleKey(video)).sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
    const lessonIndex = allLessons.findIndex(item => item.id === video.id);
    const reorder = course ? `<div class="reorder-actions"><button class="lesson-move" type="button" data-action="move-lesson-up" aria-label="Mover ${escapeHtml(video.title)} para cima" title="Mover aula para cima" ${lessonIndex <= 0 ? 'disabled' : ''}>↑</button><button class="lesson-move" type="button" data-action="move-lesson-down" aria-label="Mover ${escapeHtml(video.title)} para baixo" title="Mover aula para baixo" ${lessonIndex < 0 || lessonIndex >= allLessons.length - 1 ? 'disabled' : ''}>↓</button></div>` : '';
    return `<article class="video-card ${video.watched ? 'is-watched' : ''}" data-id="${escapeHtml(video.id)}">
      <label class="check-wrap"><span class="sr-only">Marcar ${escapeHtml(video.title)} como assistida</span><input type="checkbox" data-action="toggle" ${video.watched ? 'checked' : ''}><span class="checkmark"></span></label>
      <div class="video-copy"><h3 class="video-title">${escapeHtml(video.title)}</h3>${video.notes ? `<p class="video-notes">${escapeHtml(video.notes)}</p>` : ''}</div>
      <div class="video-actions">${reorder}${link ? `<a class="watch-link" href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer" aria-label="Abrir ${escapeHtml(video.title)} no Telegram" title="Abrir aula">${icon('open')}</a>` : ''}<button class="icon-button" type="button" data-action="edit" aria-label="Editar ${escapeHtml(video.title)}" title="Editar aula">${icon('edit')}</button><button class="icon-button" type="button" data-action="delete" aria-label="Apagar ${escapeHtml(video.title)}" title="Apagar aula">${icon('delete')}</button></div>
    </article>`;
  };
  list.innerHTML = orderedCourseIds.map(courseId => {
    const course = getCourseById(courseId);
    const courseVideos = visibleByCourse.get(courseId).sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
    const moduleMap = new Map();
    courseVideos.forEach(video => {
      const key = moduleKey(video);
      if (!moduleMap.has(key)) moduleMap.set(key, { key, label: String(video.module || '').trim() || 'Sem módulo', videos: [] });
      moduleMap.get(key).videos.push(video);
    });
    let modules = [...moduleMap.values()];
    if (course) {
      const moduleOrder = new Map(moduleGroups(courseId).map((item, index) => [item.key, index]));
      modules.sort((a, b) => (moduleOrder.get(a.key) ?? 0) - (moduleOrder.get(b.key) ?? 0));
    }
    const moduleMarkup = modules.map(module => {
      const fullModules = course ? moduleGroups(courseId) : [];
      const moduleIndex = fullModules.findIndex(item => item.key === module.key);
      const moves = course && fullModules.length > 1 ? `<div class="module-moves"><button class="module-move" type="button" data-action="move-module-up" data-course-id="${escapeHtml(courseId)}" data-module="${escapeHtml(module.key)}" aria-label="Mover módulo ${escapeHtml(module.label)} para cima" title="Mover módulo para cima" ${moduleIndex <= 0 ? 'disabled' : ''}>↑</button><button class="module-move" type="button" data-action="move-module-down" data-course-id="${escapeHtml(courseId)}" data-module="${escapeHtml(module.key)}" aria-label="Mover módulo ${escapeHtml(module.label)} para baixo" title="Mover módulo para baixo" ${moduleIndex >= fullModules.length - 1 ? 'disabled' : ''}>↓</button></div>` : '';
      return `<section class="module-group"><div class="module-heading"><span>${escapeHtml(module.label)}</span>${moves}</div>${module.videos.map(cardMarkup).join('')}</section>`;
    }).join('');
    const label = course?.name || 'Sem curso';
    const rename = course ? `<button class="course-rename" type="button" data-action="rename-course" data-course-id="${escapeHtml(course.id)}">Renomear</button>` : '';
    const allCourseVideos = course ? videos.filter(video => video.courseId === course.id) : courseVideos;
    const completed = allCourseVideos.filter(video => video.watched).length;
    const percent = allCourseVideos.length ? Math.round((completed / allCourseVideos.length) * 100) : 0;
    const progressMarkup = course ? `<span class="course-progress" aria-label="${percent}% concluído, ${completed} de ${allCourseVideos.length} aulas"><strong>${percent}%</strong><span class="course-progress-track" role="progressbar" aria-label="Progresso de ${escapeHtml(label)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}"><span class="course-progress-fill" style="display:block;width:${percent}%"></span></span></span>` : '';
    return `<section class="course-group"><header class="course-group-heading"><h3>${escapeHtml(label)}</h3><div class="course-group-meta">${progressMarkup}<span>${allCourseVideos.length} ${allCourseVideos.length === 1 ? 'aula' : 'aulas'}</span>${rename}</div></header>${moduleMarkup}</section>`;
  }).join('');
}
function resetForm(courseId = '') {
  form.reset();
  editingId = null;
  updateCourseFormOptions(courseId);
  document.getElementById('form-heading').textContent = 'Adicionar uma aula';
  document.getElementById('submit-label').textContent = 'Adicionar à lista';
}
function validFormUrl(value) {
  if (!value.trim()) return '';
  const link = safeLink(value.trim());
  if (!link) throw new Error('Use um link http, https ou Telegram válido.');
  return link;
}

function bindUiEvents() {
  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form);
    let url;
    try { url = validFormUrl(String(data.get('url') || '')); }
    catch (error) { showToast(error.message); return; }
    const title = String(data.get('title') || '').trim();
    if (!title) return;
    const course = getCourseById(String(data.get('courseId') || ''));
    if (!course) { showToast('Selecione ou crie um curso.'); return; }
    const current = editingId ? videos.find(video => video.id === editingId) : null;
    const entry = {
      id: current?.id || (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`),
      courseId: course.id,
      course: course.name,
      title,
      module: String(data.get('module') || '').trim(),
      url,
      notes: String(data.get('notes') || '').trim(),
      watched: current?.watched || false,
      createdAt: current?.createdAt || Date.now(),
      order: current?.order ?? nextCourseOrder(course.id)
    };
    if (editingId) videos = videos.map(video => video.id === editingId ? entry : video);
    else videos.unshift(entry);
    save();
    saveCourses();
    resetForm(course.id);
    courseFilter.value = 'all';
    filter.value = 'all';
    search.value = '';
    render();
    showToast(current ? 'Aula atualizada.' : 'Aula adicionada à lista.');
  });
  document.getElementById('new-course-button').addEventListener('click', () => {
    const input = prompt('Nome do novo curso:');
    if (input === null) return;
    const name = input.trim().slice(0, 100);
    if (!name) { showToast('Digite um nome para o curso.'); return; }
    const wasExisting = Boolean(getCourseByName(name));
    const course = findOrCreateCourse(name);
    saveCourses();
    updateCourseFormOptions(course.id);
    document.getElementById('course').value = course.id;
    showToast(wasExisting ? 'Curso selecionado.' : 'Curso criado.');
  });
  
  list.addEventListener('change', event => {
    const checkbox = event.target.closest('[data-action="toggle"]');
    if (!checkbox) return;
    const card = checkbox.closest('[data-id]');
    videos = videos.map(video => video.id === card.dataset.id ? { ...video, watched: checkbox.checked } : video);
    save();
    render();
  });
  list.addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (!button || button.dataset.action === 'toggle') return;
    if (button.dataset.action === 'rename-course') { renameCourse(button.dataset.courseId); return; }
    if (button.dataset.action === 'move-module-up' || button.dataset.action === 'move-module-down') {
      moveModule(button.dataset.courseId, button.dataset.module, button.dataset.action.endsWith('up') ? -1 : 1); return;
    }
    const card = button.closest('[data-id]');
    if (!card) return;
    if (button.dataset.action === 'move-lesson-up' || button.dataset.action === 'move-lesson-down') {
      moveLesson(card.dataset.id, button.dataset.action.endsWith('up') ? -1 : 1); return;
    }
    const video = videos.find(item => item.id === card.dataset.id);
    if (!video) return;
    if (button.dataset.action === 'delete') {
      if (!confirm(`Apagar “${video.title}” da lista?`)) return;
      videos = videos.filter(item => item.id !== video.id);
      if (editingId === video.id) resetForm();
      save(); render(); showToast('Aula apagada.');
    } else if (button.dataset.action === 'edit') {
      editingId = video.id;
      updateCourseFormOptions(video.courseId);
      document.getElementById('course').value = video.courseId || '';
      document.getElementById('title').value = video.title;
      document.getElementById('module').value = video.module || '';
      document.getElementById('url').value = video.url || '';
      document.getElementById('notes').value = video.notes || '';
      document.getElementById('form-heading').textContent = 'Editar aula';
      document.getElementById('submit-label').textContent = 'Salvar alterações';
      document.getElementById('title').focus({ preventScroll: true });
    }
  });
  search.addEventListener('input', render);
  filter.addEventListener('change', render);
  courseFilter.addEventListener('change', render);
  timerCourse.addEventListener('change', () => {
    if (pomodoro.mode === 'focus' && pomodoro.hasStarted) return;
    pomodoro.selectedCourse = timerCourse.value;
    savePomodoro();
    renderPomodoro();
  });
  document.getElementById('timer-start').addEventListener('click', () => {
    if (pomodoro.running) pausePomodoro();
    else if (pomodoro.awaitingAdvance) {
      advancePomodoroStage();
      savePomodoro();
      renderPomodoro();
      showToast(pomodoro.mode === 'focus' ? 'Pronto para um novo foco.' : `Pronto para a ${pomodoro.mode === 'long' ? 'pausa longa' : 'pausa curta'}.`);
    }
    else startPomodoro();
  });
  document.getElementById('timer-reset').addEventListener('click', resetPomodoro);
  document.getElementById('share-course-button').addEventListener('click', openShareCard);
  document.getElementById('share-format').addEventListener('change', renderShareImage);
  document.getElementById('share-dialog-x').addEventListener('click', () => shareDialog.close());
  document.getElementById('share-dialog-close').addEventListener('click', () => shareDialog.close());
  shareDialog.addEventListener('click', event => {
    if (event.target === shareDialog) shareDialog.close();
  });
  shareDialog.addEventListener('close', () => {
    if (shareImageUrl) URL.revokeObjectURL(shareImageUrl);
    shareImageUrl = '';
    sharePreview.removeAttribute('src');
    shareBlob = null;
  });
  document.getElementById('share-download').addEventListener('click', () => {
    if (!shareBlob) return;
    const url = URL.createObjectURL(shareBlob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = shareFileName;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  document.getElementById('share-native').addEventListener('click', async () => {
    if (!shareBlob) return;
    const file = new File([shareBlob], shareFileName, { type: 'image/png' });
    if (!navigator.canShare?.({ files: [file] })) { showToast('Este navegador não permite compartilhar o arquivo. Baixe o PNG para enviar.'); return; }
    try {
      await navigator.share({ files: [file], title: `Meu progresso em ${shareCourseName}`, text: `${shareCourseName} · imagem do meu progresso de estudos` });
    } catch (error) {
      if (error.name !== 'AbortError') showToast('Não foi possível compartilhar. Você ainda pode baixar o PNG.');
    }
  });
  settingsToggle.addEventListener('click', () => {
    const opening = settingsForm.hidden;
    if (opening) syncSettingsInputs();
    settingsForm.hidden = !opening;
    settingsToggle.setAttribute('aria-expanded', String(opening));
  });
  document.getElementById('settings-cancel').addEventListener('click', closeSettings);
  settingsForm.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(settingsForm);
    settings = normalizeSettings({ ...Object.fromEntries(data.entries()), autoAdvance: settingsForm.elements.namedItem('autoAdvance').checked });
    pomodoro.cycle = Math.min(pomodoro.cycle, settings.cyclesBeforeLong - 1);
    if (!pomodoro.running && !pomodoro.hasStarted && !pomodoro.awaitingAdvance) {
      pomodoro.intervalDurationSeconds = durationSeconds(pomodoro.mode);
      pomodoro.remainingSeconds = pomodoro.intervalDurationSeconds;
    }
    saveSettings();
    savePomodoro();
    closeSettings();
    renderPomodoro();
    showToast('Tempos do Pomodoro atualizados.');
  });
  
}
