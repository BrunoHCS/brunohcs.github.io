function loadVideos() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter(isVideo).map((video, index) => ({
      ...video,
      course: String(video.course || ''),
      courseId: String(video.courseId || ''),
      order: Number.isFinite(Number(video.order)) ? Number(video.order) : index * 100
    })).map(({ duration, ...video }) => video) : [];
  } catch { return []; }
}
function makeId() { return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`; }
function courseKey(name) { return String(name || '').trim().toLocaleLowerCase('pt-BR'); }
function getCourseById(id) { return courses.find(course => course.id === id); }
function getCourseByName(name) { return courses.find(course => courseKey(course.name) === courseKey(name)); }
function resolveCourseId(reference) { return getCourseById(String(reference || ''))?.id || getCourseByName(reference)?.id || ''; }
function activeCourses() {
  const activeIds = new Set(videos.map(video => video.courseId).filter(Boolean));
  return courses.filter(course => activeIds.has(course.id)).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }));
}
function updateCourseFormOptions(selected = document.getElementById('course').value) {
  const select = document.getElementById('course');
  const sorted = [...courses].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }));
  select.innerHTML = '<option value="">Selecione ou crie um curso</option>' + sorted.map(course => {
    const archived = !videos.some(video => video.courseId === course.id);
    return `<option value="${escapeHtml(course.id)}">${escapeHtml(course.name)}${archived ? ' · sem aulas' : ''}</option>`;
  }).join('');
  if (sorted.some(course => course.id === selected)) select.value = selected;
}
function renameCourse(courseId) {
  const course = getCourseById(courseId);
  if (!course) return;
  const input = prompt('Novo nome para este curso:', course.name);
  if (input === null) return;
  const name = input.trim().slice(0, 100);
  if (!name) { showToast('O nome do curso não pode ficar vazio.'); return; }
  const duplicate = courses.find(item => item.id !== courseId && courseKey(item.name) === courseKey(name));
  if (duplicate) { showToast('Já existe um curso com esse nome.'); return; }
  course.name = name;
  videos.forEach(video => { if (video.courseId === courseId) video.course = name; });
  if (focusTotals[courseId]) focusTotals[courseId].name = name;
  saveCourses(); save(); saveFocusTotals(); updateCourseFormOptions(courseId); render();
  showToast('Curso renomeado.');
}
function nextCourseOrder(courseId) {
  const maxOrder = videos.filter(video => video.courseId === courseId).reduce((max, video) => Math.max(max, Number(video.order) || 0), 0);
  return maxOrder + 100;
}
function moduleKey(video) { return String(video.module || '').trim().toLocaleLowerCase('pt-BR') || '__sem_modulo__'; }
function orderedCourseVideos(courseId) {
  return videos.filter(video => video.courseId === courseId).sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0) || (Number(a.createdAt) || 0) - (Number(b.createdAt) || 0));
}
function moduleGroups(courseId) {
  const groups = new Map();
  orderedCourseVideos(courseId).forEach(video => {
    const key = moduleKey(video);
    if (!groups.has(key)) groups.set(key, { key, label: String(video.module || '').trim() || 'Sem módulo', videos: [] });
    groups.get(key).videos.push(video);
  });
  return [...groups.values()];
}
function reindexCourse(courseId, orderedVideos) {
  orderedVideos.forEach((video, index) => { video.order = (index + 1) * 100; });
  save(); render();
}
function moveLesson(videoId, direction) {
  const video = videos.find(item => item.id === videoId);
  if (!video) return;
  const groups = moduleGroups(video.courseId);
  const group = groups.find(item => item.key === moduleKey(video));
  if (!group) return;
  const index = group.videos.findIndex(item => item.id === videoId);
  const target = index + direction;
  if (target < 0 || target >= group.videos.length) return;
  [group.videos[index], group.videos[target]] = [group.videos[target], group.videos[index]];
  reindexCourse(video.courseId, groups.flatMap(item => item.videos));
}
function moveModule(courseId, module, direction) {
  const groups = moduleGroups(courseId);
  const index = groups.findIndex(item => item.key === module);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= groups.length) return;
  [groups[index], groups[target]] = [groups[target], groups[index]];
  reindexCourse(courseId, groups.flatMap(item => item.videos));
}
function findOrCreateCourse(name) {
  const cleanName = String(name || '').trim();
  if (!cleanName) return null;
  let course = getCourseByName(cleanName);
  if (!course) {
    course = { id: makeId(), name: cleanName, createdAt: Date.now() };
    courses.push(course);
    saveCourses();
  }
  return course;
}
function loadCourses() {
  let stored = [];
  try {
    const parsed = JSON.parse(localStorage.getItem(COURSES_KEY) || '[]');
    if (Array.isArray(parsed)) stored = parsed;
  } catch {}
  const result = [];
  const ids = new Set();
  const names = new Set();
  stored.forEach(item => {
    const name = String(item?.name || '').trim();
    if (!name) return;
    const nameKey = courseKey(name);
    if (names.has(nameKey)) return;
    let id = typeof item.id === 'string' && item.id ? item.id : makeId();
    if (ids.has(id)) id = makeId();
    ids.add(id);
    names.add(nameKey);
    result.push({ id, name, createdAt: Number(item.createdAt) || Date.now() });
  });
  videos.forEach(video => {
    let course = result.find(item => item.id === video.courseId);
    if (!course && video.course) course = result.find(item => courseKey(item.name) === courseKey(video.course));
    if (!course && video.course) {
      course = { id: makeId(), name: String(video.course).trim(), createdAt: Number(video.createdAt) || Date.now() };
      result.push(course);
    }
    if (course) {
      video.courseId = course.id;
      video.course = course.name;
    }
  });
  try {
    localStorage.setItem(COURSES_KEY, JSON.stringify(result));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(videos));
  } catch {}
  return result;
}
function saveCourses() {
  try { localStorage.setItem(COURSES_KEY, JSON.stringify(courses)); }
  catch { showToast('Não foi possível salvar os cursos neste navegador.'); }
}
