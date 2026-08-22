/**
 * Qiskit Fall Fest ITS 2026 - Schedule & Countdown Script
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Countdown Timer (Target: October 15, 2026)
  const targetDate = new Date('2026-10-15T09:00:00+07:00').getTime();

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    const daysEl = document.getElementById('cd-days');
    const hoursEl = document.getElementById('cd-hours');
    const minutesEl = document.getElementById('cd-minutes');
    const secondsEl = document.getElementById('cd-seconds');

    if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

    if (distance < 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');
  }

  setInterval(updateCountdown, 1000);
  updateCountdown();

  // 2. Schedule Category Filter
  const filterBtns = document.querySelectorAll('.schedule-filter-btn');
  const eventCards = document.querySelectorAll('.timeline-event-card');

  if (filterBtns.length > 0 && eventCards.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Active button styling
        filterBtns.forEach(b => {
          b.classList.remove('bg-cyan-500', 'text-black', 'border-cyan-400');
          b.classList.add('bg-slate-800/80', 'text-slate-300', 'border-slate-700');
        });
        btn.classList.remove('bg-slate-800/80', 'text-slate-300', 'border-slate-700');
        btn.classList.add('bg-cyan-500', 'text-black', 'border-cyan-400');

        const category = btn.getAttribute('data-filter');

        eventCards.forEach(card => {
          const cardCategory = card.getAttribute('data-category');
          if (category === 'all' || cardCategory === category) {
            card.style.display = 'block';
            card.classList.add('animate-fadeIn');
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // 3. Event Detail Modal
  const modal = document.getElementById('event-detail-modal');
  const modalTitle = document.getElementById('modal-event-title');
  const modalDate = document.getElementById('modal-event-date');
  const modalTime = document.getElementById('modal-event-time');
  const modalType = document.getElementById('modal-event-type');
  const modalDesc = document.getElementById('modal-event-desc');
  const modalSpeaker = document.getElementById('modal-event-speaker');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  const detailButtons = document.querySelectorAll('.view-detail-btn');
  detailButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (!modal) return;
      
      const title = btn.getAttribute('data-title') || '';
      const date = btn.getAttribute('data-date') || '';
      const time = btn.getAttribute('data-time') || '';
      const type = btn.getAttribute('data-type') || '';
      const desc = btn.getAttribute('data-desc') || '';
      const speaker = btn.getAttribute('data-speaker') || '';

      if (modalTitle) modalTitle.textContent = title;
      if (modalDate) modalDate.textContent = date;
      if (modalTime) modalTime.textContent = time;
      if (modalType) modalType.textContent = type;
      if (modalDesc) modalDesc.textContent = desc;
      if (modalSpeaker) modalSpeaker.textContent = speaker;

      modal.classList.remove('hidden');
      modal.classList.add('flex');
    });
  });

  if (modalCloseBtn && modal) {
    modalCloseBtn.addEventListener('click', () => {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
    });
  }
});
