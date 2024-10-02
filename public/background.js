chrome.runtime.onStartup.addListener(() => {
    resetTimeIfNeeded();
  });
  
  function resetTimeIfNeeded() {
    chrome.storage.local.get(['lastReset'], (result) => {
      const currentTime = new Date().getTime();
      const oneDay = 24 * 60 * 60 * 1000;
      if (!result.lastReset || currentTime - result.lastReset > oneDay) {
        chrome.storage.local.clear(); // Clear all time data
        chrome.storage.local.set({ lastReset: currentTime });
      }
    });
  }
  
  resetTimeIfNeeded(); // Ensure reset check on extension load
  
let activeTabId = null;
let activeTabUrl = null;
let startTime = null;

chrome.tabs.onActivated.addListener((activeInfo) => {
  switchTab(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tabId === activeTabId && changeInfo.status === 'complete') {
    updateTime();
    activeTabUrl = new URL(tab.url).hostname;
    startTime = new Date().getTime();
  }
});

chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    updateTime(); // User is out of focus, stop counting time
  } else {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      if (tabs.length > 0) switchTab(tabs[0].id);
    });
  }
});

function switchTab(tabId) {
  updateTime();
  activeTabId = tabId;
  chrome.tabs.get(tabId, (tab) => {
    activeTabUrl = new URL(tab.url).hostname;
    startTime = new Date().getTime();
  });
}

function updateTime() {
  if (activeTabUrl && startTime) {
    const elapsedTime = Math.round((new Date().getTime() - startTime) / 1000);
    chrome.storage.local.get([activeTabUrl], (result) => {
      let totalTime = result[activeTabUrl] || 0;
      totalTime += elapsedTime;
      let update = {};
      update[activeTabUrl] = totalTime;
      chrome.storage.local.set(update);
    });
  }
}