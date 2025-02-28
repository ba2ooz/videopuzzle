import { TileAnimation } from "./TileAnimation.js";

export class TileSwapAnimation extends TileAnimation {
  constructor(tile, startPos, zFactor = 1) {
    super(tile);
    this.startPos = startPos;
    this.targetPos = tile.getInitialPosition();
    this.animationZ = -0.01 * zFactor; // by default move the animated tile behind the others
  }

  animate(progress) {
    // interpolate position (smooth movement)
    const interpolatedPos = {
      x: this.lerp(this.startPos.x, this.targetPos.x, progress),
      y: this.lerp(this.startPos.y, this.targetPos.y, progress),
      z: this.animationZ, // z should be fixed
    };

    // update tile's current position
    this.tile.setCurrentPosition(interpolatedPos);
  }

  complete() {
    const endPosition = {
      x: this.targetPos.x,
      y: this.targetPos.y,
      z: this.tile.initialZ,
    };

    // update tile's current position
    this.tile.setCurrentPosition(endPosition);
  }
}
