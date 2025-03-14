/**
 * Manages the gl buffers state.
 *
 * @param    {WebGLRenderingContext} gl              - The WebGL rendering context.
 * @param    {Object}                config          - The configuration object for the buffers.
 * @property {Float32Array}          config.vertices - The vertices data for the position buffer.
 * @property {Float32Array}          config.textures - The texture coordinates data for the texture buffer.
 * @property {Uint16Array}           config.indices  - The indices data for the index buffer.
 */
export class BuffersManager {
  constructor(gl, config) {
    this.gl = gl;
    this.config = config;

    // init buffers
    this.initPositionBuffer(config.vertices);
    this.initTextureBuffer(config.textures);
    this.initIndexBuffer(config.indices);

    // register the texture update listeners
    this.addListeners();
  }

  bindPositionBuffer() {
    if (!this.positionBuffer) {
      this.positionBuffer = this.gl.createBuffer();
    }
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
  }

  bindTextureBuffer() {
    if (!this.textureCoordBuffer) {
      this.textureCoordBuffer = this.gl.createBuffer();
    }
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureCoordBuffer);
  }

  bindIndexBuffer() {
    if (!this.indexBuffer) {
      this.indexBuffer = this.gl.createBuffer();
    }
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
  }

  /**
   * Inits the vertices buffer
   *
   * @param {Float32Array} vertixCoords - The vertices array
   */
  initPositionBuffer(vertixCoords) {
    this.bindPositionBuffer();
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(vertixCoords),
      this.gl.STATIC_DRAW
    );
  }

  /**
   * Inits the textures buffer
   *
   * @param {Float32Array} texCoords - The textures array
   */
  initTextureBuffer(texCoords) {
    this.bindTextureBuffer();
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(texCoords),
      this.gl.STATIC_DRAW
    );
  }

  /**
   * Inits the indices buffer
   *
   * @param {Uint16Array} indexCoords - The indices array
   */
  initIndexBuffer(indexCoords) {
    this.bindIndexBuffer();
    this.gl.bufferData(
      this.gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indexCoords),
      this.gl.STATIC_DRAW
    );
  }

  /**
   * Updates the entire textures buffer
   *
   * @param {Float32Array} newTexCoords - The new textures array
   */
  updateTextureBuffer(newTexCoords) {
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array(newTexCoords),
      this.gl.STATIC_DRAW
    );
  }
  /**
   * Updates a subarray of the textures buffer
   *
   * @param {Float32Array} newTexCoords - The new textures subarray
   * @param {number}       offset       - The start index for data replace in the existing texture buffer array
   */
  updateTextureBufferSubData(newTexCoords, offset) {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureCoordBuffer);
    this.gl.bufferSubData(
      this.gl.ARRAY_BUFFER,
      offset * Float32Array.BYTES_PER_ELEMENT,
      new Float32Array(newTexCoords)
    );
  }

  /**
   * Handles a custom event that:
   * 1. either triggers a replace of the entire buffer textures array
   * 2. or triggers a subarray replace in the buffer textures array
   */
  handleTexturesSwapEvent(e) {
    if (e.detail.offset === -1) {
      return this.updateTextureBuffer(e.detail.data);
    }

    this.updateTextureBufferSubData(e.detail.data, e.detail.offset);
  }

  /**
   * Registers the textures swap event
   */
  addListeners() {
    document.addEventListener("texture_swap", this.handleTexturesSwapEvent.bind(this));
  }

  destroy() {
    document.removeEventListener("texture_swap", this.handleTexturesSwapEvent);
    this.gl.deleteBuffer(this.textureCoordBuffer);
    this.gl.deleteBuffer(this.positionBuffer);
    this.gl.deleteBuffer(this.indexBuffer);
    this.textureCoordBuffer = null; 
    this.positionBuffer = null;
    this.indexBuffer = null;
    this.config = null;
    this.gl = null;
  }
}
