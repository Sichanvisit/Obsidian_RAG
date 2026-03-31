import esbuild from "esbuild";
import process from "node:process";
import { builtinModules } from "node:module";

const watch = process.argv.includes("--watch");

const ctx = await esbuild.context({
  entryPoints: ["main.ts"],
  bundle: true,
  outfile: "main.js",
  format: "cjs",
  platform: "node",
  target: "es2020",
  sourcemap: "inline",
  logLevel: "info",
  external: ["obsidian", "electron", ...builtinModules],
});

if (watch) {
  await ctx.watch();
  console.log("Watching obsidian plugin...");
} else {
  await ctx.rebuild();
  await ctx.dispose();
}
