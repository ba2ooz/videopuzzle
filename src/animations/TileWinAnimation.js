import { TileAnimation } from "./TileAnimation";
import { AnimationUtils } from "./AnimationUtils";

export class TileWinAnimation extends TileAnimation {
  constructor(tile, totalDuration, delay = 0) {
    // make total duration longer to account for all tiles
    super(tile, totalDuration + 1000);
    this.delay = delay;
    this.initialScale = 1.0;
    this.targetScale = 1.1;
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
      AnimationUtils.easeOutBackTwiceStylized(tileProgress, 0.25, 0.1)
    );

    this.tile.currentZ = 0.01;
    this.tile.setScale(scale);
  }

  complete() {
    this.tile.setScale(this.initialScale);
    this.tile.currentZ = this.initialZ;
  }
}
