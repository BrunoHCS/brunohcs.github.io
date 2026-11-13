videos = loadVideos();
courses = loadCourses();
focusTotals = loadFocusTotals();
settings = loadSettings();
pomodoro = loadPomodoro();
TAB_ID = makeId();
receivedInterruptedTimer = Boolean(pomodoro.interrupted);
pomodoro.interrupted = false;

syncSettingsInputs();
initializeTheme();
updateCourseFormOptions();
bindUiEvents();
bindBackupEvents();
bindCrossTabSync();
bindPageLifecycle();
render();
if (receivedInterruptedTimer) {
  receivedInterruptedTimer = false;
  savePomodoro();
  showToast('Timer pausado após uma interrupção; o tempo fora da página não foi contado.');
}
timerTick();
timerInterval = window.setInterval(timerTick, 1000);
