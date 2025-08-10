I have amblyopia and I want to pratice eye coordination. For that, I want to build a simple eye coordination training app.

Create a simple web app that has the following characteristics:

## Description
- Takes the entire viewport.
- A completely white background, with a small black round shape.
- On load, the small round shape contrasting with the background starts moving randomly.
- The moving shape can freely move inside the entire viewport.
- Motion model: use a random waypoint model — pick a random target point within the viewport, move linearly toward it; upon arrival immediately pick a new target.
- By default:
  - The movement is linear.
  - Speed is defined in pixels per second; default is ~400 px/s (about five seconds to cross ~2000px).
  - When the shape changes direction, it does so in an immediate angular turn fashion (as opposed to making a curve).
  - On reaching edges, reflect (bounce) with conservation of speed.
- Implement animation with `requestAnimationFrame` using delta-time for frame-rate independence, and update position via `transform: translate3d()` for performance.
- For curved turns (when enabled), use a constant turn rate (max angular velocity) toward the next target.
- Recompute bounds on viewport resize and respect mobile safe-area insets.

## Controls
The app must include a small, inconspicuous (low opacity) icon button at the top right corner (minimum 32×32 CSS px) with tooltip "Settings".
When clicking on that button, it should open a small menu that allows customizing the following behaviors:
- Theme: by default the app loads on light theme. This setting toggles a dark blue background and a white round shape.
- Size of the shape: allow changing the size of the shape from 1px to 32px (maps directly to CSS width/height in px).
- Shape: a small full circle by default, allow changing to a square, cross, or classic mouse cursor.
- Opacity: allow changing the opacity of the moving shape, from 1% (`opacity: 0.01`) to 100% (`opacity: 1`).
- Speed: allow changing the speed in pixels per second, from very slow (~96 px/s — about 20 seconds to cross 1920px) to very fast (~1920 px/s — one second to cross 1920px).
- Turn type: angular or curved. Angular by default; curved uses constant turn rate for smooth direction change.
- Turn frequency: control how often a new direction is chosen. Use a uniform random segment duration in seconds between a **Min** and **Max** (default Min=1.5s, Max=3s). At each expiry, immediately pick a new random target. If the shape arrives at its target earlier, pick a new target right away (the timer resets).

## Additional controls & features
- Keyboard: space = pause/resume, R = reset to defaults, T = toggle theme.
- All settings persist across sessions via `localStorage`.
- Target 60 FPS performance.

## Stack
Use only HTML, CSS, and JavaScript for this app.

