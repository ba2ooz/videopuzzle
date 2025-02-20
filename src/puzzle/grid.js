import { Direction } from "./direction.js";
import { Tile } from "./tile.js";

export class GameGrid {
  highlightedTile = null;
  draggedTile = null;

  vertices = [];
  indices = [];
  tiles = [];

  constructor(gridSize) {
    this.gridSize = gridSize;
    this.generateGrid();
    this.shuffleTextures();
  }

  // generates grid tiles, coordinates for vertices, textures and indices
  generateGrid() {
    let indexOffset = 0;
    let id = 0;

    for (let col = 0; col < this.gridSize; col++) {
      for (let row = 0; row < this.gridSize; row++) {
        const tile = new Tile(id, col, row, this.gridSize);
        this.vertices.push(...tile.getVertices());
        this.indices.push(...tile.getIndices(indexOffset));
        this.tiles.push(tile);

        indexOffset += 4;
        id++;
      }
    }
  }

  // Fisher–Yates shuffle algorithm - ensures each item is swapped only once
  shuffleTextures() {
    for (let i = this.tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      this.tiles[i].swap(this.tiles[j]);
    }
  }

  // checks each tile has the right identity as win condition
  isUnshuffled() {
    return this.tiles.every((tile) => tile.checkIdentity());
  }

  // sets initial state of the dragged and highlighted tiles
  initDragState(pointerX, pointerY) {
    this.draggedTile = this.getTileAt(pointerX, pointerY);
    if (!this.draggedTile) {
      return;
    }

    // set the initial state of the highlight object
    this.highlightedTile = this.draggedTile;
  }

  // clears the grid after a drag event
  clearDragState() {
    // reset the dragged tile
    if (this.draggedTile) {
      this.draggedTile.resetTranslate();
      this.draggedTile = null;
    }
    // clear highlight
    if (this.highlightedTile) {
      this.highlightedTile.unhiglight();
      this.highlightedTile = null;
    }
  }

  // translates and highlights the needed tiles
  handleDragAction(pointerX, pointerY) {
    // no dragged tile should not be a valid scenario
    if (this.draggedTile) {
      // translate dragged tile's position
      this.draggedTile.translate(pointerX, pointerY);
      // highlight the underneath tile as we drag over it
      this.handleHighlightAction(pointerX, pointerY);
    }
  }

  // highligths the tiles as the dragged tile moves over them
  handleHighlightAction(pointerX, pointerY) {
    // get the tile currently being pointed at - the potential tile to highlight
    const highlightTileCandidate = this.getTileAt(pointerX, pointerY);

    // only proceed further if the highlight tile candidate is not the already highlighted tile
    if (this.highlightedTile === highlightTileCandidate) {
      return;
    }

    // unhighlight the already highlighted tile when candiate tile coords change
    if (this.highlightedTile instanceof Tile) {
      this.highlightedTile = this.highlightedTile.unhiglight();
    }

    // only proceed further if the highlight candidate is not the dragged tile
    if (highlightTileCandidate === this.draggedTile) {
      return;
    }

    // highlight the candidate and update highlighted tile object state
    if (highlightTileCandidate instanceof Tile) {
      this.highlightedTile = highlightTileCandidate.higlight();
    }
  }

  // swaps the dragged tile with the one underneath it
  handleSwapAction() {
    // can't swap when tiles coords are not valid
    if (!this.draggedTile || !this.highlightedTile) {
      return null;
    }

    // tiles point to same location, no need to swap
    if (this.draggedTile === this.highlightedTile) {
      return null;
    }

    // swap
    this.draggedTile.swap(this.highlightedTile);
    const draggedTexture = this.draggedTile.getTexture();
    const highlightedTexture = this.highlightedTile.getTexture();

    // return offset ids for both textures and the respective data
    return {
      texture1: {
        offsetId: this.tiles.indexOf(this.draggedTile) * draggedTexture.length,
        data: draggedTexture,
      },
      texture2: {
        offsetId:
          this.tiles.indexOf(this.highlightedTile) * highlightedTexture.length,
        data: highlightedTexture,
      },
    };
  }

  // swaps all tiles within the grid left and right
  shiftOnColumns(direction) {
    let shiftOffset;
    if (direction === Direction.LEFT) {
      shiftOffset = 1;
    } else if (direction === Direction.RIGHT) {
      shiftOffset = -1;
    } else {
      return null;
    }

    for (let col = 0; col < this.gridSize; col++) {
      // get the tiles on the current column
      const colTiles = this.tiles.filter((tile) => tile.col === col);

      // extract the textures
      const extractedTextures = colTiles.map((tile) => tile.getTexture());

      // shift the textures
      const shiftedTextures = extractedTextures
        .slice(shiftOffset)
        .concat(extractedTextures.slice(0, shiftOffset));

      // apply the shifted textures to their respective tiles
      colTiles.forEach((tile, index) => {
        tile.setTexture(shiftedTextures[index]);
      });
    }

    return this.getTextures();
  }

  // swaps all tiles within the grid up and down`
  shiftOnRows(direction) {
    let shiftOffset;
    if (direction === Direction.UP) {
      shiftOffset = 1;
    } else if (direction === Direction.DOWN) {
      shiftOffset = -1;
    } else {
      return null;
    }

    for (let row = 0; row < this.gridSize; row++) {
      // get the tiles on the current row
      const rowTiles = this.tiles.filter((tile) => tile.row === row);

      // extract the textures
      const extraxctedTextures = rowTiles.map((tile) => tile.getTexture());

      // shift the textures
      const shiftedTextures = extraxctedTextures
        .slice(shiftOffset) // copy from offset index to the end
        .concat(extraxctedTextures.slice(0, shiftOffset)); // copy from start to offset index

      // apply shifted textures to their respective tiles
      rowTiles.forEach((tile, index) => {
        tile.setTexture(shiftedTextures[index]);
      });
    }

    return this.getTextures();
  }

  // translates input coordinates to grid coordinates and returns the tile at that location
  getTileAt(pointerX, pointerY) {
    return this.tiles.find(
      (tile) =>
        tile.row === Math.floor(pointerX * this.gridSize) &&
        tile.col === Math.floor(pointerY * this.gridSize)
    );
  }

  // gets the tiles textures as a flattened array
  getTextures() {
    let textures = [];
    this.tiles.forEach((tile) => {
      textures.push(...tile.texture);
    });

    return textures;
  }

  getVertices() {
    return this.vertices;
  }

  getIndices() {
    return this.indices;
  }

  getTiles() {
    return this.tiles;
  }
}
