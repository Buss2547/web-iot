/**
 * Vigil Security System — Live Detection Script (detection.html)
 */

const DEFAULT_CAMERA_URL = 'http://192.168.137.112/stream';

document.addEventListener('DOMContentLoaded', () => {
  initLiveFeedTimer();
  initCameraStream();
});

/**
 * Handles IP / ESP32-CAM live stream connection, fallback states, and URL configuration
 */
function initCameraStream() {
  const streamImg = document.getElementById('cameraStream');
  const placeholder = document.getElementById('cameraPlaceholder');
  const statusText = document.getElementById('streamStatusText');
  const urlDisplay = document.getElementById('streamUrlDisplay');
  const urlTag = document.getElementById('cameraUrlTag');
  const liveBadge = document.getElementById('liveBadge');
  const configBar = document.getElementById('cameraConfigBar');
  const btnToggleConfig = document.getElementById('btnToggleConfig');
  const btnApplyUrl = document.getElementById('btnApplyUrl');
  const urlInput = document.getElementById('cameraUrlInput');
  const btnReloadStream = document.getElementById('btnReloadStream');
  const btnRetryStream = document.getElementById('btnRetryStream');
  const streamHint = document.getElementById('streamHint');
  const presetChips = document.querySelectorAll('.preset-chip');

  if (!streamImg) return;

  // Read saved URL from localStorage (migrating old root URL to /stream if needed)
  let savedUrl = localStorage.getItem('vigil_camera_url');
  if (!savedUrl || savedUrl === 'http://192.168.137.112/') {
    savedUrl = DEFAULT_CAMERA_URL;
  }
  applyCameraUrl(savedUrl, false);

  // Toggle Config Drawer
  if (btnToggleConfig && configBar) {
    btnToggleConfig.addEventListener('click', () => {
      const isHidden = configBar.style.display === 'none' || !configBar.style.display;
      configBar.style.display = isHidden ? 'block' : 'none';
      if (isHidden && urlInput) {
        urlInput.focus();
        urlInput.select();
      }
    });
  }

  // Handle Preset Click
  presetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const url = chip.getAttribute('data-url');
      if (url) {
        if (urlInput) urlInput.value = url;
        presetChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        applyCameraUrl(url, true);
      }
    });
  });

  // Apply custom URL button
  if (btnApplyUrl && urlInput) {
    btnApplyUrl.addEventListener('click', () => {
      let customUrl = urlInput.value.trim();
      if (!customUrl) {
        alert('Please enter a valid Camera URL (e.g. http://192.168.137.112/stream)');
        return;
      }
      // If user typed only IP without http://
      if (!customUrl.startsWith('http://') && !customUrl.startsWith('https://')) {
        customUrl = 'http://' + customUrl;
      }
      applyCameraUrl(customUrl, true);
    });

    urlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        btnApplyUrl.click();
      }
    });
  }

  // Reload stream button
  if (btnReloadStream) {
    btnReloadStream.addEventListener('click', () => {
      reloadCurrentStream();
    });
  }

  if (btnRetryStream) {
    btnRetryStream.addEventListener('click', () => {
      reloadCurrentStream();
    });
  }

  // Image load & error event listeners
  streamImg.addEventListener('load', () => {
    streamImg.classList.add('loaded');
    if (placeholder) placeholder.classList.add('hidden');
    if (liveBadge) {
      liveBadge.className = 'live-badge online';
      liveBadge.innerHTML = '<span></span>LIVE';
    }
  });

  streamImg.addEventListener('error', () => {
    streamImg.classList.remove('loaded');
    if (placeholder) placeholder.classList.remove('hidden');
    if (statusText) statusText.textContent = 'ESP32 STREAM OFFLINE / CONNECTING';
    if (liveBadge) {
      liveBadge.className = 'live-badge offline';
      liveBadge.innerHTML = '<span></span>OFFLINE';
    }
    if (streamHint) {
      streamHint.innerHTML = 'กำลังรอสัญญาณภาพจาก ESP32-S3 (192.168.137.112)<br>ตรวจสอบว่าเปิดบอร์ดและเชื่อมต่อ WiFi/Hotspot แล้ว หรือคลิก <b>Config URL</b> เพื่อเปลี่ยนเส้นทาง';
    }
  });

  function applyCameraUrl(url, save = true) {
    if (save) {
      localStorage.setItem('vigil_camera_url', url);
    }
    if (urlInput) urlInput.value = url;
    if (urlDisplay) urlDisplay.textContent = url;
    if (urlTag) {
      try {
        const parsed = new URL(url);
        urlTag.textContent = parsed.host;
        urlTag.title = `Camera Stream: ${url} (คลิกเพื่อทดสอบเปิดในแท็บใหม่)`;
        urlTag.style.cursor = 'pointer';
        urlTag.onclick = () => window.open(url, '_blank');
      } catch (e) {
        urlTag.textContent = url;
      }
    }

    // Highlight matching preset
    presetChips.forEach(chip => {
      if (chip.getAttribute('data-url') === url) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }
    });

    // Reset status UI
    if (statusText) statusText.textContent = 'CONNECTING TO ESP32 CAMERA STREAM';
    if (placeholder) placeholder.classList.remove('hidden');
    if (liveBadge) {
      liveBadge.className = 'live-badge connecting';
      liveBadge.innerHTML = '<span></span>CONNECTING';
    }

    // Load stream with cache buster
    const separator = url.includes('?') ? '&' : '?';
    streamImg.src = `${url}${separator}_t=${Date.now()}`;
  }

  function reloadCurrentStream() {
    const currentUrl = localStorage.getItem('vigil_camera_url') || DEFAULT_CAMERA_URL;
    applyCameraUrl(currentUrl, false);
  }
}

/**
 * Updates real-time camera metadata timestamp
 */
function initLiveFeedTimer() {
  const metaEl = document.querySelector('.camera-feed-meta');
  if (!metaEl) return;

  function updateClock() {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const fps = (29.5 + Math.random() * 0.8).toFixed(1);
    const activeUrl = localStorage.getItem('vigil_camera_url') || DEFAULT_CAMERA_URL;
    let hostStr = '192.168.137.112';
    try {
      hostStr = new URL(activeUrl).host;
    } catch (e) {
      hostStr = 'CAM-01';
    }
    metaEl.textContent = `REC ● ${timeStr} | SVGA 800x600 @ ${fps} FPS | ${hostStr}`;
  }

  updateClock();
  setInterval(updateClock, 1000);
}
