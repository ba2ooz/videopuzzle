import cardHTML from "bundle-text:./puzzle-card.html?raw";
import { createDomElementFromHtml } from "../../utils/utils.js";

export class PuzzleCardComponent {
  constructor() {
    this.card = createDomElementFromHtml(cardHTML);
  }

  render(cardInfo) {
    const cardElement = this.card.cloneNode(true);
    cardElement.dataset.id = cardInfo.id;
    cardElement.querySelector("#card-number").textContent = cardInfo.id;
    return cardElement;
  }

  destroy() {
    this.card = null;
  }
}
