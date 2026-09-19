# Orange Dash — Privacy Policy

**Effective date:** September 19, 2026

Orange Dash is a Chrome extension that replaces your New Tab page with a
customizable dashboard (clock, sticky notes, a Pomodoro timer with optional
site blocking, a to-do list, a bookmark dock, Tab Spaces, and Screen Time
tracking). This document explains, plainly, what data the extension touches
and where it goes.

## The short version

Everything Orange Dash stores lives **only on your device**, in Chrome's
own local extension storage (`chrome.storage.local`). There is no Orange
Dash server. Nothing you type, track, or configure is transmitted to the
developer, sold, or shared with advertisers. The only network requests the
extension causes are two narrow, unavoidable ones to Google (described
below), and only when you use a feature that needs them.

## What's stored locally, and why

All of the following is saved with `chrome.storage.local` and never leaves
your browser except as noted in "Third-party requests" below:

| Feature | What's stored |
|---|---|
| Screen Time | The hostname of the site you're viewing (e.g. `github.com`) and how many seconds you spent on it. No full URLs, page content, or browsing history are recorded. |
| Quick Access bookmarks | The name and URL of each shortcut you add. |
| Sticky Notes | Note text, color, position, and size. |
| To-Do List | Task text and completion status. |
| Tab Spaces | The name and URLs you group into each space. |
| Pomodoro Tracker | Timer durations, current mode, and session counts. |
| Focus Mode blocklist | Which sites you've chosen to block during focus sessions. |
| Settings | Your customization choices — accent color, font, background type, header/clock preferences, and, if you upload one, a custom background image (stored as image data, capped at 3MB, entirely on-device). |

Uninstalling the extension deletes all of this automatically, since it's
tied to the extension's own storage. You can also clear individual data
(reset the Pomodoro state, remove bookmarks, clear screen time, etc.)
from within the app itself.

## Third-party requests

Orange Dash's own code makes no network requests. Two things happen as a
side effect of normal browser behavior when using certain features:

- **Google Fonts** (`fonts.googleapis.com`, `fonts.gstatic.com`): the app's
  interface fonts are loaded from Google Fonts. Google may log standard
  request metadata (like your IP address) per
  [Google's privacy policy](https://policies.google.com/privacy).
- **Google's favicon service** (`google.com/s2/favicons`): used to fetch a
  small icon for bookmarks, Tab Spaces, and Screen Time entries you add.
  This sends the **domain name** you're requesting an icon for (e.g.
  `spotify.com`) to Google — never a full URL or page content.

Orange Dash does not run analytics, does not use tracking pixels or ad
SDKs, and does not have a login or user account system of any kind.

## Permissions, and why the extension asks for them

Chrome requires extensions to declare permissions up front. Here's what
each one is used for:

- **`storage`** — save everything listed above, locally.
- **`tabs`** / **`activeTab`** — open every URL in a Tab Space at once, and
  know which site is currently active so Screen Time can track it.
- **`alarms`** — let the Pomodoro timer finish and notify you even if the
  New Tab page isn't open at the time.
- **`notifications`** — show a system notification when a Pomodoro session
  ends.
- **`declarativeNetRequest`** plus a fixed list of host permissions
  (YouTube, Instagram, Facebook, X/Twitter, Reddit, TikTok, Netflix) —
  power Focus Mode's site blocking: redirecting those sites to a local
  "you're in focus mode" page, but **only** while a Focus session is
  actively running.
- **Optional host permission (`<all_urls>`)** — not granted automatically.
  It's only ever requested, through Chrome's own permission prompt, at the
  moment you type a custom domain into Focus Mode's blocklist. Declining
  that prompt simply means that one custom site can't be blocked; nothing
  else is affected.

## Children's privacy

Orange Dash is not directed at children and does not knowingly collect
personal information from anyone.

## Changes to this policy

If this policy changes, the update will be reflected here with a new
effective date.

## Contact

Questions about this policy or your data can be sent to
**vaidyaishan11@gmail.com**.
