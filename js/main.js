/**
 * Vigil Security System — Shared Main Script
 */

document.addEventListener('DOMContentLoaded', () => {
  // Automatically highlight current active nav pill if not already active
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-pills a');

  navLinks.forEach(link => {
    const linkHref = link.getAttribute('href');
    if (linkHref === currentPath) {
      link.classList.add('active');
    }
  });
});

/**
 * Utility toast notification
 * @param {string} message 
 * @param {'info' | 'success' | 'warning'} type 
 */
function showToast(message, type = 'info') {
  let toast = document.getElementById('vigil-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'vigil-toast';
    toast.style.position = 'fixed';
    toast.style.bottom = '24px';
    toast.style.right = '24px';
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '999px';
    toast.style.background = '#111';
    toast.style.color = '#fff';
    toast.style.fontSize = '0.85rem';
    toast.style.fontWeight = '600';
    toast.style.boxShadow = '0 4px 16px rgba(0,0,0,0.2)';
    toast.style.zIndex = '9999';
    toast.style.transition = 'all 0.25s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
  }, 2500);
}
