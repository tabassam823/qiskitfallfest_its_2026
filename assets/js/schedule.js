/**
 * Qiskit Fall Fest ITS 2026 - Clean Schedule Script (Lightweight)
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Schedule Category Filter
  const filterBtns = document.querySelectorAll('.schedule-filter-btn');
  const eventCards = document.querySelectorAll('.timeline-event-card');

  if (filterBtns.length > 0 && eventCards.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => {
          b.classList.remove('bg-[#002868]', 'text-white', 'border-[#002868]');
          b.classList.add('bg-white', 'text-slate-700', 'border-slate-300');
        });
        btn.classList.remove('bg-white', 'text-slate-700', 'border-slate-300');
        btn.classList.add('bg-[#002868]', 'text-white', 'border-[#002868]');

        const category = btn.getAttribute('data-filter');

        eventCards.forEach(card => {
          const cardCategory = card.getAttribute('data-category');
          if (category === 'all' || cardCategory === category) {
            card.style.display = 'block';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // 2. Event Detail Modal
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
