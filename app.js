/* =========================================================
 * HabitForge — vanilla JS habit tracker
 * Storage: localStorage
 * ========================================================= */

const STORAGE_KEY = 'habitforge.v1';
const THEME_KEY = 'habitforge.theme';

const MOTIVATION = [
  { emoji: '🌱', text: 'Small steps every day add up to big results.' },
  { emoji: '🔥', text: "Discipline is choosing what you want most over what you want now." },
  { emoji: '⚡', text: 'You don\'t have to be extreme — just consistent.' },
  { emoji: '🚀', text: 'A year from now you will wish you had started today.' },
  { emoji: '🌟', text: 'Habits are the compound interest of self-improvement.' },
  { emoji: '🎯', text: 'Don\'t break the chain.' },
  { emoji: '💎', text: 'Pressure makes diamonds. Stay with it.' },
  { emoji: '🏔️', text: 'Every expert was once a beginner. Keep climbing.' },
  { emoji: '🌊', text: 'Drop by drop, the ocean is filled.' },
  { emoji: '🦋', text: 'Be patient with yourself. Growth takes time.' },
  { emoji: '🎉', text: 'You\'re building the future you. Show up today.' },
  { emoji: '💪', text: 'Strength is built one rep at a time — literal or otherwise.' },
];

// ------------------- State -------------------
let state = loadState();
let viewDate = startOfMonth(new Date());   // for calendar nav
let calFilter = '__all';                   // which habit to display in calendar
let editingId = null;

// ------------------- Helpers -------------------
function todayKey(d = new Date()) {
  // Use LOCAL date parts so the key matches what the user sees as "today"
  // (toISOString() returns UTC, which can be a day ahead/behind their local date)
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function startOfMonth(d) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function endOfMonth(d)   { return new Date(d.getFullYear(), d.getMonth() + 1, 0); }
function addDays(d, n)   { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function uuid()          { return 'h_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36); }

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore */ }
  return {
    habits: [],
    // log: { 'YYYY-MM-DD': { habitId: true } }
    log: {},
  };
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Storage failed', e);
  }
}

function isDone(habitId, key) {
  return !!(state.log[key] && state.log[key][habitId]);
}

function toggleHabit(habitId) {
  const key = todayKey();
  const day = state.log[key] || {};
  const newVal = !day[habitId];
  day[habitId] = newVal;
  if (!newVal) delete day[habitId];
  if (Object.keys(day).length) state.log[key] = day;
  else delete state.log[key];
  saveState();

  if (allDoneToday()) confettiBurst();
}

function allDoneToday() {
  if (!state.habits.length) return false;
  const key = todayKey();
  return state.habits.every(h => isDone(h.id, key));
}

// ------------------- Streak calculations -------------------
function habitStreak(habitId, refDate = new Date()) {
  // current streak: count back from today as long as habit is done.
  // If today is not yet done, still allow streak using yesterday as anchor.
  let streak = 0;
  let cursor = new Date(refDate);
  const todayK = todayKey(refDate);
  if (!isDone(habitId, todayK)) {
    cursor = addDays(cursor, -1);
  }
  while (isDone(habitId, todayKey(cursor))) {
    streak++;
    cursor = addDays(cursor, -1);
    if (streak > 3650) break; // safety
  }
  return streak;
}

function habitLongest(habitId) {
  const keys = Object.keys(state.log).filter(k => state.log[k][habitId]).sort();
  let best = 0, cur = 0, prev = null;
  for (const k of keys) {
    if (prev && nextDayKey(prev) === k) cur++;
    else cur = 1;
    if (cur > best) best = cur;
    prev = k;
  }
  return best;
}

function nextDayKey(k) {
  const d = new Date(k + 'T00:00:00');
  d.setDate(d.getDate() + 1);
  return todayKey(d);
}

function overallCurrentStreak() {
  // Days where AT LEAST one habit was completed, counting back from today.
  if (!state.habits.length) return 0;
  let streak = 0;
  let cursor = new Date();
  if (!dayHasAny(todayKey(cursor))) cursor = addDays(cursor, -1);
  while (dayHasAny(todayKey(cursor))) {
    streak++;
    cursor = addDays(cursor, -1);
    if (streak > 3650) break;
  }
  return streak;
}

