import { component$ } from "@builder.io/qwik";
import { mountAllMatchingTags } from "./mount";
import { parse_fn_params } from "./parser";
import { replaceSelectorAttributes } from "./transform";
import type { Component, Props, Renderer, Template } from "./types";

export class QwixElement extends HTMLElement {}

export function registerRendererComponent<T extends Props>(renderer: Renderer) {
  return registerTemplateBySelector<T>(renderer.selector, renderer.template);
}

export function registerTemplateBySelector<T extends Props>(
  selector: string,
  template: Template,
) {
  registerComponentBySelector(
    selector,
    component$<T>((props: T) => template(props)),
    parse_fn_params(template),
  );
}

export function registerComponentBySelector(
  selector: string,
  component: Component,
  props: Props = {},
) {
  if (!customElements.get(selector)) {
    customElements.define(selector, QwixElement);
  }

  replaceSelectorAttributes(selector);

  mountAllMatchingTags(selector, props, component);
}

export function registerFromMap<T extends Props>(
  components: Record<string, Template>,
) {
  for (const [selector, template] of Object.entries(components)) {
    registerTemplateBySelector<T>(selector, template);
  }
}

export function registerFromArray<T extends Props>(renderers: Renderer[]) {
  for (const renderer of renderers) {
    registerFromRenderer<T>(renderer);
  }
}

export function registerFromRenderer<T extends Props>(renderer: Renderer) {
  registerTemplateBySelector<T>(renderer.selector, renderer.template);
}

export function registerFromSelector<T extends Props>(
  selector: string,
  template: Template,
) {
  registerTemplateBySelector<T>(selector, template);
}
