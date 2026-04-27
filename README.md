# LifeSim v12 — Ascension Edition

LifeSim v12 is a static browser life-simulation game. No build step required — open `index.html` directly.

---

## What's New in v12

### 🌳 Legacy / Dynasty System
Your lives are now connected. After completing a life with Grade **B or higher**, you unlock **Legacy Inheritance** when starting your next life. Choose a bonus passed down from your ancestor: extra cash, stat boosts, skill points, or bonus happiness. Each surname forms a growing **Dynasty**.

### 🏅 Prestige Rank
A persistent rank tracking all your lives. Watch your rank climb from **Newcomer → Initiate → Veteran → Elite → Legend → Immortal**. Your prestige, best grade, and dynasty name appear on the splash screen every session.

### 🎭 Life Chapters
Your life unlocks narrative chapters at key milestones (age 5, 13, 18, 25, 40, 60, 80), each with a personalised summary. Chapters appear in the **Life tab** as a scrollable history panel. Unlock all 7 to earn the **Full Story** achievement.

### 🎲 3 New Personality Traits
- **🎲 Maverick** — High risk, high reward. Gambling stakes and outcomes are amplified dramatically.
- **🌿 Naturalist** — Outdoor activities heal 60-70% more. Nature is your medicine.
- **🗿 Stoic** — Stress barely touches you. Passive stress reduction, lower death risk.

### 🏅 2 New Life Ambitions
- **🏅 The Legend** — Live to 90 with 80+ happiness and $1M+ net worth.
- **🧘 The Minimalist** — Reach 85+ happiness without any luxury assets.

### 🌍 4 New World Events
AI Revolution, Internet Blackout, Space Tourism ($250K to orbit!), Climate Emergency.

### 📰 15+ New Life Events
Mentorship Offers, DNA Tests, Wellness Retreats, Patent Ideas, Tabloid Scandals, 80th Birthday Parties, Writing Memoirs, Guide Dog Companions, Life Reflections, Science Fair Wins, and more.

### 🎖️ 17 New Achievements
Born Into Legacy, Dynasty, Veteran Soul, Full Story, Maverick Life, One with Nature, Living Legend, Polymath Supreme (all 10 skills Lv 3+), Space Tourist, Zero Worries, and more.

---

## Project Structure

```
lifesim-v12/
  index.html
  css/  base.css · components.css · screens.css · animations.css
  data/ achievements.js · careers.js · countries.js · events.js · names.js · properties.js
  js/   ai_story.js · assets.js · business.js · career.js · crime.js · engine.js
        goals.js · health.js · helpers.js · hustle.js · legacy.js(NEW) · main.js · pets.js
        relations.js · save.js · skills.js · social.js · stocks.js · ui.js
```

## Notes
- All features except AI Story work fully offline.
- AI Story requires internet (calls Anthropic API).
- Prestige and dynasty data persist in `localStorage` across all lives.
