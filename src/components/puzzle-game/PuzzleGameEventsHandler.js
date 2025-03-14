import { Direction } from "../../core/puzzle/Direction.js";
import { Grid } from "../../core/puzzle/Grid.js";

/**
 * Handles pointer event listeners on the canvas for grid interactions.
 *
 * @param     {HTMLCanvasElement}     canvas           - the gl canvas
 * @param     {Grid}                  grid             - The grid object that handles drag and swap actions.
 */
export class PuzzleGameEventsHandler {
  constructor(canvas, grid) {
    this.grid = grid;
    this.canvas = canvas;
    this.canvasRect = canvas.getBoundingClientRect();
    this.eventHandlers = new Map(); // store event handlers for easy removal

    // shared state for pointer events
    this.isPointerDown = false;

    // add event listeners
    this.addGridListeners();
    this.addButtonListeners();
  }

  /**
   * Handles the pointer down within the canvas.
   *
   * @param {Event} e - The pointer move event.
   */
  handleGridPointerDown(e) {
    this.isPointerDown = true;
    const [pointerX, pointerY] = this.getCanvasEventCoords(e);
    this.grid.initDragState(pointerX, pointerY);
  }

  /**
   * Handles the pointer move event on the entire window for as long as pointerdown is active
   *
   * @param {Event} e - The pointer move event.
   */
  handleGridPointerMove(e) {
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
  handleGridPointerUp(e) {
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

    this.notifyTextureSwap(swappedTextures.texture1.data, swappedTextures.texture1.offsetId);
    this.notifyTextureSwap(swappedTextures.texture2.data, swappedTextures.texture2.offsetId);

    if (this.grid.isUnshuffled()) {
      this.grid.unshuffledWithSuccess();
      this.notifyUnshuffled();
      this.eventHandlers.removeAllEventListeners();
    }
  }

  /**
   * Executes a callback function which shifts the grid textures
   * Triggers texture update event.
   * Checks for win condition in which case removes the grid interaction listeners.
   *
   * @param {function} handleShift - callback shift textures function
   */
  handleGridButtonPointerDown(handleShift, direction) {
    const gridTextures = handleShift.call(this.grid, direction);
    this.notifyTextureSwap(gridTextures);

    if (this.grid.isUnshuffled()) {
      this.grid.unshuffledWithSuccess();
      this.notifyUnshuffled();
      this.eventHandlers.removeAllEventListeners();
    }
  }

  /**
   * Registers the grid interaction events
   */
  addGridListeners() {
    this.eventHandlers.addAndStoreEventListener(
      this.canvas,
      "pointerdown",
      this.handleGridPointerDown.bind(this)
    );
    this.eventHandlers.addAndStoreEventListener(
      window,
      "pointermove",
      this.handleGridPointerMove.bind(this)
    );
    this.eventHandlers.addAndStoreEventListener(
      window,
      "pointerup",
      this.handleGridPointerUp.bind(this)
    );
  }

  /**
   * Registers the grid buttons click events
   */
  addButtonListeners() {
    this.upButton = document.getElementById("shift_UP");
    this.downButton = document.getElementById("shift_DOWN");
    this.leftButton = document.getElementById("shift_LEFT");
    this.rightButton = document.getElementById("shift_RIGHT");

    const eventType = "pointerdown";
    this.eventHandlers.addAndStoreEventListener(this.upButton, eventType, () =>
      this.handleGridButtonPointerDown(this.grid.shiftOnRows, Direction.UP)
    );
    this.eventHandlers.addAndStoreEventListener(this.downButton, eventType, () =>
      this.handleGridButtonPointerDown(this.grid.shiftOnRows, Direction.DOWN)
    );
    this.eventHandlers.addAndStoreEventListener(this.leftButton, eventType, () =>
      this.handleGridButtonPointerDown(this.grid.shiftOnColumns, Direction.LEFT)
    );
    this.eventHandlers.addAndStoreEventListener(this.rightButton, eventType, () =>
      this.handleGridButtonPointerDown(
        this.grid.shiftOnColumns,
        Direction.RIGHT
      )
    );
  }

  /**
   * Triggers a custom texture update event
   *
   * @param {Array}  data   - An array containing either all textures or one specific texture 
   * @param {number} offset - The offset id at which data should be inserted - if null, the entire textures array will be replaced
   */
  notifyTextureSwap(data, offset = null) {
    const offsetId = offset === null ? -1 : offset;
    document.dispatchEvent(
      new CustomEvent("texture_swap", {
        detail: {
          data: data,
          offset: offsetId,
        },
      })
    );
  }

  notifyUnshuffled() {
    document.dispatchEvent(new CustomEvent("unshuffled"));
  }

  /**
   * Calculates the coordinates of a mouse event relative to the canvas.
   *
   * @param   {Event} e  - The mouse event object.
   * @returns {number[]} An array containing the normalized x and y coordinates of the event.
   */
  getCanvasEventCoords(e) {
    return [
      (e.clientX - this.canvasRect.left) / this.canvas.width,
      (e.clientY - this.canvasRect.top) / this.canvas.height,
    ];
  }
}
