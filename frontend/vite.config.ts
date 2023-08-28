import { defineConfig } from "vite";
import zipPack from "vite-plugin-zip-pack";
import preact from "@preact/preset-vite";

import { readFileSync, mkdirSync, copyFileSync, existsSync } from "node:fs";

const embedDir = "../src/embed/";

function embedVersion() {
  return {
    name: "vite-plugin-embed-webxdc-version",
    apply: "build",
    buildEnd(error) {
      if (error) {
        return;
      }
      if (!existsSync(embedDir)) {
        mkdirSync(embedDir);
      }
        copyFileSync("./public/version.txt", embedDir + "version.txt");
    },
  };
}

function eruda(debug = undefined) {
  const erudaSrc = readFileSync("./node_modules/eruda/eruda.js", "utf-8");
  return {
    name: "vite-plugin-eruda",
    apply: "build",
    transformIndexHtml(html) {
      const tags = [
        {
          tag: "script",
          children: erudaSrc,
          injectTo: "head",
        },
        {
          tag: "script",
          children: "eruda.init();",
          injectTo: "head",
        },
      ];
      if (debug === true) {
        return {
          html,
          tags,
        };
      } else if (debug === false) {
        return html;
      }
      // @ts-ignore
      if (process.env.NODE_ENV !== "production") {
        return {
          html,
          tags,
        };
      } else {
        return html;
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    preact(),
    // @ts-ignore
    eruda(),
    embedVersion(),
    zipPack({
      outDir: embedDir,
      outFileName: "app.xdc",
    }),
  ],
});