// Beach Body Weight Tracker - App Logic

// State
let state = {
  settings: {
    unit: 'kg',
    targetWeight: null,
    targetDate: null,
    setupComplete: false
  },
  entries: []
};

// DOM Elements
const elements = {};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  cacheElements();
  loadState();
  setupEventListeners();

  if (state.settings.setupComplete) {
    showApp();
  } else {
    showSetup();
  }

  registerServiceWorker();
});

function cacheElements() {
  // Screens
  elements.setupScreen = document.getElementById('setup-screen');
  elements.appContainer = document.getElementById('app-container');

  // Setup
  elements.setupCurrentWeight = document.getElementById('setup-current-weight');
  elements.setupTargetWeight = document.getElementById('setup-target-weight');
  elements.setupUnit = document.getElementById('setup-unit');
  elements.setupTargetDate = document.getElementById('setup-target-date');
  elements.setupSubmit = document.getElementById('setup-submit');

  // Log tab
  elements.logWeight = document.getElementById('log-weight');
  elements.omadCheckbox = document.getElementById('omad-checkbox');
  elements.logDate = document.getElementById('log-date');
  elements.logSubmit = document.getElementById('log-submit');
  elements.omadInfo = document.getElementById('omad-info');

  // Stats
  elements.currentWeightStat = document.getElementById('current-weight-stat');
  elements.targetWeightStat = document.getElementById('target-weight-stat');
  elements.toGoStat = document.getElementById('to-go-stat');

  // Progress
  elements.projectionDate = document.getElementById('projection-date');
  elements.projectionDays = document.getElementById('projection-days');

  // History
  elements.historyList = document.getElementById('history-list');

  // Settings
  elements.settingsTargetWeight = document.getElementById('settings-target-weight');
  elements.settingsUnit = document.getElementById('settings-unit');
  elements.settingsTargetDate = document.getElementById('settings-target-date');
  elements.settingsSave = document.getElementById('settings-save');
  elements.resetApp = document.getElementById('reset-app');

  // Modals
  elements.celebrationModal = document.getElementById('celebration-modal');
  elements.celebrationDate = document.getElementById('celebration-date');
  elements.celebrationDays = document.getElementById('celebration-days');
  elements.celebrationClose = document.getElementById('celebration-close');

  elements.editModal = document.getElementById('edit-modal');
  elements.editWeight = document.getElementById('edit-weight');
  elements.editOmad = document.getElementById('edit-omad');
  elements.editDate = document.getElementById('edit-date');
  elements.editSave = document.getElementById('edit-save');
  elements.editDelete = document.getElementById('edit-delete');
  elements.editCancel = document.getElementById('edit-cancel');

  elements.omadModal = document.getElementById('omad-modal');
  elements.omadModalClose = document.getElementById('omad-modal-close');

  elements.goalModal = document.getElementById('goal-modal');
  elements.goalClose = document.getElementById('goal-close');

  // Tabs
  elements.tabBtns = document.querySelectorAll('.tab-btn');
  elements.tabPanes = document.querySelectorAll('.tab-pane');

  // Confetti
  elements.confetti = document.getElementById('confetti');
}

function setupEventListeners() {
  // Setup
  elements.setupUnit.addEventListener('change', updateUnitDisplays);
  elements.setupSubmit.addEventListener('click', handleSetup);

  // Log
  elements.logSubmit.addEventListener('click', handleLogWeight);
  elements.omadInfo.addEventListener('click', () => showModal(elements.omadModal));

  // Tabs
  elements.tabBtns.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Settings
  elements.settingsSave.addEventListener('click', handleSaveSettings);
  elements.resetApp.addEventListener('click', handleResetApp);

  // Modals
  elements.celebrationClose.addEventListener('click', () => {
    hideModal(elements.celebrationModal);
    switchTab('progress');
  });

  elements.omadModalClose.addEventListener('click', () => hideModal(elements.omadModal));
  elements.goalClose.addEventListener('click', () => hideModal(elements.goalModal));

  elements.editSave.addEventListener('click', handleEditSave);
  elements.editDelete.addEventListener('click', handleEditDelete);
  elements.editCancel.addEventListener('click', () => hideModal(elements.editModal));

  // Set default log date to today
  elements.logDate.value = formatDateForInput(new Date());
}

// Storage
function loadState() {
  const saved = localStorage.getItem('beachBodyState');
  if (saved) {
    state = JSON.parse(saved);
  }
}

function saveState() {
  localStorage.setItem('beachBodyState', JSON.stringify(state));
}

