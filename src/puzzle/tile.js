import { mat4 } from 'gl-matrix'; 

export class Tile {
  initialX;
  initialY;
  initialZ;

  currentX;
  currentY;
  currentZ;

  texture;
  originalId;
  shuffleId;

  /**
   * Creates a new Tile instance.
   * @param {number} id - The ID of the tile.
   * @param {number} col - The column position of the tile in the grid.
   * @param {number} row - The row position of the tile in the grid.
   * @param {number} gridSize - The size of the grid.
   */
  constructor(id, col, row, gridSize) {
    // set tile id
    this.originalId = id;
    this.shuffleId = id;

    // set tile coords within the grid
    this.col = col;
    this.row = row;

    // set tile helper info
    this.gridSize = gridSize;
    this.tileSize = 2 / gridSize; // tile size in clip space (-1 to 1)

    // set tile defaults
    this.isHighlighted = false;
    this.initModelMatrix();
    this.initTexture();
  }

  /**
   * Initializes the model matrix and sets the initial and current coordinates.
   */
  initModelMatrix() {
    this.modelMatrix = mat4.create();
    this.initialX = this.currentX = -1 + this.row * this.tileSize;
    this.initialY = this.currentY = 1 - this.col * this.tileSize;
    this.initialZ = this.currentZ = 0;
  }

  /**
   * Initializes the texture coordinates of the tile.
   */
  initTexture() {
    const u = this.row / this.gridSize;
    const v = this.col / this.gridSize;

    this.texture = [
      u,
      v,
      u + 1 / this.gridSize,
      v,
      u,
      v + 1 / this.gridSize,
      u + 1 / this.gridSize,
      v + 1 / this.gridSize,
    ];
  }

  /**
   * Sets the texture coordinates of the tile.
   * @param {number[]} texture - The new texture coordinates.
   */
  setTexture(texture) {
    this.texture = texture;
  }

  /**
   * Gets the texture coordinates of the tile.
   * @returns {number[]} The texture coordinates.
   */
  getTexture() {
    return this.texture;
  }

  /**
   * Gets the initial position of the tile.
   * 
   * @returns {Object} An object containing the initial x, y, and z coordinates.
   */
  getInitialPosition() {
    return {
      x: this.initialX,
      y: this.initialY,
      z: this.initialZ
    }
  }

  /**
   * Gets the current position of the tile.
   * 
   * @returns {Object} An object containing the current x, y, and z coordinates.
   */
  getCurrentPosition() {
    return {
      x: this.currentX,
      y: this.currentY,
      z: this.currentZ
    }
  }

  /**
   * Sets the current position of the tile.
   *
   * @param {Object} position - An object containing the new x, y, and z coordinates to be set as current position.
   */
  setCurrentPosition(position) {
      this.currentX = position.x;
      this.currentY = position.y;
      this.currentZ = position.z;
  }

  /**
   * Translates the tile to a new position.
   * @param {number} newX - The new X coordinate.
   * @param {number} newY - The new Y coordinate.
   */
  translate(newX, newY) {
    // normalize the input coordinates
    const normalizedX = 2 * newX - 1;
    const normalizedY = 1 - 2 * newY;

    // calculate the offsets to drag the tile by its center
    const tileCenterX = this.tileSize / 2;
    const tileCenterY = -this.tileSize / 2;
    const offsetX = normalizedX - tileCenterX;
    const offsetY = normalizedY - tileCenterY;

    // set the tile's new position
    this.currentX = offsetX;
    this.currentY = offsetY;
    this.currentZ = 0.001; // to render the dragged tile on top of the others
  }

  /**
   * Resets the tile's position to its initial coordinates.
   */
  resetTranslate() {
    this.currentX = this.initialX;
    this.currentY = this.initialY;
    this.currentZ = this.initialZ;
  }

  /**
   * Highlights the tile.
   * @returns {Tile} The current tile instance.
   */
  highlight() {
    this.isHighlighted = true;
    return this;
  }

  /**
   * Removes the highlight from the tile.
   * @returns {null} Null when the tile is unhighlighted.
   */
  unhighlight() {
    this.isHighlighted = false;
    return null;
  }

  /**
   * Swaps the current tile's texture and shuffle ID with another tile.
   * @param {Tile} otherTile - The other tile to swap with.
   * @returns {void} void.
   */
  swapTexture(otherTile) {
    // swap textures
    [this.texture, otherTile.texture] = [otherTile.texture, this.texture];
    // swap shuffleIds
    [this.shuffleId, otherTile.shuffleId] = [
      otherTile.shuffleId,
      this.shuffleId,
    ];
  }

  /**
   * Checks if the tile has the correct identity.
   * @returns {boolean} True if the tile's original ID matches its shuffle ID.
   */
  checkIdentity() {
    return this.originalId === this.shuffleId;
  }

  /**
   * Gets the vertices of the tile - 2 coordinates per corner, 4 corners.
   * @returns {number[]} The vertices of the tile in this order: Top-left, Top-right, Bottom-left, Bottom-right.
   */
  getVertices() {
    return [
      0,
      0,
      this.tileSize,
      0,
      0,
      -this.tileSize,
      this.tileSize,
      -this.tileSize,
    ];
  }

  /**
   * Gets the indices for the tile's vertices.
   * @param {number} indexOffset - The offset for the indices.
   * @returns {number[]} The indices for the tile's vertices.
   */
  getIndices(indexOffset) {
    return [
      indexOffset,
      indexOffset + 1,
      indexOffset + 2,
      indexOffset + 1,
      indexOffset + 2,
      indexOffset + 3,
    ];
  }
}
