// The two prizes shown when a conversation gives up its secret: a calendar
// page for the date and a view of the train crossing the sierra for the
// location. Each is drawn at a fixed size around (0, 0) into a container the
// scene positions and scales.
import { COLORS, CSS_COLORS, FONTS, t } from '../shared.js';

export const ART_WIDTH = 220;
export const ART_HEIGHT = 150;

// A tear-off calendar page showing the dates.
export function drawCalendar(scene, into) {
  const g = scene.add.graphics();
  g.fillStyle(COLORS.mutedPurple, 1);
  g.fillRect(-82, -62, 176, 142); // drop shadow
  g.fillStyle(COLORS.offWhite, 1);
  g.fillRect(-88, -70, 176, 142);
  g.fillStyle(COLORS.red, 1);
  g.fillRect(-88, -70, 176, 40);
  g.fillStyle(COLORS.mutedPurple, 1);
  [-52, 52].forEach((x) => g.fillRect(x - 5, -82, 10, 22)); // binder rings
  into.add(g);
  const text = (y, copy, size, color) =>
    scene.add.text(0, y, copy, { fontFamily: FONTS.heading, fontSize: size, color }).setOrigin(0.5);
  into.add(text(-44, t('rewardDateMonth'), '12px', CSS_COLORS.offWhite));
  into.add(text(8, '13-18', '30px', CSS_COLORS.background));
  into.add(text(50, '2027', '14px', CSS_COLORS.red));
}

// A framed view of the sierra with the train to Madrid crossing it.
export function drawTrainView(scene, into) {
  const g = scene.add.graphics();
  const w = ART_WIDTH;
  const h = ART_HEIGHT;
  g.fillStyle(COLORS.offWhite, 1);
  g.fillRect(-w / 2, -h / 2, w, h);
  const ix = -w / 2 + 8;
  const iy = -h / 2 + 8;
  const iw = w - 16;
  const ih = h - 16;
  g.fillStyle(COLORS.background, 1);
  g.fillRect(ix, iy, iw, ih);
  g.fillStyle(COLORS.gold, 1);
  [[20, 14], [70, 30], [150, 12], [185, 34]].forEach(([x, y]) => g.fillRect(ix + x, iy + y, 4, 4));

  const base = iy + ih - 34;
  g.fillStyle(COLORS.mutedPurple, 1);
  g.fillTriangle(ix, base, ix + 62, iy + 30, ix + 124, base);
  g.fillTriangle(ix + 84, base, ix + 150, iy + 18, ix + iw, iy + 70);
  g.fillTriangle(ix + 84, base, ix + iw, iy + 70, ix + iw, base);
  g.fillStyle(COLORS.offWhite, 1);
  g.fillTriangle(ix + 50, iy + 42, ix + 62, iy + 30, ix + 74, iy + 42);
  g.fillTriangle(ix + 136, iy + 32, ix + 150, iy + 18, ix + 164, iy + 32);

  g.fillStyle(COLORS.cyan, 1);
  g.fillRect(ix, base, iw, ih - (base - iy)); // meadow
  g.fillStyle(COLORS.background, 1);
  g.fillRect(ix, base + 22, iw, 4); // rail
  for (let x = ix + 4; x < ix + iw; x += 16) g.fillRect(x, base + 26, 6, 4); // sleepers

  // Locomotive + two carriages, wheels on the rail.
  const car = (x, width, color) => {
    g.fillStyle(color, 1);
    g.fillRect(x, base, width, 18);
    g.fillStyle(COLORS.gold, 1);
    for (let wx = x + 6; wx < x + width - 8; wx += 14) g.fillRect(wx, base + 4, 8, 6);
    g.fillStyle(COLORS.background, 1);
    g.fillRect(x + 6, base + 18, 8, 4);
    g.fillRect(x + width - 14, base + 18, 8, 4);
  };
  car(ix + 26, 46, COLORS.offWhite);
  car(ix + 76, 46, COLORS.offWhite);
  car(ix + 126, 50, COLORS.red);
  g.fillStyle(COLORS.red, 1);
  g.fillRect(ix + 160, base - 8, 10, 8); // funnel
  into.add(g);
}
