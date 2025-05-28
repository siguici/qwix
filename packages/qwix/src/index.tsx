import { component$, render } from "@builder.io/qwik";
import { parse_fn_params, parse_val } from "./parser";
import type { Component, Props, Renderer, Template } from "./types";

class QElement extends HTMLElement {}

export function defineRenderer<T extends Props>(renderer: Renderer) {
  return defineTemplate<T>(renderer.selector, renderer.template);
}

export function defineTemplate<T extends Props>(
  selector: string,
  template: Template,
) {
  const Qomponent: Component = component$<T>((props: T) => template(props));

  if (!customElements.get(selector)) {
    customElements.define(selector, QElement);
  }

  const props = parse_fn_params(template);

  defineSelectorElements(selector);

  for (const elt of document.getElementsByTagName(selector)) {
    const _props: Props = {};
    const slot = elt.innerHTML;
    if (props) {
      for (const [_prop, _val] of Object.entries(props)) {
        let attr = elt.getAttribute(`:${_prop}`);
        if (attr) {
          _props[_prop] = parse_val(attr);
          elt.removeAttribute(`:${_prop}`);
          continue;
        }

        attr = elt.getAttribute(_prop);
        if (attr) {
          _props[_prop] = attr;
          elt.removeAttribute(_prop);
          continue;
        }

        _props[_prop] = _val;
      }
    }

    defineComponent(elt, Qomponent, _props, slot);
  }
}

export function defineSelectorElements(selector: string) {
  for (const elt of document.querySelectorAll(`[${selector}]`)) {
    defineSelectorElement(elt, selector);
  }
}

export function defineSelectorElement(element: Element, selector: string) {
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

export function defineComponent<T extends Props>(
  parent: Document | Element,
  Output: Component,
  props: T,
  slot: string,
) {
  return render(parent, <Output {...props}>{slot}</Output>);
}

export function qwix<T extends Props>(components: {
  [key: string]: Template;
}): void;
export function qwix<T extends Props>(
  components: { selector: string; template: Template }[],
): void;
export function qwix<T extends Props>(
  selector: string,
  template: Template,
): void;
export function qwix<T extends Props>(renderer: Renderer): void;
export function qwix<T extends Props>(
  arg1:
    | string
    | Renderer
    | { [key: string]: Template }
    | { selector: string; template: Template }[],
  arg2?: Template,
): void {
  if (typeof arg1 === "string" && typeof arg2 === "function") {
    defineTemplate<T>(arg1, arg2);
    return;
  }

  if (Array.isArray(arg1)) {
    for (const renderer of arg1) {
      defineRenderer<T>(renderer);
    }
    return;
  }

  if (typeof arg1 === "object" && typeof arg2 === "undefined") {
    if (
      typeof arg1.selector === "string" &&
      typeof arg1.template === "function"
    ) {
      defineRenderer<T>(arg1 as Renderer);
      return;
    }

    for (const [selector, template] of Object.entries(arg1)) {
      defineTemplate<T>(selector, template);
    }
    return;
  }

  throw new Error("Invalid arguments passed to qwix()");
}

export default qwix;
