import esbuild from "esbuild";
import process from "node:process";
import builtins from "builtin-modules";

const prod = process.argv.includes("production");

const context = await esbuild.context({
  banner: {
    js: "/* Bundled by esbuild for the classpage Obsidian plugin. */",
  },
  bundle: true,
  entryPoints: ["src/main.ts"],
  external: [
    "obsidian",
    "electron",
    "@codemirror/autocomplete",
    "@codemirror/collab",
    "@codemirror/commands",
    "@codemirror/language",
    "@codemirror/lint",
    "@codemirror/search",
    "@codemirror/state",
    "@codemirror/view",
    ...builtins,
  ],
  format: "cjs",
  logLevel: "info",
  outfile: "main.js",
  sourcemap: prod ? false : "inline",
  target: "es2020",
  treeShaking: true,
});

if (prod) {
  await context.rebuild();
  await context.dispose();
} else {
  await context.watch();
}

