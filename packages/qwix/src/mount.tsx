import { render } from "@builder.io/qwik";
import { parse_val } from "./parser";
import type { Component, Props } from "./types";

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

  renderComponent(element, component, props, slot);
}

export function renderComponent<T extends Props>(
  parent: Document | Element,
  Output: Component,
  props: T,
  slot: string,
) {
  return render(parent, <Output {...props}> {slot} </Output>);
}
