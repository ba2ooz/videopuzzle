import { TileSwapAnimation } from "../../animations/TileSwapAnimation.js";
import { TileWinAnimation } from "../../animations/TileWinAnimation.js";
import { Direction } from "./Direction.js";
import { Tile } from "./Tile.js";

/**
 * Holds and manages the game grid state
 *
 * @param {number} gridSize
 */
export class Grid {
  highlightedTile = null;
  draggedTile = null;

  vertices = [];
  indices = [];
  tiles = [];

  animations = [];

  moves = 0;

  constructor(gridSize) {
    this.gridSize = gridSize;
    this.generateGrid();
    this.shuffleTextures();
  }

  /**
   * Generates grid tiles, coordinates for vertices, textures and indices
   *
   * @returns {void} void
   */
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

  /**
   * Shuffles the texture properties within the GameGrid tiles collection
   *
   * @uses FisherYates shuffle algorithm - ensures each item is swapped only once
   * @returns {void} void
   */
  shuffleTextures() {
    for (let i = this.tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      this.tiles[i].swapTexture(this.tiles[j]);
    }
  }

  /**
   * Checks if all tiles in the grid are in their original positions.
   *
   * @returns {boolean} True if all tiles are in their original positions, otherwise false.
   */
  isUnshuffled() {
    return this.tiles.every((tile) => tile.checkIdentity());
  }

  /**
   * Creates a win animation for each tile of the grid.
   */
  unshuffledWithSuccess() {
    const delay = 100; // ms

    for (let row = 0; row < this.gridSize; row++) {
      // get the tiles on the current row
      const rowTiles = this.tiles.filter((tile) => tile.row === row);

      // apply win animation for each tile
      rowTiles.forEach((tile, index) => {
        const animationDelay = ((row + index) * delay); //ms
        const animationDuration = delay*this.gridSize*this.gridSize;
        this.animations.push(
          new TileWinAnimation(tile, animationDuration, animationDelay)
        );
      });
    }
  }

  /**
   * Initializes the drag state by setting the dragged tile based on the given pointer coordinates.
   * If a tile is found at the specified coordinates, it also sets the highlighted tile to the dragged tile.
   *
   * @param {number} pointerX - The x-coordinate of the pointer.
   * @param {number} pointerY - The y-coordinate of the pointer.
   * @returns {void} void
   */
  initDragState(pointerX, pointerY) {
    this.draggedTile = this.getTileAt(pointerX, pointerY);
    if (!this.draggedTile) {
      return;
    }

    // set the initial state of the highlight object
    this.highlightedTile = this.draggedTile;
  }

  /**
   * Clears the drag state by resetting the dragged tile and removing any highlights.
   *
   * This method performs the following actions:
   * 1. Resets the translation of the currently dragged tile and sets it to null.
   * 2. Removes the highlight from the currently highlighted tile and sets it to null.
   *
   * @returns {void} void
   */
  clearDragState() {
    // reset the dragged tile
    if (this.draggedTile) {
      this.draggedTile.resetTranslate();
      this.draggedTile = null;
    }
    // clear highlight
    if (this.highlightedTile) {
      this.highlightedTile.unhighlight();
      this.highlightedTile = null;
    }
  }

  /**
   * Handles the drag action for a tile.
   *
   * @param {number} pointerX - The x-coordinate of the pointer.
   * @param {number} pointerY - The y-coordinate of the pointer.
   * @returns {void} void
   */
  handleDragAction(pointerX, pointerY) {
    // no dragged tile should not be a valid scenario
    if (this.draggedTile) {
      // translate dragged tile's position
      this.draggedTile.translate(pointerX, pointerY);
      // highlight the underneath tile as we drag over it
      this.handleHighlightAction(pointerX, pointerY);
    }
  }

  /**
   * Highlights the tiles as the dragged tile moves over them.
   *
   * @param {number} pointerX - The x-coordinate of the pointer.
   * @param {number} pointerY - The y-coordinate of the pointer.
   * @returns {void} void
   */
  handleHighlightAction(pointerX, pointerY) {
    // get the tile currently being pointed at - the potential tile to highlight
    const highlightTileCandidate = this.getTileAt(pointerX, pointerY);

    // only proceed further if the highlight tile candidate is not the already highlighted tile
    if (this.highlightedTile === highlightTileCandidate) {
      return;
    }

    // unhighlight the already highlighted tile when candiate tile coords change
    if (this.highlightedTile instanceof Tile) {
      this.highlightedTile = this.highlightedTile.unhighlight();
    }

    // only proceed further if the highlight candidate is not the dragged tile
    if (highlightTileCandidate === this.draggedTile) {
      return;
    }

    // highlight the candidate and update highlighted tile object state
    if (highlightTileCandidate instanceof Tile) {
      this.highlightedTile = highlightTileCandidate.highlight();
    }
  }

