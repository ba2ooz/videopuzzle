import gameHTML from "bundle-text:./puzzle-game.html?raw";
import { createDomElementFromHtml } from "../../utils";

import { PuzzleGameEventsHandler } from "../";
import { GridAnimationController } from "../../animations";
import { Grid, GLContext } from "../../core";

export class PuzzleGameComponent {
  constructor(container, grid) {
    this.container = container;
    this.gameGrid = grid;
    this.availableSneakPeeks = 2;
  }

  render(gameInfo) {
    this.ui = this.getUIElements();
    this.setupGameComponents(gameInfo.videoUrl);
    this.renderFrameLoop();
  }

  renderFrameLoop = () => {
    const tiles = this.gameGrid.getTiles();
    this.glContext.sceneManager.render(tiles, (deltaTime) =>
      this.animationController.updateAnimations(deltaTime)
    );
    this.animationFrameId = requestAnimationFrame(this.renderFrameLoop);
  };

  addListeners() {
    this.gameEventsHandler = new PuzzleGameEventsHandler(this);
  }

  setupGameComponents(videoUrl) {
    this.initGrid();
    this.initGraphics(videoUrl);
    this.addListeners();
  }

  initGrid() {
    // create the game logical grid
    const puzzleSize = 4;
    // this.gameGrid = new Grid(puzzleSize);
    this.animationController = new GridAnimationController(puzzleSize);
  }

  initGraphics(videoUrl) {
    // get a WebGLRenderingContext to render the grid
    this.glContext = new GLContext(this.ui.canvasElement, {
      vertices: this.gameGrid.getVertices(),
      textures: this.gameGrid.getTextures(),
      indices: this.gameGrid.getIndices(),
    });

    // remove the loading spinner once video loaded and store the promise for later use
    this.isReady = this.glContext.sceneManager
      .initVideoTexture(videoUrl)
      .then(() => this.ui.loadingSpinnerElement.hide())
      .catch((error) => {
        throw new Error("GLScene initialization failed. " + error.message);
      });
  }

  getUIElements() {
    const gameElement = createDomElementFromHtml(gameHTML);
    this.container.insertBefore(gameElement, this.container.firstChild);

    return {
      canvasElement: document.getElementById("video-canvas"),
      puzzleBoardElement: gameElement.querySelector(".puzzle-board"),
      loadingSpinnerElement: document.querySelector(".loading-spinner"),
    }
  }

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
    this.animationController.destroy();
    this.gameEventsHandler.destroy();
    this.glContext.destroy();
    this.gameGrid.destroy();

    Object.keys(this).forEach(key => this[key] = null);
  }
}
