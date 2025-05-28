import { component$, render } from "@builder.io/qwik";
import { parse_fn_params, parse_val } from "./parser";
import type { Component, Props, Renderer, Template } from "./types";

class QwixElement extends HTMLElement {}

export function registerRendererComponent<T extends Props>(renderer: Renderer) {
  return registerComponentBySelector<T>(renderer.selector, renderer.template);
}

export function registerComponentBySelector<T extends Props>(
  selector: string,
  template: Template,
) {
  if (!customElements.get(selector)) {
    customElements.define(selector, QwixElement);
  }

  replaceSelectorAttributes(selector);
  mountAllMatchingTags(
    selector,
    parse_fn_params(template),
    component$<T>((props: T) => template(props)),
  );
}

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

export function mountAllMatchingTags(
  tagName: string,
  params: object,
  component: Component,
) {
  for (const element of document.getElementsByTagName(tagName)) {
    mountComponentToElement(element, params, component);
  }
}

export function mountComponentToElement(
  element: Element,
  params: object,
  component: Component,
) {
  const props: Props = {};
  const slot = element.innerHTML;
  if (params) {
    for (const [_prop, _val] of Object.entries(params)) {
      let attr = element.getAttribute(`:${_prop}`);
      if (attr) {
        props[_prop] = parse_val(attr);
        element.removeAttribute(`:${_prop}`);
        continue;
      }

      attr = element.getAttribute(_prop);
      if (attr) {
        props[_prop] = attr;
        element.removeAttribute(_prop);
        continue;
      }

      props[_prop] = _val;
    }
  }

  renderComponent(element, component, props, slot);
}

export function renderComponent<T extends Props>(
  parent: Document | Element,
  Output: Component,
  props: T,
  slot: string,
) {
  return render(parent, <Output {...props}>{slot}</Output>);
}

export function registerQwixComponents<T extends Props>(components: {
  [key: string]: Template;
}): void;
export function registerQwixComponents<T extends Props>(
  components: { selector: string; template: Template }[],
): void;
export function registerQwixComponents<T extends Props>(
  selector: string,
  template: Template,
): void;
export function registerQwixComponents<T extends Props>(
  renderer: Renderer,
): void;
export function registerQwixComponents<T extends Props>(
  arg1:
    | string
    | Renderer
    | { [key: string]: Template }
    | { selector: string; template: Template }[],
  arg2?: Template,
): void {
  if (typeof arg1 === "string" && typeof arg2 === "function") {
    registerComponentBySelector<T>(arg1, arg2);
    return;
  }

  if (Array.isArray(arg1)) {
    for (const renderer of arg1) {
      registerRendererComponent<T>(renderer);
    }
    return;
  }

  if (typeof arg1 === "object" && typeof arg2 === "undefined") {
    if (
      typeof arg1.selector === "string" &&
      typeof arg1.template === "function"
    ) {
      registerRendererComponent<T>(arg1 as Renderer);
      return;
    }

    for (const [selector, template] of Object.entries(arg1)) {
      registerComponentBySelector<T>(selector, template);
    }
    return;
  }

  throw new Error("Invalid arguments passed to registerQwixComponents()");
}

export default registerQwixComponents;
