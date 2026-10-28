# Puzzle #35 — sticky scroll-spy sidebar navigation

Brief (Task Forge puzzle tracker): sticky scroll-spy sidebar navigation — none/generic.

A documentation-style page with a sticky left sidebar that auto-highlights the
section currently in view as you scroll, and smooth-scrolls to a section when
its link is clicked. Three files, no build step, no dependencies.

## How it works (the real mechanic)

`spy.js` uses a real `IntersectionObserver` — async, off the main thread —
rather than a throttled scroll-position calculation:

- Observes every `<section>` that has a matching sidebar link.
- Keeps a live map of which sections are visible and their intersection
  ratios, then picks the **first visible section in document order** as
  "active" — this matches what a reader perceives as the section they're in,
  and avoids the flicker you get when several sections are partly on screen.
- `rootMargin: '0px 0px -65% 0px'` biases the active band toward the top third
  of the viewport.
- Native CSS `scroll-behavior: smooth` + `scroll-margin-top` handle the
  click-to-jump without hiding headings under the sticky header.
- The sidebar itself is `position: sticky; top: 0; height: 100vh`.

## Verified live (automated + visual)

Served locally and driven via a real browser (claude-in-chrome):

- An automated check scrolled to all 8 sections (instant jumps, settle delay)
  and asserted the highlighted sidebar link matched the target section every
  time — **8/8 match**, including the bottom "Support" edge case (a short last
  section that can't reach the top of the viewport, which naive
  scroll-position implementations get wrong) and the reset-to-top → "Overview"
  case.
- Visually confirmed mid-document: at the Theming section the sidebar shows
  the "Theming" pill + left-border active state, the sidebar stays pinned, and
  the bottom progress bar/label read "Theming" at ~57%.

(First automated run looked wrong because it measured mid-animation while
CSS smooth-scroll was still running — re-running with instant jumps showed the
observer logic itself is correct. Noted here because it's a real gotcha when
testing scroll-spy with smooth scrolling enabled.)

## Deploy

`wrangler.jsonc` is included (static-assets Worker). The deploy to
`puzzle-35-scroll-spy.krikormher.workers.dev` was not completed in-session
because wrangler's cached OAuth session expired mid-session and can't refresh
non-interactively — run `wrangler login` once, then `npx wrangler deploy`.
