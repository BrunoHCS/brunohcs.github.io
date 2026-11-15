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
function drawProgressRing(context, x, y, radius, percent, story = false) {
  context.beginPath(); context.arc(x, y, radius, 0, Math.PI * 2);
  context.strokeStyle = '#263749'; context.lineWidth = story ? 22 : 18; context.stroke();
  context.beginPath(); context.arc(x, y, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * percent / 100);
  context.strokeStyle = '#63c2ff'; context.lineWidth = story ? 22 : 18; context.lineCap = 'round'; context.stroke();
  context.lineCap = 'butt';
  context.textAlign = 'center'; context.fillStyle = '#ffffff';
  context.font = `700 ${story ? 82 : 69}px Sora, Segoe UI, sans-serif`;
  context.fillText(`${percent}%`, x, y + (story ? 15 : 10));
  context.fillStyle = '#93a4ba'; context.font = `700 ${story ? 19 : 17}px Manrope, Segoe UI, sans-serif`;
  context.fillText('CONCLUÍDO', x, y + (story ? 57 : 48));
  context.textAlign = 'left';
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
  context.fillStyle = '#93a4ba'; context.font = '700 18px Manrope, Segoe UI, sans-serif';
  context.fillText('MEU PROGRESSO', left, story ? 330 : 205);

  const maxTitleWidth = story ? 900 : 1000;
  let titleFont = story ? 58 : 54;
  let titleLineHeight = story ? 72 : 64;
  context.fillStyle = '#FFFFFF'; context.font = `700 ${titleFont}px Sora, Segoe UI, sans-serif`;
  let courseLines = wrapCanvasText(context, course, maxTitleWidth);
  if (!story && courseLines.length > 2) {
    titleFont = 46; titleLineHeight = 56;
    context.font = `700 ${titleFont}px Sora, Segoe UI, sans-serif`;
    courseLines = wrapCanvasText(context, course, maxTitleWidth);
  }
  const shownLines = courseLines.slice(0, 3);
  if (courseLines.length > 3) {
    let shortened = shownLines[2];
    while (shortened && context.measureText(`${shortened}…`).width > maxTitleWidth) shortened = shortened.slice(0, -1);
    shownLines[2] = `${shortened}…`;
  }
  const titleTop = story ? 410 : 282;
  shownLines.forEach((line, index) => context.fillText(line, left, titleTop + index * titleLineHeight, maxTitleWidth));
  const lastTitleBaseline = titleTop + (shownLines.length - 1) * titleLineHeight;
  const dividerY = lastTitleBaseline + (story ? 72 : 48);
  context.strokeStyle = '#ffffff2b'; context.lineWidth = 2;
  context.beginPath(); context.moveTo(left, dividerY); context.lineTo(width - left, dividerY); context.stroke();

  if (story) {
    const cardX = 90; const cardWidth = 900;
    const progressY = Math.max(560, dividerY + 48);
    const progressHeight = 660;
    roundedRect(context, cardX, progressY, cardWidth, progressHeight, 30);
    context.fillStyle = '#ffffff0b'; context.fill(); context.strokeStyle = '#ffffff20'; context.lineWidth = 1.5; context.stroke();
    context.fillStyle = '#93a4ba'; context.font = '700 20px Manrope, Segoe UI, sans-serif';
    context.fillText('SUA JORNADA', cardX + 46, progressY + 56);
    drawProgressRing(context, width / 2, progressY + 252, 138, percent, true);

    context.textAlign = 'center'; context.fillStyle = '#93a4ba'; context.font = '700 20px Manrope, Segoe UI, sans-serif';
    context.fillText('AULAS CONCLUÍDAS', width / 2, progressY + 440);
    const completedText = String(completed);
    const lessonCount = `/ ${total} ${total === 1 ? 'aula' : 'aulas'}`;
    context.font = '700 64px Sora, Segoe UI, sans-serif';
    const completedWidth = context.measureText(completedText).width;
    context.font = '500 32px Sora, Segoe UI, sans-serif';
    const lessonCountWidth = context.measureText(lessonCount).width;
    const countStart = (width - completedWidth - 16 - lessonCountWidth) / 2;
    context.textAlign = 'left'; context.fillStyle = '#63c2ff'; context.font = '700 64px Sora, Segoe UI, sans-serif';
    context.fillText(completedText, countStart, progressY + 516);
    context.fillStyle = '#e8eef6'; context.font = '500 32px Sora, Segoe UI, sans-serif';
    context.fillText(lessonCount, countStart + completedWidth + 16, progressY + 516);
    roundedRect(context, cardX + 54, progressY + 554, cardWidth - 108, 12, 6);
    context.fillStyle = '#263749'; context.fill();
    roundedRect(context, cardX + 54, progressY + 554, (cardWidth - 108) * percent / 100, 12, 6);
    context.fillStyle = '#63c2ff'; context.fill();
    const progressCaption = 'Mais um passo na sua jornada.';
    context.textAlign = 'left'; context.font = '500 19px Manrope, Segoe UI, sans-serif';
    const captionX = (width - context.measureText(progressCaption).width - 22) / 2;
    context.beginPath(); context.arc(captionX + 5, progressY + 609, 6, 0, Math.PI * 2);
    context.fillStyle = '#3ddc97'; context.fill();
    context.fillStyle = '#93a4ba';
    context.fillText(progressCaption, captionX + 22, progressY + 615);
    context.textAlign = 'left';

    const focusY = progressY + progressHeight + 28;
    roundedRect(context, cardX, focusY, cardWidth, 180, 24);
    context.fillStyle = '#3ddc970d'; context.fill(); context.strokeStyle = '#3ddc9730'; context.lineWidth = 1.5; context.stroke();
    const clockX = cardX + 80; const clockY = focusY + 90;
    context.beginPath(); context.arc(clockX, clockY, 32, 0, Math.PI * 2);
    context.fillStyle = '#3ddc9724'; context.fill(); context.strokeStyle = '#3ddc9770'; context.lineWidth = 3; context.stroke();
    context.beginPath(); context.moveTo(clockX, clockY - 17); context.lineTo(clockX, clockY); context.lineTo(clockX + 15, clockY + 9);
    context.strokeStyle = '#3ddc97'; context.lineWidth = 4; context.lineCap = 'round'; context.lineJoin = 'round'; context.stroke();
    context.lineCap = 'butt'; context.lineJoin = 'miter';
    context.fillStyle = '#93a4ba'; context.font = '700 19px Manrope, Segoe UI, sans-serif';
    context.fillText('TEMPO DE FOCO', cardX + 145, focusY + 68);
    context.fillStyle = '#3ddc97'; context.font = '700 48px Sora, Segoe UI, sans-serif';
    context.fillText(formatFocusTime(focusedSeconds), cardX + 145, focusY + 132, 430);
    context.fillStyle = '#e8eef6'; context.font = '500 20px Manrope, Segoe UI, sans-serif';
    context.textAlign = 'right'; context.fillText('de dedicação a este curso', cardX + cardWidth - 40, focusY + 132, 280); context.textAlign = 'left';
  } else {
    const panelY = Math.max(430, dividerY + 40);
    const panelHeight = 432;
    roundedRect(context, 92, panelY, 1016, panelHeight, 30);
    context.fillStyle = '#ffffff0b'; context.fill(); context.strokeStyle = '#ffffff20'; context.lineWidth = 1.5; context.stroke();
    context.fillStyle = '#93a4ba'; context.font = '700 17px Manrope, Segoe UI, sans-serif';
    context.fillText('SUA JORNADA', 142, panelY + 62);
    drawProgressRing(context, 350, panelY + 220, 118, percent);

    context.strokeStyle = '#ffffff1f'; context.lineWidth = 2;
    context.beginPath(); context.moveTo(565, panelY + 105); context.lineTo(565, panelY + 370); context.stroke();
    context.fillStyle = '#93a4ba'; context.font = '700 17px Manrope, Segoe UI, sans-serif';
    context.fillText('AULAS CONCLUÍDAS', 620, panelY + 145);
    context.fillStyle = '#63c2ff'; context.font = '700 66px Sora, Segoe UI, sans-serif';
    const completedText = String(completed);
    context.fillText(completedText, 620, panelY + 225, 170);
    const completedWidth = Math.min(context.measureText(completedText).width, 170);
    context.fillStyle = '#93a4ba'; context.font = '500 34px Sora, Segoe UI, sans-serif';
    context.fillText(`/ ${total}`, 620 + completedWidth + 12, panelY + 225, 220);
    roundedRect(context, 620, panelY + 253, 420, 12, 6); context.fillStyle = '#263749'; context.fill();
    roundedRect(context, 620, panelY + 253, 420 * percent / 100, 12, 6); context.fillStyle = '#63c2ff'; context.fill();
    context.beginPath(); context.arc(626, panelY + 326, 6, 0, Math.PI * 2); context.fillStyle = '#3ddc97'; context.fill();
    context.fillStyle = '#e8eef6'; context.font = '500 18px Manrope, Segoe UI, sans-serif';
    context.fillText('Mais um passo na sua jornada.', 644, panelY + 333, 390);

    const focusY = panelY + panelHeight + 30;
    roundedRect(context, 92, focusY, 1016, 112, 22);
    context.fillStyle = '#3ddc970d'; context.fill(); context.strokeStyle = '#3ddc9730'; context.lineWidth = 1.5; context.stroke();
    context.beginPath(); context.arc(151, focusY + 56, 25, 0, Math.PI * 2); context.fillStyle = '#3ddc9724'; context.fill();
    context.beginPath(); context.moveTo(151, focusY + 41); context.lineTo(151, focusY + 56); context.lineTo(163, focusY + 63);
    context.strokeStyle = '#3ddc97'; context.lineWidth = 3; context.lineCap = 'round'; context.lineJoin = 'round'; context.stroke(); context.lineCap = 'butt'; context.lineJoin = 'miter';
    context.fillStyle = '#93a4ba'; context.font = '700 15px Manrope, Segoe UI, sans-serif';
    context.fillText('TEMPO DE FOCO', 202, focusY + 45);
    context.fillStyle = '#3ddc97'; context.font = '700 29px Sora, Segoe UI, sans-serif';
    context.fillText(formatFocusTime(focusedSeconds), 202, focusY + 83, 400);
    context.fillStyle = '#e8eef6'; context.font = '500 17px Manrope, Segoe UI, sans-serif';
    context.textAlign = 'right'; context.fillText('de dedicação a este curso', 1060, focusY + 65, 330); context.textAlign = 'left';
  }
  context.fillStyle = '#93a4ba'; context.font = '500 23px Manrope, Segoe UI, sans-serif';
  context.fillText('Um passo de cada vez.', left, story ? 1780 : 1084);
  context.fillStyle = '#63c2ff'; context.font = '600 20px Manrope, Segoe UI, sans-serif';
  context.textAlign = 'right'; context.fillText('brunohcs.github.io/estudos', width - left, story ? 1780 : 1084); context.textAlign = 'left';
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
