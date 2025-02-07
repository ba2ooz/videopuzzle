const ELEMENTS_TYPE = gl.UNSIGNED_SHORT;    // the data in the buffer is 16bit shorts
const ATTRIB_TYPE = gl.FLOAT;               // the data in the buffer is 32bit floats
const NUM_COMPONENTS = 2;                   // every coordinate composed of 2 values
const NORMALIZE = false;                    // don't normalize
const STRIDE = 0;                           // how many bytes to get from one set of values to the next
const OFFSET = 0;                           // how many bytes inside the buffer to start from

const drawScene = (gl, programInfo, buffers) => {
    setPositionAttribute(gl, buffers, programInfo);
    setTextureAttribute(gl, buffers, programInfo);
    
    gl.useProgram(programInfo.program);                                         // install render program
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices.collection);         // indices to use to index the vertices
    gl.drawElements(gl.TRIANGLES, buffers.indices.size, ELEMENTS_TYPE, OFFSET); // draw the scene
}

// pull out the positions from the position buffer into the vertexPosition attribute.
const setPositionAttribute = (gl, buffers, programInfo) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, NUM_COMPONENTS, ATTRIB_TYPE, NORMALIZE, STRIDE, OFFSET);
}

// pull out the texture coordinates from buffer into the textureCoord attribute.
const setTextureAttribute = (gl, buffers, programInfo) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
    gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
    gl.vertexAttribPointer(programInfo.attribLocations.textureCoord, NUM_COMPONENTS, ATTRIB_TYPE, NORMALIZE, STRIDE, OFFSET);
}

export { drawScene };