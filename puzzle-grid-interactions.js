import { swapPuzzles, checkSolved, gridSize } from "./puzzle-grid.js";
import { updateTextureBuffer } from "./buffers.js";

export const addPointerListenerOn = (gl, canvas) => {
    canvas.addEventListener("pointerdown", (e) => {
        const puzzleBoard = canvas.getBoundingClientRect();
        // get coords of the grid cell from which the puzzle is dragged
        const puzzleFrom = getPointerCoords(e, canvas, puzzleBoard);
    
        canvas.addEventListener("pointerup", (e) => {
            // get the coords of the grid cell where the puzzle is droped
            const puzzleTo = getPointerCoords(e, canvas, puzzleBoard);
            const gridTextures = swapPuzzles(puzzleFrom, puzzleTo);
            updateTextureBuffer(gl, gridTextures);
            
            if (checkSolved()) 
                console.log("puzzle solved");
        }, 
        { once: true }
        );
    });
}

const getPointerCoords = (event, canvas, board) => {
    // get click positions
    const x = event.clientX - board.left;
    const y = event.clientY - board.top;

    // convert click position to grid coordinates
    const row = Math.floor((y / canvas.height) * gridSize);
    const col = Math.floor((x / canvas.width) * gridSize);

    return { row, col };
}