const hasChromeStorage =
  typeof chrome !== "undefined" && chrome.storage && chrome.storage.local;

export function loadState(key, fallback) {
  return new Promise((resolve) => {
    if (hasChromeStorage) {
      chrome.storage.local.get([key], (result) => {
        resolve(result[key] !== undefined ? result[key] : fallback);
      });
    } else {
      try {
        const raw = window.localStorage.getItem(key);
        resolve(raw ? JSON.parse(raw) : fallback);
      } catch {
        resolve(fallback);
      }
    }
  });
}

export function saveState(key, value) {
  if (hasChromeStorage) {
    chrome.storage.local.set({ [key]: value });
  } else {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage unavailable, ignore
    }
  }
}
