// The Pili/Joe sprite the player controls in all three levels: left/right,
// jump, and the run/jump animation. It only listens to InputActions (the
// shared input seam, see game/CLAUDE.md) — it never looks at keys or touches.
import { charKey, runFrameKeys, FrameAnimator, sfx } from './shared.js';
import { PLAYER } from './config/tuning.js';

export class Player {
  constructor(scene, x, y, char, actions) {
    this.scene = scene;
    this.idleKey = charKey(char, 'idle');
    this.jumpKey = charKey(char, 'jump');
    this.runAnimator = new FrameAnimator({ frames: runFrameKeys(char), frameDurationMs: 120 });

    this.sprite = scene.physics.add.sprite(x, y, this.idleKey).setOrigin(0.5, 1);
    this.sprite.body.setSize(this.sprite.width * 0.7, this.sprite.height * 0.95);

    this.left = false;
    this.right = false;
    this.facing = 1; // 1 = right, -1 = left
    this.frozen = false; // set once the player has died or the level is won
    this.lastShotAt = -Infinity;

    actions.on('moveStart', () => { this.right = true; });
    actions.on('moveEnd', () => { this.right = false; });
    actions.on('moveLeftStart', () => { this.left = true; });
    actions.on('moveLeftEnd', () => { this.left = false; });
    actions.on('jump', () => this.jump());
  }

  get onGround() {
    const { body } = this.sprite;
    return body.blocked.down || body.touching.down;
  }

  jump() {
    if (this.frozen || !this.onGround) return;
    this.sprite.setVelocityY(PLAYER.jumpVelocity);
    sfx.jump();
  }

  // True (and starts the cooldown) if the player may fire right now.
  tryFire() {
    const now = this.scene.time.now;
    if (this.frozen || now - this.lastShotAt < PLAYER.fireCooldownMs) return false;
    this.lastShotAt = now;
    sfx.shoot();
    return true;
  }

  freeze() {
    this.frozen = true;
    this.sprite.setVelocity(0, 0);
  }

  update(delta) {
    if (this.frozen) return;
    const dir = (this.right ? 1 : 0) - (this.left ? 1 : 0);
    this.sprite.setVelocityX(dir * PLAYER.runSpeed);
    if (dir !== 0) this.facing = dir;
    this.sprite.setFlipX(this.facing < 0); // the source art faces right

    if (!this.onGround) {
      this.sprite.setTexture(this.jumpKey);
    } else if (dir !== 0) {
      this.sprite.setTexture(this.runAnimator.update(delta));
    } else {
      this.runAnimator.reset();
      this.sprite.setTexture(this.idleKey);
    }
  }
}
