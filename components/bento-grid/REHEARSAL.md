# Feature bento: rehearsal notes

Built with the Stageshow skill. Starting gold: `examples/bento` (one Stage per tile, measured picture slots, page-text copy, staggered once-on-scroll beats).

## What changed from the gold
- Layout: a tall hero (Android phone) beside a 2 × 2, instead of hero-and-strip, so the phone shows its screen without shrinking.
- Tiles: Class Routine (hero UI), Marks Tracker (stat, inverted), Todo List (component), Exam Schedule (object, tilted stack), Fee Calculator (diagram).
- Colors come from the site's tokens (`globals.css`), so tiles follow light and dark; the phone screen keeps the app's own light look.

## Checked
- Stills at 1440, 820 and 390, light and dark.
- `film.mjs --gate` at 1440: the only remaining lines are 24 `kit override` reports. They are false positives: the check treats only stylesheets whose path has `/kit/` as the kit's own, and Next bundles the kit CSS into a `components_*.css` chunk (its `@layer stageshow` rules are intact).
- One non-gating note: a `Count` digit strip in the Todo header "appears with no entrance" (kit-internal).

## Not checked
- The gate at 820 and 390 (the film's still capture fails when the grid is taller than its viewport; those widths were checked by element screenshots only).
- Reduced motion beyond the posters (each stage's `poster` is the final state).
- The Taka sign (৳) falls back to a system font, since Geist lacks it.