// Setup
function showSetup() {
  elements.setupScreen.classList.remove('hidden');
  elements.appContainer.classList.add('hidden');
}

function showApp() {
  elements.setupScreen.classList.add('hidden');
  elements.appContainer.classList.remove('hidden');
  updateAllDisplays();
}

function handleSetup() {
  const currentWeight = parseFloat(elements.setupCurrentWeight.value);
  const targetWeight = parseFloat(elements.setupTargetWeight.value);
  const unit = elements.setupUnit.value;
  const targetDate = elements.setupTargetDate.value || null;

  if (!currentWeight || !targetWeight) {
    alert('Please enter your current weight and target weight');
    return;
  }

  state.settings = {
    unit,
    targetWeight,
    targetDate,
    setupComplete: true
  };

  // Add first entry
  const entry = {
    id: generateId(),
    date: formatDateForInput(new Date()),
    weight: currentWeight,
    omadOrFasted: false,
    changeType: 'initial'
  };

  state.entries = [entry];
  saveState();
  showApp();
}

function updateUnitDisplays() {
  const unit = elements.setupUnit?.value || state.settings.unit;
  document.querySelectorAll('.unit-display, .unit-label').forEach(el => {
    el.textContent = unit;
  });
}

// Tabs
function switchTab(tabName) {
  elements.tabBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });

  elements.tabPanes.forEach(pane => {
    pane.classList.toggle('active', pane.id === `${tabName}-tab`);
  });

  if (tabName === 'progress') {
    setTimeout(renderChart, 100);
  } else if (tabName === 'history') {
    renderHistory();
  } else if (tabName === 'settings') {
    populateSettings();
  }
}

// Log Weight
function handleLogWeight() {
  const weight = parseFloat(elements.logWeight.value);
  const omadOrFasted = elements.omadCheckbox.checked;
  const date = elements.logDate.value;

  if (!weight) {
    alert('Please enter your weight');
    return;
  }

  // Check if entry exists for this date
  const existingIndex = state.entries.findIndex(e => e.date === date);

  const previousEntry = getPreviousEntry(date);
  const previousWeight = previousEntry ? previousEntry.weight : weight;
  const changeType = getChangeType(weight, previousWeight, omadOrFasted);

  const entry = {
    id: existingIndex >= 0 ? state.entries[existingIndex].id : generateId(),
    date,
    weight,
    omadOrFasted,
    previousWeight,
    changeType
  };

  if (existingIndex >= 0) {
    state.entries[existingIndex] = entry;
  } else {
    state.entries.push(entry);
  }

  // Sort entries by date
  state.entries.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Recalculate change types for subsequent entries
  recalculateChangeTypes();

  saveState();

  // Reset form
  elements.logWeight.value = '';
  elements.omadCheckbox.checked = false;
  elements.logDate.value = formatDateForInput(new Date());

  // Update displays
  updateAllDisplays();

  // Check if goal achieved
  if (weight <= state.settings.targetWeight) {
    showGoalAchieved();
  } else {
    showCelebration();
  }
}

function getChangeType(currentWeight, previousWeight, omadOrFasted) {
  if (currentWeight > previousWeight) {
    return 'gain';
  } else if (currentWeight < previousWeight && omadOrFasted) {
    return 'loss-fasted';
  } else if (currentWeight < previousWeight) {
    return 'loss-regular';
  } else {
    return 'no-change';
  }
}

function getPreviousEntry(date) {
  const sorted = [...state.entries].sort((a, b) => new Date(b.date) - new Date(a.date));
  return sorted.find(e => e.date < date);
}

function recalculateChangeTypes() {
  state.entries.forEach((entry, index) => {
    if (index === 0) {
      entry.changeType = 'initial';
      entry.previousWeight = entry.weight;
    } else {
      const prev = state.entries[index - 1];
      entry.previousWeight = prev.weight;
      entry.changeType = getChangeType(entry.weight, prev.weight, entry.omadOrFasted);
    }
  });
}

