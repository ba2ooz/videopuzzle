import errorHTML from "bundle-text:./error-toast.html?raw";

export class ErrorToast {
  static container;
  static toasts = new Map();
  static AUTOHIDE_DELAY = 5000;

  static createStackableContainer() {
    if (!ErrorToast.container) {
      ErrorToast.container = document.createElement("div");
      ErrorToast.container.className = "toast-container";
      document.body.appendChild(ErrorToast.container);
    }

    return ErrorToast.container;
  }

  static show(message) {
    const container = ErrorToast.createStackableContainer();
    const toast = new Toast(message);
    ErrorToast.toasts.set(toast.id, toast);
    toast.show(container);
  }

  static close(toastId) {
    const toast = ErrorToast.toasts.get(toastId);
    if (!toast) {
      return;
    }

    toast.close();
    ErrorToast.toasts.delete(toastId);
    if (ErrorToast.toasts.size === 0) {
      ErrorToast.container.remove();
    }
  }
}

class Toast {
  element;
  closeButton;
  messageElement;
  autoHideTimeout;
  id;

  constructor(message) {
    this.id = crypto.randomUUID();
    this.createToastElement();
    this.setMessage(message);
    this.setupCloseButton();
    this.setupAutoHide();
  }

  get id() {
    return this.id;
  }

  createToastElement() {
    this.element = document.createElement("div");
    this.element.innerHTML = errorHTML;
    this.element.dataset.toastId = this.id;

    this.messageElement = this.element.querySelector(".error-message");
    this.closeButton = this.element.querySelector(".error-close-btn");

    if (!this.messageElement || !this.closeButton) {
      throw new Error("Failed to initialize toast elements");
    }
  }

  setMessage(message) {
    if (!message) {
      return;
    }
    this.messageElement.textContent = message;
  }

  setupCloseButton() {
    this.closeButton.addEventListener(
      "pointerup",
      () => ErrorToast.close(this.id),
      { once: true }
    );
  }

  setupAutoHide() {
    this.autoHideTimeout = setTimeout(
      () => ErrorToast.close(this.id),
      ErrorToast.AUTOHIDE_DELAY
    );
  }

  show(container) {
    if (!container) {
      return;
    }
    container.appendChild(this.element);
  }

  close() {
    clearTimeout(this.autoHideTimeout);

    const content = this.element.firstChild;
    if (!content) {
      return;
    }

    content.classList.add("fade-out");
    content.addEventListener(
      "animationend",
      () => {
        this.element.remove();
      },
      { once: true }
    );
  }
}
