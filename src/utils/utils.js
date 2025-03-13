export function createDomElementFromHtml(htmlString) {
  const domElement = document.createElement("div");
  domElement.innerHTML = htmlString;
  return domElement.firstElementChild;
}

/**
 * Adds an event listener to the specified element and stores the handler for future reference in a given map.
 *
 * @param {HTMLElement} element   - The DOM element to which the event listener will be added.
 * @param {string}      eventType - The type of the event to listen for (e.g., 'pointerdown', 'pointermove').
 * @param {Function}    handler   - The function to be called when the event is triggered.
 */
Map.prototype.addAndStoreEventListener = function (element, eventType, handler) {
  const boundHandler = handler.bind(this);
  this.set(element, { eventType, boundHandler });
  element.addEventListener(eventType, boundHandler);
}

/**
 * Removes all the event listeners from a given map.
 */
Map.prototype.removeAllEventListeners = function () {
  this.forEach(({ eventType, boundHandler }, element) => {
    element.removeEventListener(eventType, boundHandler);
  });
  this.clear();
}
