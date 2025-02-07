const initBuffers = (gl, grid) => {
    const positionBuffer = initPositionBuffer(gl, grid.vertices);
    const textureCoordBuffer = initTextureBuffer(gl, grid.shuffledTextureQuadCoords);
    const indexBuffer = initIndexBuffer(gl, grid.indices);

    return {
        position: positionBuffer,
        textureCoord: textureCoordBuffer,
        indices: indexBuffer,
    };
}

const initPositionBuffer = (gl, gridPositions) => {
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

const initTextureBuffer = (gl, gridCoords) => {
    const textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(gridCoords), gl.STATIC_DRAW);

    return textureCoordBuffer;
}

const initIndexBuffer = (gl, gridIndices) => {
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(gridIndices), gl.STATIC_DRAW);
    
    return indexBuffer;
}

const updateTextureBuffer = (gl, newGridCoords) => {
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(newGridCoords), gl.STATIC_DRAW);
} 

export { initBuffers, updateTextureBuffer };

//            |
//   (-1,1)---|---(1,1)    
//      |     |     |
//------|-----|-----|--------
//      |     |     |
//  (-1,-1)---|---(1,-1)
//            |
