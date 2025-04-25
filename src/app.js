import { RouterComponent } from "./components/router/RouterComponent.js";
import { ErrorHandler } from "./components/shared/error/ErrorHandler.js";
import { ErrorToast } from "./components/shared/error/ErrorToast.js";
import { ServiceContainer } from "./services/ServiceContainer.js";

const serviceContainer = new ServiceContainer();
serviceContainer.initialize();

const appContainer = document.getElementById("app-container");
const router = new RouterComponent(appContainer, serviceContainer);
router.start();

// add global error listener
document.addEventListener("app-error", (e) => {
  ErrorToast.show(`Error in ${e.detail.context}: ${e.detail.message}`);
});

// catch global unhandled errors
window.addEventListener("error", (e) => {
  ErrorHandler.handle(e.error, "Unhandled Error");
});

window.addEventListener("unhandledrejection", (e) => {
  ErrorHandler.handle(e.reason, "Unhandled Promise Rejection");
});