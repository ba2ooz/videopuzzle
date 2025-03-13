import { Direction } from "../../puzzle/Direction.js";
import { Grid } from "../../puzzle/Grid.js";

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

    this.updateTexture(swappedTextures.texture1);
    this.updateTexture(swappedTextures.texture2);

    if (this.grid.isUnshuffled()) {
      this.grid.unshuffledWithSuccess();
      this.removeAllEventListeners();
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
    this.updateAllTextures(gridTextures);

    if (this.grid.isUnshuffled()) {
      this.grid.unshuffledWithSuccess();
      this.removeAllEventListeners();
    }
  }

  /**
   * Registers the grid interaction events
   */
  addGridListeners() {
    this.addAndStoreEventListener(
      this.canvas,
      "pointerdown",
      this.handleGridPointerDown
    );
    this.addAndStoreEventListener(
      window,
      "pointermove",
      this.handleGridPointerMove
    );
    this.addAndStoreEventListener(
      window,
      "pointerup",
      this.handleGridPointerUp
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
    this.addAndStoreEventListener(this.upButton, eventType, () =>
      this.handleGridButtonPointerDown(this.grid.shiftOnRows, Direction.UP)
    );
    this.addAndStoreEventListener(this.downButton, eventType, () =>
      this.handleGridButtonPointerDown(this.grid.shiftOnRows, Direction.DOWN)
    );
    this.addAndStoreEventListener(this.leftButton, eventType, () =>
      this.handleGridButtonPointerDown(this.grid.shiftOnColumns, Direction.LEFT)
    );
    this.addAndStoreEventListener(this.rightButton, eventType, () =>
      this.handleGridButtonPointerDown(
        this.grid.shiftOnColumns,
        Direction.RIGHT
      )
    );
  }

  /**
   * Adds an event listener to the specified element and stores the handler for future reference.
   *
   * @param {HTMLElement} element   - The DOM element to which the event listener will be added.
   * @param {string}      eventType - The type of the event to listen for (e.g., 'pointerdown', 'pointermove').
   * @param {Function}    handler   - The function to be called when the event is triggered.
   */
  addAndStoreEventListener(element, eventType, handler) {
    const boundHandler = handler.bind(this);
    this.eventHandlers.set(element, { eventType, boundHandler });
    element.addEventListener(eventType, boundHandler);
  }

  /** 
   * Removes all the event listeners.
   */
  removeAllEventListeners() {
    this.eventHandlers.forEach(({ eventType, boundHandler }, element) => {
      element.removeEventListener(eventType, boundHandler);
    });
    this.eventHandlers.clear();
  }

  /**
   * Triggers a custom texture update event
   *
   * @param {Array} textures - The textures array
   */
  updateAllTextures(textures) {
    document.dispatchEvent(
      new CustomEvent("update_all_textures", {
        detail: { textures: textures },
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
      (e.clientX - this.canvasRect.left) / this.canvas.width,
      (e.clientY - this.canvasRect.top) / this.canvas.height,
    ];
  }
}
