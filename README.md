# Miu Phone — V3

A mobile-first, single-screen interactive fanfiction phone simulator. Updated with five authored Notes entries.

## Fix for the V2 duplicate home screen
V2 mistakenly used a FULL SCREENSHOT, including icons, as a background image, and then painted new icons over it.
V3 uses `assets/home-photo.jpg`, a crop containing *only the photograph*, and builds each widget/app icon exactly once with HTML/CSS.

## LINE and SMS
- LINE contact name / remark: **Kiddo**.
- Tap Kiddo's round avatar in the LINE header to open the contact profile.
- LINE's scripted conversation is dated **2026/11/25**.
- SMS is a separate past-timeline conversation with an unknown number.
- Both LINE and SMS have free text inputs. Type and press Enter or **Send**. The message appears immediately and remains after reload on the same browser.
- No real text is sent; all messages are local fiction.
- Neither app automatically invents a reply after you send a message. Scripted replies can be added later.

## Photos
The supplied images are now included: your first standalone photograph appears in the home Photos widget; the second appears as the Kiddo avatar in LINE and the contact profile. The assets are placed at `assets/home-photo.jpg` and `assets/kiddo-avatar.jpg`.

## Notes timeline
Five notes are preloaded, in this order:
- October 25, 2027 at 1:30 am
- September 30, 2027 at 3:27 am
- January 15, 2027 at 10:27 pm
- November 25, 2026 at 00:36 am
- October 23, 2026 at 00:36 am

Open a note to see its full timestamp and its original text. You can edit its text locally in the simulated Notes app; any edits are only saved in the current browser via localStorage. Updating `story-data.js` later does not automatically overwrite saved note edits. For a clean view, clear the site's stored data in your browser.

## Edit story text later
- `story-data.js`: contacts, dates, dialogue, notes, photo content, Instagram content, etc.
- `style.css`: layout and colors
- `app.js`: interface behaviors; generally leave alone
- `assets/`: photos, avatars, audio

### Scripted message syntax
```js
messages: [
  { type: 'date', text: 'Wed, 11/25 · 2026' },
  { from: 'them', text: 'Miu message goes here.' },
  { from: 'me', text: 'My reply goes here.' }
]
```

## Upload to GitHub Pages
1. Create or open your repository.
2. Upload **the contents of this folder** to the repository root (`index.html`, `style.css`, `app.js`, `story-data.js`, `assets/`). Do not upload the ZIP as your site.
3. Go to Settings → Pages and set `Deploy from a branch`, branch `main`, folder `/ (root)`.
4. Refresh your site after deployment. If it displays the old UI, use a hard refresh or an incognito window to avoid browser cache.

## No backend
All local sent messages and note edits are stored using localStorage, specific to a browser/device. Clearing browser data will clear them. There is no sign-in or server.
