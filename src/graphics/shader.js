// vertex shader program
const vsSource = /*glsl*/ `
        attribute vec4 aVertexPosition;
        attribute vec2 aTextureCoord;

        uniform mat4 uModelMatrix;
        uniform mat4 uProjectionMatrix;

        varying highp vec2 vTextureCoord;

        void main() {
          gl_Position = uProjectionMatrix * uModelMatrix * aVertexPosition;
          vTextureCoord = aTextureCoord;
          }
        `;

// fragment shader program
const fsSource = /*glsl*/ `
        precision mediump float;
        
        varying highp vec2 vTextureCoord;

        uniform sampler2D uSampler;
        uniform vec4 uOverlayColor; // RGBA color with transparency

        void main(void) {
          vec4 texColor = texture2D(uSampler, vTextureCoord);
    
          // blend texture color with overlay color
          vec4 finalColor = mix(texColor, uOverlayColor, uOverlayColor.a);
      
          gl_FragColor = finalColor;
        }
      `;

// initialize a shader program, so WebGL knows how to draw our data
const initShaderProgram = (gl) => {
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
        shaderProgram
      )}`
    );
    return null;
  }

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
      uProjectionMatrix: gl.getUniformLocation(
        shaderProgram,
        "uProjectionMatrix"
      ),
      uModelMatrix: gl.getUniformLocation(shaderProgram, "uModelMatrix"),
      uOverlayColor: gl.getUniformLocation(shaderProgram, "uOverlayColor"),
    },
  };

  return programInfo;
};

// creates a shader of the given type, uploads the source and
// compiles it.
const loadShader = (gl, type, source) => {
  const shader = gl.createShader(type);

  // Send the source to the shader object
  gl.shaderSource(shader, source);

  // Compile the shader program
  gl.compileShader(shader);

  // See if it compiled successfully
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(
      `An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`
    );
    gl.deleteShader(shader);
    return null;
  }

  return shader;
};

export { initShaderProgram };
