import dts from "bun-plugin-dts";

console.log("🏗️  Building Lib");
await Bun.build({
  entrypoints: ["src/index.ts"],
  outdir: "dist",
  target: "node",
  sourcemap: "external",
  // @ts-ignore
  packages: "external",
  minify: true,
  plugins: [
    dts({
      output: {
        exportReferencedTypes: false,
      },
    }),
  ],
});

console.log("🏗️  Building CLI");
await Bun.build({
  entrypoints: ["src/cli.ts"],
  outdir: "dist",
  target: "node",
  sourcemap: "none",
  minify: true,
});
