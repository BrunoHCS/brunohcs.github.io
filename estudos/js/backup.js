function buildSimpleBackup() {
  const exportedCourses = courses.map(course => ({
    nome: course.name,
    aulas: videos.filter(video => video.courseId === course.id).sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0)).map(video => ({
      titulo: video.title,
      modulo: video.module || '',
      link: video.url || '',
      anotacoes: video.notes || ''
    }))
  }));
  const uncategorized = videos.filter(video => !video.courseId);
  if (uncategorized.length) exportedCourses.push({
    nome: 'Sem curso',
    aulas: uncategorized.map(video => ({ titulo: video.title, modulo: video.module || '', link: video.url || '', anotacoes: video.notes || '' }))
  });
  return { cursos: exportedCourses };
}
function downloadJson(filename, content) {
  const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function normalizeSimpleImport(parsed) {
  if (!parsed || !Array.isArray(parsed.cursos)) return null;
  if (!parsed.cursos.every(course => course && typeof course.nome === 'string' && Array.isArray(course.aulas))) {
    throw new Error('Cada curso precisa ter “nome” e uma lista “aulas”.');
  }
  for (const course of parsed.cursos) {
    for (const lesson of course.aulas) {
      if (!lesson || typeof lesson.titulo !== 'string' || !lesson.titulo.trim()) throw new Error('Cada aula precisa ter um “titulo”.');
      const link = String(lesson.link || '').trim();
      if (link && !safeLink(link)) throw new Error(`O link da aula “${lesson.titulo}” não é válido.`);
    }
  }
  return parsed.cursos.map(course => ({
    name: String(course?.nome || '').trim().slice(0, 100),
    lessons: Array.isArray(course?.aulas) ? course.aulas : []
  }));
}

function bindBackupEvents() {
  document.getElementById('export-button').addEventListener('click', () => {
    downloadJson('meus-cursos.json', buildSimpleBackup());
    showToast('Cursos exportados em JSON.');
  });
  document.getElementById('import-button').addEventListener('click', () => importFile.click());
  document.getElementById('template-button').addEventListener('click', () => {
    downloadJson('modelo-de-importacao.json', { cursos: [{ nome: 'Nome do curso', aulas: [{ titulo: 'Título da aula', modulo: 'Nome do módulo', link: 'https://exemplo.com/aula', anotacoes: 'Suas anotações' }] }] });
    showToast('Modelo de importação baixado.');
  });
  importFile.addEventListener('change', async () => {
    const file = importFile.files?.[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      const simpleCourses = normalizeSimpleImport(parsed);
      const isLegacy = Array.isArray(parsed) || (parsed && Array.isArray(parsed.videos));
      if (!simpleCourses && !isLegacy) throw new Error('O arquivo precisa ter uma lista “cursos” com “nome” e “aulas”.');
      let incomingCourses = [];
      if (simpleCourses) {
        incomingCourses = simpleCourses.map(course => ({
          name: course.name,
          lessons: course.lessons.map(item => ({
            title: String(item.titulo).trim().slice(0, 180),
            module: String(item.modulo || '').trim().slice(0, 80),
            url: safeLink(String(item.link || '').trim()),
            notes: String(item.anotacoes || '').slice(0, 1000),
            watched: false
          }))
        }));
      } else {
        const legacyCourses = Array.isArray(parsed) ? [] : (Array.isArray(parsed.courses) ? parsed.courses : []);
        const legacyNameById = new Map(legacyCourses.map(course => [String(course?.id || ''), String(course?.name || '').trim().slice(0, 100)]));
        incomingCourses = legacyCourses.map(course => ({ name: String(course?.name || '').trim().slice(0, 100), lessons: [] }));
        const incoming = Array.isArray(parsed) ? parsed : parsed.videos;
        if (!Array.isArray(incoming) || !incoming.every(isVideo)) throw new Error('O arquivo não tem o formato esperado.');
        incoming.forEach(item => {
          const name = (legacyNameById.get(String(item.courseId || '')) || String(item.course || '')).trim().slice(0, 100);
          let group = incomingCourses.find(course => name && courseKey(course.name) === courseKey(name));
          if (!group) {
            group = { name, lessons: [] };
            incomingCourses.push(group);
          }
          const rawLink = String(item.url || '').trim();
          if (rawLink && !safeLink(rawLink)) throw new Error(`O link da aula “${item.title}” não é válido.`);
          group.lessons.push({
            title: item.title.trim().slice(0, 180), module: String(item.module || '').trim().slice(0, 80),
            url: safeLink(rawLink), notes: String(item.notes || '').slice(0, 1000), watched: Boolean(item.watched)
          });
        });
      }
      const incomingCount = incomingCourses.reduce((sum, course) => sum + course.lessons.length, 0);
      const courseCount = new Set(incomingCourses.map(course => courseKey(course.name)).filter(Boolean)).size;
      if (!confirm(`Adicionar ${incomingCount} ${incomingCount === 1 ? 'aula' : 'aulas'} de ${courseCount} ${courseCount === 1 ? 'curso' : 'cursos'}? Cursos com o mesmo nome serão agrupados e aulas já existentes serão ignoradas.`)) return;
      let addedCount = 0;
      let duplicateCount = 0;
      incomingCourses.forEach(courseData => {
        const name = String(courseData.name || '').trim().slice(0, 100);
        const course = name ? (getCourseByName(name) || { id: makeId(), name, createdAt: Date.now() }) : null;
        if (course && !getCourseById(course.id)) courses.push(course);
        courseData.lessons.forEach(item => {
          const courseId = course?.id || '';
          const identity = lesson => JSON.stringify([
            String(lesson.title || '').trim().toLocaleLowerCase('pt-BR'),
            String(lesson.module || '').trim().toLocaleLowerCase('pt-BR'),
            safeLink(String(lesson.url || ''))
          ]);
          const duplicate = videos.find(video => video.courseId === courseId && identity(video) === identity(item));
          if (duplicate) {
            duplicateCount++;
            if (!duplicate.notes && item.notes) duplicate.notes = item.notes;
            if (item.watched) duplicate.watched = true;
            return;
          }
          videos.push({
            id: makeId(), courseId, course: course?.name || '', title: item.title,
            module: item.module, url: item.url, notes: item.notes, watched: Boolean(item.watched),
            createdAt: Date.now(), order: course ? nextCourseOrder(course.id) : 0
          });
          addedCount++;
        });
      });
      search.value = '';
      filter.value = 'all';
      courseFilter.value = 'all';
      saveCourses(); save(); updateCourseFormOptions(); render();
      showToast(addedCount ? `${addedCount} ${addedCount === 1 ? 'aula importada' : 'aulas importadas'}${duplicateCount ? `; ${duplicateCount} repetidas ignoradas` : ''}.` : 'Nenhuma aula nova; os dados já estavam na lista.');
    } catch (error) { showToast(error.message || 'Não foi possível ler esse arquivo.'); }
    finally { importFile.value = ''; }
  });
  document.getElementById('clear-button').addEventListener('click', () => {
    if (!videos.length && !courses.length && !Object.keys(focusTotals).length) { showToast('A lista já está vazia.'); return; }
    if (!confirm('Apagar todos os cursos, aulas e tempos focados? Essa ação não pode ser desfeita.')) return;
    videos = [];
    courses = [];
    focusTotals = {};
    pomodoro = defaultPomodoro();
    try { localStorage.removeItem(TIMER_LEASE_KEY); } catch {}
    saveCourses(); save(); saveFocusTotals(); savePomodoro();
    search.value = '';
    filter.value = 'all';
    courseFilter.value = 'all';
    resetForm();
    render();
    showToast('Cursos, aulas e tempos focados apagados.');
  });
  
}
