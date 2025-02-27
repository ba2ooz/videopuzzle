export class VideoManager {
  constructor(gl) {
    this.gl = gl;
    this.texture = null;
    this.videoElement = null;
    this.canCopyVideo = false;
  }

  /**
   * Creates a video element and makes sure it can be used by waiting for both 
   * 'playing' and 'timeupdate' events to be triggered indicating the video element has data.
   * 
   * @param   {string}  url - The video url.
   * @returns {Promise}
   */
  setupVideo(url) {
    this.videoElement = document.createElement("video");
    this.videoElement.playsInline = true;
    this.videoElement.muted = true;
    this.videoElement.loop = true;
    this.videoElement.src = url;

    return new Promise((resolve) => {
      // use Promise.all to wait for both events: 'playing' and 'timeupdate'
      const events = [
        new Promise((resolve) => {
          this.videoElement.addEventListener("playing", resolve, {
            once: true,
          });
        }),
        new Promise((resolve) => {
          this.videoElement.addEventListener("timeupdate", resolve, {
            once: true,
          });
        }),
      ];

      // the video is ready when both events fired
      Promise.all(events).then(() => {
        this.texture = this.initTexture();
        resolve(this.videoElement);
      });

      // start the video
      this.videoElement.play();
    });
  }

  initTexture() {
    const texture = this.gl.createTexture();
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

    // turn off mips and set wrapping to clamp to edge so it
    // will work regardless of the dimensions of the video.
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_WRAP_S,
      this.gl.CLAMP_TO_EDGE
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_WRAP_T,
      this.gl.CLAMP_TO_EDGE
    );
    this.gl.texParameteri(
      this.gl.TEXTURE_2D,
      this.gl.TEXTURE_MIN_FILTER,
      this.gl.LINEAR
    );

    return texture;
  }

  /**
   * Udates the gl texture with frames pulled out from the video element
   */
  updateTexture() {
    // ready to copy frame from video element
    if (this.texture) {
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
      this.gl.texImage2D(
        this.gl.TEXTURE_2D,
        0,            // level
        this.gl.RGBA, // internal format
        this.gl.RGBA, // src format
        this.gl.UNSIGNED_BYTE, // src type
        this.videoElement
      );
    }
  }
}
