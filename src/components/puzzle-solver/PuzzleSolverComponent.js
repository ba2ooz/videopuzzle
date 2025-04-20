import puzzleSolverHTML from "bundle-text:./puzzle-solver.html?raw";
import page from "page";

import { PuzzleStatsComponent } from "../puzzle-stats-modal/PuzzleStatsComponent.js";
import { PuzzleGameComponent } from "../puzzle-game/PuzzleGameComponent.js";
import { ErrorHandler } from "../error/ErrorHandler.js";
import { catchError } from "../../utils/utils.js";

export class PuzzleSolverComponent {
  constructor(container, userPuzzleService, puzzle, retry) {
    this.container = container;
    this.userPuzzleService = userPuzzleService; 
    this.puzzle = puzzle;
    this.retry = retry;
    this.eventHandlers = new Map(); // store event handlers for easy removal
  }

  async render() {
    this.container.innerHTML = puzzleSolverHTML;

    const gameContainer = document.querySelector("#solver-container");
    this.game = new PuzzleGameComponent(gameContainer);
    this.game.render(this.puzzle);
    this.game.gameEventsHandler.disableAllGridListeners();

    const [error, _] = await catchError(this.game.isReady);
    if (error) {
      ErrorHandler.handle(error, `[${this.constructor.name}][${this.render.name}]`);
      this.handleGoBack();
      return;
    }

    this.addListeners();

    if(this.puzzle.isSolved && !this.retry) {
      this.game.gameEventsHandler.showSolvedPuzzle();
      this.showSolvedModal(this.puzzle.stats);
    } else {
      this.game.gameEventsHandler.enableAllGridListeners();
      this.game.gameEventsHandler.showControls();
      this.startClock();
    }
  }

  startClock() {
    this.seconds = 0;
    this.clockStop = false;
    this.clockElement = document.querySelector(".game-clock")

    this.updateClock(); 
    this.clockIntervalId = setInterval(() => {
      if (!this.clockStop) {
        this.seconds++;
        this.updateClock(); // update the clock every second
      }
    }, 1000);
  }

  updateClock() {
    // update the clock display
    this.clockElement.textContent = this.formatClock(this.seconds);
  }

  formatClock(seconds, short = false) {
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0'); 
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0'); 
    const s = String(seconds % 60).padStart(2, '0');

    if(short) {
      let timeString = "";
      if (h > 0) timeString += `${h}h`;
      if (m > 0) timeString += `${m}m`;
      if (s > 0) timeString += `${s}s`;
      return timeString;
    }

    return `${h}:${m}:${s}`;
  }

  addListeners() {
    this.backToSelectionBtn = document.getElementById("back-to-selection");
    this.showResult = document.querySelector("#show-result");
    this.moves = document.getElementById("move-count");

    this.eventHandlers.addAndStoreEventListener(
      this.showResult,
      "pointerup",
      () => this.showSolvedModal(this.puzzle.stats, this.newStats)
    );
    this.eventHandlers.addAndStoreEventListener(
      this.backToSelectionBtn,
      "pointerup",
      this.handleGoBack.bind(this)
    );
    this.eventHandlers.addAndStoreEventListener(
      document,
      "texture_swap",
      this.handleUpdateMoves.bind(this)
    );
    this.eventHandlers.addAndStoreEventListener(
      document,
      "unshuffled",
      this.handlePuzzleSolved.bind(this)
    );
  }

  destroy() {
    this.eventHandlers?.removeAllEventListeners();
    this.game?.destroy();
    this.modal?.destroy();

    this.eventHandlers = null;
    this.container = null;
    this.service = null;
    this.game = null;
    this.modal = null;
  }

  async handlePuzzleSolved() {
    this.clockStop = true;
    clearInterval(this.clockIntervalId);

    this.newStats = {
      moves: this.game.getMovesCount(),
      time: this.seconds,
    }

    if (!this.puzzle.isSolved) 
      await this.handleSave(this.newStats);

    this.showSolvedModal(this.puzzle.stats, this.newStats);
  }

  showSolvedModal(currentStats, newStats = undefined) {
    this.game.gameEventsHandler.hideControls();
    this.showResult.classList.remove("hidden"); 
    this.eventHandlers?.removeAllEventListeners();
    
    const currentTime = this.formatClock(currentStats.time, true);
    const newTime = newStats ? this.formatClock(newStats.time, true) : undefined;

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
      this.container.querySelector(".container"), 
      stats,
      this.handleTryAgain.bind(this),
      this.handleSave.bind(this),
      this.addListeners.bind(this),
    );

    this.modal.render();
  }

  handleTryAgain() {
    this.destroy();
    page(`/puzzle/${this.puzzle.id}?retry=true`);
  }

  async handleSave() {
    const [saveError, _] = await catchError(
      this.userPuzzleService.saveSolvedPuzzleForUser(this.puzzle.id, this.newStats));

      if (saveError) {
      ErrorHandler.handle(saveError, saveError.metadata.context);
      return;
    }

    const [refreshError, updatedPuzzle] = await catchError(this.userPuzzleService.getPuzzleForUser(this.puzzle.id));
    if (refreshError) {
      ErrorHandler.handle(refreshError, refreshError.metadata.context);
      return;
    }

    // refresh stats state after saving
    this.puzzle.stats = updatedPuzzle.stats;
    this.newStats = undefined;
  }

  handleUpdateMoves() {
    this.moves.textContent = this.game.getMovesCount();
  }

  handleGoBack() {
    this.destroy();
    page.redirect("/");
  }
}
