/**
 * Vigil Security System — Training Page Script (training.html)
 */

let currentFilter = 'All';
let isTrainingActive = true;
let trainingInterval = null;
let currentEpoch = 150;
const maxEpochs = 200;

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search');
  if (searchInput) {
    searchInput.addEventListener('input', filterPeople);
  }

  // Setup GPU buttons
  const stopBtn = document.querySelector('.gpu-buttons button:not(.resume)');
  const resumeBtn = document.querySelector('.gpu-buttons .resume');

  if (stopBtn) {
    stopBtn.addEventListener('click', stopTraining);
  }
  if (resumeBtn) {
    resumeBtn.addEventListener('click', resumeTraining);
  }

  // Start background log simulation
  startLogSimulation();
});

/**
 * Filter people by category tag
 * @param {string} type 
 * @param {HTMLElement} button 
 */
function setFilter(type, button) {
  currentFilter = type;
  document.querySelectorAll('.filters button').forEach(b => b.classList.remove('selected'));
  if (button) {
    button.classList.add('selected');
  }
  filterPeople();
}

/**
 * Filter people cards by search query and active category
 */
function filterPeople() {
  const searchEl = document.getElementById('search');
  const query = searchEl ? searchEl.value.toLowerCase().trim() : '';

  document.querySelectorAll('.person-card').forEach(card => {
    const cardType = card.dataset.type || '';
    const cardName = (card.dataset.name || '').toLowerCase();

    const matchesType = currentFilter === 'All' || cardType.toLowerCase() === currentFilter.toLowerCase();
    const matchesSearch = cardName.includes(query);

    card.style.display = matchesType && matchesSearch ? 'block' : 'none';
  });
}

/**
 * Start training console log stream simulation
 */
function startLogSimulation() {
  if (trainingInterval) clearInterval(trainingInterval);

  trainingInterval = setInterval(() => {
    if (!isTrainingActive || currentEpoch >= maxEpochs) return;

    currentEpoch++;
    const consoleEl = document.querySelector('.console');
    const progressBar = document.querySelector('.progress span');
    const epochStat = document.querySelector('.model-stats div:nth-child(5) b');

    const loss = (0.0234 - (currentEpoch - 150) * 0.0001).toFixed(4);
    const mAP = (0.947 + (currentEpoch - 150) * 0.0002).toFixed(3);

    if (consoleEl) {
      const newLine = document.createElement('div');
      newLine.className = 'current';
      newLine.textContent = `Epoch ${currentEpoch}/${maxEpochs} - Loss: ${loss} - mAP: ${mAP} - LR: 0.0001`;

      // Demote previous current line
      const prevCurrent = consoleEl.querySelector('.current');
      if (prevCurrent && prevCurrent !== newLine) {
        prevCurrent.classList.remove('current');
      }

      consoleEl.appendChild(newLine);
      consoleEl.scrollTop = consoleEl.scrollHeight;
    }

    if (progressBar) {
      const pct = Math.min(100, Math.round((currentEpoch / maxEpochs) * 100));
      progressBar.style.width = `${pct}%`;
      const gpuPct = document.querySelector('.gpu-top strong');
      if (gpuPct) gpuPct.textContent = `${pct}%`;
    }

    if (epochStat) {
      epochStat.textContent = `${currentEpoch} / ${maxEpochs}`;
    }
  }, 4000);
}

/**
 * Stop GPU Training
 */
function stopTraining() {
  isTrainingActive = false;
  const activePill = document.querySelector('.active-pill');
  if (activePill) {
    activePill.textContent = 'TRAINING PAUSED';
    activePill.style.background = 'rgba(239, 68, 68, 0.2)';
    activePill.style.borderColor = '#ef4444';
    activePill.style.color = '#f87171';
  }
  if (typeof showToast === 'function') {
    showToast('GPU Training paused');
  }
}

/**
 * Resume GPU Training
 */
function resumeTraining() {
  isTrainingActive = true;
  const activePill = document.querySelector('.active-pill');
  if (activePill) {
    activePill.textContent = 'TRAINING ACTIVE';
    activePill.style.background = 'rgba(38, 166, 154, 0.2)';
    activePill.style.borderColor = '#26a69a';
    activePill.style.color = '#4db6ac';
  }
  if (typeof showToast === 'function') {
    showToast('GPU Training resumed');
  }
}
