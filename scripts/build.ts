import { readFileSync } from "fs";
import { build, type BuildOptions } from "esbuild";
import { exec } from "@yao-pkg/pkg";

const NODE_VERSION = readFileSync("./.node-version", "utf-8");

console.log(
  `==> Building APKMirror Downloader v${process.env.npm_package_version}\n`
);

const config = {
  entryPoints: ["src/index.ts"],
  outfile: "./bin/apkmd.cjs",
  format: "cjs",
  platform: "node",
  bundle: true,
  minify: true,
  sourcemap: false,
  define: {
    "process.env.CLI_VERSION": `"${process.env.npm_package_version}"`,
  },
} satisfies BuildOptions;

try {
  console.log("> esbuild");
  await build(config);
  console.log("bundle: Done\n");

  await exec([
    config.outfile,
    "--target",
    `node${NODE_VERSION}-win-x64`,
    "--compress",
    "GZip",
    "--output",
    "bin/apkmd.exe",
  ]);

  await exec([
    config.outfile,
    "--target",
    `node${NODE_VERSION}-linux-x64`,
    "--compress",
    "GZip",
    "--output",
    "bin/apkmd",
  ]);

  console.log("\n==> Build success");
  process.exit(0);
} catch (e) {
  console.log("☠️ Build failed");
  console.error(e);
  process.exit(1);
}
