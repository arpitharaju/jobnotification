# Job Notification App — Design System Foundation

## Design philosophy
- Calm, intentional, coherent, confident
- Not flashy, not playful, not hackathon-style
- No gradients
- No glassmorphism
- No neon colors
- No animation noise

## Color system
Core tokens:
- `--color-background`: `#F7F6F3`
- `--color-text`: `#111111`
- `--color-accent`: `#8B0000`
- `--color-success`: muted green
- `--color-warning`: muted amber

Rules:
- Borders and surfaces should be derived from `--color-text` using alpha (avoid introducing extra hex colors).
- Use semantic styles (`--success`, `--warning`, `--accent`) for status and feedback.

## Typography
- Headings: serif (`var(--font-serif)`), confident scale, generous spacing.
- Body: clean sans (`var(--font-sans)`), `16px` with `line-height: 1.7`.
- Text blocks: max width `720px` (`--content-max`).
- Avoid decorative fonts and random font sizes.

## Spacing system
Only use:
- `8px`, `16px`, `24px`, `40px`, `64px`

Use the spacing tokens:
- `--space-1` (8px)
- `--space-2` (16px)
- `--space-3` (24px)
- `--space-4` (40px)
- `--space-5` (64px)

## Global layout structure (every page)
1. `Top Bar`
2. `Context Header`
3. `Primary Workspace (70%)` + `Secondary Panel (30%)`
4. `Proof Footer`

## Component rules (foundation)
- Primary button: solid deep red (`--color-accent`)
- Secondary button: outlined
- Same border radius everywhere (`--radius`)
- Cards: subtle border, no drop shadows
- Inputs: clean borders, visible `:focus-visible` state

## Interaction rules
- Transitions: `170ms` (`ease-in-out`)
- No bounce and no parallax
- Prefer motion-safety: respect `prefers-reduced-motion`

## Error & empty states
- Errors must clearly explain what went wrong and how to fix it (no blame).
- Empty states must guide the next action (never a blank screen).

