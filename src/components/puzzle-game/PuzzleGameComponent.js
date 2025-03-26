import gameHTML from "bundle-text:./puzzle-game.html?raw";

import { PuzzleGameEventsHandler } from "./PuzzleGameEventsHandler.js";
import { GLContext } from "../../core/GLcontext.js";
import { Grid } from "../../core/puzzle/Grid.js";

import { createDomElementFromHtml } from "../../utils/utils.js";

export class PuzzleGameComponent {
  constructor(container) {
    this.container = container;
    this.availableSneakPeeks = 2;
  }

  setup(videoUrl) {
    // create the game logical grid
    const puzzleSize = 4;
    this.gameGrid = new Grid(puzzleSize);

    // get a WebGLRenderingContext to render the grid
    const canvasEl = document.getElementById("video-canvas");
    this.glContext = new GLContext(canvasEl, {
      vertices: this.gameGrid.getVertices(),
      textures: this.gameGrid.getTextures(),
      indices: this.gameGrid.getIndices(),
    });

    // add events listeners on the canvas
    this.gameEventsHandler = new PuzzleGameEventsHandler(this);

    // remove the loading spinner once video loaded and store the promise for later use
    this.isReady = this.glContext.sceneManager
      .initVideoTexture(videoUrl)
      .then((videoElement) => {
        const loadingSpinner = document.querySelector(".loading-spinner");
        loadingSpinner.classList.add("inactive");
        return videoElement;
      })
      .catch((error) => {
        throw new Error("\nGame initialization failed. " + error.message);
      });
  }

  render(gameInfo) {
    this.gameElement = createDomElementFromHtml(gameHTML);
    this.container.insertBefore(this.gameElement, this.container.firstChild);
    this.setup(gameInfo.videoUrl);
    this.loop();
  }

  loop = () => {
    const tiles = this.gameGrid.getTiles();
    this.glContext.sceneManager.render(tiles, (delta) =>
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
