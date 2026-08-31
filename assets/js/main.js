/**
 * Qiskit Fall Fest ITS 2026 - Main UI Interactions & Font Switcher Previewer
 */

// Immediate font application from localStorage


document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
      const isExpanded = !mobileMenu.classList.contains('hidden');
      mobileMenuBtn.setAttribute('aria-expanded', isExpanded);
    });

    document.addEventListener('click', (e) => {
      if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target) && !mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
      }
    });
  }

  // 2. Highlight Active Navigation Links
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // 3. Back to Top Button
  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        backToTopBtn.classList.remove('opacity-0', 'pointer-events-none');
        backToTopBtn.classList.add('opacity-100');
      } else {
        backToTopBtn.classList.add('opacity-0', 'pointer-events-none');
        backToTopBtn.classList.remove('opacity-100');
      }
    }, { passive: true });

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // 4. Interactive Font Switcher Previewer Widget

});

function initFontSwitcher() {
  const fontOptions = [
    { key: 'outfit', name: 'Outfit (Recommended)', tag: 'Soft & Modern' },
    { key: 'dm-sans', name: 'DM Sans', tag: 'Clean & Warm' },
    { key: 'manrope', name: 'Manrope', tag: 'Tech & Sleek' },
    { key: 'poppins', name: 'Poppins', tag: 'Soft & Rounded' },
    { key: 'plus-jakarta', name: 'Plus Jakarta Sans', tag: 'Original Geometric' }
  ];

  let currentFont = localStorage.getItem('qiskit_font_choice') || 'outfit';

  const widget = document.createElement('div');
  widget.className = 'font-switcher-widget';
  widget.id = 'font-switcher-widget';

  const button = document.createElement('button');
  button.className = 'font-switcher-btn';
  button.type = 'button';
  button.setAttribute('aria-label', 'Switch typography preview');
  
  const currentObj = fontOptions.find(f => f.key === currentFont) || fontOptions[0];
  button.innerHTML = `<span>🎨 Font: <strong>${currentObj.name.split(' ')[0]}</strong></span> <span class="text-xs opacity-70">▾</span>`;

  const dropdown = document.createElement('div');
  dropdown.className = 'font-switcher-dropdown hidden';

  const header = document.createElement('div');
  header.className = 'px-2 py-1 text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 mb-1 flex justify-between items-center';
  header.innerHTML = '<span>Preview Soft Fonts</span><span class="text-[10px] text-blue-600 font-normal">Live Preview</span>';
  dropdown.appendChild(header);

  fontOptions.forEach(opt => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = `font-switcher-item ${opt.key === currentFont ? 'active' : ''}`;
    item.innerHTML = `
      <div class="text-left">
        <div class="font-bold leading-snug">${opt.name}</div>
        <div class="text-[10px] opacity-75 font-mono">${opt.tag}</div>
      </div>
      <div class="text-sm font-bold opacity-80">${opt.key === currentFont ? '✓' : ''}</div>
    `;

    item.addEventListener('click', () => {
      currentFont = opt.key;
      localStorage.setItem('qiskit_font_choice', currentFont);
      document.documentElement.setAttribute('data-font', currentFont);
      
      button.innerHTML = `<span>🎨 Font: <strong>${opt.name.split(' ')[0]}</strong></span> <span class="text-xs opacity-70">▾</span>`;
      
      dropdown.querySelectorAll('.font-switcher-item').forEach((it, idx) => {
        if (fontOptions[idx].key === currentFont) {
          it.classList.add('active');
          it.querySelector('div:last-child').textContent = '✓';
        } else {
          it.classList.remove('active');
          it.querySelector('div:last-child').textContent = '';
        }
      });

      dropdown.classList.add('hidden');
    });

    dropdown.appendChild(item);
  });

  button.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('hidden');
  });

  document.addEventListener('click', (e) => {
    if (!widget.contains(e.target)) {
      dropdown.classList.add('hidden');
    }
  });

  widget.appendChild(dropdown);
  widget.appendChild(button);
  document.body.appendChild(widget);
}