  /**
   * Handles the swap action between two tiles.
   *
   * This method performs the following steps:
   * 1. Checks if the dragged tile and highlighted tile are valid.
   * 2. Ensures the tiles are not pointing to the same location.
   * 3. Swaps the textures of the dragged tile and highlighted tile.
   * 4. Returns the offset IDs and texture data for both tiles.
   *
   * @returns  {Object|null}               An object containing the two texture objects:
   * @property {Object} texture1          - The first texture object.
   * @property {number} texture1.offsetId - The offset ID for the dragged tile's texture.
   * @property {Array}  texture1.data     - The texture data for the dragged tile.
   *
   * @property {Object} texture2          - The second texture object.
   * @property {number} texture2.offsetId - The offset ID for the highlighted tile's texture.
   * @property {Array}  texture2.data     - The texture data for the highlighted tile.
   */
  handleSwapAction() {
    // can't swap when tiles coords are not valid
    if (!this.draggedTile || !this.highlightedTile) {
      return null;
    }

    // tiles point to same location, no need to swap
    if (this.draggedTile === this.highlightedTile) {
      return null;
    }

    // update moves counter
    this.moves++;

    // swap
    this.draggedTile.swapTexture(this.highlightedTile);
    const draggedTexture = this.draggedTile.getTexture();
    const highlightedTexture = this.highlightedTile.getTexture();

    // create animation for the swap
    this.animations.push(
      new TileSwapAnimation(
        this.draggedTile,
        this.highlightedTile.getInitialPosition()
      )
    );

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

  /**
   * Shifts(swaps) the textures of the tiles in the grid in the specified direction.
   *
   * @param {Direction} direction - The direction to shift the textures.
   *                                Use `Direction.LEFT` to shift left and `Direction.RIGHT` to shift right.
   * @returns {Array} The updated textures of the grid after the shift.
   */
  shiftOnColumns(direction) {
    // update moves counter
    this.moves++;

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

      const colTilesCopy = colTiles.map((tile) => {
        let tileCopy = { ...tile }; // create a shallow copy of the current tile
        // this is to ensure correct z value during shifting animation for the first row tiles
        if (tileCopy.row === 0) {
          tileCopy.initialZ = shiftOffset;
        }

        return tileCopy;
      });

      // shift tiles
      const slice1 = colTilesCopy.slice(shiftOffset);
      const slice2 = colTilesCopy.slice(0, shiftOffset);
      const shiftedTilesCopy = slice1.concat(slice2);

      // apply the shifted textures to their respective tiles
      colTiles.forEach((tile, index) => {
        tile.swapTexture(shiftedTilesCopy[index]);

        // create animation for the shift
        const shiftedTilePos = {
          x: shiftedTilesCopy[index].initialX,
          y: shiftedTilesCopy[index].initialY,
          z: shiftedTilesCopy[index].initialZ,
        };
        this.animations.push(
          new TileSwapAnimation(tile, shiftedTilePos, shiftedTilePos.z)
        );
      });
    }

    return this.getTextures();
  }

  /**
   * Shifts(swaps) the textures of the tiles in the grid in the specified direction.
   *
   * @param {Direction} direction - The direction to shift the textures.
   *                                Use `Direction.UP` to shift up and `Direction.DOWN` to shift down.
   * @returns {Array} The updated textures of the grid after the shift.
   */
  shiftOnRows(direction) {
    // update moves counter
    this.moves++;

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
      const rowTilesCopy = rowTiles.map((tile) => {
        // first col tiles should appear behind all the others during shift animation
        // z should be negative when shifting up, and positive otherwise
        let tileCopy = { ...tile };
        if (tileCopy.col === 0) {
          tileCopy.initialZ = shiftOffset;
        }

        return tileCopy;
      });

      // shift tiles
      const slice1 = rowTilesCopy.slice(shiftOffset); // copy from offset index to the end
      const slice2 = rowTilesCopy.slice(0, shiftOffset); // copy from start to offset index
      const shiftedTilesCopy = slice1.concat(slice2);

      // apply shifted textures to their respective tiles and apply animations
      rowTiles.forEach((tile, index) => {
        tile.swapTexture(shiftedTilesCopy[index]);

        // create animation for the shift
        const shiftedTilePos = {
          x: shiftedTilesCopy[index].initialX,
          y: shiftedTilesCopy[index].initialY,
          z: shiftedTilesCopy[index].initialZ,
        };
        this.animations.push(
          new TileSwapAnimation(tile, shiftedTilePos, shiftedTilePos.z)
        );
      });
    }

    return this.getTextures();
  }

  /**
   * Updates the animations by filtering out those that have completed.
   *
   * @param {number} deltaTime - The time elapsed since the last update, in milliseconds.
   */
  updateAnimations(deltaTime) {
    this.animations = this.animations.filter((animation) =>
      animation.update(deltaTime)
    );
  }

  /**
   * Retrieves the tile at the specified pointer coordinates.
   *
   * @param   {number}          pointerX - The X coordinate of the pointer.
   * @param   {number}          pointerY - The Y coordinate of the pointer.
   * @returns {Object|undefined} The tile object at the specified coordinates, or undefined if no tile is found.
   */
  getTileAt(pointerX, pointerY) {
    return this.tiles.find(
      (tile) =>
        tile.row === Math.floor(pointerX * this.gridSize) &&
        tile.col === Math.floor(pointerY * this.gridSize)
    );
  }

  /**
   * Retrieves an array of textures from the tiles collection.
   *
   * @returns {Array} An array containing all the textures from the tiles collection.
   */
  getTextures() {
    let textures = [];
    this.tiles.forEach((tile) => {
      textures.push(...tile.texture);
    });

    return textures;
  }

  /**
   * Returns the vertices array.
   *
   * @returns {Array} An array containing all the vertices for the grid tiles.
   */
  getVertices() {
    return this.vertices;
  }

  /**
   * Returns the indices array.
   *
   * @returns {Array} An array containing all the indices for the grid tiles.
   */
  getIndices() {
    return this.indices;
  }

  /**
   * Returns the tiles array.
   *
   * @returns {Array} An array containing all the tiles of the grid.
   */
  getTiles() {
    return this.tiles;
  }

  getMovesCount() {
    return this.moves;
  }

  destroy() {
    this.tiles.forEach((tile) => tile.destroy());
    this.highlightedTile = null;
    this.draggedTile = null;
    this.animations = null;
    this.vertices = null;
    this.indices = null;
    this.tiles = null;
    this.moves = null;
  }
}
