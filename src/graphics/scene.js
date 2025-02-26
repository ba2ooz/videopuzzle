import { mat4 } from 'gl-matrix'; 

const NUM_COMPONENTS = 2;   // every coordinate composed of 2 values
const NORMALIZE = false;    // don't normalize
const STRIDE = 0;           // how many bytes to get from one set of values to the next
const OFFSET = 0;           // how many bytes inside the buffer to start from

const drawScene = (gl, shader, buffers, modelViews) => {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);                   // Clear to black, fully opaque
  gl.clearDepth(1.0);                                  // Clear everything
  gl.enable(gl.DEPTH_TEST);                            // Enable depth testing
  gl.depthFunc(gl.LEQUAL);                             // Near things obscure far things
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // Clear the canvas before we start drawing on it.

  setPositionAttribute(gl, buffers, shader);
  setTextureAttribute(gl, buffers, shader);

  // install render program
  gl.useProgram(shader.program);                   
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index); // indices to use to index the vertices

  // set the projection matrix and pass it to the shader
  const projectionMatrix = mat4.create();
  mat4.ortho(projectionMatrix,
    -1, 1,  // Left, right
    -1, 1,  // Bottom, top
    -10, 10 // far, near
  );
  gl.uniformMatrix4fv(
    shader.uniforms.projection, 
    false, 
    projectionMatrix
  );

  modelViews.forEach((modelView, index) => {
    // reset tile before translation
    mat4.identity(modelView.modelMatrix);
    mat4.translate(modelView.modelMatrix, modelView.modelMatrix, [
      modelView.currentX,
      modelView.currentY,
      modelView.currentZ,
    ]);

    // apply overlay color for the highlighted tiles
    if (modelView.isHighlighted){
      gl.uniform4f(
        shader.uniforms.overlayColor, 
        1.0, 1.0, 1.0, 0.4              
      );  // RGBA blue 0.2 opacity
    } else {
      gl.uniform4f(
        shader.uniforms.overlayColor, 
        0.0, 0.0, 0.0, 0.0
      );  // no overlay
    }

    // pass the model matrix to the shader
    gl.uniformMatrix4fv(
      shader.uniforms.model,
      false,
      modelView.modelMatrix,
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
  gl.enableVertexAttribArray(programInfo.attributes.position);
  gl.vertexAttribPointer(
    programInfo.attributes.position,
    NUM_COMPONENTS,
    gl.FLOAT,
    NORMALIZE,
    STRIDE,
    OFFSET
  );
};

// pull out the texture coordinates from buffer into the textureCoord attribute.
const setTextureAttribute = (gl, buffers, programInfo) => {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.texture);
  gl.enableVertexAttribArray(programInfo.attributes.texture);
  gl.vertexAttribPointer(
    programInfo.attributes.texture,
    NUM_COMPONENTS,
    gl.FLOAT,
    NORMALIZE,
    STRIDE,
    OFFSET
  );
};

export { drawScene };
