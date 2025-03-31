export class AnimationUtils {
  static easeOutBackTwiceStylized(x, phaseThreshold, lingerDuration) {
    if (x < phaseThreshold) {
      // first phase
      x = AnimationUtils.easeInOutSine(x / lingerDuration);
      return 0.5 * AnimationUtils.easeOutBackModified(x);
    } else {
      // second phase
      x = (x - lingerDuration) / (1 - lingerDuration); // normalize to 0 - 1
      x = AnimationUtils.easeOutCubic(x); // speed up return
      return 0.5 + 0.5 * AnimationUtils.easeOutBackModified(x, true);
    }
  }

  static easeOutBackModified(x, stronger = false) {
    const c1 = stronger ? 2.5 : 2.0; // second phase is snappier
    const c2 = c1 * 1.7;

    return 1 + c2 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
  }

  // slow down in the middle
  static easeInOutSine(x) {
    return -(Math.cos(Math.PI * x) - 1) / 2;
  }

  // speed up return
  static easeOutCubic(x) {
    return 1 - Math.pow(1 - x, 3);
  }
}
