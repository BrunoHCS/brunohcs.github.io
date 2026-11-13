function setTheme(theme) {
  const dark = theme === 'dark';
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) themeColor.content = dark ? '#0b1119' : '#edf2f4';
}

function initializeTheme() {
  try { currentTheme = localStorage.getItem('theme') || document.documentElement.dataset.theme || 'dark'; } catch {}
  setTheme(currentTheme);
}

function reloadSharedState() {
  try {
    const savedCourses = JSON.parse(localStorage.getItem(COURSES_KEY) || '[]');
    if (Array.isArray(savedCourses)) courses = savedCourses.filter(item => item && typeof item.id === 'string' && typeof item.name === 'string');
    videos = loadVideos().map(video => {
      let course = getCourseById(video.courseId);
      if (!course && video.course) course = getCourseByName(video.course);
      return course ? { ...video, courseId: course.id, course: course.name } : video;
    });
    focusTotals = normalizeFocusTotals(JSON.parse(localStorage.getItem(FOCUS_TOTALS_KEY) || '{}'));
    settings = loadSettings();
    pomodoro = loadPomodoro();
    if (pomodoro.interrupted) { receivedInterruptedTimer = true; pomodoro.interrupted = false; }
    lastTimerPulse = Date.now();
    try { currentTheme = localStorage.getItem('theme') || 'dark'; } catch { currentTheme = 'dark'; }
    setTheme(currentTheme);
    updateCourseFormOptions(document.getElementById('course').value);
    render();
    if (receivedInterruptedTimer) {
      receivedInterruptedTimer = false;
      savePomodoro();
      showToast('Timer pausado após uma interrupção; o tempo fora da página não foi contado.');
    }
  } catch {}
}

function bindCrossTabSync() {
  window.addEventListener('storage', event => {
    if ([STORAGE_KEY, COURSES_KEY, FOCUS_TOTALS_KEY, POMODORO_KEY, SETTINGS_KEY, TIMER_LEASE_KEY, 'theme'].includes(event.key)) reloadSharedState();
  });
  
}
function bindPageLifecycle() {
  window.addEventListener('pagehide', () => {
    if (!pomodoro.running || !ownsTimerLease()) return;
    const now = Date.now();
    if (now - lastTimerPulse > TIMER_STALE_MS) {
      pomodoro.running = false;
      pomodoro.hasStarted = true;
      pomodoro.endAt = null;
      pomodoro.lastAccountedAt = null;
      pomodoro.heartbeatAt = null;
      savePomodoro();
      releaseTimerLease();
      return;
    }
    accountFocusUntil(now);
    const remaining = Math.ceil((pomodoro.endAt - now) / 1000);
    if (remaining <= 0) { finishPomodoro(); return; }
    pomodoro.remainingSeconds = remaining;
    pomodoro.running = false;
    pomodoro.hasStarted = true;
    pomodoro.endAt = null;
    pomodoro.lastAccountedAt = null;
    pomodoro.heartbeatAt = null;
    savePomodoro();
    releaseTimerLease();
  });
  
}