// Projection
function calculateProjection() {
  if (state.entries.length < 2) {
    return { date: null, days: null, avgDailyLoss: 0 };
  }

  const now = new Date();
  const fourWeeksAgo = new Date(now);
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

  // Get entries from last 4 weeks
  const recentEntries = state.entries.filter(e => new Date(e.date) >= fourWeeksAgo);

  if (recentEntries.length < 2) {
    // Use all available data
    const sortedEntries = [...state.entries].sort((a, b) => new Date(a.date) - new Date(b.date));
    const oldest = sortedEntries[0];
    const newest = sortedEntries[sortedEntries.length - 1];
    const daysDiff = Math.max(1, (new Date(newest.date) - new Date(oldest.date)) / (1000 * 60 * 60 * 24));
    const weightChange = oldest.weight - newest.weight;
    const avgDailyLoss = weightChange / daysDiff;

    return calculateProjectionFromAvg(newest.weight, avgDailyLoss);
  }

  // Sort and calculate
  const sorted = recentEntries.sort((a, b) => new Date(a.date) - new Date(b.date));
  const oldest = sorted[0];
  const newest = sorted[sorted.length - 1];

  const daysDiff = Math.max(1, (new Date(newest.date) - new Date(oldest.date)) / (1000 * 60 * 60 * 24));
  const weightChange = oldest.weight - newest.weight;
  const avgDailyLoss = weightChange / daysDiff;

  return calculateProjectionFromAvg(newest.weight, avgDailyLoss);
}

function calculateProjectionFromAvg(currentWeight, avgDailyLoss) {
  const targetWeight = state.settings.targetWeight;

  if (currentWeight <= targetWeight) {
    return { date: new Date(), days: 0, avgDailyLoss, achieved: true };
  }

  if (avgDailyLoss <= 0) {
    return { date: null, days: null, avgDailyLoss, noProgress: true };
  }

  const weightToLose = currentWeight - targetWeight;
  const daysToTarget = Math.ceil(weightToLose / avgDailyLoss);

  const projectedDate = new Date();
  projectedDate.setDate(projectedDate.getDate() + daysToTarget);

  return { date: projectedDate, days: daysToTarget, avgDailyLoss };
}

// Celebration
function showCelebration() {
  const projection = calculateProjection();

  if (projection.achieved) {
    showGoalAchieved();
    return;
  }

  if (projection.noProgress || !projection.date) {
    elements.celebrationDate.textContent = 'Keep pushing!';
    elements.celebrationDays.textContent = 'Stay consistent for better projections';
  } else {
    elements.celebrationDate.textContent = formatDisplayDate(projection.date);
    elements.celebrationDays.textContent = `That's only ${projection.days} days away!`;
  }

  spawnConfetti();
  showModal(elements.celebrationModal);
}

function showGoalAchieved() {
  spawnConfetti();
  showModal(elements.goalModal);
}

function spawnConfetti() {
  const container = elements.confetti;
  container.innerHTML = '';

  const confettiItems = ['🌴', '🥥', '🍹', '🌺', '⭐', '🐚', '☀️', '🏖️'];

  for (let i = 0; i < 30; i++) {
    const confetti = document.createElement('span');
    confetti.className = 'confetti';
    confetti.textContent = confettiItems[Math.floor(Math.random() * confettiItems.length)];
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.animationDelay = Math.random() * 2 + 's';
    confetti.style.animationDuration = (2 + Math.random() * 2) + 's';
    container.appendChild(confetti);
  }
}

// Modal helpers
function showModal(modal) {
  modal.classList.remove('hidden');
}

function hideModal(modal) {
  modal.classList.add('hidden');
}

// Update displays
function updateAllDisplays() {
  updateUnitDisplays();
  updateQuickStats();
  updateProjectionDisplay();
  updateDateDisplay();
}

function updateQuickStats() {
  const unit = state.settings.unit;
  const currentWeight = getCurrentWeight();
  const targetWeight = state.settings.targetWeight;

  elements.currentWeightStat.textContent = currentWeight ? `${currentWeight.toFixed(1)} ${unit}` : '--';
  elements.targetWeightStat.textContent = targetWeight ? `${targetWeight.toFixed(1)} ${unit}` : '--';

  if (currentWeight && targetWeight) {
    const toGo = currentWeight - targetWeight;
    elements.toGoStat.textContent = toGo > 0 ? `${toGo.toFixed(1)} ${unit}` : 'Done!';
  } else {
    elements.toGoStat.textContent = '--';
  }
}

function updateProjectionDisplay() {
  const projection = calculateProjection();

  if (projection.achieved) {
    elements.projectionDate.textContent = 'Goal Achieved!';
    elements.projectionDays.textContent = 'Congratulations!';
  } else if (projection.noProgress || !projection.date) {
    elements.projectionDate.textContent = 'Keep going!';
    elements.projectionDays.textContent = 'More data needed';
  } else {
    elements.projectionDate.textContent = formatDisplayDate(projection.date);
    elements.projectionDays.textContent = `${projection.days} days to go`;
  }
}

