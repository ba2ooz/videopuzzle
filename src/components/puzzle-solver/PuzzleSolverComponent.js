import puzzleSolverHTML from "bundle-text:./puzzle-solver.html?raw";
import page from "page";

import { PuzzleGameComponent } from "../puzzle-game/PuzzleGameComponent.js";
import { ErrorHandler } from "../error/ErrorHandler.js";

export class PuzzleSolverComponent {
  constructor(container, puzzle) {
    this.container = container;
    this.puzzle = puzzle;
    this.eventHandlers = new Map(); // store event handlers for easy removal
  }

  render() {
    this.container.innerHTML = puzzleSolverHTML;

    const gameContainer = document.querySelector("#solver-container");
    this.game = new PuzzleGameComponent(gameContainer);
    this.game.render(this.puzzle);
    this.game.gameEventsHandler.disableAllGridListeners();
    this.game.isReady
      .then(() => {
        this.game.gameEventsHandler.enableAllGridListeners();
        this.startClock();
      })
      .catch((error) => {
        ErrorHandler.handle(error, "render");
      });

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
    this.successMessage = document.getElementById("success-message");
    this.finalMoves = document.getElementById("final-moves");
    this.finalClock = document.getElementById("final-clock");
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
    this.eventHandlers.removeAllEventListeners();
    this.game.destroy();

    this.eventHandlers = null;
    this.container = null;
    this.service = null;
    this.game = null;
  }

  handlePuzzleSolved() {
    this.clockStop = true;
    clearInterval(this.clockIntervalId);
    this.finalMoves.textContent = this.game.getMovesCount();
    this.finalClock.textContent = this.readFinalClock();
    this.successMessage.classList.add("visible");
  }

  handleUpdateMoves() {
    this.moves.textContent = this.game.getMovesCount();
  }

  handleGoBack() {
    this.destroy();
    page.redirect("/");
  }
}
