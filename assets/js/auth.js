/**
 * Qiskit Fall Fest ITS 2026 - Participant Portal & Authentication (Custom Database Ready)
 */

document.addEventListener('DOMContentLoaded', () => {
  const tabLogin = document.getElementById('tab-login-btn');
  const tabRegister = document.getElementById('tab-register-btn');
  const formLogin = document.getElementById('form-login');
  const formRegister = document.getElementById('form-register');
  const alertBox = document.getElementById('auth-alert');

  function showAlert(message, isSuccess = true) {
    if (!alertBox) return;
    alertBox.textContent = message;
    alertBox.className = `p-4 mb-4 rounded-xl text-sm font-medium transition-all duration-300 ${
      isSuccess 
        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm' 
        : 'bg-rose-50 text-rose-800 border border-rose-200 shadow-sm'
    }`;
    alertBox.classList.remove('hidden');
    setTimeout(() => {
      alertBox.classList.add('hidden');
    }, 5000);
  }

  // 1. Tab Switcher
  if (tabLogin && tabRegister && formLogin && formRegister) {
    tabLogin.addEventListener('click', () => {
      tabLogin.classList.add('bg-[#002868]', 'text-white', 'shadow-sm');
      tabLogin.classList.remove('bg-transparent', 'text-slate-600', 'hover:text-[#002868]');

      tabRegister.classList.remove('bg-[#002868]', 'text-white', 'shadow-sm');
      tabRegister.classList.add('bg-transparent', 'text-slate-600', 'hover:text-[#002868]');

      formLogin.classList.remove('hidden');
      formRegister.classList.add('hidden');
    });

    tabRegister.addEventListener('click', () => {
      tabRegister.classList.add('bg-[#002868]', 'text-white', 'shadow-sm');
      tabRegister.classList.remove('bg-transparent', 'text-slate-600', 'hover:text-[#002868]');

      tabLogin.classList.remove('bg-[#002868]', 'text-white', 'shadow-sm');
      tabLogin.classList.add('bg-transparent', 'text-slate-600', 'hover:text-[#002868]');

      formRegister.classList.remove('hidden');
      formLogin.classList.add('hidden');
    });
  }

  // 2. Form Submission Handlers
  if (formLogin) {
    formLogin.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email')?.value || 'Participant';
      const submitBtn = formLogin.querySelector('button[type="submit"]');
      
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="inline-block animate-spin mr-2">🔄</span> Verifying Credentials...';
      }

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Sign In to Portal 🚀';
        }
        showAlert(`Welcome back! Quantum computing session active for ${email}.`, true);
      }, 1200);
    });
  }

  if (formRegister) {
    formRegister.addEventListener('submit', (e) => {
      e.preventDefault();
      const fullname = document.getElementById('reg-fullname')?.value || 'Participant';
      const submitBtn = formRegister.querySelector('button[type="submit"]');
      
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="inline-block animate-spin mr-2">🔄</span> Registering Participant Profile...';
      }

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Create Account ★';
        }
        showAlert(`Registration successful! Welcome to Qiskit Fall Fest ITS 2026, ${fullname}. Please check your email for confirmation.`, true);
        formRegister.reset();
      }, 1500);
    });
  }

  // 3. Social SSO Handlers
  const ssoButtons = document.querySelectorAll('.sso-btn');
  ssoButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const provider = btn.getAttribute('data-provider') || 'Single Sign-On';
      showAlert(`Connecting to ${provider} authentication... (Custom database sandbox)`, true);
    });
  });
});

