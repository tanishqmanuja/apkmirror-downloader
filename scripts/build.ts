import { chmodSync } from "fs";

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

// Bun preserves the `#!/usr/bin/env node` shebang from src/cli.ts,
// but ensure dist/cli.js has exactly one shebang so the `apkmd`
// bin works when installed globally (fixes `syntax error near
// unexpected token` when the file was executed as a shell script).
const cliPath = "dist/cli.js";
const cliContent = await Bun.file(cliPath).text();
const shebang = "#!/usr/bin/env node\n";
const stripped = cliContent.replace(/^(#![^\n]*\n)+/, "");
await Bun.write(cliPath, shebang + stripped);

// Ensure the bin is executable when packed/published.
chmodSync(cliPath, 0o755);
