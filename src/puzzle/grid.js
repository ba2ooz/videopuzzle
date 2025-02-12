export const createPuzzleGrid = (gridSize = 3) => {

  const TEX_COORD_SIZE = 8; // how many texture array locations define a texture quad
  const TEX_COORDS_ARRAY_SIZE = gridSize * gridSize * TEX_COORD_SIZE; // final texture array size
  
  let tilesMatrix = []; //new Array(gridSize * gridSize).fill().map(() => mat4.create());
  let tilesMatrixCopy = [];

  let shuffledTexCoords = [];
  let texCoords = [];
  let vertices = [];
  let indices = [];

  const generateGrid = () => {
    const tileSize = 2 / gridSize; // quad size in clip space (-1 to 1)
    let indexOffset = 0;

    // generate grid tiles coordinates for vertices, textures and indices
    for (let col = 0; col < gridSize; col++) {
      for (let row = 0; row < gridSize; row++) {
        // vertices coords 
        const tileVertices = [
          0,          0,         // Top-left 
          tileSize,   0,         // Top-right
          0,          -tileSize, // Bottom-left
          tileSize,   -tileSize, // Bottom-right
        ];

        // texture coords -> Top-left, Top-right, Bottom-left, Bottom-right
        let u = col / gridSize;
        let v = row / gridSize;
        const tileTexCoords = [
          u, v,                                // Top-left 
          u + 1 / gridSize, v,                 // Top-right
          u, v + 1 / gridSize,                 // Bottom-left 
          u + 1 / gridSize, v + 1 / gridSize,  // Bottom-right   
        ];

        // indices coords for two triangles (0, 1, 2) and (1, 2, 3)
        const tileIndices = [
          indexOffset,
          indexOffset + 1,
          indexOffset + 2,
          indexOffset + 1,
          indexOffset + 2,
          indexOffset + 3,
        ];

        // increment the index offset for the next tile
        indexOffset += 4;

        // create a model matrix for each tile to easily apply transformations later
        let x = -1 + col * tileSize;
        let y = 1 - row * tileSize;
        const tileMatrix = mat4.create();
        mat4.translate(tileMatrix, tileMatrix, [x, y, 0]);
        
        // push the generated data to the respective arrays
        tilesMatrix.push(tileMatrix);
        vertices.push(...tileVertices);
        texCoords.push(...tileTexCoords);
        indices.push(...tileIndices);
      }
    }

    // make a copy of the tiles matrix to reset the grid when needed
    tilesMatrixCopy = structuredClone(tilesMatrix);
    
    // shuffle the grid tiles
    shuffledTexCoords = shuffleTiles([...texCoords]);
  };

  const shuffleTiles = (tilesTexCoords) => {
    for (let i = 0; i < TEX_COORDS_ARRAY_SIZE; i += TEX_COORD_SIZE) {
      let swapIndex = 
        Math.floor(Math.random() * (TEX_COORDS_ARRAY_SIZE / TEX_COORD_SIZE)) * TEX_COORD_SIZE;

      for (let j = 0; j < TEX_COORD_SIZE; j++)
        [tilesTexCoords[i + j], tilesTexCoords[swapIndex + j]] =
          [tilesTexCoords[swapIndex + j], tilesTexCoords[i + j]];
    }

    return tilesTexCoords;
  };

  // translates the normalized coordinates to the grid coordinates
  const getTileCoords = (x, y) => {
    return {
      row: Math.floor(x * gridSize), 
      col: Math.floor(y * gridSize)
    };
  }

  // resets the tile to its original position
  const resetTile = (tileCoords) => {
    const tileIndex = tileCoords.row * gridSize + tileCoords.col;
    tilesMatrix[tileIndex] = structuredClone(tilesMatrixCopy[tileIndex]); 
  };

  // applies translation to the tile
  const moveTile = (tileCoords, x, y) => {
    // calculate the offsets to drag the tile by its center
    const tileVertixId = (gridSize * tileCoords.col + tileCoords.row) * TEX_COORD_SIZE;
    const tileCenterX = (vertices[tileVertixId] + vertices[tileVertixId + 2]) / 2;
    const tileCenterY = (vertices[tileVertixId + 1] + vertices[tileVertixId + 5]) / 2;
    const offsetX = x - tileCenterX;
    const offsetY = y - tileCenterY;

    // get the current tile translation
    const tileIndex = tileCoords.row * gridSize + tileCoords.col;
    const tile = tilesMatrix[tileIndex]; 
    const tileX = tile[12]; 
    const tileY = tile[13]; 

    // calculate the needed offset to move the tile to the new position
    const translateX = offsetX - tileX;
    const translateY = offsetY - tileY;
    const translateZ = 0.01;  // to render the dragged tile on top of the others 

    // apply translation to actually move the tile
    mat4.translate(tilesMatrix[tileIndex], tilesMatrix[tileIndex], [translateX, translateY, translateZ]);
  }

  const swapTiles = (tileFrom, tileTo) => {
    // tiles point to same location, no need to swap
    if (tileFrom.row === tileTo.row && tileFrom.col === tileTo.col) {
      return null;;
    }

    // tiles are out of bounds, no need to swap
    if (tileTo.row < 0 || tileTo.row >= gridSize || 
      tileTo.col < 0 || tileTo.col >= gridSize) {
        return null;
    }

    // get start ids of the tiles to be swapped
    const tileFromTexId = (gridSize * tileFrom.row + tileFrom.col) * TEX_COORD_SIZE;
    const tileToTexId = (gridSize * tileTo.row + tileTo.col) * TEX_COORD_SIZE;

    // swap the grid tiles
    for (let i = 0; i < TEX_COORD_SIZE; i++) {
      [shuffledTexCoords[tileFromTexId + i], shuffledTexCoords[tileToTexId + i]] =
        [shuffledTexCoords[tileToTexId + i], shuffledTexCoords[tileFromTexId + i]];
    }

    return shuffledTexCoords;
  };

  const isUnshuffled = () => {
    // the original and shuffled array should never be different in length
    if (texCoords.length !== shuffledTexCoords.length)
      throw Error("Something unexpected happened.");

    // if the shuffled textures array matches the original textures array then puzzle solved
    for (let i = 0; i < texCoords.length; i++) {
      if (texCoords[i] !== shuffledTexCoords[i])
        return false;
    }

    return true;
  };

  generateGrid();

  return {
    getVertices: () => vertices,
    getShuffledTexCoords: () => shuffledTexCoords,
    getIndices: () => indices,
    getTilesMatrix: () => tilesMatrix,
    getTileCoords,
    resetTile,
    swapTiles,
    moveTile,
    isUnshuffled,
  };
};

