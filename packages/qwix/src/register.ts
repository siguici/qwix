import { component$ } from "@builder.io/qwik";
import { mountAllMatchingTags } from "./mount";
import { parse_fn_params } from "./parser";
import { replaceSelectorAttributes } from "./transform";
import type { Props, Renderer, Template } from "./types";

export class QwixElement extends HTMLElement {}

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
