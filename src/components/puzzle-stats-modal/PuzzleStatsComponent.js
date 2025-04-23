import modalHTML from "bundle-text:./puzzle-stats-modal.html?raw";
import { createDomElementFromHtml } from "../../utils/utils.js";

export class PuzzleStatsComponent {
  constructor(container, data, onTryAgain, onSave, onClose) {
    this.data = data;
    this.container = container;
    this.onTryAgain = onTryAgain;
    this.onSave = onSave;
    this.onClose = onClose;
    this.eventHandlers = new Map(); 
  }

  render() {
    this.modal = createDomElementFromHtml(modalHTML);
    this.ui = this.getUIElements();

    this.ui.currentMovesElement.innerText = this.data.currentStats.moves;
    this.ui.currentTimeElement.innerText = this.data.currentStats.time;
    this.ui.movesRankElement.innerText = this.data.currentStats.movesRank;
    this.ui.timeRankElement.innerText = this.data.currentStats.timeRank;

    if(this.data.newStats) {
      this.ui.newMovesElement.innerText = this.data.newStats.moves;
      this.ui.newTimeElement.innerText = this.data.newStats.time;
      this.ui.newStatsElement.display();
      this.ui.saveBtn.display();
    }

    this.container.appendChild(this.modal);
    this.addListeners();
  }

  getUIElements() {
    return {
      currentMovesElement: this.modal.querySelector(".current-moves"),
      currentTimeElement: this.modal.querySelector(".current-time"),
      movesRankElement: this.modal.querySelector(".moves-rank"),
      timeRankElement: this.modal.querySelector(".time-rank"),

      newStatsElement: this.modal.querySelector(".new-stats"),
      newMovesElement: this.modal.querySelector(".new-moves"),
      newTimeElement: this.modal.querySelector(".new-time"),

      closeModalBtn: this.modal.querySelector(".close-button"),
      tryAgainBtn: this.modal.querySelector("#try-again"),
      saveBtn: this.modal.querySelector("#save"),
    };
  }

  addListeners() {
    this.eventHandlers.addAndStoreEventListener(
      this.ui.closeModalBtn, "pointerup",
      () => {
        this.destroy();
        this.onClose(); 
      }
    )

    this.eventHandlers.addAndStoreEventListener(
      this.ui.tryAgainBtn, "pointerup", this.onTryAgain.bind(this)
    )

    this.eventHandlers.addAndStoreEventListener(
      this.ui.saveBtn, "pointerup",
      async () => {
        await this.onSave();
        this.destroy();
        this.onClose();
      }
    )
  }

  destroy() {
    this.eventHandlers.removeAllEventListeners();
    this.modal.remove();
  }
}
