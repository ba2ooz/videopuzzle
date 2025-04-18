import modalHTML from "bundle-text:./puzzle-stats-modal.html?raw";
import { createDomElementFromHtml } from "../../utils/utils.js";

export class PuzzleStatsComponent {
  constructor(container, data, onTryAgain, onSave) {
    this.data = data;
    this.container = container;
    this.onTryAgain = onTryAgain;
    this.onSave = onSave;
    this.eventHandlers = new Map(); 
  }

  render() {
    this.modal = createDomElementFromHtml(modalHTML);
    this.modal.querySelector(".current-moves").innerText = this.data.currentStats.moves;
    this.modal.querySelector(".current-time").innerText = this.data.currentStats.time;
    this.modal.querySelector(".moves-rank").innerText = this.data.currentStats.movesRank;
    this.modal.querySelector(".time-rank").innerText = this.data.currentStats.timeRank;

    if(this.data.newStats) {
      this.modal.querySelector(".new-moves").innerText = this.data.newStats.moves;
      this.modal.querySelector(".new-time").innerText = this.data.newStats.time;
      this.modal.querySelector(".new-stats").classList.remove("hidden");
      this.modal.querySelector("#save").classList.remove("hidden");
    }

    this.container.appendChild(this.modal);

    this.addListeners();
  }

  addListeners() {
    this.closeModal = this.modal.querySelector(".close-button");
    this.tryAgain = this.modal.querySelector("#try-again");
    this.save = this.modal.querySelector("#save");

    this.eventHandlers.addAndStoreEventListener(
      this.closeModal,
      "pointerup",
      this.destroy.bind(this)
    )

    this.eventHandlers.addAndStoreEventListener(
      this.tryAgain,
      "pointerup",
      this.onTryAgain.bind(this)
    )

    this.eventHandlers.addAndStoreEventListener(
      this.save,
      "pointerup",
      async () => {
        await this.onSave();
        this.destroy();
      }
    )
  }

  destroy() {
    this.eventHandlers.removeAllEventListeners();
    this.modal.remove();
  }
}
