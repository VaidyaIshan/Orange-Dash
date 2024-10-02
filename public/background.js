let activeTabId = null;
let activeTabUrl = null;
let startTime = null;
let timerId = null;

chrome.tabs.onActivated.addListener((activeInfo) => {
  switchTab(activeInfo.tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tabId === activeTabId && changeInfo.status === 'complete') {
    activeTabUrl = new URL(tab.url).hostname;
    if (!startTime) {
      startTime = new Date().getTime();
      startTimer();
    }
  }
});

chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    stopTimer(); // User is out of focus, stop counting time
  } else {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      if (tabs.length > 0) switchTab(tabs[0].id);
    });
  }
});

function switchTab(tabId) {
  stopTimer();
  activeTabId = tabId;
  chrome.tabs.get(tabId, (tab) => {
    activeTabUrl = new URL(tab.url).hostname;
    startTime = new Date().getTime();
    startTimer();
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
      startTime = new Date().getTime(); // Reset startTime for the next interval
    });
  }
}

function startTimer() {
  if (!timerId) {
    timerId = setInterval(() => {
      updateTime();
    }, 1000); // Update time every 1 second
  }
}

function stopTimer() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
}