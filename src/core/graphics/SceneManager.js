import { BuffersManager } from "./BuffersManager.js";
import { ShaderManager } from "./ShaderManager.js";
import { VideoManager } from "./VideoManager.js";
import { Tile } from "../puzzle/Tile.js";
import { mat4 } from "gl-matrix";

/**
 * Manages all the rendering logic
 */
export class SceneManager {
  /**
   * @param {WebGL2RenderingContext} gl
   * @param {ShaderManager} shaderManager
   * @param {BuffersManager} buffersManager
   */
  constructor(gl, shaderManager, buffersManager) {
    this.gl = gl;
    this.shaderManager = shaderManager;
    this.buffersManager = buffersManager;
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
    this.buffersManager.bindPositionBuffer();
    this.shaderManager.setAttribute("position");
  }

  /**
   * Pulls out the texture coordinates from buffer into the textureCoord attribute.
   */
  setupTextureAttribute() {
    this.buffersManager.bindTextureBuffer();
    this.shaderManager.setAttribute("texture");
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

    this.shaderManager.setUniform("overlayColor", color);
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
    // reset and update model matrix position
    mat4.identity(modelView.modelMatrix);
    const pos = modelView.getCurrentPosition();
    mat4.translate(modelView.modelMatrix, modelView.modelMatrix, [pos.x, pos.y, pos.z]);

    // set current scale
    const scale = modelView.getScale();
    mat4.scale(modelView.modelMatrix, modelView.modelMatrix, [scale, scale, 1]);

    // set overlay color based on highlight state
    this.setOverlayColor(modelView.isHighlighted);

    // pass model matrix to the shader
    this.shaderManager.setUniformMatrix('model', modelView.modelMatrix);

    // draw the geometry
    this.gl.drawElements(
      this.gl.TRIANGLES, 6, // number of vertices to draw
      this.gl.UNSIGNED_SHORT, index * 6 * 2
    );
  }

  resetScene() {
    this.gl.clearDepth(1.0);                                            // Clear everything
    this.gl.enable(this.gl.DEPTH_TEST);                                 // Enable depth testing
    this.gl.depthFunc(this.gl.LEQUAL);                                  // Near things obscure far things
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT); // Clear the canvas before we start drawing on it.
    this.gl.clearColor(18/255, 24/255, 38/255, 1.0);                                // Clear to default, fully opaque
  }

  drawScene(modelViews) {
    this.resetScene();
    // setup attributes
    this.setupPositionAttribute();
    this.setupTextureAttribute();
    
    // setup render program
    this.shaderManager.useProgram();
    // pass projection matrix to the shader
    this.shaderManager.setUniformMatrix('projection', this.projectionMatrix);

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
