import { addPointerListenerOn } from "./puzzle-grid-interactions.js";
import { initShaderProgram } from "./shader.js";
import { createPuzzleGrid } from "./puzzle-grid.js";
import { initBuffers } from "./buffers.js";
import { drawScene } from "./draw-scene.js";
import * as video from "./video.js";

// get a WebGLRenderingContext to render content
const canvas = document.querySelector("#video-canvas");
const gl = canvas.getContext("webgl");
if (!gl) {
    const errMsg = "Unable to initialize WebGL. Your browser or machine may not support it.";
    alert(errMsg);

    throw Error(errMsg);
}

addPointerListenerOn(gl, canvas);

// Initialize a shader program; this is where all the lighting
// for the vertices and so forth is established.
const programInfo = initShaderProgram(gl);
const gridSettings = createPuzzleGrid();
const buffers = initBuffers(gl, gridSettings);

// Load video texture
const videoElement = document.createElement("video");
const videoRef = video.setupVideo(videoElement, "Firefox.mp4");
const texture = video.initTexture(gl);

// Draw the scene repeatedly
const render = () => {
    video.updateTexture(gl, texture, videoRef);
    drawScene(gl, programInfo, buffers);
    requestAnimationFrame(render);
}

requestAnimationFrame(render);