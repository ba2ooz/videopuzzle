import { ShaderManager } from "./ShaderManager.js";
import { VideoManager } from "./VideoManager.js";
import { Tile } from "../puzzle/tile.js";
import { mat4 } from "gl-matrix";

/**
 * Manages all the rendering logic
 */
export class SceneManager {
  /**
   * @param {WebGL2RenderingContext} gl
   * @param {ShaderManager} shader
   * @param {Object} buffers
   */
  constructor(gl, shader, buffers) {
    this.gl = gl;
    this.shader = shader;
    this.buffers = buffers;
    this.video = new VideoManager(gl);
    this.lastFrameTime = performance.now();
    this.projectionMatrix = this.createProjectionMatrix();
  }

  async initVideoTexture(videoUrl) {
    await this.video.setupVideo(videoUrl);
  }

  /**
   * Creates an orthographic projection matrix.
   *
   * @returns {mat4} The orthographic projection matrix.
   */
  createProjectionMatrix() {
    const matrix = mat4.create();
    mat4.ortho(
      matrix,
      -1, 1, // Left, right
      -1, 1, // Bottom, top
      -10, 10 // far, near
    );
    return matrix;
  }

  /**
   * Pulls out the positions from the position buffer into the vertexPosition attribute.
   */
  setupPositionAttribute() {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.position);
    this.gl.enableVertexAttribArray(this.shader.attributes.position);
    this.gl.vertexAttribPointer(
      this.shader.attributes.position,
      2,        // every coordinate composed of 2 values
      this.gl.FLOAT,
      false,    // normalize - don't normalize
      0,        // stride - how many bytes to get from one set of values to the next
      0         // offset - how many bytes inside the buffer to start from
    );
  }

  /**
   * Pulls out the texture coordinates from buffer into the textureCoord attribute.
   */
  setupTextureAttribute() {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.texture);
    this.gl.enableVertexAttribArray(this.shader.attributes.texture);
    this.gl.vertexAttribPointer(
      this.shader.attributes.texture,
      2,        // every coordinate composed of 2 values
      this.gl.FLOAT,
      false,    // normalize - don't normalize
      0,        // stride - how many bytes to get from one set of values to the next
      0         // offset - how many bytes inside the buffer to start from
    );
  }

  /**
   * Sets or clears the higlight overlay
   *
   * @param {boolean} isHighlighted - Indicates if overlay should be applied.
   */
  setOverlayColor(isHighlighted) {
    const color = isHighlighted
      ? [1.0, 1.0, 1.0, 0.4] // highlighted
      : [0.0, 0.0, 0.0, 0.0]; // no overlay

    this.gl.uniform4fv(this.shader.uniforms.overlayColor, color);
  }

  /**
   * Draws a Tile element in the scene.
   *
   * @param {Tile}         modelView               - The model view object containing transformation and state information.
   * @param {number}       modelView.currentX      - The current X position of the model.
   * @param {number}       modelView.currentY      - The current Y position of the model.
   * @param {number}       modelView.currentZ      - The current Z position of the model.
   * @param {boolean}      modelView.isHighlighted - Indicates if the model is highlighted.
   * @param {Float32Array} modelView.modelMatrix   - The model matrix to be updated.
   * @param {number}       index                   - The index of the element to draw.
   */
  drawElement(modelView, index) {
    // reset and update model matrix
    const translatePosition = [
      modelView.currentX,
      modelView.currentY,
      modelView.currentZ,
    ];
    mat4.identity(modelView.modelMatrix);
    mat4.translate(
      modelView.modelMatrix,
      modelView.modelMatrix,
      translatePosition
    );

    // set overlay color based on highlight state
    this.setOverlayColor(modelView.isHighlighted);

    // pass model matrix to the shader
    this.gl.uniformMatrix4fv(
      this.shader.uniforms.model,
      false,
      modelView.modelMatrix
    );

    // draw the geometry
    this.gl.drawElements(
      this.gl.TRIANGLES,
      6,  // number of vertices to draw
      this.gl.UNSIGNED_SHORT,
      index * 6 * 2
    );
  }

  resetScene() {
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);                             // Clear to black, fully opaque
    this.gl.clearDepth(1.0);                                            // Clear everything
    this.gl.enable(this.gl.DEPTH_TEST);                                 // Enable depth testing
    this.gl.depthFunc(this.gl.LEQUAL);                                  // Near things obscure far things
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT); // Clear the canvas before we start drawing on it.
  }

  drawScene(modelViews) {
    this.resetScene();

    // setup render program
    this.gl.useProgram(this.shader.program);
    // specify indices to use to index the vertices
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffers.index);
    // setup attributes
    this.setupPositionAttribute();
    this.setupTextureAttribute();

    // pass projection matrix to the shader
    this.gl.uniformMatrix4fv(
      this.shader.uniforms.projection,
      false,
      this.projectionMatrix
    );

    // draw grid elements
    modelViews.forEach((modelView, index) =>
      this.drawElement(modelView, index)
    );
  }

  /**
   * Renders the scene by updating the video texture, invoking the animation update callback, and drawing the scene.
   *
   * @param {Array} modelViews - An array of model view matrices to be used for rendering.
   * @param {Function} updateAnimationsCallback - A callback function to update animations, which takes the delta time as a parameter.
   */
  render(modelViews, updateAnimationsCallback) {
    const now = performance.now();
    const deltaTime = now - this.lastFrameTime;
    this.lastFrameTime = now;

    this.video.updateTexture();
    updateAnimationsCallback(deltaTime);

    this.drawScene(modelViews);
  }
}
