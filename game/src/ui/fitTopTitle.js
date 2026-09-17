// Scene titles were sized/positioned for a 960px-wide screen and centered
// across the full width. On a narrow phone (rendered at its true width now,
// not shrunk via letterboxing — see main.js) a long title's centered right
// edge can run into the corner mute toggle (muteToggle.js, always
// top-right). Shrinks the text just enough to clear it — titles always stay
// centered on the full width; they're never re-positioned off-center, so
// none of them read as left-aligned on mobile.
//
// The toggle dodge only makes sense when the title's row actually overlaps
// it vertically (muteToggle.js sits at y 16, ~11px tall). Titles placed
// further down the screen (e.g. EndingScene's "YOU'RE INVITED" at y 60)
// can't collide with it, so they only get the plain full-width fit.
export function fitTopTitle(scene, textObj, { reserveRight = 90, margin = 12, toggleBottom = 32 } = {}) {
  const overlapsToggleRow = textObj.y - textObj.displayHeight / 2 < toggleBottom;
  const fullWidth = scene.scale.width - margin * 2;
  // Centered text intrudes on the toggle once half its width passes
  // (width/2 - reserveRight), i.e. once its total width exceeds this.
  const toggleSafeWidth = scene.scale.width - reserveRight * 2;
  const maxWidth = overlapsToggleRow ? Math.min(fullWidth, toggleSafeWidth) : fullWidth;

  if (textObj.width > maxWidth) textObj.setScale(maxWidth / textObj.width);
  return textObj;
}
