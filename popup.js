const buttons = document.querySelectorAll('.segmented button');
const status = document.getElementById('status');

function setActiveButton(mode) {
  buttons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });

  if (mode === 'system') {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    status.textContent = `Currently ${isDark ? 'dark' : 'light'} (following system)`;
  } else {
    status.textContent = '';
  }
}

// Load saved state
chrome.storage.sync.get(['mode'], (result) => {
  const mode = result.mode || 'system';
  setActiveButton(mode);
});

// Handle button clicks
buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    const newMode = btn.dataset.mode;
    setActiveButton(newMode);

    chrome.storage.sync.set({ mode: newMode }, () => {
      // Notify all Google Docs tabs to update
      chrome.tabs.query({ url: 'https://docs.google.com/*' }, (tabs) => {
        tabs.forEach((tab) => {
          chrome.tabs.sendMessage(tab.id, { action: 'updateTheme', mode: newMode });
        });
      });
    });
  });
});