function updateDateDisplay() {
  const dateDisplay = document.querySelector('.date-display');
  if (dateDisplay) {
    dateDisplay.textContent = formatDisplayDate(new Date());
  }
}

function getCurrentWeight() {
  if (state.entries.length === 0) return null;
  const sorted = [...state.entries].sort((a, b) => new Date(b.date) - new Date(a.date));
  return sorted[0].weight;
}

// History
function renderHistory() {
  const list = elements.historyList;
  list.innerHTML = '';

  if (state.entries.length === 0) {
    list.innerHTML = '<div class="no-entries">No entries yet. Start logging!</div>';
    return;
  }

  const sorted = [...state.entries].sort((a, b) => new Date(b.date) - new Date(a.date));
  const unit = state.settings.unit;

  sorted.forEach(entry => {
    const div = document.createElement('div');
    div.className = 'history-entry';
    div.onclick = () => openEditModal(entry);

    const dotColor = getColorForChangeType(entry.changeType);
    const change = entry.previousWeight ? entry.weight - entry.previousWeight : 0;
    const changeText = change === 0 ? '-' : (change > 0 ? `+${change.toFixed(1)}` : change.toFixed(1));
    const changeClass = change > 0 ? 'positive' : (change < 0 ? 'negative' : '');

    div.innerHTML = `
      <div class="entry-dot ${dotColor}"></div>
      <div class="entry-details">
        <div class="entry-weight">${entry.weight.toFixed(1)} ${unit}</div>
        <div class="entry-date">${formatDisplayDate(new Date(entry.date))}</div>
      </div>
      <div class="entry-badges">
        ${entry.omadOrFasted ? '<span class="badge">OMAD</span>' : ''}
      </div>
      <div class="entry-change">
        <span class="change-value ${changeClass}">${changeText}</span>
      </div>
    `;

    list.appendChild(div);
  });
}

function getColorForChangeType(changeType) {
  switch (changeType) {
    case 'loss-fasted': return 'green';
    case 'loss-regular': return 'orange';
    case 'gain': return 'red';
    default: return 'gray';
  }
}

// Edit Entry
let editingEntryId = null;

function openEditModal(entry) {
  editingEntryId = entry.id;
  elements.editWeight.value = entry.weight;
  elements.editOmad.checked = entry.omadOrFasted;
  elements.editDate.value = entry.date;
  showModal(elements.editModal);
}

function handleEditSave() {
  const index = state.entries.findIndex(e => e.id === editingEntryId);
  if (index === -1) return;

  state.entries[index].weight = parseFloat(elements.editWeight.value);
  state.entries[index].omadOrFasted = elements.editOmad.checked;
  state.entries[index].date = elements.editDate.value;

  // Resort and recalculate
  state.entries.sort((a, b) => new Date(a.date) - new Date(b.date));
  recalculateChangeTypes();

  saveState();
  hideModal(elements.editModal);
  renderHistory();
  updateAllDisplays();
}

function handleEditDelete() {
  if (!confirm('Delete this entry?')) return;

  state.entries = state.entries.filter(e => e.id !== editingEntryId);
  recalculateChangeTypes();

  saveState();
  hideModal(elements.editModal);
  renderHistory();
  updateAllDisplays();
}

// Settings
function populateSettings() {
  elements.settingsTargetWeight.value = state.settings.targetWeight || '';
  elements.settingsUnit.value = state.settings.unit;
  elements.settingsTargetDate.value = state.settings.targetDate || '';
}

function handleSaveSettings() {
  state.settings.targetWeight = parseFloat(elements.settingsTargetWeight.value);
  state.settings.unit = elements.settingsUnit.value;
  state.settings.targetDate = elements.settingsTargetDate.value || null;

  saveState();
  updateAllDisplays();
  alert('Settings saved!');
}

function handleResetApp() {
  if (!confirm('Are you sure you want to delete all data? This cannot be undone!')) return;
  if (!confirm('Really delete everything?')) return;

  localStorage.removeItem('beachBodyState');
  location.reload();
}

// Chart
let chartInstance = null;

