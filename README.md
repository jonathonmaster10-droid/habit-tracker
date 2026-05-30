# Habit Tracker — Capstone Project

A simple web app that helps you build good habits.

**Live demo:** https://jonathonmaster10-droid.github.io/habit-tracker/

## What it does

- Add habits you want to track (like **Water intake, Gym, Reading, Coding practice**)
- Click "Done" each day when you finish a habit
- See your **daily streak** and your **longest streak**
- View a **calendar** showing which days you completed habits
- See **motivational stats** — today's progress %, total completions
- A fresh **motivational quote** every day
- Your data is saved in the browser, so it stays even if you close the page

## How to run it on your computer

You only need a browser. There is no install, no build step, no framework.

**Option 1 — Easiest:** Just double-click `index.html`.

**Option 2 — Run a local server (recommended):**
```
python -m http.server 8000
```
Then open http://localhost:8000 in your browser.

## What's in the project

| File | What it's for |
|---|---|
| `index.html` | The page structure (header, stats, habits list, calendar) |
| `styles.css` | Colors, layout, spacing — makes it look nice |
| `app.js` | The JavaScript that adds habits, tracks streaks, draws the calendar |
| `README.md` | This file |

## Who did what (team of 6)

The code in `app.js` is split into 6 clearly-labelled sections so each person has their own part to present:

| Member | Section in `app.js` | What they built |
|---|---|---|
| **Team Member 1** | SECTION 1 | Helper functions, save/load to browser storage |
| **Team Member 2** | SECTION 2 + `styles.css` | Date display, motivational quote, all the styling |
| **Team Member 3** | SECTION 3 | Add habit, preset buttons, delete habit |
| **Team Member 4** | SECTION 4 | Mark done / undo, current + longest streak math |
| **Team Member 5** | SECTION 5 | Calendar view (the month grid) |
| **Team Member 6** | SECTION 6 | Stats box (streaks, today %, total done) + habit list display |

> Replace the names above with the real team members before presenting.

## How the code works (talking points for the presentation)

### Where the data lives

Everything is stored in two variables at the top of `app.js`:

```javascript
let habits = ["Water intake", "Gym"];

let completed = {
  "2026-05-25": ["Water intake", "Gym"],
  "2026-05-26": ["Water intake"]
};
```

That's it. The whole app is just adding/removing things from those two variables, then redrawing the page.

### Saving data

Every time something changes, we call `saveData()`, which stores both variables into the browser using `localStorage`. When the page reloads, `loadData()` reads them back.

### How the streak is calculated

We start at today's date and walk backwards day by day. As long as the user did at least one habit that day, we add 1 to the streak. When we hit a day with nothing, we stop. (Look at `calculateCurrentStreak` in Section 4.)

### How the calendar is drawn

We loop from day 1 to the last day of the month and build one `<div>` per day. If all habits were completed that day, the box turns green. If some were completed, it turns yellow. Today's box gets a blue border. (See `showCalendar` in Section 5.)

## Possible improvements (future work)

- Let users pick custom emojis and colors for their habits
- Show charts (weekly bar chart of completions)
- Reminders / notifications
- Export data as a file
- A way to sync data across devices (would need a backend)

---

Built for our capstone project.
