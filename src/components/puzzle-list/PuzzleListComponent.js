import cardListHTML from "bundle-text:./puzzle-list.html?raw";
import { PuzzleCardComponent } from "../puzzle-card/PuzzleCardComponent.js";

export class PuzzleListComponent {
  constructor(container, service) {
    this.puzzleCard = new PuzzleCardComponent();
    this.container = container;
    this.service = service;
  }

  render() {
    // append this component html to the container
    this.container.innerHTML = cardListHTML;

    // create the card list
    const cardListContainer = this.container.querySelector(".puzzles-grid");

    const puzzles = this.service.getAllPuzzles();
    puzzles.forEach((puzzle) => {
        const card = this.puzzleCard.render(puzzle);
        cardListContainer.appendChild(card);
    });
  }
}
