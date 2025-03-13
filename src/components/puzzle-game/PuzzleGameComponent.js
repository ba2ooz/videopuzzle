import fragmentShader from "bundle-text:../../core/shader.frag?raw";
import vertexShader from "bundle-text:../../core/shader.vert?raw";
import gameHTML from "bundle-text:./puzzle-game.html?raw";

import { PuzzleGameEventsHandler } from "./PuzzleGameEventsHandler.js";
import { BuffersManager } from "../../core/graphics/BuffersManager.js";
import { ShaderManager } from "../../core/graphics/ShaderManager.js";
import { SceneManager } from "../../core/graphics/SceneManager.js";
import { GLContext } from "../../core/GLcontext.js";
import { Grid } from "../../core/puzzle/Grid.js";

import { createDomElementFromHtml } from "../utils.js";

export class PuzzleGameComponent {
  constructor(container) {
    this.container = container;
  }

  setup(videoUrl) {
    // get a WebGLRenderingContext to render content
    this.glContext = new GLContext("#video-canvas");

    // create the game grid
    const puzzleSize = 4;
    this.gameGrid = new Grid(puzzleSize);

    // init the buffers, shader program and the rendering scene
    this.buffersManager = new BuffersManager(this.glContext.gl, {
      vertices: this.gameGrid.getVertices(),
      textures: this.gameGrid.getTextures(),
      indices: this.gameGrid.getIndices(),
    });

    this.shaderManager = new ShaderManager(
      this.glContext.gl,
      vertexShader,
      fragmentShader
    );

    this.sceneManager = new SceneManager(
      this.glContext.gl,
      this.shaderManager,
      this.buffersManager
    );

    this.sceneManager.initVideoTexture(videoUrl);

    // add events listeners on the canvas
    new PuzzleGameEventsHandler(this.glContext.canvas, this.gameGrid);
  }

  render(gameInfo) {
    this.container.appendChild(createDomElementFromHtml(gameHTML));
    this.setup(gameInfo.videoUrl);
    this.loop();
  }

  loop = () => {
    const tiles = this.gameGrid.getTiles();
    this.sceneManager.render(tiles, (delta) =>
      this.gameGrid.updateAnimations(delta)
    );
    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  destroy() {
    cancelAnimationFrame(this.animationFrameId);
    this.glContext.gl = null;
    GLContext.instance = null;
  }
}