import { initBuffers } from "./init-buffers.js";
import { drawScene } from "./draw-scene.js";
import { swapPuzzles, checkSolved, gridSize } from "./puzzle-grid.js";

// will set to true when video can be copied to texture
let copyVideo = false;

// Get a WebGLRenderingContext to render content
const canvas = document.querySelector("#video-canvas");
const gl = canvas.getContext("webgl");

// Only continue if WebGL is available and working
if (!gl) 
    alert("Unable to initialize WebGL. Your browser or machine may not support it.");

canvas.addEventListener("pointerdown", (e) => {
    const puzzleBoard = canvas.getBoundingClientRect();
    const puzzleFrom = getPointerCoords(e, puzzleBoard);

    canvas.addEventListener("pointerup", (e) => {
        const puzzleTo = getPointerCoords(e, puzzleBoard);
        const puzzleTexturesAfterSwap = swapPuzzles(puzzleFrom, puzzleTo);
        
        // uodate the textures buffer
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(puzzleTexturesAfterSwap), gl.STATIC_DRAW);
        
        if (checkSolved()) 
            console.log("puzzle solved");
    },
        { once: true });
});

function getPointerCoords(e, board) {
    // get click down positions
    const x = e.clientX - board.left;
    const y = e.clientY - board.top;

    // convert click position to grid coordinates
    const row = Math.floor((y / canvas.height) * gridSize);
    const col = Math.floor((x / canvas.width) * gridSize);

    return { row, col };
}

main();

function main() {
    // Vertex shader program
    const vsSource = /*glsl*/ `
        attribute vec4 aVertexPosition;
        attribute vec2 aTextureCoord;

        varying highp vec2 vTextureCoord;

        void main() {
          gl_Position = aVertexPosition;
          vTextureCoord = aTextureCoord;
          }
        `;

    // Fragment shader program
    const fsSource = /*glsl*/ `
        varying highp vec2 vTextureCoord;
    
        uniform sampler2D uSampler;
    
        void main(void) {
          gl_FragColor = texture2D(uSampler, vTextureCoord);
        }
      `;

    // Initialize a shader program; this is where all the lighting
    // for the vertices and so forth is established.
    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

    // Collect all the info needed to use the shader program.
    // Look up which attribute our shader program is using
    // for aVertexPosition and look up uniform locations.
    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
            textureCoord: gl.getAttribLocation(shaderProgram, "aTextureCoord"),
        },
        uniformLocations: {
            uSampler: gl.getUniformLocation(shaderProgram, "uSampler"),
        },
    };

    const buffers = initBuffers(gl);

    // Load video texture
    const texture = initTexture(gl);
    const video = setupVideo("Firefox.mp4");

    // Draw the scene repeatedly
    function render() {
        if (copyVideo) {
            updateTexture(gl, texture, video);
        }

        drawScene(gl, programInfo, buffers, texture);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

//
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    // Create the shader program
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert(
            `Unable to initialize the shader program: ${gl.getProgramInfoLog(
                shaderProgram,
            )}`,
        );
        return null;
    }

    return shaderProgram;
}

// creates a shader of the given type, uploads the source and
// compiles it.
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);

    // Send the source to the shader object
    gl.shaderSource(shader, source);

    // Compile the shader program
    gl.compileShader(shader);

    // See if it compiled successfully
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(
            `An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`,
        );
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function initTexture(gl) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Because video has to be download over the internet
    // they might take a moment until it's ready so
    // put a single pixel in the texture so we can
    // use it immediately.
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
    gl.texImage2D(
        gl.TEXTURE_2D,
        level,
        internalFormat,
        width,
        height,
        border,
        srcFormat,
        srcType,
        pixel,
    );

    // Turn off mips and set wrapping to clamp to edge so it
    // will work regardless of the dimensions of the video.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    return texture;
}

function updateTexture(gl, texture, video) {
    const level = 0;
    const internalFormat = gl.RGBA;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
        gl.TEXTURE_2D,
        level,
        internalFormat,
        srcFormat,
        srcType,
        video,
    );
}

function setupVideo(url) {
    const video = document.createElement("video");

    let playing = false;
    let timeupdate = false;

    video.playsInline = true;
    video.muted = true;
    video.loop = true;

    // Waiting for these 2 events ensures
    // there is data in the video
    video.addEventListener(
        "playing",
        () => {
            playing = true;
            checkReady();
        },
        true,
    );

    video.addEventListener(
        "timeupdate",
        () => {
            timeupdate = true;
            checkReady();
        },
        true,
    );

    video.src = url;
    video.play();

    function checkReady() {
        if (playing && timeupdate) {
            copyVideo = true;
        }
    }

    return video;
}