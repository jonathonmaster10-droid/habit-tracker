# 🔥 HabitForge

A beautiful, zero-dependency **habit tracker** web app.

Track habits like **Water intake, Gym, Reading, Coding practice**, build daily streaks, visualize your consistency on a calendar, and stay motivated.

## ✨ Features

- ✅ **Add, edit, and check off habits** — with custom emoji + color per habit
- 🔥 **Daily streaks** — current streak + personal best, per-habit and overall
- 📅 **Calendar view** — month grid that color-codes your completion ("All habits" view or per-habit filter)
- 📊 **Motivational stats** — today's progress %, total completions, lifetime completion rate
- 💬 **Daily motivational quote** — fresh inspiration each day
- 🎉 **Confetti celebration** when all today's habits are complete
- 🌙 **Dark / light theme** toggle
- 💾 **Saves to your browser** — no account, no server, your data stays on your device
- 📱 **Fully responsive** — works on phone, tablet, and desktop

## 🚀 Run it

### Option 1 — GitHub Pages (live server)
The app is deployed at:
**https://jonathonmaster10-droid.github.io/habit-tracker/**

### Option 2 — Run locally
Clone the repo and serve the folder with any static server:

```bash
git clone https://github.com/jonathonmaster10-droid/habit-tracker.git
cd habit-tracker

# Python (any 3.x)
python -m http.server 8000

# OR Node
npx serve .

# OR just double-click index.html
```

Then open <http://localhost:8000>.

## 🛠 Tech

No build step. No framework. Just:
- `index.html`
- `styles.css`
- `app.js`

State persists in `localStorage` under the key `habitforge.v1`.

## 📂 Project structure

```
habit-tracker/
├── index.html      # markup
├── styles.css      # styling, themes, responsive grid
├── app.js          # all logic (state, streaks, calendar, stats)
└── README.md
```

## 🧠 How streaks work

- A habit's **current streak** = how many consecutive days (counting back from today) you've checked it off. If you haven't checked it today yet, the streak is computed from yesterday so you don't lose it mid-day.
- The **longest streak** is the best consecutive run in your history for that habit.
- The **overall streak** counts days where at least one habit was checked off.

## 🤝 Contributing

Capstone project — feel free to fork and adapt.

---

Built with ❤️ for the capstone project.
