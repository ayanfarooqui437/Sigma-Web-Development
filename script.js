const skillData = [
  { name: 'HTML', value: 82, level: 'Advanced', color: '#ff9a62', pale: '#fff0e7', icon: '5' },
  { name: 'CSS', value: 74, level: 'Advanced', color: '#75a7ff', pale: '#edf4ff', icon: '#', },
  { name: 'JavaScript', value: 68, level: 'Intermediate', color: '#f0c94c', pale: '#fff7d7', icon: 'JS' },
  { name: 'React', value: 61, level: 'Intermediate', color: '#67b8ef', pale: '#e8f6ff', icon: '⚛' },
  { name: 'React.js', value: 57, level: 'Intermediate', color: '#8b9bf7', pale: '#edf0ff', icon: '⚛' },
  { name: 'Node.js', value: 43, level: 'Learning', color: '#7dbb68', pale: '#edf8e9', icon: 'JS' }
];

const defaultEntries = [
  { title: 'Built a responsive portfolio', skill: 'CSS', minutes: 95, date: new Date(Date.now() - 86400000).toISOString(), mood: 'Confident' },
  { title: 'Learned React hooks', skill: 'React.js', minutes: 75, date: new Date(Date.now() - 2 * 86400000).toISOString(), mood: 'Focused' },
  { title: 'Practiced async JavaScript', skill: 'JavaScript', minutes: 60, date: new Date(Date.now() - 3 * 86400000).toISOString(), mood: 'Curious' }
];

let entries = JSON.parse(localStorage.getItem('devlogEntries') || 'null') || defaultEntries;

const $ = (selector) => document.querySelector(selector);

function renderSkills() {
  $('#skillsGrid').innerHTML = skillData.map((skill) => `
    <article class="skill-card">
      <div class="skill-top">
        <div class="skill-icon" style="background:${skill.pale};color:${skill.color}">${skill.icon}</div>
        <span class="skill-percent">${skill.value}%</span>
      </div>
      <h3>${skill.name}</h3>
      <div class="skill-track"><div style="width:${skill.value}%;background:${skill.color}"></div></div>
      <span class="skill-level">${skill.level}</span>
    </article>`).join('');
}

function renderEntries() {
  const container = $('#recentEntries');
  if (!entries.length) {
    container.innerHTML = '<p class="empty-state">No entries yet. Log your first session to start your journey.</p>';
    return;
  }
  container.innerHTML = entries.slice(0, 4).map((entry) => {
    const date = new Date(entry.date);
    return `<article class="entry">
      <div class="entry-date"><strong>${date.getDate()}</strong><span>${date.toLocaleString('en', { month: 'short' })}</span></div>
      <div class="entry-info"><strong>${escapeHTML(entry.title)}</strong><span>${escapeHTML(entry.skill)} · ${escapeHTML(entry.mood || 'Focused')}</span></div>
      <div class="entry-time">${entry.minutes >= 60 ? `${(entry.minutes / 60).toFixed(entry.minutes % 60 ? 1 : 0)}h` : `${entry.minutes}m`}</div>
    </article>`;
  }).join('');
}

function escapeHTML(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}

function renderStats() {
  const average = Math.round(skillData.reduce((sum, skill) => sum + skill.value, 0) / skillData.length);
  $('#overallPercent').textContent = `${average}%`;
  const circumference = 440;
  $('#ringProgress').style.strokeDashoffset = String(circumference - circumference * average / 100);

  const totalMinutes = entries.reduce((sum, entry) => sum + Number(entry.minutes || 0), 0);
  $('#hoursLogged').textContent = `${Math.max(48, Math.round(totalMinutes / 60))}h`;

  const uniqueDays = new Set(entries.map(entry => new Date(entry.date).toDateString())).size;
  $('#dayStreak').textContent = Math.max(12, uniqueDays);
}

function renderHeatmap() {
  const heatmap = $('#heatmap');
  const recorded = new Set(entries.map(entry => new Date(entry.date).toDateString()));
  let html = '';
  for (let i = 83; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const level = recorded.has(date.toDateString()) ? (i % 4 === 0 ? 4 : 3) : ((i * 7 + i * i) % 17 === 0 ? 1 : 0);
    html += `<i data-level="${level}" title="${date.toLocaleDateString()}"></i>`;
  }
  heatmap.innerHTML = html;
}

const today = new Date();
$('#todayLabel').textContent = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

renderSkills();
renderEntries();
renderStats();
renderHeatmap();

let playlistProgress = Math.max(0, Number(localStorage.getItem('devlogPlaylistProgress') || 0));

function renderPlaylistProgress() {
  $('#playlistProgressText').textContent = `${playlistProgress} ${playlistProgress === 1 ? 'video' : 'videos'}`;
  $('#playlistProgressBar').style.width = `${Math.min(100, playlistProgress * 2)}%`;
}

$('#markVideoBtn').addEventListener('click', () => {
  playlistProgress += 1;
  localStorage.setItem('devlogPlaylistProgress', String(playlistProgress));
  renderPlaylistProgress();
});

renderPlaylistProgress();

const dialog = $('#entryDialog');
$('#openEntryBtn').addEventListener('click', () => dialog.showModal());
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) dialog.close();
});

$('#entryForm').addEventListener('submit', (event) => {
  event.preventEvent && event.preventEvent();
  if (event.submitter?.value === 'cancel') return;
  event.preventDefault();
  const title = $('#entryTitle').value.trim();
  if (!title) return;
  entries.unshift({
    title,
    skill: $('#entrySkill').value,
    minutes: Number($('#entryHours').value),
    mood: $('#entryMood').value,
    date: new Date().toISOString()
  });
  localStorage.setItem('devlogEntries', JSON.stringify(entries));
  renderEntries();
  renderStats();
  renderHeatmap();
  dialog.close();
  event.target.reset();
});

$('#clearFilterBtn').addEventListener('click', () => renderEntries());

const weekDays = new Set(entries.filter(entry => {
  const age = Date.now() - new Date(entry.date).getTime();
  return age >= 0 && age < 7 * 86400000;
}).map(entry => new Date(entry.date).toDateString())).size;
$('#weeklyGoalText').textContent = `${Math.min(weekDays, 5)} / 5 days`;
$('#weeklyGoalBar').style.width = `${Math.min(100, weekDays * 20)}%`;

document.querySelectorAll('.nav-item').forEach((item) => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach((link) => link.classList.remove('active'));
    item.classList.add('active');
  });
});
