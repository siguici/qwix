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

export function registerFromMap<T extends Props>(
  components: Record<string, Template>,
) {
  for (const [selector, template] of Object.entries(components)) {
    registerComponentBySelector<T>(selector, template);
  }
}

export function registerFromArray<T extends Props>(renderers: Renderer[]) {
  for (const renderer of renderers) {
    registerFromRenderer<T>(renderer);
  }
}

export function registerFromRenderer<T extends Props>(renderer: Renderer) {
  registerComponentBySelector<T>(renderer.selector, renderer.template);
}

export function registerFromSelector<T extends Props>(
  selector: string,
  template: Template,
) {
  registerComponentBySelector<T>(selector, template);
}