function dayHasAny(key) {
  return !!(state.log[key] && Object.keys(state.log[key]).length);
}

function overallLongestStreak() {
  const keys = Object.keys(state.log).filter(k => dayHasAny(k)).sort();
  let best = 0, cur = 0, prev = null;
  for (const k of keys) {
    if (prev && nextDayKey(prev) === k) cur++;
    else cur = 1;
    if (cur > best) best = cur;
    prev = k;
  }
  return best;
}

function totalCompletions() {
  let n = 0;
  for (const k of Object.keys(state.log)) n += Object.keys(state.log[k]).length;
  return n;
}

function lifetimeRate() {
  if (!state.habits.length) return 0;
  // Earliest log date -> today, inclusive
  const keys = Object.keys(state.log).sort();
  if (!keys.length) return 0;
  const first = new Date(keys[0] + 'T00:00:00');
  const today = new Date();
  const days = Math.max(1, Math.floor((today - first) / 86400000) + 1);
  const expected = days * state.habits.length;
  const done = totalCompletions();
  return Math.round((done / expected) * 100);
}

// ------------------- Rendering -------------------
function render() {
  renderTodayLabel();
  renderMotivation();
  renderStats();
  renderHabits();
  renderCalendar();
  renderCalendarFilter();
}

function renderTodayLabel() {
  const opts = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
  document.getElementById('todayLabel').textContent =
    new Date().toLocaleDateString(undefined, opts);
}

function renderMotivation() {
  // Pick a stable-per-day motivation
  const seed = new Date().getDate() + new Date().getMonth() * 31;
  const item = MOTIVATION[seed % MOTIVATION.length];
  document.getElementById('motivationEmoji').textContent = item.emoji;
  document.getElementById('motivationText').textContent = item.text;
}

function renderStats() {
  const cur = overallCurrentStreak();
  const best = Math.max(overallLongestStreak(), cur);
  document.getElementById('currentStreak').textContent = cur;
  document.getElementById('longestStreak').textContent = best;

  const key = todayKey();
  const dayLog = state.log[key] || {};
  const total = state.habits.length;
  const done = total ? state.habits.filter(h => dayLog[h.id]).length : 0;
  const pct = total ? Math.round((done / total) * 100) : 0;
  document.getElementById('todayPercent').textContent = pct;
  document.getElementById('todayProgressFill').style.width = pct + '%';

  document.getElementById('totalCompletions').textContent = totalCompletions();
  document.getElementById('completionRate').textContent = lifetimeRate() + '% lifetime rate';
}

function renderHabits() {
  const list = document.getElementById('habitsList');
  const empty = document.getElementById('emptyState');
  list.innerHTML = '';

  if (!state.habits.length) {
    empty.classList.remove('hidden');
    list.classList.add('hidden');
    return;
  }
  empty.classList.add('hidden');
  list.classList.remove('hidden');

  const key = todayKey();
  for (const habit of state.habits) {
    const done = isDone(habit.id, key);
    const streak = habitStreak(habit.id);
    const longest = habitLongest(habit.id);

    const item = document.createElement('div');
    item.className = 'habit-item' + (done ? ' done' : '');
    item.style.setProperty('--habit-color', habit.color);

    item.innerHTML = `
      <div class="habit-emoji" aria-hidden="true">${habit.emoji}</div>
      <div class="habit-info">
        <div class="habit-name">
          ${escapeHtml(habit.name)}
          ${streak > 0 ? `<span class="habit-streak">🔥 ${streak}d streak</span>` : ''}
        </div>
        <div class="habit-meta">
          <span>Longest: ${longest}d</span>
          <span>Total: ${countCompletions(habit.id)}</span>
        </div>
      </div>
      <div class="habit-actions">
        <button class="edit-btn" data-edit="${habit.id}" title="Edit" aria-label="Edit habit">✎</button>
        <button class="check-btn" data-toggle="${habit.id}" aria-label="${done ? 'Mark as not done' : 'Mark as done'}">✓</button>
      </div>
    `;
    list.appendChild(item);
  }
}

function countCompletions(habitId) {
  let n = 0;
  for (const k of Object.keys(state.log)) if (state.log[k][habitId]) n++;
  return n;
}

