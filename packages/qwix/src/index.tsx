import { type Component, type QwikJSX, render } from "@builder.io/qwik";
import { parse_props, parse_val } from "./parser";

export type Props = Record<any, any>;
export type Template = <T extends Props>(props: T) => QwikJSX.Element;

export interface Renderer {
  name: string;
  render: Template;
}

export declare const Renderer: {
  prototype: Renderer;
  new (): Renderer;
};

class QElement extends HTMLElement {}

export default function (
  renderer: Renderer,
  template: Template,
  Component: Component,
  prefix = "q",
) {
  const tag = `${prefix}-${renderer.name}`;
  if (!customElements.get(tag)) {
    customElements.define(tag, QElement);
  }

  const reg = /(?:render)?\s*\(\{([^\(\)\{\}]+?)\}\)\s*(?:\=\>)?\s*\{?/gm;
  const tpl = template.toString();
  const res = reg.exec(tpl);
  const props = res ? parse_props(res[1]) : {};

  for (const elt of document.querySelectorAll(`[${tag}]`)) {
    elt.removeAttribute(tag);

    const attrs = elt.attributes;
    const q_elt = document.createElement(tag);
    for (const attr of Array.from(attrs)) {
      q_elt.setAttribute(attr.name, attr.value);
    }

    if (elt.childNodes.length > 0) {
      for (const child of Array.from(elt.childNodes)) {
        q_elt.appendChild(child.cloneNode(true));
      }
    } else {
      q_elt.textContent = elt.textContent;
    }

    elt.parentNode
      ? elt.parentNode.replaceChild(q_elt, elt)
      : elt.replaceWith(q_elt);
  }

  for (const elt of document.getElementsByTagName(tag)) {
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
    console.log(_props);

    render(elt, <Component {..._props}>{slot}</Component>);
  }
}
