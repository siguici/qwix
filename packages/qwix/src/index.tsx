import { component$, render } from "@builder.io/qwik";
import { parse_fn_params, parse_val } from "./parser";
import type { Component, Props, Renderer, Template } from "./types";

class QwixElement extends HTMLElement {}

export function defineRenderer<T extends Props>(renderer: Renderer) {
  return defineTemplate<T>(renderer.selector, renderer.template);
}

export function defineTemplate<T extends Props>(
  selector: string,
  template: Template,
) {
  if (!customElements.get(selector)) {
    customElements.define(selector, QwixElement);
  }

  defineSelectorElements(selector);
  defineTagComponents(
    selector,
    parse_fn_params(template),
    component$<T>((props: T) => template(props)),
  );
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

export function defineTagComponents(
  tagName: string,
  params: object,
  component: Component,
) {
  for (const element of document.getElementsByTagName(tagName)) {
    defineElementComponent(element, params, component);
  }
}

export function defineElementComponent(
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

  defineComponent(element, component, props, slot);
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
