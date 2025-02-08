import { updateTextureBuffer } from "../graphics/buffers.js";

export const addPointerListenerOn = (gl, canvas, grid) => {
  const getPointerCoords = (e) => {
    const canvasRect = canvas.getBoundingClientRect();
    // get click positions
    const x = e.clientX - canvasRect.left;
    const y = e.clientY - canvasRect.top;

    // convert click position to grid coordinates
    const row = Math.floor((y / canvas.height) * grid.getGridSize());
    const col = Math.floor((x / canvas.width) * grid.getGridSize());

    return { row, col };
  };

  canvas.addEventListener("pointerdown", (e) => {
    // get clicked-down tile coords
    const gridFrom = getPointerCoords(e);

    const handlePointerUp = (e) => {
      // get click-released tile coords
      const gridTo = getPointerCoords(e);

      const gridTextures = grid.swapTiles(gridFrom, gridTo);

      if (!gridTextures) {
        return;
      }

      updateTextureBuffer(gl, gridTextures);

      if (grid.isUnshuffled()) {
        console.log("puzzle solved");
      }
    };

    window.addEventListener("pointerup", handlePointerUp, { once: true });
  });
};
