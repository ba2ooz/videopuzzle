import puzzleSolverHTML from "bundle-text:./puzzle-solver.html?raw";
import page from "page";

import { Game } from "../../puzzle/Game.js";

export class PuzzleSolverComponent {
  constructor(container, service, puzzleId) {
    this.container = container;
    this.service = service;
    this.puzzleId = puzzleId;
  }

  render() {
    this.container.innerHTML = puzzleSolverHTML;

    const puzzle = this.service.getPuzzleById(this.puzzleId);
    this.game = new Game(puzzle.videoUrl);
    this.game.start();

    this.addListeners();
  }

  addListeners() {
    const viewSolutionBtn = document.getElementById("view-solution");
    viewSolutionBtn.addEventListener("pointerdown", () => {
      const successMessage = document.getElementById("success-message");
      const finalMoves = document.getElementById("final-moves");
      successMessage.classList.add("visible");
    });

    const backToSelectionBtn = document.getElementById("back-to-selection");
    backToSelectionBtn.addEventListener("pointerdown", () => {
      this.game.destroy();
      page.redirect("/");
    });
  }
}
