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

    if(this.puzzle.isSolved && !this.retry) {
      this.showSolvedModal(this.puzzle.stats);
    }
    
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

    this.game.gameEventsHandler.enableAllGridListeners();
    this.startClock();

    this.addListeners();
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
    const hours = String(Math.floor(this.seconds / 3600)).padStart(2, '0'); 
    const minutes = String(Math.floor((this.seconds % 3600) / 60)).padStart(2, '0'); 
    const seconds = String(this.seconds % 60).padStart(2, '0');

    // format the time as HH:MM:SS
    const timeString = `${hours}:${minutes}:${seconds}`;

    // update the clock display
    this.clockElement.textContent = timeString;
  }

  readFinalClock() {
    let timeString = "";
    const hours = String(Math.floor(this.seconds / 3600)).padStart(2, '0'); 
    const minutes = String(Math.floor((this.seconds % 3600) / 60)).padStart(2, '0'); 
    const seconds = String(this.seconds % 60).padStart(2, '0');

    if (hours > 0) {
      timeString += `${hours} hours, `;
    }
    if (minutes > 0) {
      timeString += `${minutes} minutes and `;
    }
    timeString += `${seconds} seconds`;

    return timeString;
  }

  addListeners() {
    this.backToSelectionBtn = document.getElementById("back-to-selection");
    this.moves = document.getElementById("move-count");

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
    // this.readFinalClock();

    let newStats = {
      moves: this.game.getMovesCount(),
      time: this.seconds,
    }

    if (!this.puzzle.isSolved) {
      await this.handleSave(newStats)
      this.puzzle.stats = 
        (await this.userPuzzleService.getPuzzleForUser(this.puzzle.id)).stats;
      newStats = undefined;
    }

    await this.showSolvedModal(this.puzzle.stats, newStats);
  }

  async showSolvedModal(currentStats, newStats = undefined) {
    const stats = {
      currentStats: currentStats,
      newStats: newStats,
    }

    this.modal = new PuzzleStatsComponent(
      this.container.querySelector(".container"), 
      stats,
      this.handleTryAgain.bind(this),
      this.handleSave.bind(this)
    );

    this.modal.render();
  }

  handleTryAgain() {
    this.destroy();
    page(`/puzzle/${this.puzzle.id}?retry=true`);
  }

  async handleSave(stats) {
    const [error, _] = await catchError(
      this.userPuzzleService.saveSolvedPuzzleForUser(this.puzzle.id, stats));

    if (error) 
      ErrorHandler.handle(error, error.metadata.context);
  }

  handleUpdateMoves() {
    this.moves.textContent = this.game.getMovesCount();
  }

  handleGoBack() {
    this.destroy();
    page.redirect("/");
  }
}
