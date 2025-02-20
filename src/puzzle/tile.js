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

  constructor(id, col, row, gridSize) {
    // set tile id
    this.originalId = id;
    this.shuffleId = id;

    // set tile coords within the grid
    this.col = col;
    this.row = row;

    // set tile helper info
    this.gridSize = gridSize;
    this.tileSize = 2 / gridSize;   // tile size in clip space (-1 to 1)

    // set tile defaults
    this.isHighlighted = false;
    this.initModelMatrix();
    this.initTexture();
  }

  initModelMatrix() {
    this.modelMatrix = mat4.create();
    this.initialX = this.currentX = -1 + this.row * this.tileSize;
    this.initialY = this.currentY = 1 - this.col * this.tileSize;
    this.initialZ = this.currentZ = 0;
  }

  // Top-left, Top-right, Bottom-left, Bottom-right
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

  setTexture(texture) {
    this.texture = texture;
  }

  getTexture() {
    return this.texture;
  }

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

  resetTranslate() {
    this.currentX = this.initialX;
    this.currentY = this.initialY;
    this.currentZ = this.initialZ;
  }

  // highlights the tile
  higlight() {
    this.isHighlighted = true;
    return this;
  }

  // removes the highlight from the tile
  unhiglight() {
    this.isHighlighted = false;
    return null;
  }

  // swaps current tile's texture with onther tile's texture
  swap(otherTile) {
    // swap textures
    [this.texture, otherTile.texture] = [otherTile.texture, this.texture];
    // swap shuffleIds
    [this.shuffleId, otherTile.shuffleId] = [otherTile.shuffleId, this.shuffleId]; 
  }

  // the tile has the right identity when orginalId equals shuffleId
  checkIdentity() {
    return this.originalId === this.shuffleId;
  }

  // Top-left, Top-right, Bottom-left, Bottom-right
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
