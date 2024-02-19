import { existsSync } from "fs";
import minimist from "minimist";
import ora from "ora-classic";

import { getDownloadUrl, getLatestVersion, getVariants } from "./scrapping";
import { downloadAPK, waitForKeypressExit } from "./utils";
import { FALLBACK_CONFIG, parseConfig, type Config } from "./config";

const args = minimist(process.argv.slice(2));

console.log(`APKMirror Downloader v${process.env.CLI_VERSION ?? "0.0.0-dev"}`);

async function resolveConfigPath() {
  const configPath = args._[0];
  if (!configPath && !existsSync(FALLBACK_CONFIG)) {
    console.info(" - USAGE: apkmd apps.json\n");
    throw new Error("Could not find a config file");
  }
  return configPath;
}

async function processConfig(config: Config) {
  const { apps } = config;

  let downloadCount = 1;
  const spinner = ora({
    text: `Downloading ${apps.length} apps`,
  }).start();

  const p = await Promise.allSettled(
    apps.map(async (app) => {
      app.version = app.version ?? (await getLatestVersion(app.org, app.repo));

      if (!app.version) {
        throw new Error(`Could not find a version for ${app.org}/${app.repo}`);
      }

      const variants = await getVariants(app.org, app.repo, app.version);
      const found =
        (config.options?.arch
          ? variants.findLast((v) => v.arch === config.options?.arch)
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
          spinner.clear();
        })
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
          spinner.text = `Downloading ${apps.length - downloadCount} apps`;
          downloadCount++;
        });
    })
  );

  spinner.succeed(
    `Downloaded [${p.filter((p) => p.status === "fulfilled").length}/${
      p.length
    }] apps`
  );
}

resolveConfigPath()
  .then(parseConfig)
  .then(processConfig)
  .catch((error) => {
    ora().fail(error.message);
  })
  .finally(async () => {
    waitForKeypressExit();
  });

process.on("SIGINT", () => {
  process.exit(1);
});
