import { TileAnimation } from "./TileAnimation";

export class SneakPeekAnimation extends TileAnimation {
  constructor(tile, totalDuration, delay = 0) {
    // make total duration longer to account for all tiles
    super(tile, totalDuration);
    this.delay = delay;
    this.initialScale = 1.0;
    this.targetScale = 1.3;
    this.initialZ = tile.initialZ;
  }

  animate(progress) {
    // convert the 0-1 progress to the actual time in milliseconds
    const currentTime = progress * this.duration;

    if (currentTime < this.delay) return;

    // calculate progress for this specific tile's animation
    const tileProgress = (currentTime - this.delay) / this.duration;
    const scale = this.lerp(
      this.targetScale,
      this.initialScale,
      this.easeOutBackTwiceStylized(tileProgress)
    );

    this.tile.currentZ = 0.01;
    this.tile.setScale(scale);
  }

  complete() {
    this.tile.setScale(this.initialScale);
    this.tile.currentZ = this.initialZ;
  }

  easeOutBackTwiceStylized(x) {
    const phaseThreshold = 0.1;
    const lingerDuration = 0.75;

    if (x < phaseThreshold) {
      // first phase
      x = this.easeInOutSine(x / lingerDuration);
      return 0.5 * this.easeOutBackModified(x);
    } else {
      // second phase
      x = (x - lingerDuration) / (1 - lingerDuration); // normalize to 0 - 1
      x = this.easeOutCubic(x); // speed up return
      return 0.5 + 0.5 * this.easeOutBackModified(x, true);
    }
  }

  easeOutBackModified(x, stronger = false) {
    const c1 = stronger ? 2.5 : 2.0; // second phase is snappier
    const c2 = c1 * 1.7;

    return 1 + c2 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  }

  // slow down in the middle
  easeInOutSine(x) {
    return -(Math.cos(Math.PI * x) - 1) / 2;
  }

  // speed up return
  easeOutCubic(x) {
    return 1 - Math.pow(1 - x, 3);
  }
}