function renderCalendarFilter() {
  const sel = document.getElementById('calHabitFilter');
  const prev = calFilter;
  sel.innerHTML = '<option value="__all">All habits (combined)</option>';
  for (const h of state.habits) {
    const opt = document.createElement('option');
    opt.value = h.id;
    opt.textContent = `${h.emoji} ${h.name}`;
    sel.appendChild(opt);
  }
  // restore
  if ([...sel.options].some(o => o.value === prev)) sel.value = prev;
  else { sel.value = '__all'; calFilter = '__all'; }
}

function renderCalendar() {
  const grid = document.getElementById('calendarGrid');
  const label = document.getElementById('calMonthLabel');
  grid.innerHTML = '';

  label.textContent = viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  const first = startOfMonth(viewDate);
  const last = endOfMonth(viewDate);
  const startDow = first.getDay(); // 0 = Sun
  const totalDays = last.getDate();
  const totalCells = Math.ceil((startDow + totalDays) / 7) * 7;

  const todayK = todayKey();

  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - startDow + 1;
    const cell = document.createElement('div');
    cell.className = 'cal-cell';

    if (dayNum < 1 || dayNum > totalDays) {
      cell.classList.add('outside');
      const fillerDate = new Date(first);
      fillerDate.setDate(dayNum);
      cell.innerHTML = `<div class="cell-date">${fillerDate.getDate()}</div>`;
      grid.appendChild(cell);
      continue;
    }

    const cellDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), dayNum);
    const k = todayKey(cellDate);
    const dayLog = state.log[k] || {};

    let dotLevel = 0;
    let metaText = '';

    if (calFilter === '__all') {
      const total = state.habits.length;
      const done = total ? state.habits.filter(h => dayLog[h.id]).length : 0;
      if (total) {
        const ratio = done / total;
        if (done === 0) dotLevel = 0;
        else if (ratio === 1) dotLevel = 3;
        else if (ratio >= 0.5) dotLevel = 2;
        else dotLevel = 1;
        if (done) metaText = `${done}/${total}`;
      }
    } else {
      dotLevel = dayLog[calFilter] ? 3 : 0;
      if (dotLevel) metaText = '✓';
    }

    cell.classList.add('dot-' + dotLevel);
    if (dotLevel > 0) cell.classList.add('has-data');
    if (k === todayK) cell.classList.add('today');

    cell.innerHTML = `
      <div class="cell-date">${dayNum}</div>
      ${metaText ? `<div class="cell-meta">${metaText}</div>` : ''}
    `;

    if (dotLevel > 0) {
      cell.title = k + ' — ' + metaText;
    }

    grid.appendChild(cell);
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

// ------------------- Modal -------------------
const modal = document.getElementById('habitModal');

function openModal(habit = null) {
  editingId = habit ? habit.id : null;
  document.getElementById('modalTitle').textContent = habit ? 'Edit habit' : 'New habit';
  document.getElementById('habitName').value = habit ? habit.name : '';
  document.getElementById('habitEmoji').value = habit ? habit.emoji : '💧';
  document.getElementById('habitColor').value = habit ? habit.color : '#38bdf8';
  document.getElementById('habitId').value = habit ? habit.id : '';
  document.getElementById('deleteHabitBtn').classList.toggle('hidden', !habit);

  // mark selected emoji + color
  for (const btn of document.querySelectorAll('#emojiPicker button')) {
    btn.classList.toggle('selected', btn.dataset.emoji === document.getElementById('habitEmoji').value);
  }
  for (const btn of document.querySelectorAll('#colorPicker button')) {
    btn.classList.toggle('selected', btn.dataset.color === document.getElementById('habitColor').value);
  }

  modal.classList.remove('hidden');
  setTimeout(() => document.getElementById('habitName').focus(), 50);
}

function closeModal() { modal.classList.add('hidden'); }

function saveHabitFromForm(e) {
  e.preventDefault();
  const name  = document.getElementById('habitName').value.trim();
  const emoji = document.getElementById('habitEmoji').value;
  const color = document.getElementById('habitColor').value;
  const id    = document.getElementById('habitId').value;
  if (!name) return;

  if (id) {
    const h = state.habits.find(x => x.id === id);
    if (h) { h.name = name; h.emoji = emoji; h.color = color; }
  } else {
    state.habits.push({ id: uuid(), name, emoji, color, createdAt: todayKey() });
  }
  saveState();
  closeModal();
  render();
}

