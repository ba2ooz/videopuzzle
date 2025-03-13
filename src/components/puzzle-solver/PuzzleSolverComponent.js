import puzzleSolverHTML from "bundle-text:./puzzle-solver.html?raw";
import page from "page";

import { PuzzleGameComponent } from "../puzzle-game/PuzzleGameComponent.js";

export class PuzzleSolverComponent {
  constructor(container, service, puzzleId) {
    this.container = container;
    this.service = service;
    this.puzzleId = puzzleId;
    this.eventHandlers = new Map(); // store event handlers for easy removal
  }

  render() {
    this.container.innerHTML = puzzleSolverHTML;

    const gameContainer = document.querySelector("#solver-container");
    this.game = new PuzzleGameComponent(gameContainer);

    const puzzle = this.service.getPuzzleById(this.puzzleId);
    this.game.render(puzzle);

    this.addListeners();
  }

  addListeners() {
    this.backToSelectionBtn = document.getElementById("back-to-selection");
    this.successMessage = document.getElementById("success-message");
    this.finalMoves = document.getElementById("final-moves");
    this.moves = document.getElementById("move-count");
  
    this.eventHandlers.addAndStoreEventListener(this.backToSelectionBtn, "pointerdown", this.handleGoBack.bind(this));
    this.eventHandlers.addAndStoreEventListener(document, "update_all_textures", this.handleUpdateMoves.bind(this));
    this.eventHandlers.addAndStoreEventListener(document, "update_texture", this.handleUpdateMoves.bind(this));
    this.eventHandlers.addAndStoreEventListener(document, "unshuffled", this.handlePuzzleSolved.bind(this));
  }

  destroy() {
    this.eventHandlers.removeAllEventListeners();
    this.game.destroy();
  }

  handlePuzzleSolved() {
    this.finalMoves.textContent = this.game.getMovesCount();
    this.successMessage.classList.add("visible");
  };

  handleUpdateMoves() {
    this.moves.textContent = this.game.getMovesCount();
  }

  handleGoBack() {
    this.destroy();
    page.redirect("/");
  }
}