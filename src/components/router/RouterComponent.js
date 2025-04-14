import { PuzzleSolverComponent } from "../puzzle-solver/PuzzleSolverComponent.js";
import { PuzzleListComponent } from "../puzzle-list/PuzzleListComponent.js";
import { NotFoundComponent } from "../not-found/NotFoundComponent.js";

import { PuzzleSolveService } from "../../services/PuzzleSolveService.js";
import { PuzzleService } from "../../services/PuzzleService.js";
import { UserPuzzleService } from "../../services/UserPuzzleService.js";
import { UserService } from "../../services/UserService.js";

import page from "page";
import { catchError } from "../../utils/utils.js";
import { ErrorHandler } from "../error/ErrorHandler.js";
import { NotFoundError } from "../../services/errors/ServiceError.js";

export class RouterComponent {
  constructor(appContainer) {
    this.appContainer = appContainer;
    this.puzzleService = new PuzzleService();
    this.userPuzzleService = new UserPuzzleService(
      this.puzzleService,
      new PuzzleSolveService(),
      new UserService()
    );
  }

  // Middleware to check if the puzzle exists
  puzzleGuard = async (ctx, next) => {
    const [error, puzzle] = await catchError(
      this.puzzleService.getPuzzleById(ctx.params.id)
    );

    if (error) {
      if (error instanceof NotFoundError) {
        page.redirect("/*");
      } else {
        ErrorHandler.handle(error, error.metadata.context);
      } 

      return;
    }

    ctx.puzzle = puzzle;
    next();
  };

  start() {
    // Set up page.js routes
    page("/", () => {
      const puzzleListPage = new PuzzleListComponent(
        this.appContainer,
        this.userPuzzleService
      );
      puzzleListPage.render();
    });

    page("/puzzle/:id", this.puzzleGuard, (ctx) => {
      const puzzleSolverPage = new PuzzleSolverComponent(
        this.appContainer,
        this.userPuzzleService,
        ctx.puzzle
      );
      puzzleSolverPage.render();
    });

    page("/*", () => {
      const notFoundPage = new NotFoundComponent(this.appContainer);
      notFoundPage.render();
    });

    // Start router
    page();
  }
}
