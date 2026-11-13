function normalizeFocusTotals(source) {
  const result = {};
  if (!source || typeof source !== 'object' || Array.isArray(source)) return result;
  for (const [sourceKey, item] of Object.entries(source)) {
    const courseId = typeof item?.courseId === 'string' ? item.courseId : '';
    const name = String(item?.name || (courseId ? '' : sourceKey)).trim();
    const rawSeconds = typeof item === 'number' ? item : item?.seconds;
    const seconds = Math.floor(Number(rawSeconds));
    const course = courseId ? getCourseById(courseId) : getCourseByName(name);
    if (Number.isFinite(seconds) && seconds > 0 && (course || name)) {
      const id = course?.id || courseId || makeId();
      if (!course && name) courses.push({ id, name, createdAt: Date.now() });
      result[id] = { courseId: id, name: course?.name || name, seconds };
    }
  }
  return result;
}
function loadFocusTotals() {
  try {
    const totals = normalizeFocusTotals(JSON.parse(localStorage.getItem(FOCUS_TOTALS_KEY) || '{}'));
    saveCourses();
    localStorage.setItem(FOCUS_TOTALS_KEY, JSON.stringify(totals));
    return totals;
  }
  catch { return {}; }
}
function normalizeSettings(source) {
  const bounded = (value, fallback, min, max) => {
    const number = Math.floor(Number(value));
    return Number.isFinite(number) ? Math.max(min, Math.min(max, number)) : fallback;
  };
  return {
    focusMinutes: bounded(source?.focusMinutes, DEFAULT_SETTINGS.focusMinutes, 1, 180),
    shortBreakMinutes: bounded(source?.shortBreakMinutes, DEFAULT_SETTINGS.shortBreakMinutes, 1, 60),
    longBreakMinutes: bounded(source?.longBreakMinutes, DEFAULT_SETTINGS.longBreakMinutes, 1, 120),
    cyclesBeforeLong: bounded(source?.cyclesBeforeLong, DEFAULT_SETTINGS.cyclesBeforeLong, 1, 12),
    autoAdvance: source?.autoAdvance !== false
  };
}
function loadSettings() {
  try { return normalizeSettings(JSON.parse(localStorage.getItem(SETTINGS_KEY) || 'null')); }
  catch { return { ...DEFAULT_SETTINGS }; }
}
function durationSeconds(mode) {
  const minutes = mode === 'focus' ? settings.focusMinutes : mode === 'long' ? settings.longBreakMinutes : settings.shortBreakMinutes;
  return minutes * 60;
}
function saveSettings() {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }
  catch { showToast('Não foi possível salvar a configuração neste navegador.'); }
}
function syncSettingsInputs() {
  Object.entries(settings).forEach(([key, value]) => {
    const input = settingsForm.elements.namedItem(key);
    if (input && input.type === 'checkbox') input.checked = Boolean(value);
    else if (input) input.value = value;
  });
}
function closeSettings() {
  settingsForm.hidden = true;
  settingsToggle.setAttribute('aria-expanded', 'false');
}
function defaultPomodoro() {
  return { mode: 'focus', running: false, hasStarted: false, awaitingAdvance: false, completed: false, finishAfterBreak: false, intervalDurationSeconds: durationSeconds('focus'), remainingSeconds: durationSeconds('focus'), endAt: null, lastAccountedAt: null, heartbeatAt: null, sessionCourse: '', selectedCourse: '', cycle: 0, interrupted: false };
}
function normalizePomodoro(source) {
  if (!source || typeof source !== 'object') return defaultPomodoro();
  const mode = ['focus', 'short', 'long'].includes(source.mode) ? source.mode : 'focus';
  const duration = durationSeconds(mode);
  const intervalDuration = Math.max(1, Math.min(180 * 60, Math.floor(Number(source.intervalDurationSeconds) || duration)));
  const rawRemaining = Math.floor(Number(source.remainingSeconds));
  const remaining = Number.isFinite(rawRemaining) ? Math.max(0, Math.min(intervalDuration, rawRemaining)) : intervalDuration;
  const heartbeatAt = Number(source.heartbeatAt) || Number(source.lastAccountedAt) || 0;
  const interrupted = Boolean(source.running) && heartbeatAt > 0 && Date.now() - heartbeatAt > TIMER_STALE_MS;
  const completed = Boolean(source.completed);
  const running = Boolean(source.running) && Number.isFinite(Number(source.endAt)) && !interrupted && !completed;
  return {
    mode, running, hasStarted: !completed && (Boolean(source.hasStarted) || running), awaitingAdvance: !completed && Boolean(source.awaitingAdvance),
    completed, finishAfterBreak: Boolean(source.finishAfterBreak), intervalDurationSeconds: intervalDuration,
    remainingSeconds: completed ? 0 : running ? Math.max(0, Math.ceil((Number(source.endAt) - Date.now()) / 1000)) : remaining,
    endAt: running ? Number(source.endAt) : null,
    lastAccountedAt: running ? (Number(source.lastAccountedAt) || Date.now()) : null,
    heartbeatAt: running ? heartbeatAt || Date.now() : null,
    sessionCourse: resolveCourseId(source.sessionCourse),
    selectedCourse: resolveCourseId(source.selectedCourse),
    cycle: Math.max(0, Math.min(settings.cyclesBeforeLong - 1, Math.floor(Number(source.cycle) || 0))),
    interrupted: Boolean(source.interrupted) || interrupted
  };
}
function loadPomodoro() {
  try { return normalizePomodoro(JSON.parse(localStorage.getItem(POMODORO_KEY) || 'null')); }
  catch { return defaultPomodoro(); }
}
function saveFocusTotals() {
  try { localStorage.setItem(FOCUS_TOTALS_KEY, JSON.stringify(focusTotals)); }
  catch { showToast('Não foi possível salvar o tempo focado neste navegador.'); }
}
function savePomodoro() {
  try { localStorage.setItem(POMODORO_KEY, JSON.stringify(pomodoro)); }
  catch { showToast('Não foi possível salvar o estado do timer.'); }
}
function readTimerLease() {
  try { return JSON.parse(localStorage.getItem(TIMER_LEASE_KEY) || 'null'); }
  catch { return null; }
}
function ownsTimerLease() {
  const lease = readTimerLease();
  return Boolean(lease && lease.tabId === TAB_ID && Number(lease.expiresAt) > Date.now());
}
function acquireTimerLease() {
  const now = Date.now();
  const lease = readTimerLease();
  if (lease && Number(lease.expiresAt) > now && lease.tabId !== TAB_ID) return false;
  try {
    localStorage.setItem(TIMER_LEASE_KEY, JSON.stringify({ tabId: TAB_ID, expiresAt: now + TIMER_LEASE_MS }));
    return ownsTimerLease();
  } catch { return false; }
}
function renewTimerLease() {
  if (!ownsTimerLease()) return acquireTimerLease();
  try {
    localStorage.setItem(TIMER_LEASE_KEY, JSON.stringify({ tabId: TAB_ID, expiresAt: Date.now() + TIMER_LEASE_MS }));
    return ownsTimerLease();
  } catch { return false; }
}
function releaseTimerLease() {
  const lease = readTimerLease();
  if (!lease || lease.tabId !== TAB_ID) return;
  try { localStorage.removeItem(TIMER_LEASE_KEY); } catch {}
}
function isVideo(item) {
  return item && typeof item.id === 'string' && typeof item.title === 'string';
}
function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(videos));
    return true;
  } catch {
    showToast('Não foi possível salvar. Exporte uma cópia para liberar espaço.');
    return false;
  }
}
