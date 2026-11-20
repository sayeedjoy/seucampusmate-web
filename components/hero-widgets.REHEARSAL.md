# Hero widgets: rehearsal notes

Built with the Stageshow skill. Starting gold: `examples/many-of-one` (a wall of one thing, the same anatomy per tile, only the focus tile has words, focus by depth).

## What changed from the gold
- Product: CampusMate home-screen widgets in three right-aligned, staggered rows behind the hero phone. Each tile keeps its own color in both page themes.
- A still that is decorative only: no links or controls, `aria-hidden`, `pointer-events: none`. The phone beside it carries the accessible description.
- Real strings (6) tell the phone's story: CSE261 final / In 3 days (the course the phone grades), Attendance / 86% this term, Cumulative CGPA / 3.44 (the phone's payoff). Every other tile is bars in its own ink, plus one graphic.
- The CGPA tile leads by a deeper shadow, not by a ring or a size change.
- Framing: the rows run under the phone on the right and fade out on the left (mask on the wrapper in `hero.tsx`). On small screens the 960px design is shifted so the attendance and CGPA tiles sit mid-screen, and the phone overlaps only the bottom row.

## Checked
- Hero stills at 1440 (light), 1100 (dark) and 390.
- ESLint and `tsc` on `hero.tsx` and `hero-widgets.tsx`.

## Not checked
- `film.mjs --gate` (no motion here, but the static checks, such as insets and touching, were not run).
- Widths between 390 and 1024.
- A fresh-eye review pass.
