export function createDomElementFromHtml(htmlString) {
  const domElement = document.createElement("div");
  domElement.innerHTML = htmlString;
  return domElement.firstElementChild;
}
