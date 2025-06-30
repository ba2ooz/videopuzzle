export class ErrorHandler {
  static handle(error, context = "") {
    console.error(`[${context}]:`, error.message);

    document.dispatchEvent(
      new CustomEvent("app-error", {
        detail: {
          context,
          message: error.message,
        },
      })
    );
  }
}
