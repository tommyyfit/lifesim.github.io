# LifeSim v24.2.1 — Fun First Rebuild

## Why this version exists

v24.2 added too many layers at once. The result was harder to understand, visually crowded, slower to test and less enjoyable to play. v24.2.1 returns to a stable v24.1 foundation and keeps only the additions that improve the moment-to-moment game.

## New player experience

The main Life page now answers four questions immediately:

1. How is my character doing?
2. What can I do this year?
3. What recently happened?
4. Who matters right now?

The screen does not require the player to manage world meters, personality charts, consequences, calendars, goals and stories simultaneously.

## Navigation

The main navigation changes with age:

- Infancy: Life, Activities, Family, Health
- School years: Life, School, Activities, Family, Health
- Teen years: Life, School, People, Activities, Health
- Adult years: Life, Career, Relationships, Money, Health
- Later life: Life, Relationships, Health, Money, Activities

Secondary systems remain available from **More** once they become relevant.

## Events

- The yearly queue is limited to one age-appropriate event.
- Each event has no more than three choices.
- Long risk labels, effect spreadsheets and future-callback explanations are removed from the modal.
- The simulation still applies the real effects behind the choice.
- Age Up ignores repeated input while a year is already processing.

## Visual cleanup

- Removed inherited background layers and conflicting gradients.
- Removed full-screen confetti, heart particles and duplicate achievement cards.
- Replaced them with small non-blocking feedback.
- Rebuilt the Life page, navigation, event modal and optional-system menu.
- Improved desktop, tablet and phone spacing.

## Logic repairs

- Age-stage labels stay consistent after every UI refresh.
- Optional tabs cannot flash back into view after legacy navigation updates.
- Annual finalization uses a bounded timeout instead of a long polling interval.
- Young healthy characters are protected from arbitrary random death before age 35.
- The game retains serious consequences when health actually reaches zero.

## Local AI

Ollama remains optional. It can enhance selected writing, but it does not control core money, age, health, relationships, eligibility rules or save logic. The game always falls back to built-in content.
