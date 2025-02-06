import { initShaderProgram } from "./shader.js";
import { initBuffers } from "./buffers.js";
import { addPointerListenerOn } from "./puzzle-grid-interactions.js";
import * as video from "./video.js";
import { drawScene } from "./draw-scene.js";

// get a WebGLRenderingContext to render content
const canvas = document.querySelector("#video-canvas");
const gl = canvas.getContext("webgl");
if (!gl) {
    const errMessage = "Unable to initialize WebGL. Your browser or machine may not support it.";
    alert(errMessage);

    throw Error(errMessage);
}

addPointerListenerOn(gl, canvas);

main();

function main() {
    // Initialize a shader program; this is where all the lighting
    // for the vertices and so forth is established.
    const programInfo = initShaderProgram(gl);
    const buffers = initBuffers(gl);

    // Load video texture
    let canUpdateRef = { ready: false };
    const videoElement = document.createElement("video");
    const videoRef = video.setupVideo(videoElement, canUpdateRef, "Firefox.mp4");
    const texture = video.initTexture(gl);

    // Draw the scene repeatedly
    const render = () => {
        // ready to copy frame from video element
        if (canUpdateRef.ready) 
            video.updateTexture(gl, texture, videoRef);

        drawScene(gl, programInfo, buffers);
        
        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}