import { SneakPeekAnimation } from "./SneakPeekAnimation";
import { TileSwapAnimation } from "./TileSwapAnimation";
import { TileWinAnimation } from "./TileWinAnimation";

export class GridAnimationController {
  constructor(gridSize) {
    this.gridSize = gridSize;
    this.animations = [];
  }

  createSneakPeekAnimations(tiles) {
    const totalAnimationDuration = 1600; // ms
    const baseDelay = totalAnimationDuration / this.gridSize / this.gridSize;

    for (let row = 0; row < this.gridSize; row++) {
      // get the tiles on the current row
      const rowTiles = tiles.filter((tile) => tile.row === row);

      // apply sneak peek animation for each tile
      rowTiles.forEach((tile, index) => {
        const tileAnimationDelay = index * baseDelay;
        const animation = new SneakPeekAnimation(
          tile,
          totalAnimationDuration,
          tileAnimationDelay
        );
        this.animations.push(animation);
      });
    }

    return totalAnimationDuration - 500;
  }

  createWinAnimations(tiles) {
    const totalAnimationDuration = 1600;
    const baseDelay = totalAnimationDuration / (this.gridSize * this.gridSize);

    for (let row = 0; row < this.gridSize; row++) {
      // get the tiles on the current row
      const rowTiles = tiles.filter((tile) => tile.row === row);

      // apply win animation for each tile
      rowTiles.forEach((tile, index) => {
        const tileAnimationDelay = (row + index) * baseDelay; //ms
        this.animations.push(
          new TileWinAnimation(tile, totalAnimationDuration, tileAnimationDelay)
        );
      });
    }
  }

  createSwapAnimation(sourceTile, targetTile) {
    const targetPosition = targetTile.getInitialPosition();
    this.animations.push(new TileSwapAnimation(sourceTile, targetPosition));
  }

  createShiftAnimations(shiftedResult) {
    // data will be all the tiles either in a column or in a row
    shiftedResult.forEach((data) => {

      data.tilesBeforeShift.forEach((tile, index) => {
        const zFactor = data.tilesAfterShift[index].initialZ;
        const targetPosition = {
          x: data.tilesAfterShift[index].initialX,
          y: data.tilesAfterShift[index].initialY,
        };
        this.animations.push(
          new TileSwapAnimation(tile, targetPosition, zFactor)
        );
      });
    });
  }

  updateAnimations(deltaTime) {
    this.animations = this.animations.filter((animation) =>
      animation.update(deltaTime)
    );
  }

  destroy() {
    this.animations = null;
  }
}