function renderChart() {
  const canvas = document.getElementById('weight-chart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  // Destroy existing chart
  if (chartInstance) {
    chartInstance.destroy();
  }

  if (state.entries.length === 0) {
    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#666';
    ctx.textAlign = 'center';
    ctx.fillText('No data yet', canvas.width / 2, canvas.height / 2);
    return;
  }

  const sorted = [...state.entries].sort((a, b) => new Date(a.date) - new Date(b.date));

  // Prepare data
  const labels = sorted.map(e => formatShortDate(new Date(e.date)));
  const weights = sorted.map(e => e.weight);
  const colors = sorted.map(e => {
    switch (e.changeType) {
      case 'loss-fasted': return '#2ecc71';
      case 'loss-regular': return '#f39c12';
      case 'gain': return '#e74c3c';
      default: return '#95a5a6';
    }
  });

  // Add projection data
  const projection = calculateProjection();
  const projectionLabels = [...labels];
  const projectionData = new Array(weights.length).fill(null);

  if (projection.date && !projection.achieved && !projection.noProgress) {
    // Add projection point
    projectionLabels.push(formatShortDate(projection.date));
    projectionData.push(null);
    projectionData[projectionData.length - 2] = weights[weights.length - 1];
    projectionData[projectionData.length - 1] = state.settings.targetWeight;
  }

  // Simple canvas chart (no external library needed)
  drawChart(ctx, canvas, {
    labels: projectionLabels,
    weights,
    colors,
    projectionData,
    targetWeight: state.settings.targetWeight
  });
}

function drawChart(ctx, canvas, data) {
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const width = canvas.width = canvas.offsetWidth * 2;
  const height = canvas.height = canvas.offsetHeight * 2;
  ctx.scale(1, 1);

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Clear
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, width, height);

  if (data.weights.length === 0) return;

  // Calculate scales
  const allWeights = [...data.weights, data.targetWeight].filter(w => w != null);
  const minWeight = Math.min(...allWeights) - 2;
  const maxWeight = Math.max(...allWeights) + 2;
  const weightRange = maxWeight - minWeight;

  const xStep = chartWidth / Math.max(1, data.labels.length - 1);

  const scaleY = (weight) => {
    return padding.top + chartHeight - ((weight - minWeight) / weightRange) * chartHeight;
  };

  const scaleX = (index) => {
    return padding.left + index * xStep;
  };

  // Draw grid
  ctx.strokeStyle = '#eee';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const y = padding.top + (chartHeight / 5) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
  }

  // Draw target line
  if (data.targetWeight) {
    const targetY = scaleY(data.targetWeight);
    ctx.strokeStyle = '#48c9b0';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(padding.left, targetY);
    ctx.lineTo(width - padding.right, targetY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#48c9b0';
    ctx.font = '20px sans-serif';
    ctx.fillText('Target', width - padding.right - 50, targetY - 5);
  }

  // Draw projection line
  if (data.projectionData.some(d => d != null)) {
    ctx.strokeStyle = '#48c9b0';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();

    let started = false;
    data.projectionData.forEach((weight, i) => {
      if (weight != null) {
        const x = scaleX(i);
        const y = scaleY(weight);
        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else {
          ctx.lineTo(x, y);
        }
      }
    });
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Draw weight line
  ctx.strokeStyle = '#2e86ab';
  ctx.lineWidth = 3;
  ctx.beginPath();
  data.weights.forEach((weight, i) => {
    const x = scaleX(i);
    const y = scaleY(weight);
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.stroke();

  // Draw points
  data.weights.forEach((weight, i) => {
    const x = scaleX(i);
    const y = scaleY(weight);

    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fillStyle = data.colors[i];
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  // Draw labels
  ctx.fillStyle = '#666';
  ctx.font = '18px sans-serif';
  ctx.textAlign = 'center';

  // X-axis labels (show first, last, and a few in between)
  const labelStep = Math.max(1, Math.floor(data.labels.length / 5));
  data.labels.forEach((label, i) => {
    if (i === 0 || i === data.labels.length - 1 || i % labelStep === 0) {
      const x = scaleX(i);
      ctx.fillText(label, x, height - padding.bottom + 25);
    }
  });

  // Y-axis labels
  ctx.textAlign = 'right';
  for (let i = 0; i <= 5; i++) {
    const weight = minWeight + (weightRange / 5) * (5 - i);
    const y = padding.top + (chartHeight / 5) * i;
    ctx.fillText(weight.toFixed(1), padding.left - 10, y + 5);
  }
}

// Utility functions
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDateForInput(date) {
  return date.toISOString().split('T')[0];
}

function formatDisplayDate(date) {
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function formatShortDate(date) {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short'
  });
}

// Service Worker
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Service Worker registered'))
      .catch(err => console.log('Service Worker registration failed:', err));
  }
}
