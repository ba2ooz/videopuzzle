export function createDomElementFromHtml(htmlString) {
  const domElement = document.createElement("div");
  domElement.innerHTML = htmlString;
  return domElement.firstElementChild;
}

HTMLElement.prototype.disable = function () {
  this.classList.add("inactive");
}

HTMLElement.prototype.enable = function () {
  this.classList.remove("inactive");
}

HTMLElement.prototype.hide = function () {
  this.classList.add("hidden");
}

HTMLElement.prototype.display = function () {
  this.classList.remove("hidden");
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
  // create a unique key for each event in case they are on the same element with same event type
  const key = `${eventType}_${this.size}`;
  this.set(key, { element, eventType, boundHandler });
  element.addEventListener(eventType, boundHandler);
}

/**
 * Removes all the event listeners from a given map.
 */
Map.prototype.removeAllEventListeners = function () {
  this.forEach(({ element, eventType, boundHandler }, key) => {
    element.removeEventListener(eventType, boundHandler);
  });
  this.clear();
}

/**
 * Wraps a promise to handle errors in a more convenient way, returning a tuple with error and data.
 * 
 * @param   {Promise<any>}                              promise - The promise to be handled
 * @returns {Promise<[Error|undefined, any|undefined]>} A promise that resolves to a tuple where:
 *   - First element is either the error (if occurred) or undefined
 *   - Second element is either the resolved data or undefined
 * 
 * @example
 * const [error, data] = await catchError(somePromise());
 * if (error) {
 *   // handle error
 * } else {
 *   // use data
 * }
 */
export function catchError(promise) {
  return promise
    .then(data => {
      return [undefined, data];
    })
    .catch(error => {
      return [error];
    });
}
