/**
 * Vigil Security System — Register New Person Script (add-person.html)
 */

document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('files');
  const previewBox = document.getElementById('preview');
  const countEl = document.getElementById('imageCount');

  // Classification label selector buttons
  const labelButtons = document.querySelectorAll('.label-btn');
  labelButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      labelButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Handle file uploads
  if (fileInput) {
    fileInput.addEventListener('change', () => {
      const files = fileInput.files;
      const count = files.length;
      if (countEl) {
        countEl.textContent = `${count} / 15 min`;
      }

      if (count > 0 && previewBox) {
        previewBox.innerHTML = `
          <div style="display:flex; flex-direction:column; align-items:center; gap:8px;">
            <span style="font-size:1.8rem; color:var(--green)">✓</span>
            <b>${count} image(s) selected</b>
            <p style="font-size:0.8rem; color:var(--muted); margin:0;">
              Ready to extract facial landmark embeddings and train YOLOv8 weights.
            </p>
          </div>
        `;
        previewBox.style.borderColor = 'var(--green)';
        previewBox.style.background = 'var(--green-bg)';
      }
    });
  }
});

/**
 * Handle Save Person and trigger training redirect
 */
function savePerson() {
  const nameInput = document.getElementById('fullName');
  const fileInput = document.getElementById('files');
  const name = nameInput ? nameInput.value.trim() : '';

  if (!name) {
    alert('Please enter a Full Name for this person.');
    if (nameInput) nameInput.focus();
    return;
  }

  const fileCount = fileInput && fileInput.files ? fileInput.files.length : 0;
  if (fileCount < 1) {
    alert('Please add at least 1 image for training demo.');
    return;
  }

  const activeLabel = document.querySelector('.label-btn.active');
  const labelText = activeLabel ? activeLabel.textContent.trim() : 'Employee';

  alert(`✓ Person "${name}" registered as [${labelText}] with ${fileCount} images.\nTraining pipeline initiated!`);
  window.location.href = 'training.html';
}

/**
 * Start webcam live capture simulation
 */
function startCamera() {
  const countEl = document.getElementById('imageCount');
  const previewBox = document.getElementById('preview');

  alert('Webcam Capture Mode: Simulating 15 rapid facial capture frames...');
  
  if (countEl) {
    countEl.textContent = '15 / 15 min';
  }

  if (previewBox) {
    previewBox.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; gap:8px;">
        <span style="font-size:1.8rem; color:var(--green)">◉</span>
        <b>15 frames captured via live camera</b>
        <p style="font-size:0.8rem; color:var(--muted); margin:0;">
          All frames successfully aligned and normalized.
        </p>
      </div>
    `;
    previewBox.style.borderColor = 'var(--green)';
    previewBox.style.background = 'var(--green-bg)';
  }
}
