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
    // no dragged tile should not be a valid scenario
    if (!this.draggedTile) {
      return;
    }

    // only allow dragging the tiles needed for the tutorial
    if (
      this.tiles.indexOf(this.draggedTile) !== this.swapIndex1 &&
      this.tiles.indexOf(this.draggedTile) !== this.swapIndex2
    ) {
      return;
    }

    // translate dragged tile's position
    this.draggedTile.translate(pointerX, pointerY);
    // highlight the underneath tile as we drag over it
    this.handleHighlightAction(pointerX, pointerY);
  }

  handleSwapAction() {
    // can't swap when tiles coords are not valid
    if (!this.draggedTile || !this.highlightedTile) {
      return null;
    }

    // tiles point to same location, no need to swap
    if (this.draggedTile === this.highlightedTile) {
      return null;
    }

    // only allow swapping the tiles needed for the tutorial
    if (
        this.tiles.indexOf(this.highlightedTile) !== this.swapIndex1 &&
        this.tiles.indexOf(this.highlightedTile) !== this.swapIndex2
      ) {
      return null;
    }

    // update moves counter
    this.moves++;

    // swap
    this.draggedTile.swapTexture(this.highlightedTile);
    const draggedTexture = this.draggedTile.getTexture();
    const highlightedTexture = this.highlightedTile.getTexture();

    // return offset ids for both textures and the respective data
    return {
      source: {
        tile: this.draggedTile,
        texture: {
          offsetId:
            this.tiles.indexOf(this.draggedTile) * draggedTexture.length,
          data: draggedTexture,
        },
      },
      target: {
        tile: this.highlightedTile,
        texture: {
          offsetId:
            this.tiles.indexOf(this.highlightedTile) *
            highlightedTexture.length,
          data: highlightedTexture,
        },
      },
    };
  }

  destroy() {
    super.destroy();
    Object.keys(this).forEach(key => this[key] = null);
  }
}
