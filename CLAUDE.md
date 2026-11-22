# Momnie family app: notes for Claude

## What's new splash screens

When you ship a change, decide whether it deserves a "What's new" splash. Not every change does.

**Add a splash when** people will notice something new they can use or that behaves differently: a new feature, a new screen or button, a changed way of doing something familiar (for example a new post type, the assistant asking new kinds of questions, a new Home page).

**Skip it for** bug fixes, spacing or color tweaks, speed or reliability work, changes to the assistant's behind-the-scenes rules, and anything only Paul sees.

When you do add one, write a row in the Sheet's **Updates** tab (columns: `id, date, title, message, hiddenFrom, label`):
- `id`: any short unique text. `date`: today, `YYYY-MM-DD`.
- `title`: a short, plain headline (for example "Lists are here").
- `message`: two to four short sentences in plain words, saying what changed and where to find it. Light formatting is allowed (`**bold**`, `- ` bullets, blank line between paragraphs). No emoji.
- `hiddenFrom`: leave blank. `label`: optional heading above the title (default is "WHAT'S NEW").

Each person sees a new splash once when they open the app (Close shows it again next time, Hide stops it). Every splash stays readable under Home, "What's new" (the link next to the version at the bottom). Tell Paul in your reply when you added a splash, and what it says.

## Shipping

Bump `APP_VERSION` in `index.html` and `VERSION` in `sw.js` with every change. Apps Script changes deploy automatically from `main` (see `docs/APPS-SCRIPT-DEPLOY.md`).
