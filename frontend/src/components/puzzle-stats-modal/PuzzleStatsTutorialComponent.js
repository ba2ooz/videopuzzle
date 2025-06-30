import { PuzzleStatsBaseComponent } from "./PuzzleStatsBaseComponent";

export class PuzzleStatsTutorialComponent extends PuzzleStatsBaseComponent {
  constructor(container, data, onComplete, onClose) {
    super(container, data, onClose);
    this.onComplete = onComplete;
  }

  render() {
    super.render();
    this.ui.modalTitle.innerText = "Tutorial Completed!";
    this.ui.startPuzzleBtn.innerText = "Start Puzzle";
  }

  addListeners() {
    super.addListeners();
    this.eventHandlers.addAndStoreEventListener(
      this.ui.startPuzzleBtn, "pointerup", this.onComplete.bind(this)
    )
  }

  getUIElements() {
    const ui = super.getUIElements();
    ui.modalTitle = this.modal.querySelector(".modal-title");
    ui.startPuzzleBtn = this.modal.querySelector("#try-again");
    
    return ui;
  }

  showCurrentStats() {
    super.showCurrentStats();
    this.ui.movesRankElement.innerText = "--/--";
    this.ui.timeRankElement.innerText = "--/--";
  }

  destroy() {
    super.destroy();

    Object.keys(this).forEach(key => this[key] = null);
  }
}
