function initBuffers(gl) {
    const grid = createGrid();
    const positionBuffer = initPositionBuffer(gl, grid.vertices);
    const textureCoordBuffer = initTextureBuffer(gl, grid.shuffledTextureQuadCoords);
    const indexBuffer = initIndexBuffer(gl, grid.indices);

    return {
        position: positionBuffer,
        textureCoord: textureCoordBuffer,
        indices: indexBuffer,
    };
}

function initPositionBuffer(gl, gridPositions) {
    // Create a buffer for the square's positions.
    const positionBuffer = gl.createBuffer();

    // Select the positionBuffer as the one to apply buffer
    // operations to from here out.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Now pass the list of positions into WebGL to build the
    // shape. We do this by creating a Float32Array from the
    // JavaScript array, then use it to fill the current buffer.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(gridPositions), gl.STATIC_DRAW);

    return positionBuffer;
}

function initTextureBuffer(gl, gridCoords) {
    const textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(gridCoords), gl.STATIC_DRAW);

    return textureCoordBuffer;
}

function initIndexBuffer(gl, gridIndices) {
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(gridIndices), gl.STATIC_DRAW);
    
    return indexBuffer;
}

function createGrid() {
    // Puzzle grid settings
    const gridSize = 3; // 3x3 grid
    const tileSize = 2 / gridSize; // Quad size in clip space (-1 to 1)
    let vertices = [];
    let indices = [];
    let texCoords = [];

    let indexOffset = 0;

    // Generate grid pieces
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            let x = -1 + col * tileSize;
            let y = 1 - row * tileSize;
            let u = col / gridSize;
            let v = row / gridSize;

            // Quad vertices
            let quadVertices = [
                x, y,                               // Top-left
                x + tileSize, y,                    // Top-right
                x, y - tileSize,                    // Bottom-left
                x + tileSize, y - tileSize          // Bottom-right
            ];

            // Texture coordinates
            let quadTexCoords = [
                u, v,                               // Top-left
                u + 1 / gridSize, v,                // Top-right
                u, v + 1 / gridSize,                // Bottom-left
                u + 1 / gridSize, v + 1 / gridSize, // Bottom-right
            ];

            // Indices for two triangles (0, 1, 2) and (1, 2, 3)
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

    // Shuffle pieces with step 6 as this is how many indices are used for a tex quad (2 triangles)
    let shuffledTextureQuadCoords = [...texCoords];
    for (let i = 0; i < shuffledTextureQuadCoords.length; i += 8) {
        let swapIndex = Math.floor(Math.random() * (shuffledTextureQuadCoords.length / 8)) * 8;
        for (let j = 0; j < 8; j++)
            [shuffledTextureQuadCoords[i + j], shuffledTextureQuadCoords[swapIndex + j]] = [shuffledTextureQuadCoords[swapIndex + j], shuffledTextureQuadCoords[i + j]];
    }

    return {
        vertices,
        shuffledTextureQuadCoords,
        indices,
    };
}

export { initBuffers };

//            |
//   (-1,1)---|---(1,1)    
//      |     |     |
//------|-----|-----|--------
//      |     |     |
//  (-1,-1)---|---(1,-1)
//            |
