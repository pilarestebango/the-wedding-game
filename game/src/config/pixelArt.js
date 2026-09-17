// The one helper every code-generated prop/character/background texture goes
// through: draw at low logical resolution with a throwaway Graphics object,
// bake it into a real Texture, done. Idempotent — safe to call from any scene
// (e.g. a bare `?scene=final-boss` debug jump), since Phaser's TextureManager
// is game-global and survives scene restarts.
export function makeTexture(scene, key, drawFn, { width, height } = {}) {
  if (scene.textures.exists(key)) return key;
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  drawFn(g);
  g.generateTexture(key, width, height);
  g.destroy();
  return key;
}
