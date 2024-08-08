import { component$ } from "@builder.io/qwik";
import "@builder.io/qwik/qwikloader.js";
import qwix from "qwix";
import { Counter } from "./counter";

const renderer = new Counter();
const template = renderer.render;

qwix(renderer, template, component$(template));
