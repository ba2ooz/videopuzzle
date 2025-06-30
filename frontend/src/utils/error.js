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
    .then((data) => {
      return [undefined, data];
    })
    .catch((error) => {
      return [error];
    });
}
