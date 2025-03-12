import { RouterComponent } from "./components/router/RouterComponent.js";

const appContainer = document.getElementById('app-container');
const router = new RouterComponent(appContainer);
router.start();