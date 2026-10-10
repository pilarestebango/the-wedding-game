// Choose your player — PILAR vs JOE's character-select screen with this
// game's title and starfield, leading into level 1's intro screen.
import { CharacterSelectScene } from '../shared.js';
import { addStarfield } from '../config/backdrops.js';

export class SelectScene extends CharacterSelectScene {
  constructor() {
    super('Select');
    this.titleKey = 'getawayTitle';
    this.nextSceneKey = 'LevelIntro'; // defaults to level 1
  }

  create() {
    this.backdrop = addStarfield(this); // first, so it sits behind everything the shared screen adds
    super.create();
  }

  update() {
    this.backdrop.update();
  }
}
