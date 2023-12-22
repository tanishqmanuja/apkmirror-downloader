import minimist from "minimist";
import { argv, exit } from "process";

import { existsSync } from "fs";
import ora from "ora-classic";

import { getDownloadUrl, getLatestVersion, getVariants } from "./scrapping";
import { downloadAPK } from "./utils";
import { FALLBACK_CONFIG, parseConfig } from "./config";

const args = minimist(argv.slice(2));

console.log("APKMirror Downloader");

const configPath = args._[0];
if (!configPath && !existsSync(FALLBACK_CONFIG)) {
  console.info("\tUSAGE: apkmd apps.json");
  exit(0);
}

parseConfig(configPath)
  .then(async (config) => {
    const { apps } = config;

    let downloadCount = 0;
    const spinner = ora({
      text: `Downloading ${apps.length} apps`,
    }).start();

    const p = await Promise.allSettled(
      apps.map(async (app) => {
        app.version =
          app.version ?? (await getLatestVersion(app.org, app.repo));

        if (!app.version) {
          throw new Error(
            `Could not find a version for ${app.org}/${app.repo}`
          );
        }

        const variants = await getVariants(app.org, app.repo, app.version);
        const found =
          (config.options?.arch
            ? variants.find((v) => v.arch === config.options?.arch)
            : undefined) ?? variants.find((v) => v.arch === "universal");

        if (!found) {
          throw new Error(
            `Could not find an APK for ${app.org}/${app.repo}@${app.version}`
          );
        }

        const appName = app.name ?? `${app.repo}-v${app.version}`;

        await getDownloadUrl(found.url)
          .then((url) => downloadAPK(url, appName))
          .then(() => {
            ora().succeed(
              `Downloaded ${app.org}/${app.repo}@${app.version} => ${appName}.apk`
            );
          })
          .catch(() => {
            ora().fail(
              `Failed to download ${app.org}/${app.repo}@${app.version}`
            );
          })
          .finally(() => {
            downloadCount++;
            spinner.text = `Downloading ${apps.length - downloadCount} apps`;
          });
      })
    );

    spinner.succeed(
      `Downloaded [${p.filter((p) => p.status === "fulfilled").length}/${
        p.length
      }] apps`
    );
  })
  .catch((error) => {
    ora().fail(error.message);
  })
  .finally(() => {
    console.log("\nPress any key to exit ...");
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on("data", process.exit.bind(process, 0));
  });

process.on("SIGINT", () => {
  process.exit(1);
});
