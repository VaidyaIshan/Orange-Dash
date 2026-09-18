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

// --- Pomodoro Tracker ---
// The new-tab page unmounts every time the tab is closed or navigated away
// from, so the countdown itself lives in storage (as an end timestamp) and
// this service worker owns a chrome.alarms entry to notify the user and
// advance the session even while no OrangeDash tab is open.
const POMODORO_KEY = "orangedash_pomodoro";
const POMODORO_ALARM_PREFIX = "pomodoro-";

const SESSION_LABELS = {
  focus: "Focus session",
  short: "Short break",
  long: "Long break",
};

chrome.alarms.onAlarm.addListener((alarm) => {
  if (!alarm.name.startsWith(POMODORO_ALARM_PREFIX)) return;
  const endedMode = alarm.name.slice(POMODORO_ALARM_PREFIX.length);

  chrome.storage.local.get([POMODORO_KEY], (result) => {
    const state = result[POMODORO_KEY];
    if (!state) return;

    chrome.notifications.create({
      type: "basic",
      iconUrl: chrome.runtime.getURL("android-chrome-512x512.png"),
      title: `${SESSION_LABELS[endedMode] || "Session"} complete!`,
      message:
        endedMode === "focus"
          ? "Nice work. Time for a break."
          : "Break's over. Back to focus.",
      priority: 2,
    });

    // If the page was open, it already advanced the session itself when the
    // countdown hit zero. Only mutate storage here if it's still mid-flight,
    // which means no page was open to react to it.
    if (!state.isRunning || state.mode !== endedMode) return;

    const sessionsCompleted =
      endedMode === "focus" ? (state.sessionsCompleted || 0) + 1 : state.sessionsCompleted || 0;
    const nextMode =
      endedMode === "focus" ? (sessionsCompleted % 4 === 0 ? "long" : "short") : "focus";
    const nextDurationMs = state.durations?.[nextMode] || 25 * 60000;

    const nextState = {
      ...state,
      mode: nextMode,
      sessionsCompleted,
      isRunning: false,
      endTime: null,
      remainingMs: nextDurationMs,
    };
    chrome.storage.local.set({ [POMODORO_KEY]: nextState });
  });
});

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === "POMODORO_SCHEDULE") {
    chrome.alarms.clear(POMODORO_ALARM_PREFIX + message.mode);
    chrome.alarms.create(POMODORO_ALARM_PREFIX + message.mode, { when: message.endTime });
  } else if (message?.type === "POMODORO_CANCEL") {
    chrome.alarms.clear(POMODORO_ALARM_PREFIX + message.mode);
  }
});

// --- Focus Mode site blocking ---
// Only active while a Focus session is actually running (not during breaks,
// not while paused). Redirecting a request requires host permission for the
// blocked domain: the curated presets below are declared upfront in
// manifest.json's host_permissions, and any custom domain the user adds is
// granted at runtime via chrome.permissions.request (see FocusBlocklist.js).
const BLOCKLIST_KEY = "orangedash_focus_blocklist";
const PRESET_DOMAINS = {
  youtube: ["youtube.com"],
  instagram: ["instagram.com"],
  facebook: ["facebook.com"],
  twitterx: ["x.com", "twitter.com"],
  reddit: ["reddit.com"],
  tiktok: ["tiktok.com"],
  netflix: ["netflix.com"],
};

function computeBlockedDomains(blocklist) {
  const domains = [];
  if (blocklist?.presets) {
    for (const key of Object.keys(blocklist.presets)) {
      if (blocklist.presets[key] && PRESET_DOMAINS[key]) domains.push(...PRESET_DOMAINS[key]);
    }
  }
  if (Array.isArray(blocklist?.custom)) domains.push(...blocklist.custom);
  return domains;
}

async function updateBlockingRules() {
  const stored = await chrome.storage.local.get([POMODORO_KEY, BLOCKLIST_KEY]);
  const pomodoro = stored[POMODORO_KEY];
  const blocklist = stored[BLOCKLIST_KEY];
  const shouldBlock = Boolean(blocklist?.enabled && pomodoro?.mode === "focus" && pomodoro?.isRunning);

  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  const removeRuleIds = existing.map((rule) => rule.id);
  const addRules = [];

  if (shouldBlock) {
    const domains = computeBlockedDomains(blocklist);
    domains.forEach((domain, index) => {
      addRules.push({
        id: index + 1,
        priority: 1,
        action: { type: "redirect", redirect: { extensionPath: "/focus.html" } },
        condition: { urlFilter: `||${domain}^`, resourceTypes: ["main_frame"] },
      });
    });
  }

  await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds, addRules });
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  if (changes[POMODORO_KEY] || changes[BLOCKLIST_KEY]) {
    updateBlockingRules();
  }
});

updateBlockingRules();