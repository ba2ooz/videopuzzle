import { PuzzleSolverComponent, PuzzleListComponent, NotFoundComponent, ErrorHandler } from "../";
import { NotFoundError } from "../../services";
import { catchError } from "../../utils";

import page from "page";

export class RouterComponent {
  constructor(appContainer, services) {
    this.appContainer = appContainer;
    this.userPuzzleService = services.get("userPuzzleService");
  }

  // Middleware to check if the puzzle exists
  puzzleGuard = async (ctx, next) => {
    const [error, puzzle] = await catchError(
      this.userPuzzleService.getUserPuzzle(ctx.params.id)
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
        ctx.puzzle,
        ctx.querystring === 'retry=true'
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