function deleteHabit() {
  if (!editingId) return;
  if (!confirm('Delete this habit and all its history? This cannot be undone.')) return;
  state.habits = state.habits.filter(h => h.id !== editingId);
  // remove from log too
  for (const k of Object.keys(state.log)) {
    delete state.log[k][editingId];
    if (!Object.keys(state.log[k]).length) delete state.log[k];
  }
  saveState();
  closeModal();
  render();
}

// ------------------- Confetti -------------------
function confettiBurst() {
  const canvas = document.getElementById('confetti');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const colors = ['#7c5cff', '#22d3ee', '#34d399', '#fbbf24', '#f472b6', '#f87171'];
  const pieces = [];
  for (let i = 0; i < 110; i++) {
    pieces.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 1.2) * 14,
      g: 0.35 + Math.random() * 0.2,
      size: 6 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      life: 0,
    });
  }
  let frames = 0;
  function loop() {
    frames++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of pieces) {
      p.vy += p.g;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.life++;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    }
    if (frames < 140) requestAnimationFrame(loop);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  loop();
}

// ------------------- Theme -------------------
function applyTheme(theme) {
  if (theme === 'light') document.body.classList.add('light');
  else document.body.classList.remove('light');
  document.getElementById('themeToggle').textContent = theme === 'light' ? '☀️' : '🌙';
}
function toggleTheme() {
  const newTheme = document.body.classList.contains('light') ? 'dark' : 'light';
  localStorage.setItem(THEME_KEY, newTheme);
  applyTheme(newTheme);
}

// ------------------- Event wiring -------------------
function wire() {
  document.getElementById('addHabitBtn').addEventListener('click', () => openModal(null));

  document.getElementById('habitsList').addEventListener('click', (e) => {
    const t = e.target.closest('button');
    if (!t) return;
    if (t.dataset.toggle) {
      toggleHabit(t.dataset.toggle);
      render();
    } else if (t.dataset.edit) {
      const h = state.habits.find(x => x.id === t.dataset.edit);
      if (h) openModal(h);
    }
  });

  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.habits.push({
        id: uuid(),
        name: btn.dataset.name,
        emoji: btn.dataset.emoji,
        color: btn.dataset.color,
        createdAt: todayKey(),
      });
      saveState();
      render();
    });
  });

  // Modal
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('cancelHabitBtn').addEventListener('click', closeModal);
  document.getElementById('deleteHabitBtn').addEventListener('click', deleteHabit);
  document.getElementById('habitForm').addEventListener('submit', saveHabitFromForm);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  document.getElementById('emojiPicker').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    document.getElementById('habitEmoji').value = b.dataset.emoji;
    document.querySelectorAll('#emojiPicker button').forEach(x => x.classList.toggle('selected', x === b));
  });
  document.getElementById('colorPicker').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    document.getElementById('habitColor').value = b.dataset.color;
    document.querySelectorAll('#colorPicker button').forEach(x => x.classList.toggle('selected', x === b));
  });

  // Calendar
  document.getElementById('calPrev').addEventListener('click', () => {
    viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
    renderCalendar();
  });
  document.getElementById('calNext').addEventListener('click', () => {
    viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
    renderCalendar();
  });
  document.getElementById('calHabitFilter').addEventListener('change', (e) => {
    calFilter = e.target.value;
    renderCalendar();
  });

  // Theme
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
    if (e.key === 'n' && !modal.classList.contains('hidden') === false && document.activeElement.tagName !== 'INPUT') {
      // n to add when modal isn't open
      if (modal.classList.contains('hidden')) { e.preventDefault(); openModal(null); }
    }
  });

  // Refresh "today" if app stays open across midnight
  setInterval(() => {
    const cur = todayKey();
    if (cur !== window.__lastDayKey) {
      window.__lastDayKey = cur;
      render();
    }
  }, 60 * 1000);
  window.__lastDayKey = todayKey();
}

// ------------------- Boot -------------------
function boot() {
  applyTheme(localStorage.getItem(THEME_KEY) || 'dark');
  wire();
  render();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
