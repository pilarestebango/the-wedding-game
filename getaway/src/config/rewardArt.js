// The two prizes shown when a conversation gives up its secret: a calendar
// page for the date and the couple's route map for the location. Each is drawn at a fixed size around (0, 0) into a container the
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

// The couple's map of the train route from Madrid to the house, as a framed
// print. Square, so it brings its own size (MAP_SIZE) instead of ART_WIDTH x
// ART_HEIGHT. Loaded in BootScene as 'location-map' (getaway/assets/map-game.webp,
// a 512px copy of map.jpeg).
export const MAP_SIZE = 220;
const MAP_FRAME = 8;

export function drawLocationMap(scene, into) {
  const outer = MAP_SIZE + MAP_FRAME * 2;
  const g = scene.add.graphics();
  g.fillStyle(COLORS.mutedPurple, 1);
  g.fillRect(-outer / 2 + 6, -outer / 2 + 6, outer, outer); // drop shadow
  g.fillStyle(COLORS.offWhite, 1);
  g.fillRect(-outer / 2, -outer / 2, outer, outer);
  into.add(g);
  // A smooth picture, not pixel art: filter it smoothly despite pixelArt: true.
  scene.textures.get('location-map').setFilter(Phaser.Textures.FilterMode.LINEAR);
  into.add(scene.add.image(0, 0, 'location-map').setDisplaySize(MAP_SIZE, MAP_SIZE));
  into.setAngle(-3);
}
