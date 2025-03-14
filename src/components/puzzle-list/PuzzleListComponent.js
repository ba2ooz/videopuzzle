import cardListHTML from "bundle-text:./puzzle-list.html?raw";
import page from "page";

import { PuzzleCardComponent } from "../puzzle-card/PuzzleCardComponent.js";

export class PuzzleListComponent {
  constructor(container, service) {
    this.puzzleCard = new PuzzleCardComponent();
    this.container = container;
    this.service = service;
    this.eventHandlers = new Map();
  }

  render() {
    // append this component html to the container
    this.container.innerHTML = cardListHTML;

    // create the card list
    this.cardListContainer = this.container.querySelector(".puzzles-grid");

    const puzzles = this.service.getAllPuzzles();
    puzzles.forEach((puzzle) => {
      const card = this.puzzleCard.render(puzzle);
      this.cardListContainer.appendChild(card);
      this.addListeners(card);
    });
  }

  addListeners(element) {
    this.eventHandlers.addAndStoreEventListener(
      element,
      "pointerdown",
      this.handleCardSelected.bind(this, element)
    );
  }

  handleCardSelected(element) {
    this.destroy();
    const puzzleId = element.dataset.id;
    page.redirect(`/puzzle/${puzzleId}`);
  }

  destroy() {
    this.eventHandlers.forEach(({}, element) => {
      this.cardListContainer.removeChild(element);
    });
    this.eventHandlers.removeAllEventListeners();
    this.eventHandlers = null;
    
    this.puzzleCard.destroy();
    this.puzzleCard = null;
    this.container = null;
    this.service = null;
  }
}
