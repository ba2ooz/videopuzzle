import { TutorialGrid } from "../../core";
import { PuzzleSolverComponent } from "./PuzzleSolverComponent";
import { PuzzleGameTutorialComponent, PuzzleStatsTutorialComponent, ErrorHandler } from "../";
import { catchError } from "../../utils";
import page from "page";

export class PuzzleSolverTutorialComponent extends PuzzleSolverComponent {
  constructor(container, userPuzzleService, userService, puzzle) {
    super(container, userPuzzleService, puzzle);
    this.userService = userService;
  }

  async render() {
    await super.render();
    this.tutorial = new PuzzleGameTutorialComponent(this.game);
    this.tutorial.render();
  }

  getGameGrid() {
    return new TutorialGrid(4);
  }
  
  async handlePuzzleSolvedStart() {
    this.clock.stop();
    this.newStats = {
      moves: this.game.getMovesCount(),
      time: this.clock.getSeconds(),
    };

    const [saveError, _] = await catchError(
      this.userService.saveUserTutorial()
    );

    if (saveError) {
      ErrorHandler.handle(saveError, "saveError.metadata.context");
      return;
    }
  }

  async handlePuzzleSolved() {
    this.game.gameEventsHandler.hideControls();
    this.showSolvedModal(this.newStats);
  }

  renderStatsModal(stats) {
    this.modal = new PuzzleStatsTutorialComponent(
      this.ui.mainContainerElement, 
      stats,
      this.handleStartPuzzle.bind(this),
      this.addListeners.bind(this),
    );

    this.modal.render();
  }

  handleShowResult() {
    this.showSolvedModal(this.newStats);
  }

  handleStartPuzzle() {
    page(`/puzzle/${this.puzzle.id}`);
    this.destroy();
  }

  destroy() {
    this.tutorial?.destroy();
    super.destroy();

    Object.keys(this).forEach(key => this[key] = null);
  }
}
