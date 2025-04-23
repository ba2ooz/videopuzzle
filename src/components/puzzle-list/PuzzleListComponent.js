import cardListHTML from "bundle-text:./puzzle-list.html?raw";
import page from "page";

import { PuzzleCardComponent } from "../puzzle-card/PuzzleCardComponent.js";
import { ErrorHandler } from "../error/ErrorHandler.js";
import { catchError } from "../../utils/utils.js";

export class PuzzleListComponent {
  constructor(container, userPuzzleService) {
    this.container = container;
    this.userPuzzleService = userPuzzleService;
    this.puzzleCard = new PuzzleCardComponent();
    this.eventHandlers = new Map();
  }

  async render() {
    this.ui = this.getUIElements();
    await this.getAndRenderPuzzles();
  }

  getUIElements() {
    this.container.innerHTML = cardListHTML;
    return {
      cardListContainer: this.container.querySelector(".puzzles-grid")
    }
  }

  async getAndRenderPuzzles() {
    const [error, puzzles] = await catchError(
      this.userPuzzleService.getUserPuzzles()
    );

    if (error) {
      ErrorHandler.handle(error, error.metadata.context);
      this.destroy();
      return;
    }

    puzzles.forEach(puzzle => this.renderPuzzleCard(puzzle));
  }

  renderPuzzleCard(puzzle) {
    const card = this.puzzleCard.render(puzzle);
    this.ui.cardListContainer.appendChild(card);
    this.addListeners(card);
  }

  addListeners(element) {
    this.eventHandlers.addAndStoreEventListener(
      element, "pointerup", this.handleCardSelection.bind(this, element)
    );
  }

  handleCardSelection(element) {
    const puzzleId = element.dataset.id;
    page.redirect(`/puzzle/${puzzleId}`);
    this.destroy();
  }

  destroy() {
    this.eventHandlers?.forEach(({ element }) => element.remove());
    this.eventHandlers?.removeAllEventListeners();
    this.puzzleCard?.destroy();

    Object.keys(this).forEach(key => this[key] = null);
  }
}
