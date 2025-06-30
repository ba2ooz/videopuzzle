import { Direction } from "./Direction";
import { Grid } from "./Grid";

export class TutorialGrid extends Grid {
  shuffleTextures() {
    this.swapIndex1 = 0;
    this.swapIndex2 = 1;
    this.shiftOnColumns(Direction.RIGHT);
    this.shiftOnRows(Direction.DOWN);
    this.tiles[this.swapIndex1].swapTexture(this.tiles[this.swapIndex2]);
    this.moves = 0;
  }

  handleDragAction(pointerX, pointerY) {
    // only allow dragging the tiles needed for the tutorial
    if (
      this.tiles.indexOf(this.draggedTile) !== this.swapIndex1 &&
      this.tiles.indexOf(this.draggedTile) !== this.swapIndex2
    ) {
      return;
    }

    super.handleDragAction(pointerX, pointerY);
  }

  handleSwapAction() {
    // only allow swapping the tiles needed for the tutorial
    if (
        this.tiles.indexOf(this.highlightedTile) !== this.swapIndex1 &&
        this.tiles.indexOf(this.highlightedTile) !== this.swapIndex2
      ) {
      return null;
    }

    return super.handleSwapAction();
  }

  destroy() {
    super.destroy();
    Object.keys(this).forEach(key => this[key] = null);
  }
}
