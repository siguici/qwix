import '@builder.io/qwik/qwikloader.js';
import { use } from "qwix";
import { Counter } from "./counter";
import { component$ } from "@builder.io/qwik";

const renderer = new Counter;
const template = renderer.render;

use(renderer, template, component$(template));