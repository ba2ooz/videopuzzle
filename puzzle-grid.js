const gridSize = 3; // 3x3 grid
const texCoordSize = 8; // how many texture array locations define a texture quad
const texCoordsArraySize = gridSize * gridSize * texCoordSize; // final texture array size

let texCoords = [];
let shuffledTextureQuadCoords = [];

function createPuzzleGrid() {
    // puzzle grid settings
    const tileSize = 2 / gridSize; // quad size in clip space (-1 to 1)
    let vertices = [];
    let indices = [];

    let indexOffset = 0;

    // generate grid pieces
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            let x = -1 + col * tileSize;
            let y = 1 - row * tileSize;
            let u = col / gridSize;
            let v = row / gridSize;

            // vertices
            let quadVertices = [
                x, y,                               // Top-left
                x + tileSize, y,                    // Top-right
                x, y - tileSize,                    // Bottom-left
                x + tileSize, y - tileSize          // Bottom-right
            ];

            // texture coords
            let quadTexCoords = [
                u, v,                               // Top-left
                u + 1 / gridSize, v,                // Top-right
                u, v + 1 / gridSize,                // Bottom-left
                u + 1 / gridSize, v + 1 / gridSize, // Bottom-right
            ];

            // indices for two triangles (0, 1, 2) and (1, 2, 3)
            let quadIndices = [
                indexOffset, indexOffset + 1, indexOffset + 2,
                indexOffset + 1, indexOffset + 2, indexOffset + 3
            ];

            vertices.push(...quadVertices);
            texCoords.push(...quadTexCoords);
            indices.push(...quadIndices);

            indexOffset += 4;
        }
    }

    // shuffle pieces
    shuffledTextureQuadCoords = [...texCoords];
    for (let i = 0; i < texCoordsArraySize; i += texCoordSize) {
        let swapIndex = Math.floor(Math.random() * (texCoordsArraySize / texCoordSize)) * texCoordSize;
        for (let j = 0; j < texCoordSize; j++)
            [shuffledTextureQuadCoords[i + j], shuffledTextureQuadCoords[swapIndex + j]] =
                [shuffledTextureQuadCoords[swapIndex + j], shuffledTextureQuadCoords[i + j]];
    }

    return {
        vertices,
        shuffledTextureQuadCoords,
        indices,
    };
}

function swapPuzzles(puzzleFrom, puzzleTo) {
    // get start ids of the puzzles to be swapped
    const puzzleFromTexId = (gridSize * puzzleFrom.row + puzzleFrom.col) * texCoordSize
    const puzzleToTexId = (gridSize * puzzleTo.row + puzzleTo.col) * texCoordSize

    // swap the puzzles
    for (let i = 0; i < texCoordSize; i++) {
        [shuffledTextureQuadCoords[puzzleFromTexId + i], shuffledTextureQuadCoords[puzzleToTexId + i]] =
            [shuffledTextureQuadCoords[puzzleToTexId + i], shuffledTextureQuadCoords[puzzleFromTexId + i]]
    }

    return shuffledTextureQuadCoords;
}

function checkSolved() {
    if (texCoords.length !== shuffledTextureQuadCoords.length)
        throw Error("Something unexpected happened.");

    // if the shuffled textures array matches the original textures array then puzzle solved
    for (let i = 0; i < texCoords.length; i++) {
        if (texCoords[i] !== shuffledTextureQuadCoords[i])
            return false;
    }

    return true;
}

export {
    createPuzzleGrid,
    swapPuzzles,
    checkSolved,
    gridSize
}

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