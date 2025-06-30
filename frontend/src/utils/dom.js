export function createDomElementFromHtml(htmlString) {
  const domElement = document.createElement("div");
  domElement.innerHTML = htmlString;
  return domElement.firstElementChild;
}

HTMLElement.prototype.disable = function () {
  this.classList.add("inactive");
};

HTMLElement.prototype.enable = function () {
  this.classList.remove("inactive");
};

HTMLElement.prototype.hide = function () {
  this.classList.add("hidden");
};

HTMLElement.prototype.display = function () {
  this.classList.remove("hidden");
};
