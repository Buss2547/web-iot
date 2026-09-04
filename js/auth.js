/**
 * Vigil Security System — Authentication Script (login.html & signup.html)
 */

document.addEventListener('DOMContentLoaded', () => {
  const authForm = document.getElementById('authForm');

  if (authForm) {
    authForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const submitBtn = authForm.querySelector('.auth-btn');
      if (submitBtn) {
        submitBtn.textContent = 'AUTHENTICATING...';
        submitBtn.style.opacity = '0.8';
        submitBtn.disabled = true;
      }

      setTimeout(() => {
        window.location.href = 'detection.html';
      }, 500);
    });
  }
});
