import { PuzzleStatsBaseComponent } from "./PuzzleStatsBaseComponent";

export class PuzzleStatsComponent extends PuzzleStatsBaseComponent{
  constructor(container, data, onTryAgain, onSave, onClose) {
    super(container, data, onClose);
    this.onTryAgain = onTryAgain;
    this.onSave = onSave;
  }

  addListeners() {
    super.addListeners();

    this.eventHandlers.addAndStoreEventListener(
      this.ui.tryAgainBtn, "pointerup", this.onTryAgain.bind(this)
    )

    this.eventHandlers.addAndStoreEventListener(
      this.ui.saveBtn, "pointerup",
      async () => {
        await this.onSave();
        this.onClose();
        this.destroy();
      }
    )
  }

  getUIElements() {
    const ui = super.getUIElements();
    ui.tryAgainBtn = this.modal.querySelector("#try-again");
    ui.saveBtn = this.modal.querySelector("#save");

    return ui;
  }

  destroy() {
    super.destroy();

    Object.keys(this).forEach(key => this[key] = null);
  }
}
