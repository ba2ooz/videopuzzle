export class TileAnimation {
  progress = 0; // 0 = start, 1 = finished
  duration = 140; // animation duration in milliseconds
  animationZ = -0.01; // by default move the animated tile behind the others

  constructor(tile, startPos, zFactor = 1) {
    this.tile = tile;
    this.startPos = startPos;
    this.targetPos = tile.getInitialPosition();
    this.animationZ *= zFactor;
  }

  /**
   * Updates the tile animation based on the elapsed time.
   *
   * @param {number} deltaTime - The time elapsed since the last update, in milliseconds.
   * @returns {boolean} - Returns false if the animation is complete and should be removed from active animations, true otherwise.
   */
  update(deltaTime) {
    console.log(deltaTime);
    this.progress += deltaTime / this.duration;
    if (this.progress >= 1) {
      const endPosition = {
        x: this.targetPos.x,
        y: this.targetPos.y,
        z: this.tile.initialZ,
      };

      // update tile's current position
      this.tile.setCurrentPosition(endPosition);
 
      return false; // remove from active animations
    }

    // interpolate position (smooth movement)
    const interpolatedPos = {
      x: this.lerp(this.startPos.x, this.targetPos.x, this.progress),
      y: this.lerp(this.startPos.y, this.targetPos.y, this.progress),
      z: this.animationZ // z should be fixed
    }
    
    // update tile's current position
    this.tile.setCurrentPosition(interpolatedPos);

    return true; // animation still active
  }

  lerp(start, end, t) {
    return start * (1 - t) + end * t;
  }
}
