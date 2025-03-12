import cardHTML from "bundle-text:./puzzle-card.html?raw";
import page from "page";
import { createDomElementFromHtml } from "../utils.js";

export class PuzzleCardComponent {
  constructor() {
    this.card = createDomElementFromHtml(cardHTML);
  }

  render(cardInfo) {
    const cardElement = this.card.cloneNode(true);
    cardElement.dataset.id = cardInfo.id;
    cardElement.querySelector("#card-number").textContent = cardInfo.id;
    this.addListener(cardElement);
    return cardElement;
  }

  addListener(element) {
    element.addEventListener("pointerdown", () => {
      const puzzleId = element.dataset.id;
      page.redirect(`/puzzle/${puzzleId}`);
    });
  }
}
