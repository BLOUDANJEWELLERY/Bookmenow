document.addEventListener('DOMContentLoaded', () => {
  const allDropdowns = document.querySelectorAll('.custom-dropdown');

  allDropdowns.forEach(dropdown => {
    const selectedBox = dropdown.querySelector('.selected');
    const hiddenInput = dropdown.querySelector('input[type="hidden"]');
    const overlay = dropdown.querySelector('.dropdown-overlay');
    const options = overlay.querySelectorAll('li');

    selectedBox.addEventListener('click', () => {
      document.querySelectorAll('.dropdown-overlay').forEach(o => o.style.display = 'none');
      overlay.style.display = 'flex';
    });

    options.forEach(option => {
      option.addEventListener('click', () => {
        selectedBox.textContent = option.textContent;
        hiddenInput.value = option.dataset.value;

        options.forEach(opt => opt.classList.remove('selected-option'));
        option.classList.add('selected-option');

        overlay.style.display = 'none';
      });
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.style.display = 'none';
      }
    });
  });
});