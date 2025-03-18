import fragmentShader from "bundle-text:../../core/shader.frag?raw";
import vertexShader from "bundle-text:../../core/shader.vert?raw";
import gameHTML from "bundle-text:./puzzle-game.html?raw";

import { PuzzleGameEventsHandler } from "./PuzzleGameEventsHandler.js";
import { BuffersManager } from "../../core/graphics/BuffersManager.js";
import { ShaderManager } from "../../core/graphics/ShaderManager.js";
import { SceneManager } from "../../core/graphics/SceneManager.js";
import { GLContext } from "../../core/GLcontext.js";
import { Grid } from "../../core/puzzle/Grid.js";

import { createDomElementFromHtml } from "../../utils/utils.js";

export class PuzzleGameComponent {
  constructor(container) {
    this.container = container;
    this.availableSneakPeeks = 2;
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

    this.isReady = this.sceneManager
      .initVideoTexture(videoUrl)
      .then((videoElement) => {
        const loadingSpinner = document.querySelector(".loading-spinner");
        loadingSpinner.classList.add("inactive");
        return videoElement;
      });

    // add events listeners on the canvas
    this.gameEventsHandler = new PuzzleGameEventsHandler(this);
  }

  render(gameInfo) {
    this.gameElement = createDomElementFromHtml(gameHTML);
    this.container.insertBefore(this.gameElement, this.container.firstChild);
    this.setup(gameInfo.videoUrl);
    this.loop();
  }

  loop = () => {
    const tiles = this.gameGrid.getTiles();
    this.sceneManager.render(tiles, (delta) =>
      this.gameGrid.updateAnimations(delta)
    );
    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  getMovesCount() {
    return this.gameGrid.getMovesCount();
  }

  getAvailableSneakPeeks() {
    return this.availableSneakPeeks;
  }

  useSneakPeek() {
    this.availableSneakPeeks--;
  }

  destroy() {
    cancelAnimationFrame(this.animationFrameId);
    this.gameEventsHandler.destroy();
    this.buffersManager.destroy();
    this.shaderManager.destroy();
    this.sceneManager.destroy();
    this.gameElement.remove();
    this.glContext.destroy();
    this.gameGrid.destroy();

    this.gameEventsHandler = null;
    this.animationFrameId = null;
    this.buffersManager = null;
    this.shaderManager = null;
    this.sceneManager = null;
    this.gameElement = null;
    this.glContext = null;
    this.container = null;
    this.gameGrid = null;
  }
}
