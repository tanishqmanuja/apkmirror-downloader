const TARGETS = ["bun-windows-x64", "bun-linux-x64"];

for (const target of TARGETS) {
  console.log(`🏗️  Compiling CLI for ${target}`);
  await Bun.$`bun build --compile --target=${target} ./src/cli.ts --outfile ./out/apkmd`;
}
