/**
 * Vigil Security System — Alerts Page Script (alerts.html)
 */

let showingUnreadOnly = false;

document.addEventListener('DOMContentLoaded', () => {
  const filterBtn = document.getElementById('filterBtn');
  if (filterBtn) {
    filterBtn.addEventListener('click', toggleAlertsFilter);
  }

  // Allow clicking on alert rows to toggle read/unread status
  document.querySelectorAll('.alert-row').forEach(row => {
    row.addEventListener('click', () => {
      row.classList.toggle('unread');
      if (showingUnreadOnly && !row.classList.contains('unread')) {
        row.classList.add('hidden');
      }
    });
  });
});

/**
 * Toggles between showing all alerts and showing unread only
 */
function toggleAlertsFilter() {
  showingUnreadOnly = !showingUnreadOnly;
  const btn = document.getElementById('filterBtn');
  
  if (btn) {
    btn.textContent = showingUnreadOnly ? 'SHOW ALL' : 'SHOW UNREAD';
    btn.classList.toggle('active', showingUnreadOnly);
  }

  document.querySelectorAll('.alert-row').forEach(row => {
    if (showingUnreadOnly) {
      row.classList.toggle('hidden', !row.classList.contains('unread'));
    } else {
      row.classList.remove('hidden');
    }
  });
}
