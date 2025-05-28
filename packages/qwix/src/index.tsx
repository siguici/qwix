import {
  registerComponentBySelector,
  registerRendererComponent,
} from "./register";
import type { Props, Renderer, Template } from "./types";

export * from "./register";
export * from "./mount";
export * from "./parser";
export * from "./transform";

export default function <T extends Props>(components: {
  [key: string]: Template;
}): void;
export default function <T extends Props>(
  components: { selector: string; template: Template }[],
): void;
export default function <T extends Props>(
  selector: string,
  template: Template,
): void;
export default function <T extends Props>(renderer: Renderer): void;
export default function <T extends Props>(
  arg1: string | Renderer | { [key: string]: Template } | Renderer[],
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
