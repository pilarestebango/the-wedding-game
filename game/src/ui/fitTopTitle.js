// Scene titles were sized/positioned for a 960px-wide screen and centered
// across the full width. On a narrow phone (rendered at its true width now,
// not shrunk via letterboxing — see main.js) a long title's centered right
// edge can run straight into the corner mute toggle (muteToggle.js, always
// top-right). Shrinks the text and re-centers it in the space left of the
// toggle — only if it doesn't already fit, so short titles are untouched.
//
// That dodge only makes sense when the title's row actually overlaps the
// toggle vertically (muteToggle.js sits at y 16, ~11px tall). Titles placed
// further down the screen (e.g. EndingScene's "YOU'RE INVITED" at y 60)
// can't collide with it, so they're just shrunk-to-fit and left centered on
// the full width instead of getting shoved off-center for no reason.
export function fitTopTitle(scene, textObj, { reserveRight = 90, margin = 12, toggleBottom = 32 } = {}) {
  const overlapsToggleRow = textObj.y - textObj.displayHeight / 2 < toggleBottom;

  if (!overlapsToggleRow) {
    const fullWidth = scene.scale.width - margin * 2;
    if (textObj.width > fullWidth) textObj.setScale(fullWidth / textObj.width);
    return textObj;
  }

  const availableWidth = scene.scale.width - reserveRight - margin;
  if (textObj.width <= availableWidth) return textObj;
  textObj.setScale(availableWidth / textObj.width);
  textObj.x = margin + availableWidth / 2;
  return textObj;
}