//  big picture
// gridSize
// 3
//
//  split the grid in row and col
//
// shuffled = [
// cell row/col|   puzzle texture    | start Id  |            formula
// 00      =>  0, 1, 3, 5, 6, 7, 8, 6,  // 0    => (gridSize * r + c) * cellSize => 0 * 8 => 0
// 01      =>  4, 5, 6, 7, 2, 4, 7, 8,  // 8    => (gridSize * r + c) * cellSize => 1 * 8 => 8
// 02      =>  3, 4, 5, 7, 8, 9, 0, 5,  // 16   => (gridSize * r + c) * cellSize => 2 * 8 => 16
// 10      =>  0, 1, 3, 5, 6, 7, 8, 6,  // 24   => (gridSize * r + c) * cellSize => 3 * 8 => 24
// 11      =>  4, 5, 6, 7, 2, 4, 7, 8,  // 32   => (gridSize * r + c) * cellSize => 4 * 8 => 32
// 12      =>  3, 4, 5, 7, 8, 9, 0, 5,  // 40   => (gridSize * r + c) * cellSize => 5 * 8 => 40
// 20      =>  0, 1, 3, 5, 6, 7, 8, 6,  // 48   => (gridSize * r + c) * cellSize => 6 * 8 => 48
// 21      =>  4, 5, 6, 7, 2, 4, 7, 8,  // 56   => (gridSize * r + c) * cellSize => 7 * 8 => 56
// 22      =>  3, 4, 5, 7, 8, 9, 0, 5   // 64   => (gridSize * r + c) * cellSize => 8 * 8 => 64
// ]
//
//  then swap textures
//  [shuffled[drop_id], shuffled[pop_id]] = [shuffled[pop_id], shuffled[drop_id]]
//  if original_array === shuffled_array >> puzzle_solved
