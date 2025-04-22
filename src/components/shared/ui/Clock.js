export class Clock {
  constructor(element) {
    this.element = element;
    this.seconds = 0;
  }

  start() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.intervalId = setInterval(() => {
      if (this.isRunning) {
        this.seconds++;
        this.updateDisplay();
      }
    }, 1000);
  }

  stop() {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  updateDisplay() {
    if (!this.element) return;
    this.element.textContent = this.format(this.seconds);
  }

  format(seconds, short = false) {
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");

    if (short) {
      let timeString = "";
      if (h > 0) timeString += `${h}h`;
      if (m > 0) timeString += `${m}m`;
      if (s > 0) timeString += `${s}s`;
      return timeString;
    }

    return `${h}:${m}:${s}`;
  }

  getSeconds() {
    return this.seconds;
  }

  destroy() {
    this.stop();
    this.element = null;
  }
}
