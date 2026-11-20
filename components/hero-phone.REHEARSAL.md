# Hero phone: rehearsal notes

Built with the Stageshow skill. Starting gold: `examples/phone-touch` (a card opens into its screen as one `Expand`, a touch cursor, a reset hidden behind the closed card).

## What changed from the gold
- Product: the CampusMate home screen (greeting, Quick Actions, a CGPA Calculator card) on the kit's Android Pixel, in the app's blue.
- Story: the card opens into the calculator; the ungraded course (CSE261) gets A+ from its grade menu; the CGPA rolls 3.40 → 3.44 and the credits 45 → 48; Back folds it into the card, and the grade resets unseen. About 11s a loop.
- Framing: the phone is pinned from the top of a transparent stage and runs off the hero's foot, dissolving into the page through a mask (no plate, as the page is the ground).
- Compact (below 520px): a 326px phone a gutter from the left, with the small type a size up.
- Poster (reduced motion, thumbnails): the calculator open with A+ set and 3.44 showing.

## Checked
- `film.mjs --gate` at 1440 and 390: the only lines left are 6 `kit override` reports. These are the same false positives noted in `bento-grid/REHEARSAL.md` (Next bundles the kit CSS into a chunk whose path lacks `/kit/`).
- The whole hero section at 1440 and 390, and a dark-mode still. The phone screen keeps the app's light look on the dark page.
- ESLint and `tsc` on `hero.tsx` and `hero-phone.tsx`.

## Not checked
- Frame-by-frame stepping of the open, menu and close at `--slow` (the contact sheets at 700ms and 1500ms looked clean, but film reported coverage as inconclusive because of dev-server sampling gaps).
- A fresh-eye review pass.
- Widths between 520 and 1024, where the stage scales the wide design down.
