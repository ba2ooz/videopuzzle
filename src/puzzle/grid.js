export const createPuzzleGrid = (gridSize = 3) => {

  const TEX_COORD_SIZE = 8; // how many texture array locations define a texture quad
  const TEX_COORDS_ARRAY_SIZE = gridSize * gridSize * TEX_COORD_SIZE; // final texture array size
  
  let draggedTile = null;
  let highlightedTile = null;

  let tilesMatrix = []; //new Array(gridSize * gridSize).fill().map(() => mat4.create());
  let tilesMatrixBackup = [];

  let shuffledTextures = [];
  let textures = [];
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
        tilesMatrix.push({modelMatrix: tileMatrix, isHighlighted: false});
        vertices.push(...tileVertices);
        textures.push(...tileTexCoords);
        indices.push(...tileIndices);
      }
    }

    // make a copy of the tiles matrix to reset their position when needed
    tilesMatrixBackup = structuredClone(tilesMatrix);
    
    // shuffle the grid tiles to scramble the puzzle
    shuffleTiles();
  };

  const shuffleTiles = () => {
    shuffledTextures = [...textures];

    for (let i = 0; i < TEX_COORDS_ARRAY_SIZE; i += TEX_COORD_SIZE) {
      let swapIndex = 
        Math.floor(Math.random() * (TEX_COORDS_ARRAY_SIZE / TEX_COORD_SIZE)) * TEX_COORD_SIZE;

      for (let j = 0; j < TEX_COORD_SIZE; j++)
        [shuffledTextures[i + j], shuffledTextures[swapIndex + j]] =
          [shuffledTextures[swapIndex + j], shuffledTextures[i + j]];
    }
  };

  // sets initial state of the dragged and highlighted tiles
  const initDragState = (pointerX, pointerY) => {
    draggedTile = getTileCoords(pointerX, pointerY);
    // set the initial state of the highlight object
    highlightedTile = draggedTile;
  }

  // cleans the grid
  const cleanDragState = () => {
    if (!draggedTile){
      return;
    }

    // reset the dragged tile position
    const tileIndex = draggedTile.row * gridSize + draggedTile.col;
    tilesMatrix[tileIndex] = structuredClone(tilesMatrixBackup[tileIndex]); 
    draggedTile = null;

    // clear highlight
    unhiglightTile(highlightedTile);
    highlightedTile = null;
  };

  // translates received coordinates to grid coordinates
  const getTileCoords = (x, y) => {
    return {
      row: Math.floor(x * gridSize), 
      col: Math.floor(y * gridSize)
    };
  }

  // translates and highlights the needed tiles
  const dragTile = (pointerX, pointerY) => {
    // no dragged tile should not be a valid scenario
    if (!validTileCoords(draggedTile)){
      return;
    }

    // translate dragged tile's position
    handleTranslateTile(pointerX, pointerY);
    // highlight the underneath tile as we drag over it
    handleHighlightTile(pointerX, pointerY);
  }

  // swap the dragged tile with the one underneath it
  const swapTiles = () => {
    // can't swap when tiles coords are not valid
    if (
      !validTileCoords(draggedTile) || 
      !validTileCoords(highlightedTile)
    ) {
        return null;
    }

    // tiles point to same location, no need to swap
    if (
      draggedTile.row === highlightedTile.row && 
      draggedTile.col === highlightedTile.col
    ) {
      return null;
    }

    // get start ids of the tiles to be swapped
    const tileFromTexId = 
      (gridSize * draggedTile.row + draggedTile.col) * TEX_COORD_SIZE;
    const tileToTexId = 
      (gridSize * highlightedTile.row + highlightedTile.col) * TEX_COORD_SIZE;

    // swap the tiles textures
    for (let i = 0; i < TEX_COORD_SIZE; i++) {
      [shuffledTextures[tileFromTexId + i], shuffledTextures[tileToTexId + i]] =
        [shuffledTextures[tileToTexId + i], shuffledTextures[tileFromTexId + i]];
    }

    return shuffledTextures;
  };

  const shiftRows = (direction) => {
    // let lastRowCopies = [];

    // let lastRow = gridSize - 1;
    // for (let col = 0; col < gridSize; col++){
    //   const sourceId = col * gridSize * TEX_COORD_SIZE + lastRow * TEX_COORD_SIZE;
  
    //   for (let texCoordId = 0; texCoordId < TEX_COORD_SIZE; texCoordId++){
    //       lastRowCopies.push(shuffledTextures[sourceId + texCoordId])
    //   }
    // }

    // for (let row = gridSize - 2; row >= 0; row--){
    //   for (let col = 0; col < gridSize; col++){
    //     const sourceId = col * gridSize * TEX_COORD_SIZE + row * TEX_COORD_SIZE;
    //     let targetId = sourceId + TEX_COORD_SIZE;
    
    //     for (let texCoordId = 0; texCoordId < TEX_COORD_SIZE; texCoordId++){
    //         shuffledTextures[targetId + texCoordId] = shuffledTextures[sourceId + texCoordId]
    //     }
    //   }
    // }

    // for (let col = 0; col < gridSize; col++){
    //   let targetId = col * gridSize * TEX_COORD_SIZE;
  
    //   for (let texCoordId = 0; texCoordId < TEX_COORD_SIZE; texCoordId++){
    //     shuffledTextures[targetId + texCoordId] = lastRowCopies[col * TEX_COORD_SIZE + texCoordId]
    //   }
    // }

    // return shuffledTextures;
    let shiftOffset;
    let messedUpRowSource;
    let messedUpRowTarget;
    if ( direction === "UP" ) {
      shiftOffset = TEX_COORD_SIZE;
      messedUpRowSource = 0;
      messedUpRowTarget = gridSize - 1;
    }

    if ( direction === "DOWN" ) {
      shiftOffset = -1 * TEX_COORD_SIZE;
      messedUpRowSource = gridSize - 1;
      messedUpRowTarget = 0;
    }

    // because we shift up or down by one tile 
    // the resulted grid will end up looking differently
    // than we desire as depicted below, 
    // so to avoid this, we are going to create a copy of the
    // first or last row while it has the right order 
    // and replace the messed up tiles with the copied good ones
    //
    //            | because textures are stored contiguously by column  |
    //            | t1 is first item in the array                       |
    //            | t9 is the last item in the array                    |    
    //            | after shift t9 will replace t1 which is not desired |
    //            | t9 should replace t6                                |
    //
    //                            shift down example 
    //
    //                     
    //  original grid              after shift grid                after replace grid
    //
    //    t1 t4 t7                     t9 t3 t6 -> (bad first row)      t3 t6 t9 -> (good first row)
    //    t2 t5 t8  => will end up =>  t1 t4 t7  =>    should be    =>  t1 t4 t7
    //    t3 t6 t9                     t2 t5 t8                         t2 t5 t8

    // backup the first/last row wich will end messed up after tiles shift
    let messedUpRow = [];
    for (let col = 0; col < gridSize; col++){
      const sourceId = 
        col * gridSize * TEX_COORD_SIZE + messedUpRowSource * TEX_COORD_SIZE;

      for (let texCoordId = 0; texCoordId < TEX_COORD_SIZE; texCoordId++){
        messedUpRow.push(shuffledTextures[sourceId + texCoordId])
      }
    }

    // shift the textures on columns by one tile up/down
    shuffledTextures = shuffledTextures.slice(shiftOffset)
      .concat(shuffledTextures.slice(0, shiftOffset));

    // replace the messed up row textures with unmessed textures from the source row backuped earlier
    for (let col = 0; col < gridSize; col++){
      const targetId = 
        col * gridSize * TEX_COORD_SIZE + messedUpRowTarget * TEX_COORD_SIZE;

      for (let texCoordId = 0; texCoordId < TEX_COORD_SIZE; texCoordId++){
        shuffledTextures[targetId + texCoordId] = 
          messedUpRow[col * TEX_COORD_SIZE + texCoordId]
      }
    }

    return shuffledTextures;
  }

  const shiftColumns = (direction) => {
    // the textures are stored in contiguous manner and they match the column order. so to shift on columns we have to 
    // either take the column length subarray from the end of the textures array
    // and prepend it to the textures array in order to shift right
    // or take the the column length subarray from the start of the textures array
    // and append it to the textures array in order to shift left
    let shiftOffset;
    if ( direction === "LEFT" ) {
      shiftOffset = gridSize * TEX_COORD_SIZE;
    }

    if ( direction === "RIGHT" ) {
      shiftOffset = -1 * gridSize * TEX_COORD_SIZE;
    }

    shuffledTextures = shuffledTextures.slice(shiftOffset)
      .concat(shuffledTextures.slice(0, shiftOffset));

    return shuffledTextures;
  }

  // check if the tile coords are valid
  const validTileCoords = (tileCoords) => {
    // check for null and undefined
    if (
      !tileCoords || 
      tileCoords.row === undefined || 
      tileCoords.col === undefined
    ) {
      return false;
    }

    // check if the received coords are within the grid bounds
    if (
      tileCoords.row < 0 || tileCoords.row >= gridSize || 
      tileCoords.col < 0 || tileCoords.col >= gridSize
    ) {
        return false;
    }

    return true;
  }

  const handleTranslateTile = (pointerX, pointerY) => {
    // normalize the input coordinates
    const normalizedX = 2 * pointerX - 1;
    const normalizedY = 1 - 2 * pointerY;

    // calculate the offsets to drag the tile by its center
    const tileVertixId = (gridSize * draggedTile.col + draggedTile.row) * TEX_COORD_SIZE;
    const tileCenterX = (vertices[tileVertixId] + vertices[tileVertixId + 2]) / 2;
    const tileCenterY = (vertices[tileVertixId + 1] + vertices[tileVertixId + 5]) / 2;
    const offsetX = normalizedX - tileCenterX;
    const offsetY = normalizedY - tileCenterY;

    // get the current tile translation
    const tileIndex = draggedTile.row * gridSize + draggedTile.col;
    const tile = tilesMatrix[tileIndex].modelMatrix; 
    const tileX = tile[12]; 
    const tileY = tile[13]; 

    // calculate the tile's new position
    const translateX = offsetX - tileX;
    const translateY = offsetY - tileY;
    const translateZ = 0.001;  // to render the dragged tile on top of the others 

    // apply translation to actually move the tile
    mat4.translate(tile, tile, [translateX, translateY, translateZ]);
  };

  const handleHighlightTile = (pointerX, pointerY) => {
    // get the coords of the potential tile to highlight
    const highlightTileCandidate = getTileCoords(pointerX, pointerY);
  
    // only proceed further if teh highlight tile candidate is not the already highlighted tile
    if (
      !highlightedTile &&
      highlightTileCandidate.row === highlightedTile.row &&
      highlightTileCandidate.col === highlightedTile.col
    ) {
      return;
    }
  
    // unhighlight the already highlighted tile when candiate tile coords change
    unhiglightTile(highlightedTile);

    // this is an edge case!
    // do not highlight the tile yet,
    // only update the highlighted tile object state to whatever coords the pointer currently points to,
    // to avoid not being able to highlight a surrounding tile of the dragged tile
    // just because that same tile has been highlighted previously
    highlightedTile = highlightTileCandidate;
  
    // only proceed further if the highlight candidate is not the dragged tile
    if (
      highlightTileCandidate.row === draggedTile.row &&
      highlightTileCandidate.col === draggedTile.col
    ) {
      return;
    }
  
    // highlight the candidate if it's valid
    const tempHighlightTile = higlightTile(highlightTileCandidate);
    if (!tempHighlightTile) {
      return;
    }
  
    // update highlighted tile object state
    highlightedTile = tempHighlightTile;
  };

  // highlights the potential swap tile
  const higlightTile = (tileCoords) => {
    if (!validTileCoords(tileCoords)) {
      return null;
    }

    const tileIndex = tileCoords.row * gridSize + tileCoords.col;
    tilesMatrix[tileIndex].isHighlighted = true;

    return tileCoords;
  }

  // removes the highlight from the tile
  const unhiglightTile = (tileCoords) => {
    if (!validTileCoords(tileCoords)) {
      return null;
    }

    const tileIndex = tileCoords.row * gridSize + tileCoords.col;
    tilesMatrix[tileIndex].isHighlighted = false;

    return tileCoords;
  }

  const isUnshuffled = () => {
    // the original and shuffled array should never be different in length
    if (textures.length !== shuffledTextures.length)
      throw Error("Something unexpected happened.");

    // if the shuffled textures array matches the original textures array then puzzle solved
    for (let i = 0; i < textures.length; i++) {
      if (textures[i] !== shuffledTextures[i])
        return false;
    }

    return true;
  };

  generateGrid();

  return {
    getVertices: () => vertices,
    getTextures: () => shuffledTextures,
    getIndices: () => indices,
    getTilesMatrix: () => tilesMatrix,
    initDragState,
    cleanDragState,
    shiftColumns,
    shiftRows,
    swapTiles,
    dragTile,
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
