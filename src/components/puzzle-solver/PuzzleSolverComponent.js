import puzzleSolverHTML from "bundle-text:./puzzle-solver.html?raw";
import page from "page";

import { PuzzleGameComponent } from "../puzzle-game/PuzzleGameComponent.js";

export class PuzzleSolverComponent {
  constructor(container, service, puzzleId) {
    this.container = container;
    this.service = service;
    this.puzzleId = puzzleId;
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

    document.addEventListener("unshuffled", () => {
      this.finalMoves.textContent = this.game.getMovesCount();
      this.successMessage.classList.add("visible");
    });

    document.addEventListener("update_all_textures", () =>
      this.moves.textContent = this.game.getMovesCount()
    );

    document.addEventListener("update_texture", () =>
      this.moves.textContent = this.game.getMovesCount()
    );

    this.backToSelectionBtn.addEventListener("pointerdown", () => {
      this.game.destroy();
      page.redirect("/");
    });
  }
}
