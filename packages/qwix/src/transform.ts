export function replaceSelectorAttributes(selector: string) {
  for (const elt of document.querySelectorAll(`[${selector}]`)) {
    replaceElementWithCustomTag(elt, selector);
  }
}

export function replaceElementWithCustomTag(
  element: Element,
  selector: string,
) {
  element.removeAttribute(selector);

  const attrs = element.attributes;
  const selectorElement = document.createElement(selector);
  for (const attr of Array.from(attrs)) {
    selectorElement.setAttribute(attr.name, attr.value);
  }

  if (element.childNodes.length > 0) {
    for (const child of Array.from(element.childNodes)) {
      selectorElement.appendChild(child.cloneNode(true));
    }
  } else {
    selectorElement.textContent = element.textContent;
  }

  element.parentNode
    ? element.parentNode.replaceChild(selectorElement, element)
    : element.replaceWith(selectorElement);
}
