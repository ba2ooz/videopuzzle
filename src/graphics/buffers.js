let textureCoordBuffer;

const initBuffers = (gl, config) => {
  const positionBuffer = initPositionBuffer(gl, config.getVertices());
  textureCoordBuffer = initTextureBuffer(gl, config.getTextures());
  const indexBuffer = initIndexBuffer(gl, config.getIndices());

  return {
    position: positionBuffer,
    textureCoord: textureCoordBuffer,
    indices: { buffer: indexBuffer, size: config.getIndices().length },
  };
};

const initPositionBuffer = (gl, vertixCoords) => {
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(vertixCoords),
    gl.STATIC_DRAW
  );

  return positionBuffer;
};

const initTextureBuffer = (gl, texCoords) => {
  const textureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

  return textureCoordBuffer;
};

const initIndexBuffer = (gl, indexCoords) => {
  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indexCoords),
    gl.STATIC_DRAW
  );

  return indexBuffer;
};

const updateTextureBuffer = (gl, newTexCoords) => {
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(newTexCoords),
    gl.STATIC_DRAW
  );
};

const updateTextureBufferSubData = (gl, newTexCoords, offset) => {
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
  gl.bufferSubData(
    gl.ARRAY_BUFFER,
    offset * Float32Array.BYTES_PER_ELEMENT,
    new Float32Array(newTexCoords)
  );
};

document.addEventListener("update_all_textures", (e) =>
  updateTextureBuffer(e.detail.gl, e.detail.textures)
);

document.addEventListener("update_texture", (e) =>
  updateTextureBufferSubData(e.detail.gl, e.detail.texture, e.detail.offset)
);

export { initBuffers };
