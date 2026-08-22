/**
 * Qiskit Fall Fest ITS 2026 - Participant Portal & Authentication
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
        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/10' 
        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-lg shadow-rose-500/10'
    }`;
    alertBox.classList.remove('hidden');
    setTimeout(() => {
      alertBox.classList.add('hidden');
    }, 5000);
  }

  // 1. Tab Switcher
  if (tabLogin && tabRegister && formLogin && formRegister) {
    tabLogin.addEventListener('click', () => {
      tabLogin.classList.add('bg-cyan-500', 'text-black', 'shadow-lg', 'shadow-cyan-500/30');
      tabLogin.classList.remove('text-slate-400', 'hover:text-white');

      tabRegister.classList.remove('bg-cyan-500', 'text-black', 'shadow-lg', 'shadow-cyan-500/30');
      tabRegister.classList.add('text-slate-400', 'hover:text-white');

      formLogin.classList.remove('hidden');
      formRegister.classList.add('hidden');
    });

    tabRegister.addEventListener('click', () => {
      tabRegister.classList.add('bg-cyan-500', 'text-black', 'shadow-lg', 'shadow-cyan-500/30');
      tabRegister.classList.remove('text-slate-400', 'hover:text-white');

      tabLogin.classList.remove('bg-cyan-500', 'text-black', 'shadow-lg', 'shadow-cyan-500/30');
      tabLogin.classList.add('text-slate-400', 'hover:text-white');

      formRegister.classList.remove('hidden');
      formLogin.classList.add('hidden');
    });
  }

  // 2. Mock Form Submission Handlers
  if (formLogin) {
    formLogin.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const submitBtn = formLogin.querySelector('button[type="submit"]');
      
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="inline-block animate-spin mr-2">🔄</span> Memverifikasi Kredensial...';

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Masuk ke Portal 🚀';
        showAlert(`Selamat datang kembali! Sesi komputasi kuantum aktif untuk ${email}.`, true);
      }, 1200);
    });
  }

  if (formRegister) {
    formRegister.addEventListener('submit', (e) => {
      e.preventDefault();
      const fullname = document.getElementById('reg-fullname').value;
      const submitBtn = formRegister.querySelector('button[type="submit"]');
      
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="inline-block animate-spin mr-2">🔄</span> Mendaftarkan Qubit ID...';

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Daftar Sekarang ★';
        showAlert(`Pendaftaran berhasil! Selamat bergabung di Qiskit Fall Fest ITS 2026, ${fullname}. Silakan cek email aktivasi Anda.`, true);
        formRegister.reset();
      }, 1500);
    });
  }

  // 3. Social SSO Mock
  const ssoButtons = document.querySelectorAll('.sso-btn');
  ssoButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const provider = btn.getAttribute('data-provider');
      showAlert(`Menghubungkan ke otentikasi ${provider}... (Portal simulasi Qiskit Fall Fest 2026)`, true);
    });
  });
});
