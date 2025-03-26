import errorHTML from "bundle-text:./error-toast.html?raw";

export class ErrorToast {
  static toasts = [];

  static show(message) {
    // create element with error html
    const toast = document.createElement("div");
    toast.innerHTML = errorHTML;

    // insert the error message text
    const errorMsg = toast.querySelector(".error-message");
    errorMsg.textContent = message;

    // create a bound function for this specific toast
    const boundClose = () => ErrorToast.close(toast);

    // add close event listener on close btn
    const closeBtn = toast.querySelector(".error-close-btn");
    closeBtn.addEventListener("pointerup", boundClose);

    // display the toast in the dom
    document.body.appendChild(toast);

    // automatically remove error message after delay
    const autoRemoveTimeout = setTimeout( () => ErrorToast.close(toast), 5000);

    // push toast object to toasts array for error stacking
    ErrorToast.toasts.push({ toast, closeBtn, boundClose, autoRemoveTimeout });
  }

  static close(toast) {
    const toastObj = ErrorToast.toasts.find((tObj) => tObj.toast === toast);
    if (!toastObj) {
      return;
    }

    // remove close button listener
    toastObj.closeBtn.removeEventListener("pointerup", toastObj.boundClose);

    // ensure the element is removed after animation ends
    toastObj.toast.firstChild.classList.add("fade-out");
    toastObj.toast.addEventListener(
      "animationend", () => {
        clearTimeout(toastObj.autoRemoveTimeout); // prevent timeout from running if manually closed
        toastObj.toast.remove();
      }, { once: true }
    );

    ErrorToast.toasts = ErrorToast.toasts.filter((t) => t !== toastObj);
  }
}
