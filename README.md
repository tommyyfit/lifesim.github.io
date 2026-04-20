# LifeSim v9 - Legendary Edition

LifeSim v9 is a static browser life-simulation game. No build step, backend, API key, or server runtime is required. It can run from `index.html` directly or from GitHub Pages.

## What's New in v9

### Local Story Moments
Press **Story Moment** in the Life tab to trigger a personalized event generated entirely in the browser from local game state. It uses your character's age, country, career, relationship, stress, and life situation. Available once every 3 in-game years.

### More Romance & Intimacy
The Love tab now has richer adult romance options: deeper conversations, home dates, cooked dinners, slow dancing, love letters, moving in together, make-out sessions, passionate nights, fantasy talks, aftercare, and more realistic intimacy outcomes.

### Stock Market
The **Stocks** tab lets you buy and sell 10 companies across tech, health, energy, crypto, finance, and more. Each stock has its own volatility profile. Dividend-paying stocks give passive yearly income. Portfolio value counts toward net worth.

### Skills System
The **Skills** tab has 10 learnable skills: Coding, Culinary Arts, Music, Languages, Athletic Training, Writing, Finance, Public Speaking, Fine Arts, and Medicine. Each has 5 levels with passive yearly bonuses. Level 3 unlocks special careers.

### Personality Traits
- Visionary - Business ideas come naturally
- Empath - Deeper relationships, starts with +Karma
- Scholar - Begins with 2 free Skill Points

### Life Ambitions
- The Sage - Max 3 skills to Level 5
- Market Wizard - $500K in stocks
- Renaissance Soul - Level 2+ in 5 skills

### Achievements
Skill Master, Polymath, Market Whale, First Investment, Life Storyteller, Dividend King, Renaissance Person, and The Sage.

### Events
Adult and elder events include solo adventures, identity theft, partnership offers, documentary features, legal battles, genetic discoveries, radio interviews, realistic relationship moments, and more.

## Project Structure

```text
lifesim-v9/
  index.html
  css/  base.css, components.css, screens.css, animations.css
  data/ achievements.js, careers.js, countries.js, events.js, names.js, properties.js
  js/   story_events.js, assets.js, business.js, career.js, crime.js, engine.js
        goals.js, health.js, helpers.js, main.js, pets.js, relations.js
        save.js, skills.js, social.js, stocks.js, ui.js
```

## GitHub Pages Notes

- Fully static: no backend, no build step, no API calls.
- Saves use `localStorage`.
- The included `.nojekyll` file keeps GitHub Pages from applying Jekyll processing.
