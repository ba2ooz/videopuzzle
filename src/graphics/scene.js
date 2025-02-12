const NUM_COMPONENTS = 2;   // every coordinate composed of 2 values
const NORMALIZE = false;    // don't normalize
const STRIDE = 0;           // how many bytes to get from one set of values to the next
const OFFSET = 0;           // how many bytes inside the buffer to start from

const drawScene = (gl, programInfo, buffers, modelViewsMatrix) => {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);                   // Clear to black, fully opaque
  gl.clearDepth(1.0);                                  // Clear everything
  gl.enable(gl.DEPTH_TEST);                            // Enable depth testing
  gl.depthFunc(gl.LEQUAL);                             // Near things obscure far things
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // Clear the canvas before we start drawing on it.

  setPositionAttribute(gl, buffers, programInfo);
  setTextureAttribute(gl, buffers, programInfo);

  // install render program
  gl.useProgram(programInfo.program);                   
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices.buffer); // indices to use to index the vertices

  // set the projection matrix and pass it to the shader
  const orthoMatrix = mat4.create();
  mat4.ortho(orthoMatrix,
    -1, 1,  // Left, right
    -1, 1,  // Bottom, top
    -10, 10 // far, near
  );
  gl.uniformMatrix4fv(
    programInfo.uniformLocations.uProjectionMatrix, 
    false, 
    orthoMatrix
  );

  modelViewsMatrix.forEach((modelViewMatrix, index) => {
    // apply overlay color for the highlighted tiles
    if (modelViewMatrix.isHighlighted){
      gl.uniform4f(
        programInfo.uniformLocations.uOverlayColor, 
        1.0, 1.0, 1.0, 0.4              
      );  // RGBA blue 0.2 opacity
    } else {
      gl.uniform4f(
        programInfo.uniformLocations.uOverlayColor, 
        0.0, 0.0, 0.0, 0.0
      );  // no overlay
    }

    // pass the model matrix to the shader
    gl.uniformMatrix4fv(
      programInfo.uniformLocations.uModelMatrix,
      false,
      modelViewMatrix.modelMatrix,
    );
    // draw the geometry
    gl.drawElements(
      gl.TRIANGLES,
      6,//buffers.indices.size,
      gl.UNSIGNED_SHORT,
      index * 6 * 2,
    );
  });
};

// pull out the positions from the position buffer into the vertexPosition attribute.
const setPositionAttribute = (gl, buffers, programInfo) => {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
  gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
  gl.vertexAttribPointer(
    programInfo.attribLocations.vertexPosition,
    NUM_COMPONENTS,
    gl.FLOAT,
    NORMALIZE,
    STRIDE,
    OFFSET
  );
};

// pull out the texture coordinates from buffer into the textureCoord attribute.
const setTextureAttribute = (gl, buffers, programInfo) => {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
  gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
  gl.vertexAttribPointer(
    programInfo.attribLocations.textureCoord,
    NUM_COMPONENTS,
    gl.FLOAT,
    NORMALIZE,
    STRIDE,
    OFFSET
  );
};

export { drawScene };
