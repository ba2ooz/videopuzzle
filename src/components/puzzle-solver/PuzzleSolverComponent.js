import puzzleSolverHTML from "bundle-text:./puzzle-solver.html?raw";
import page from "page";

import { PuzzleGameComponent, PuzzleStatsComponent, Clock, ErrorHandler } from "../";
import { UserPuzzleService } from "../../services";
import { catchError } from "../../utils";

export class PuzzleSolverComponent {
  /**
   * 
   * @param {UserPuzzleService} userPuzzleService 
   */
  constructor(container, userPuzzleService, puzzle, retry) {
    this.userPuzzleService = userPuzzleService; 
    this.container = container;
    this.puzzle = puzzle;
    this.retry = retry;
    this.eventHandlers = new Map(); // store event handlers for easy removal
  }

  async render() {
    this.ui = this.getUIElements();
    await this.initGame();
    this.addListeners();

    if(this.puzzle.isSolved && !this.retry) {
      this.showSolvedState();
    } else {
      this.showPlayableState();
    }
  }

  async initGame() {
    this.clock = new Clock(this.ui.clockElement);
    this.game = new PuzzleGameComponent(this.ui.gameContainerElement);
    this.game.render(this.puzzle);
    this.game.gameEventsHandler.disableAllGridListeners();

    const [error, _] = await catchError(this.game.isReady);
    if (error) {
      ErrorHandler.handle(error, `[${this.constructor.name}][${this.render.name}]`);
      this.handleGoBack();
      return;
    }
  }

  addListeners() {
    this.eventHandlers.addAndStoreEventListener(
      this.ui.showResultBtn, "pointerup", 
      () => this.showSolvedModal(this.puzzle.stats, this.newStats)
    );

    this.eventHandlers.addAndStoreEventListener(
      this.ui.backToSelectionBtn, "pointerup", this.handleGoBack.bind(this)
    );

    this.eventHandlers.addAndStoreEventListener(
      document, "texture_swap", this.handleUpdateMoves.bind(this)
    );

    this.eventHandlers.addAndStoreEventListener(
      document, "unshuffled", this.handlePuzzleSolved.bind(this)
    );
  }

  handleUpdateMoves() {
    this.ui.moveCountElement.textContent = this.game.getMovesCount();
  }

  handleGoBack() {
    this.destroy();
    page.redirect("/");
  }

  handleTryAgain() {
    page(`/puzzle/${this.puzzle.id}?retry=true`);
    this.destroy();
  }

  async handleSave() {
    const [saveError, _] = await catchError(
      this.userPuzzleService.saveUserPuzzle(this.puzzle.id, this.newStats));

      if (saveError) {
      ErrorHandler.handle(saveError, saveError.metadata.context);
      return;
    }

    const [refreshError, updatedPuzzle] = await catchError(this.userPuzzleService.getUserPuzzle(this.puzzle.id));
    if (refreshError) {
      ErrorHandler.handle(refreshError, refreshError.metadata.context);
      return;
    }

    // refresh stats state after saving
    this.puzzle.stats = updatedPuzzle.stats;
    this.newStats = undefined;
  }

  async handlePuzzleSolved() {
    this.clock.stop();

    this.newStats = {
      moves: this.game.getMovesCount(),
      time: this.clock.getSeconds(),
    }

    if (!this.puzzle.isSolved) 
      await this.handleSave(this.newStats);

    this.game.gameEventsHandler.hideControls();
    this.showSolvedModal(this.puzzle.stats, this.newStats);
  }

  getUIElements() {
    this.container.innerHTML = puzzleSolverHTML;

    return {
      mainContainerElement: this.container.querySelector(".container"),
      gameContainerElement: document.getElementById("solver-container"),
      backToSelectionBtn: document.getElementById("back-to-selection"),
      showResultBtn: document.getElementById("show-result"),
      moveCounterElement: document.querySelector(".move-counter"),
      moveCountElement: document.getElementById("move-count"),
      clockElement: document.querySelector(".game-clock"),
    }
  }

  showSolvedState() {
    this.ui.clockElement.hide();
    this.ui.moveCounterElement.hide();
    this.game.gameEventsHandler.hideControls();
    this.game.gameEventsHandler.showSolvedPuzzle();
    this.showSolvedModal(this.puzzle.stats);
  }

  showPlayableState() {
    this.game.gameEventsHandler.showControls();
    this.game.gameEventsHandler.enableAllGridListeners();
    this.clock.start();
  }

  showSolvedModal(currentStats, newStats = undefined) {
    this.ui.showResultBtn.display(); 
    this.eventHandlers?.removeAllEventListeners();
    
    const currentTime = this.clock.format(currentStats.time, true);
    const newTime = newStats ? this.clock.format(newStats.time, true) : undefined;

    const stats = {
      currentStats: {
        ...currentStats,
        time: currentTime,
      },
      newStats: newStats ? { 
        ...newStats, 
        time: newTime 
      } : undefined,
    }

    this.modal = new PuzzleStatsComponent(
      this.ui.mainContainerElement, 
      stats,
      this.handleTryAgain.bind(this),
      this.handleSave.bind(this),
      this.addListeners.bind(this),
    );

    this.modal.render();
  }

  destroy() {
    this.eventHandlers?.removeAllEventListeners();
    this.modal?.destroy();
    this.clock?.destroy();
    this.game?.destroy();

    Object.keys(this).forEach(key => this[key] = null);
  }
}
