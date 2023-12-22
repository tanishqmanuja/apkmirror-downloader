import { build, type BuildOptions } from "esbuild";

const config = {
  entryPoints: ["src/index.ts"],
  outfile: "./dist/apkmd.cjs",
  format: "cjs",
  platform: "node",
  bundle: true,
  minify: true,
  sourcemap: false,
} satisfies BuildOptions;

try {
  await build(config);
  console.log("⚡️ Build success");
  process.exit(0);
} catch (e) {
  console.log("☠️ Build failed");
  process.exit(1);
}
