// Small fade transition helper so scene changes aren't an abrupt cut.
export function fadeToScene(scene, key, data = {}, durationMs = 400) {
  scene.cameras.main.fadeOut(durationMs, 18, 11, 46);
  scene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
    scene.scene.start(key, data);
  });
}
