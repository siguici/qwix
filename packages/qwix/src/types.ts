import type { Component, QwikJSX } from "@builder.io/qwik";

export type Element = QwikJSX.Element;
export type Props = Record<any, any>;
export type Template = <T extends Props>(props: T) => Element;

export interface Renderer {
  selector: string;
  template: Template;
}

export declare const Renderer: {
  prototype: Renderer;
  new (): Renderer;
};

export type { Component };
