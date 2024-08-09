import { qwikVite } from "@builder.io/qwik/optimizer";
import { defineConfig } from "vite";

export default defineConfig(() => {
  return {
    plugins: [
      qwikVite({
        csr: true,
      }),
    ],
  };
});
