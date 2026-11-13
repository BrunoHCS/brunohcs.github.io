function updateTimerCourseOptions() {
  const available = activeCourses();
  const hasCourse = id => available.some(course => course.id === id);
  if (pomodoro.sessionCourse && !hasCourse(pomodoro.sessionCourse) && (!pomodoro.running || ownsTimerLease())) {
    if (pomodoro.running) accountFocusUntil(Date.now());
    pomodoro.mode = 'focus';
    pomodoro.running = false;
    pomodoro.hasStarted = false;
    pomodoro.sessionCourse = '';
    pomodoro.selectedCourse = '';
    pomodoro.intervalDurationSeconds = durationSeconds('focus');
    pomodoro.remainingSeconds = pomodoro.intervalDurationSeconds;
    pomodoro.endAt = null;
    pomodoro.lastAccountedAt = null;
    pomodoro.heartbeatAt = null;
    savePomodoro();
    releaseTimerLease();
  }
  if (pomodoro.selectedCourse && !hasCourse(pomodoro.selectedCourse) && (!pomodoro.running || ownsTimerLease())) {
    pomodoro.selectedCourse = '';
    savePomodoro();
  }
  const selected = pomodoro.sessionCourse || pomodoro.selectedCourse || timerCourse.value || '';
  const signature = available.map(course => `${course.id}:${course.name}`).join('|');
  if (signature !== timerOptionSignature) {
    timerCourse.innerHTML = '<option value="">Selecione um curso</option>' + available.map(course => `<option value="${escapeHtml(course.id)}">${escapeHtml(course.name)}</option>`).join('');
    timerOptionSignature = signature;
  }
  if (hasCourse(selected)) timerCourse.value = selected;
  else if (available.length === 1 && !pomodoro.selectedCourse && !pomodoro.sessionCourse) {
    timerCourse.value = available[0].id;
    pomodoro.selectedCourse = available[0].id;
    savePomodoro();
  }
  timerCourse.disabled = (pomodoro.mode === 'focus' && Boolean(pomodoro.sessionCourse) && (pomodoro.running || pomodoro.hasStarted || pomodoro.awaitingAdvance)) || (pomodoro.running && !ownsTimerLease());
}
function renderFocusTotals() {
  const host = document.getElementById('focus-course-list');
  const totals = activeCourses().map(course => ({ courseId: course.id, name: course.name, seconds: focusTotals[course.id]?.seconds || 0 }))
    .sort((a, b) => b.seconds - a.seconds || a.name.localeCompare(b.name, 'pt-BR'));
  host.innerHTML = totals.length
    ? totals.map(item => `<div class="focus-course-row"><span class="focus-course-name" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</span><span class="focus-course-time">${formatFocusTime(item.seconds)}</span></div>`).join('')
    : '<div class="focus-empty">Cadastre um curso com pelo menos uma aula para acompanhar o tempo focado.</div>';
}
function renderPomodoro() {
  updateTimerCourseOptions();
  const now = Date.now();
  const remoteOwner = pomodoro.running && !ownsTimerLease();
  const remaining = pomodoro.running ? Math.max(0, Math.ceil((pomodoro.endAt - now) / 1000)) : pomodoro.remainingSeconds;
  document.getElementById('timer-display').textContent = formatTimer(remaining);
  document.getElementById('pomodoro-badge').textContent = `${settings.focusMinutes}m foco · ${settings.shortBreakMinutes}m pausa · ${settings.longBreakMinutes}m longa / ${settings.cyclesBeforeLong} focos`;
  const phase = document.getElementById('timer-phase');
  const phaseName = pomodoro.completed ? 'Concluído' : pomodoro.mode === 'focus' ? 'Foco' : pomodoro.mode === 'long' ? 'Pausa longa' : 'Pausa curta';
  const phaseDetail = pomodoro.completed
    ? `${settings.cyclesBeforeLong} focos concluídos`
    : pomodoro.mode === 'focus'
    ? `Ciclo ${pomodoro.cycle + 1} de ${settings.cyclesBeforeLong} · ${Math.ceil(pomodoro.intervalDurationSeconds / 60)} min`
    : `${Math.ceil(pomodoro.intervalDurationSeconds / 60)} minutos para recarregar`;
  phase.dataset.mode = pomodoro.mode;
  document.getElementById('timer-phase-title').textContent = phaseName;
  document.getElementById('timer-phase-detail').textContent = phaseDetail;
  const startButton = document.getElementById('timer-start');
  startButton.textContent = remoteOwner ? 'Timer em outra aba' : pomodoro.completed ? 'Ciclos concluídos' : pomodoro.running ? 'Pausar' : pomodoro.awaitingAdvance ? 'Próxima etapa' : pomodoro.hasStarted ? 'Retomar' : pomodoro.mode === 'focus' ? 'Iniciar foco' : 'Iniciar pausa';
  startButton.disabled = remoteOwner || pomodoro.completed || (!pomodoro.running && !pomodoro.awaitingAdvance && pomodoro.mode === 'focus' && !(pomodoro.sessionCourse || timerCourse.value));
  document.getElementById('timer-reset').disabled = remoteOwner;
  renderFocusTotals();
}
function accountFocusUntil(now) {
  if (!pomodoro.running || !ownsTimerLease() || pomodoro.mode !== 'focus' || !pomodoro.sessionCourse || !pomodoro.lastAccountedAt) return;
  const elapsed = Math.max(0, Math.floor((now - pomodoro.lastAccountedAt) / 1000));
  const untilDeadline = Math.max(0, Math.floor((pomodoro.endAt - pomodoro.lastAccountedAt) / 1000));
  const seconds = Math.min(elapsed, untilDeadline);
  if (!seconds) return;
  const course = getCourseById(pomodoro.sessionCourse);
  if (!course) return;
  const key = course.id;
  const current = focusTotals[key] || { courseId: key, name: course.name, seconds: 0 };
  focusTotals[key] = { courseId: key, name: course.name, seconds: current.seconds + seconds };
  pomodoro.lastAccountedAt += seconds * 1000;
  saveFocusTotals();
}
function finishPomodoro() {
  playPomodoroChime();
  const finishedMode = pomodoro.mode;
  const completedSession = finishedMode === 'long' && pomodoro.finishAfterBreak;
  if (completedSession) {
    pomodoro.completed = true;
    pomodoro.awaitingAdvance = false;
    pomodoro.remainingSeconds = 0;
    pomodoro.endAt = null;
    pomodoro.lastAccountedAt = null;
    pomodoro.heartbeatAt = null;
    pomodoro.running = false;
    pomodoro.hasStarted = false;
  } else if (settings.autoAdvance) {
    advancePomodoroStage();
    startPomodoro();
  } else {
    pomodoro.awaitingAdvance = true;
    pomodoro.remainingSeconds = 0;
    pomodoro.endAt = null;
    pomodoro.lastAccountedAt = null;
    pomodoro.heartbeatAt = null;
    pomodoro.running = false;
    pomodoro.hasStarted = false;
  }
  savePomodoro();
  if (!pomodoro.running) releaseTimerLease();
  renderPomodoro();
  showToast(completedSession
    ? `Pomodoro concluído: ${settings.cyclesBeforeLong} focos e pausa longa finalizados.`
    : finishedMode === 'focus'
    ? `Foco concluído.${settings.autoAdvance ? ` ${pomodoro.mode === 'long' ? 'Pausa longa' : 'Pausa curta'} iniciada.` : ' Escolha quando avançar para a pausa.'}`
    : `Pausa concluída.${settings.autoAdvance ? ' Novo foco iniciado.' : ' Escolha quando iniciar o próximo foco.'}`);
}
function advancePomodoroStage() {
  if (pomodoro.completed) return;
  const finishedMode = pomodoro.mode;
  if (finishedMode === 'focus') {
    pomodoro.cycle += 1;
    const longBreak = pomodoro.cycle >= settings.cyclesBeforeLong;
    pomodoro.finishAfterBreak = longBreak;
    if (longBreak) pomodoro.cycle = 0;
    pomodoro.mode = longBreak ? 'long' : 'short';
    pomodoro.selectedCourse = pomodoro.sessionCourse || pomodoro.selectedCourse;
    pomodoro.sessionCourse = '';
  } else {
    pomodoro.mode = 'focus';
    pomodoro.finishAfterBreak = false;
  }
  pomodoro.awaitingAdvance = false;
  pomodoro.running = false;
  pomodoro.hasStarted = false;
  pomodoro.intervalDurationSeconds = durationSeconds(pomodoro.mode);
  pomodoro.remainingSeconds = durationSeconds(pomodoro.mode);
  pomodoro.endAt = null;
  pomodoro.lastAccountedAt = null;
  pomodoro.heartbeatAt = null;
}
function preparePomodoroAudio() {
  if (!pomodoroAudioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    try { pomodoroAudioContext = new AudioContextClass(); } catch { return; }
  }
  if (pomodoroAudioContext.state === 'suspended') pomodoroAudioContext.resume().catch(() => {});
}
function playPomodoroChime() {
  preparePomodoroAudio();
  if (!pomodoroAudioContext || pomodoroAudioContext.state !== 'running') return;
  const context = pomodoroAudioContext;
  const now = context.currentTime;
  [0, 1].forEach(repetition => [587.33, 783.99, 1046.5].forEach((frequency, index) => {
    const startAt = now + repetition * 1.2 + index * 0.2;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(0.16, startAt + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.48);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(startAt);
    oscillator.stop(startAt + 0.5);
  }));
}
function timerTick() {
  if (!pomodoro.running) return;
  const now = Date.now();
  if (!ownsTimerLease()) {
    const lease = readTimerLease();
    if (lease && Number(lease.expiresAt) > now && lease.tabId !== TAB_ID) { renderPomodoro(); return; }
    pauseForInterruption();
    return;
  }
  if (now - lastTimerPulse > TIMER_STALE_MS) {
    pauseForInterruption();
    return;
  }
  if (!renewTimerLease()) {
    const shared = (() => { try { return JSON.parse(localStorage.getItem(POMODORO_KEY) || 'null'); } catch { return null; } })();
    if (shared) pomodoro = normalizePomodoro(shared);
    renderPomodoro();
    return;
  }
  accountFocusUntil(now);
  const remaining = Math.ceil((pomodoro.endAt - now) / 1000);
  if (remaining <= 0) {
    finishPomodoro();
    return;
  }
  pomodoro.remainingSeconds = remaining;
  pomodoro.heartbeatAt = now;
  lastTimerPulse = now;
  savePomodoro();
  renderPomodoro();
}
function pauseForInterruption() {
  pomodoro.running = false;
  pomodoro.hasStarted = true;
  pomodoro.endAt = null;
  pomodoro.lastAccountedAt = null;
  pomodoro.heartbeatAt = null;
  pomodoro.interrupted = false;
  savePomodoro();
  releaseTimerLease();
  renderPomodoro();
  showToast('Timer pausado após uma interrupção; o tempo fora da página não foi contado.');
}
function startPomodoro() {
  if (pomodoro.completed) return;
  preparePomodoroAudio();
  if (pomodoro.running && !ownsTimerLease()) { showToast('O timer está ativo em outra aba.'); return; }
  if (!acquireTimerLease()) { showToast('O timer está ativo em outra aba.'); return; }
  if (pomodoro.mode === 'focus') {
    const chosenCourse = pomodoro.sessionCourse || timerCourse.value;
    if (!chosenCourse) { releaseTimerLease(); showToast('Adicione ou selecione um curso antes de iniciar o foco.'); return; }
    pomodoro.sessionCourse = chosenCourse;
    pomodoro.selectedCourse = chosenCourse;
  }
  if (!pomodoro.hasStarted) pomodoro.intervalDurationSeconds = durationSeconds(pomodoro.mode);
  pomodoro.running = true;
  pomodoro.hasStarted = true;
  const now = Date.now();
  pomodoro.endAt = now + pomodoro.remainingSeconds * 1000;
  pomodoro.lastAccountedAt = now;
  pomodoro.heartbeatAt = now;
  lastTimerPulse = now;
  savePomodoro();
  renderPomodoro();
}
function pausePomodoro() {
  if (pomodoro.running && !ownsTimerLease()) return;
  const now = Date.now();
  accountFocusUntil(now);
  const remaining = Math.ceil((pomodoro.endAt - now) / 1000);
  if (remaining <= 0) { finishPomodoro(); return; }
  pomodoro.remainingSeconds = remaining;
  pomodoro.running = false;
  pomodoro.endAt = null;
  pomodoro.lastAccountedAt = null;
  pomodoro.heartbeatAt = null;
  savePomodoro();
  releaseTimerLease();
  renderPomodoro();
}
function resetPomodoro() {
  if (pomodoro.running && !ownsTimerLease()) return;
  if (pomodoro.running) accountFocusUntil(Date.now());
  pomodoro.mode = 'focus';
  pomodoro.cycle = 0;
  pomodoro.awaitingAdvance = false;
  pomodoro.completed = false;
  pomodoro.finishAfterBreak = false;
  pomodoro.running = false;
  pomodoro.hasStarted = false;
  pomodoro.sessionCourse = '';
  pomodoro.intervalDurationSeconds = durationSeconds('focus');
  pomodoro.remainingSeconds = pomodoro.intervalDurationSeconds;
  pomodoro.endAt = null;
  pomodoro.lastAccountedAt = null;
  pomodoro.heartbeatAt = null;
  savePomodoro();
  releaseTimerLease();
  renderPomodoro();
  showToast('Pomodoro reiniciado desde o início do ciclo de foco.');
}
