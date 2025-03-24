import { PuzzleSolverComponent } from "../puzzle-solver/PuzzleSolverComponent.js";
import { PuzzleListComponent } from "../puzzle-list/PuzzleListComponent.js";
import { NotFoundComponent } from "../not-found/NotFoundComponent.js";
import { PuzzleService } from "../../services/PuzzleService.js";
import page from "page";

export class RouterComponent {
  constructor(appContainer) {
    this.appContainer = appContainer;
    this.puzzleService = new PuzzleService();
  }

  // Middleware to check if the puzzle exists
  puzzleGuard = (ctx, next) => {
    const puzzle = this.puzzleService.getPuzzleById(ctx.params.id);
    if (!puzzle) {
      page.redirect('/*');
    } else {
      ctx.puzzle = puzzle; 
      next(); 
    }
  };

  start() {
    // Set up page.js routes
    page("/", () => {
      const puzzleListPage = new PuzzleListComponent(
        this.appContainer,
        this.puzzleService
      );
      puzzleListPage.render();
    });

    page("/puzzle/:id", this.puzzleGuard, (ctx) => {
      const puzzleSolverPage = new PuzzleSolverComponent(
        this.appContainer,
        ctx.puzzle
      );
      puzzleSolverPage.render();
    });

    page('/*', () => {
      const notFoundPage = new NotFoundComponent(this.appContainer);
      notFoundPage.render();
    });

    // Start router
    page();
  }
}
