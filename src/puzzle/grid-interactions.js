import { updateTextureBuffer } from "../graphics/buffers.js";

let draggedTile = null;
let highlightedTile = null;

export const addPointerListenerOn = (gl, canvas, grid) => {
  const getCanvasEventCoords = (e) => {
    const canvasRect = canvas.getBoundingClientRect();
    return [
      (e.clientX - canvasRect.left) / canvas.width,
      (e.clientY - canvasRect.top) / canvas.height,
    ];
  };

  canvas.addEventListener("pointerdown", (e) => {
    const handlePointerMove = (e) => {
      // no tile should not be a valid scenario
      if (!draggedTile) return;

      // convert pointer coordinates and normalize to (-1 to 1)
      const [pointerX, pointerY] = getCanvasEventCoords(e);
      const normalizedX = 2 * pointerX - 1;
      const normalizedY = 1 - 2 * pointerY;
      grid.moveTile(draggedTile, normalizedX, normalizedY);
      handleHighlightTile(grid, pointerX, pointerY);
    };

    const handlePointerUp = (e) => {
      window.removeEventListener("pointermove", handlePointerMove);

      // get target tile, swap the textures and reset the dragged tile position
      const [pointerX, pointerY] = getCanvasEventCoords(e);
      const targetTile = grid.getTileCoords(pointerX, pointerY);
      const gridTextures = grid.swapTiles(draggedTile, targetTile);
      grid.unhiglightTile(highlightedTile);
      grid.resetTile(draggedTile);
      highlightedTile = null;
      draggedTile = null;

      // no swap occurred, do nothing
      if (!gridTextures) {
        return;
      }

      updateTextureBuffer(gl, gridTextures);

      if (grid.isUnshuffled()) {
        console.log("puzzle solved");
      }
    };

    const [pointerX, pointerY] = getCanvasEventCoords(e);
    draggedTile = grid.getTileCoords(pointerX, pointerY);
    
    // set the initial state of the highlight object
    highlightedTile = draggedTile;

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp, { once: true });
  });
};

const handleHighlightTile = (grid, pointerX, pointerY) => {
  // get the coords of the potential tile to highlight
  const highlightTileCandidate = grid.getTileCoords(pointerX, pointerY);

  // pointer moved to a different tile
  if (
    !highlightedTile &&
    highlightTileCandidate.row === highlightedTile.row &&
    highlightTileCandidate.col === highlightedTile.col
  ) {
    return;
  }

  // unhighlight the tile when the pointer moves to another tile
  grid.unhiglightTile(highlightedTile);
  // this is an edge case!
  // do not highlight the tile yet,
  // only update the highlighted tile object state to whatever coordinates the pointer currently points to,
  // to avoid not being able to highlight a surrounding tile of the dragged tile
  // just because that same tile has been highlighted previously
  highlightedTile = highlightTileCandidate;

  // only proceed further if the highlight candidate is not the dragged tile
  if (
    highlightTileCandidate.row === draggedTile.row &&
    highlightTileCandidate.col === draggedTile.col
  ) {
    return;
  }

  // highlight the candidate if it's valid
  const tempHighlightTile = grid.higlightTile(highlightTileCandidate);
  if (!tempHighlightTile) {
    return;
  }

  // update highlighted tile object state
  highlightedTile = tempHighlightTile;
};
