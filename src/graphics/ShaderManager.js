/**
 * Creates and manages a shader program.
 */
export class ShaderManager {
  /**
   * @param {WebGLRenderingContext} gl       - The WebGL rendering context.
   * @param {string}                vsSource - The source code for the vertex shader.
   * @param {string}                fsSource - The source code for the fragment shader.
   */
  constructor(gl, vsSource, fsSource) {
    this.gl = gl;
    this.program = this.createProgram(vsSource, fsSource);
    this.setProgramLocations();
  }

  /**
   * Creates a WebGL program from vertex and fragment shader sources.
   *
   * @param   {string}      vsSource - The source code of the vertex shader.
   * @param   {string}      fsSource - The source code of the fragment shader.
   * @returns {WebGLProgram}         - The compiled and linked WebGL program.
   * @throws  {Error}                - If the shaders fail to compile or the program fails to link.
   */
  createProgram(vsSource, fsSource) {
    const vertShader = this.loadShader(this.gl.VERTEX_SHADER, vsSource);
    const fragShader = this.loadShader(this.gl.FRAGMENT_SHADER, fsSource);

    if (!vertShader || !fragShader) {
      throw new Error("Failed to compile shaders");
    }

    const program = this.gl.createProgram();
    this.gl.attachShader(program, vertShader);
    this.gl.attachShader(program, fragShader);
    this.gl.linkProgram(program);

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      const error = this.gl.getProgramInfoLog(program);
      throw new Error(`Failed to link program: ${error}`);
    }

    // clean up shaders after linking
    this.gl.deleteShader(vertShader);
    this.gl.deleteShader(fragShader);

    return program;
  }

  /**
   * Uploads and compiles a WebGL shader.
   *
   * @param   {number}          type    - The type of shader to create. Can be either `gl.VERTEX_SHADER` or `gl.FRAGMENT_SHADER`.
   * @param   {string}          source  - The GLSL source code for the shader.
   * @returns {WebGLShader|null}        - The compiled shader, or `null` if the compilation failed.
   */
  loadShader(type, source) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    // see if it compiled successfully
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      return null;
    }

    return shader;
  }

  /**
   * Sets the locations of the shader program's attributes and uniforms.
   */
  setProgramLocations() {
    this.attributes = {
      texture: this.gl.getAttribLocation(this.program, "aTextureCoord"),
      position: this.gl.getAttribLocation(this.program, "aVertexPosition"),
    };

    this.uniforms = {
      model: this.gl.getUniformLocation(this.program, "uModelMatrix"),
      sampler: this.gl.getUniformLocation(this.program, "uSampler"),
      projection: this.gl.getUniformLocation(this.program, "uProjectionMatrix"),
      overlayColor: this.gl.getUniformLocation(this.program, "uOverlayColor"),
    };
  }
}
