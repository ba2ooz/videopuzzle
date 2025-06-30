import cardHTML from "bundle-text:./puzzle-card.html?raw";
import { createDomElementFromHtml } from "../../utils";

export class PuzzleCardComponent {
  constructor(cardInfo, onSelect) {
    this.cardInfo = cardInfo;
    this.onSelect = onSelect;
    this.eventHandlers = new Map();
  }

  render() {
    this.ui = this.getUIElements();
    this.showCardInfo();
    this.addListeners();

    return this.ui.cardElement;
  }

  addListeners() {
    this.eventHandlers.addAndStoreEventListener(
      this.ui.cardElement, "pointerup", 
      () => {
        this.onSelect(this.cardInfo.id);
        this.destroy();
      }
    );
  }

  getUIElements() {
    this.cardNode = createDomElementFromHtml(cardHTML).cloneNode(true);

    return {
      thumbnailElement: this.cardNode.querySelector("#puzzle-thumbnail"),
      checkMarkElement: this.cardNode.querySelector(".checkmark"),
      creditsElement: this.cardNode.querySelector(".credits"),
      cardElement: this.cardNode,
    }
  }

  showCardInfo() {
    if (this.cardInfo.isSolved)
      this.ui.checkMarkElement.display();

    this.ui.cardElement.dataset.id = this.cardInfo.id;
    this.ui.thumbnailElement.src = this.cardInfo.imgUrl;
    this.ui.creditsElement.href = this.cardInfo.authorProfileUrl;
    this.ui.creditsElement.textContent = this.cardInfo.authorName;
  }

  destroy() {
    this.eventHandlers?.removeAllEventListeners();
    this.cardNode?.remove();

    Object.keys(this).forEach(key => this[key] = null);
  }
}
