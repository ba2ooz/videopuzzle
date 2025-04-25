export class TileAnimation {
  constructor(tile, duration = 140) {
    this.tile = tile;
    this.progress = 0;
    this.duration = duration;
  }

  /**
   * Updates the tile animation based on the elapsed time.
   *
   * @param   {number}  deltaTime - The time elapsed since the last update, in milliseconds.
   * @returns {boolean}           - Returns false if the animation is complete and should be removed from active animations, true otherwise.
   */
  update(deltaTime) {
    this.progress += deltaTime / this.duration;
    if (this.progress >= 1) {
      this.complete();
      return false; // remove from active animations
    }

    this.animate(this.progress);
    return true; // animation still active
  }

  animate(progress) {
    throw new Error("animate() should be implemented by child class");
  }

  complete() {
    throw new Error("complete() should be implemented by child class");
  }

  lerp(start, end, t) {
    return start * (1 - t) + end * t;
  }
}
