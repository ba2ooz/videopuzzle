import cardListHTML from "bundle-text:./puzzle-list.html?raw";
import page from "page";

import { PuzzleCardComponent, ErrorHandler } from "../";
import { catchError } from "../../utils";

export class PuzzleListComponent {
  constructor(container, userPuzzleService) {
    this.container = container;
    this.userPuzzleService = userPuzzleService;
    this.puzzleCards = [];
  }

  async render() {
    this.ui = this.getUIElements();
    await this.getAndRenderPuzzles();
  }

  async getAndRenderPuzzles() {
    const [error, puzzles] = await catchError(this.userPuzzleService.getUserPuzzles());
    console.log(error);
    if (error) {
      ErrorHandler.handle(error, error.metadata?.context || this.constructor.name);
      this.destroy();
      return;
    }

    puzzles.forEach(puzzle => this.renderPuzzleCard(puzzle));
  }

  renderPuzzleCard(puzzle) {
    const card = 
      new PuzzleCardComponent(puzzle, this.handleCardSelection.bind(this));

    this.puzzleCards.push(card);
    const cardElement = card.render();
    this.ui.cardListContainer.appendChild(cardElement);
  }

  handleCardSelection(puzzleId) {
    page.redirect(`/puzzle/${puzzleId}`);
    this.destroy();
  }

  getUIElements() {
    this.container.innerHTML = cardListHTML;

    return {
      cardListContainer: this.container.querySelector(".puzzles-grid")
    }
  }

  destroy() {
    this.puzzleCards?.forEach(card => card.destroy());
    this.ui?.cardListContainer?.remove();

    Object.keys(this).forEach(key => this[key] = null);
  }
}
