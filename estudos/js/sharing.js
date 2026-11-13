function wrapCanvasText(context, text, maxWidth) {
  const words = String(text).trim().split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (line && context.measureText(next).width > maxWidth) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines.length ? lines : ['Curso'];
}
function roundedRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
}
function drawShareCard(course, completed, total, focusedSeconds, format = 'square') {
  const story = format === 'story';
  const percent = total ? Math.round((completed / total) * 100) : 0;
  const canvas = document.createElement('canvas');
  canvas.width = story ? 1080 : 1200;
  canvas.height = story ? 1920 : 1200;
  const context = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const background = context.createLinearGradient(0, 0, width, height);
  background.addColorStop(0, '#0b1119');
  background.addColorStop(.55, '#101925');
  background.addColorStop(1, '#142030');
  context.fillStyle = background;
  context.fillRect(0, 0, width, height);
  context.fillStyle = '#1ea7ff1f';
  context.beginPath(); context.arc(width - 100, story ? 140 : 100, story ? 310 : 270, 0, Math.PI * 2); context.fill();
  context.fillStyle = '#3ddc971a';
  context.beginPath(); context.arc(110, height - 110, story ? 330 : 250, 0, Math.PI * 2); context.fill();
  roundedRect(context, story ? 36 : 44, story ? 38 : 44, story ? 1008 : 1112, story ? 1844 : 1112, 34);
  context.strokeStyle = '#ffffff24'; context.lineWidth = 2; context.stroke();

  context.fillStyle = '#1ea7ff';
  const left = story ? 90 : 92;
  roundedRect(context, left, story ? 130 : 96, 12, 38, 6); context.fill();
  context.fillStyle = '#e8eef6'; context.font = '700 22px Sora, Segoe UI, sans-serif';
  context.fillText('ESTUDOS EM FOCO', left + 33, story ? 158 : 124);
  context.fillStyle = '#93a4ba'; context.font = '600 18px Manrope, Segoe UI, sans-serif';
  context.fillText('MEU PROGRESSO', left, story ? 430 : 250);

  context.fillStyle = '#FFFFFF';
  context.font = `700 ${story ? 58 : 62}px Sora, Segoe UI, sans-serif`;
  const courseLines = wrapCanvasText(context, course, story ? 900 : 1000);
  const shownLines = courseLines.slice(0, 3);
  if (courseLines.length > 3) {
    const last = shownLines[2];
    let shortened = last;
    while (shortened && context.measureText(`${shortened}…`).width > (story ? 870 : 960)) shortened = shortened.slice(0, -1);
    shownLines[2] = `${shortened}…`;
  }
  shownLines.forEach((line, index) => context.fillText(line, left, (story ? 525 : 340) + index * (story ? 74 : 76), story ? 900 : 1000));
  const dividerY = story ? 820 : 560;
  context.strokeStyle = '#ffffff2b'; context.lineWidth = 2;
  context.beginPath(); context.moveTo(left, dividerY); context.lineTo(width - left, dividerY); context.stroke();

  if (story) {
    const cardX = 90;
    const cardWidth = 900;
    const cardHeight = 285;
    const cardY = [930, 1260];
    cardY.forEach(y => {
      roundedRect(context, cardX, y, cardWidth, cardHeight, 26);
      context.fillStyle = '#ffffff12'; context.fill();
      context.strokeStyle = '#ffffff20'; context.lineWidth = 1.5; context.stroke();
    });
    context.fillStyle = '#93a4ba'; context.font = '700 20px Manrope, Segoe UI, sans-serif';
    context.fillText('AULAS CONCLUÍDAS', cardX + 42, cardY[0] + 62);
    context.fillStyle = '#63c2ff'; context.font = '750 104px Sora, Segoe UI, sans-serif';
    context.fillText(String(completed), cardX + 42, cardY[0] + 183, cardWidth - 84);
    context.textAlign = 'right'; context.fillStyle = '#63c2ff'; context.font = '750 58px Sora, Segoe UI, sans-serif';
    context.fillText(`${percent}%`, cardX + cardWidth - 42, cardY[0] + 158, 250); context.textAlign = 'left';
    context.fillStyle = '#e8eef6'; context.font = '500 22px Manrope, Segoe UI, sans-serif';
    context.fillText(`de ${total} ${total === 1 ? 'aula cadastrada' : 'aulas cadastradas'}`, cardX + 46, cardY[0] + 235, cardWidth - 92);
    context.fillStyle = '#93a4ba'; context.font = '700 20px Manrope, Segoe UI, sans-serif';
    context.fillText('TEMPO FOCADO', cardX + 42, cardY[1] + 62);
    context.fillStyle = '#3ddc97'; context.font = '700 72px Sora, Segoe UI, sans-serif';
    context.fillText(formatFocusTime(focusedSeconds), cardX + 42, cardY[1] + 166, cardWidth - 84);
    context.fillStyle = '#e8eef6'; context.font = '500 22px Manrope, Segoe UI, sans-serif';
    context.fillText('dedicados a este curso', cardX + 46, cardY[1] + 226, cardWidth - 92);
  } else {
    const cardY = dividerY + 48;
    const cardHeight = 300;
    const cardWidth = 484;
    const cardGap = 48;
    const leftX = 92;
    const rightX = leftX + cardWidth + cardGap;
    [leftX, rightX].forEach(x => {
      roundedRect(context, x, cardY, cardWidth, cardHeight, 24);
      context.fillStyle = '#ffffff12'; context.fill();
      context.strokeStyle = '#ffffff20'; context.lineWidth = 1.5; context.stroke();
    });
    context.fillStyle = '#93a4ba'; context.font = '700 17px Manrope, Segoe UI, sans-serif';
    context.fillText('AULAS CONCLUÍDAS', leftX + 34, cardY + 54);
    context.fillStyle = '#63c2ff'; context.font = '750 92px Sora, Segoe UI, sans-serif';
    context.fillText(String(completed), leftX + 34, cardY + 170);
    context.textAlign = 'right'; context.fillStyle = '#63c2ff'; context.font = '750 48px Sora, Segoe UI, sans-serif';
    context.fillText(`${percent}%`, leftX + cardWidth - 34, cardY + 132, 190); context.textAlign = 'left';
    context.fillStyle = '#e8eef6'; context.font = '500 20px Manrope, Segoe UI, sans-serif';
    context.fillText(`de ${total} ${total === 1 ? 'aula cadastrada' : 'aulas cadastradas'}`, leftX + 38, cardY + 218, cardWidth - 70);
    context.fillStyle = '#93a4ba'; context.font = '700 17px Manrope, Segoe UI, sans-serif';
    context.fillText('TEMPO FOCADO', rightX + 34, cardY + 54);
    context.fillStyle = '#3ddc97'; context.font = '700 54px Sora, Segoe UI, sans-serif';
    context.fillText(formatFocusTime(focusedSeconds), rightX + 34, cardY + 151, cardWidth - 64);
    context.fillStyle = '#e8eef6'; context.font = '500 20px Manrope, Segoe UI, sans-serif';
    context.fillText('dedicados a este curso', rightX + 38, cardY + 218, cardWidth - 70);
  }
  context.fillStyle = '#93a4ba'; context.font = '500 19px Manrope, Segoe UI, sans-serif';
  context.fillText('Um passo de cada vez.', left, story ? 1780 : 1082);
  context.fillStyle = '#63c2ff'; context.font = '600 15px Manrope, Segoe UI, sans-serif';
  context.textAlign = 'right'; context.fillText('brunohcs.github.io/estudos', width - left, story ? 1780 : 1082); context.textAlign = 'left';
  return canvas;
}
function courseSlug(value) {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'curso';
}
async function openShareCard() {
  const courseId = pomodoro.sessionCourse || timerCourse.value;
  const course = getCourseById(courseId);
  if (!course || !activeCourses().some(item => item.id === course.id)) {
    showToast('Selecione um curso que ainda tenha aulas cadastradas.');
    return;
  }
  shareCourseId = course.id;
  shareCourseName = course.name;
  shareBlob = null;
  document.getElementById('share-format').value = 'square';
  await renderShareImage();
  if (shareBlob) shareDialog.showModal();
}
async function renderShareImage() {
  const course = getCourseById(shareCourseId);
  if (!course) return;
  const renderToken = ++shareRenderToken;
  if (pomodoro.running && pomodoro.mode === 'focus' && pomodoro.sessionCourse === course.id) {
    accountFocusUntil(Date.now());
    renderPomodoro();
  }
  const courseVideos = videos.filter(video => video.courseId === course.id);
  const completed = courseVideos.filter(video => video.watched).length;
  const focusedSeconds = focusTotals[course.id]?.seconds || 0;
  const format = document.getElementById('share-format').value;
  const canvas = drawShareCard(course.name, completed, courseVideos.length, focusedSeconds, format);
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
  if (renderToken !== shareRenderToken) return;
  if (!blob) { showToast('Não foi possível gerar a imagem.'); return; }
  shareBlob = blob;
  if (shareImageUrl) URL.revokeObjectURL(shareImageUrl);
  shareImageUrl = URL.createObjectURL(shareBlob);
  shareFileName = `progresso-${courseSlug(course.name)}-${format}.png`;
  shareCourseName = course.name;
  sharePreview.src = shareImageUrl;
  const percent = courseVideos.length ? Math.round((completed / courseVideos.length) * 100) : 0;
  sharePreview.alt = `Progresso em ${course.name}: ${percent}%, ${completed} de ${courseVideos.length} aulas concluídas e ${formatFocusTime(focusedSeconds)} de foco.`;
  document.getElementById('share-dialog-caption').textContent = 'Compartilhe seu progresso nas redes e inspire alguém a começar também.';
  document.getElementById('share-native').hidden = !(navigator.share && navigator.canShare);
}
