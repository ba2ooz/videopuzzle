import { PuzzleSolverComponent } from "../puzzle-solver/PuzzleSolverComponent.js";
import { PuzzleListComponent } from "../puzzle-list/PuzzleListComponent.js";
import { PuzzleService } from "../../services/PuzzleService.js";
import page from "page";

export class RouterComponent {
  constructor(appContainer) {
    this.appContainer = appContainer;
    this.puzzleService = new PuzzleService();
  }

  start() {
    // Set up page.js routes
    page("/", () => {
      const puzzleListPage = new PuzzleListComponent(
        this.appContainer,
        this.puzzleService
      );
      puzzleListPage.render();
    });

    page("/puzzle/:id", (ctx) => {
      const puzzleId = ctx.params.id;
      const puzzleSolverPage = new PuzzleSolverComponent(
        this.appContainer,
        this.puzzleService,
        puzzleId
      );
      puzzleSolverPage.render();
    });

    // Start router
    page();
  }
}
