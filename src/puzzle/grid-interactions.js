import { Direction } from "./direction.js";
import { GameGrid } from "./grid.js";

/**
 * Handles pointer event listeners on the canvas for grid interactions.
 *
 * @param     {HTMLCanvasElement}     canvas           - the gl canvas
 * @param     {GameGrid}              grid             - The grid object that handles drag and swap actions.
 */
export class GridEventsHandler {
  constructor(canvas, grid) {
    this.canvasRect = canvas.getBoundingClientRect();
    this.canvasWidth = canvas.width;
    this.canvasHeight = canvas.height;
    this.grid = grid;

    // shared state for pointer events
    this.isPointerDown = false;

    // bind event handlers to ensure 'this' refers to the class instance
    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);

    // add event listeners
    canvas.addEventListener("pointerdown", this.handlePointerDown);
    window.addEventListener("pointermove", this.handlePointerMove);
    window.addEventListener("pointerup", this.handlePointerUp);

    // add button event listeners
    this.addButtonListeners();
  }

  /**
   * Handles the pointer down within the canvas.
   *
   * @param {Event} e - The pointer move event.
   */
  handlePointerDown(e) {
    this.isPointerDown = true;
    const [pointerX, pointerY] = this.getCanvasEventCoords(e);
    this.grid.initDragState(pointerX, pointerY);
  }

  /**
   * Handles the pointer move event on the entire window for as long as pointerdown is active
   *
   * @param {Event} e - The pointer move event.
   */
  handlePointerMove(e) {
    if (!this.isPointerDown) {
      return;
    }

    const [pointerX, pointerY] = this.getCanvasEventCoords(e);
    this.grid.handleDragAction(pointerX, pointerY);
  }

  /**
   * Handles the pointer up event on entire window.
   * This is triggered when the pointer is released.
   * It resets @param isPointerDown state and handles a two tiles swap event.
   *
   * @param {Event} e - The pointer event object.
   */
  handlePointerUp(e) {
    if (!this.isPointerDown) {
      return;
    }

    // pointerdown released, update the state
    this.isPointerDown = false;

    const swappedTextures = this.grid.handleSwapAction();
    // reset the grid state. This has to happen even if no swap occured
    this.grid.clearDragState();

    // no swap occurred, do nothing
    if (!swappedTextures) {
      return;
    }

    this.updateTexture(swappedTextures.texture1);
    this.updateTexture(swappedTextures.texture2);

    if (this.grid.isUnshuffled()) {
      console.log("puzzle solved");
    }
  }

  /**
   * Registers the grid buttons click events
   */
  addButtonListeners() {
    const leftButton = document.getElementById("shift_LEFT");
    const rightButton = document.getElementById("shift_RIGHT");
    const upButton = document.getElementById("shift_UP");
    const downButton = document.getElementById("shift_DOWN");

    leftButton.addEventListener("pointerdown", () =>
      this.updateAllTextures(this.grid.shiftOnColumns(Direction.LEFT))
    );
    rightButton.addEventListener("pointerdown", () =>
      this.updateAllTextures(this.grid.shiftOnColumns(Direction.RIGHT))
    );
    upButton.addEventListener("pointerdown", () =>
      this.updateAllTextures(this.grid.shiftOnRows(Direction.UP))
    );
    downButton.addEventListener("pointerdown", () =>
      this.updateAllTextures(this.grid.shiftOnRows(Direction.DOWN))
    );
  }

  /**
   * Executes a callback function which shifts the grid textures
   * And triggers a custom texture update event
   *
   * @param {function} handleShift - callback shift textures function
   */
  updateAllTextures(handleShift) {
    const gridTextures = handleShift;
    document.dispatchEvent(
      new CustomEvent("update_all_textures", {
        detail: { textures: gridTextures },
      })
    );
  }

  /**
   * Triggers a custom texture update event
   *
   * @param {Object} texture - texture object holding the data and the offset id at which data should be inserted
   */
  updateTexture(texture) {
    document.dispatchEvent(
      new CustomEvent("update_texture", {
        detail: {
          texture: texture.data,
          offset: texture.offsetId,
        },
      })
    );
  }

  /**
   * Calculates the coordinates of a mouse event relative to the canvas.
   *
   * @param   {Event} e  - The mouse event object.
   * @returns {number[]} An array containing the normalized x and y coordinates of the event.
   */
  getCanvasEventCoords(e) {
    return [
      (e.clientX - this.canvasRect.left) / this.canvasWidth,
      (e.clientY - this.canvasRect.top) / this.canvasHeight,
    ];
  }
}
