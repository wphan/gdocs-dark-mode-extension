// Detect system dark mode preference and apply/remove dark mode class
(function() {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  function applyTheme(isDark) {
    if (isDark) {
      document.documentElement.classList.add('gdocs-dark-mode');
    } else {
      document.documentElement.classList.remove('gdocs-dark-mode');
    }
  }

  function updateTheme(mode) {
    if (mode === 'on') {
      applyTheme(true);
    } else if (mode === 'off') {
      applyTheme(false);
    } else {
      // System mode
      applyTheme(mediaQuery.matches);
    }
  }

  // Load saved preference and apply
  chrome.storage.sync.get(['mode'], (result) => {
    const mode = result.mode || 'system';
    updateTheme(mode);
  });

  // Listen for storage changes (most reliable way to sync)
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync' && changes.mode) {
      updateTheme(changes.mode.newValue || 'system');
    }
  });

  // Listen for system theme changes (only applies in 'system' mode)
  mediaQuery.addEventListener('change', (e) => {
    chrome.storage.sync.get(['mode'], (result) => {
      const mode = result.mode || 'system';
      if (mode === 'system') {
        applyTheme(e.matches);
      }
    });
  });

  // Listen for messages from popup (backup)
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'updateTheme') {
      updateTheme(message.mode);
    }
  });
})();
