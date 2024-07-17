import { readFile } from "fs/promises";
import { resolve } from "path";

export const FALLBACK_CONFIG = "apps.json";

type AppConfig = {
  name?: string;
  org: string;
  repo: string;
  version?: string;
  bundle?: bool;
};

export type Config = {
  options?: {
    arch?: "universal" | "armeabi-v7a" | "arm64-v8a" | "x86" | "x86_64";
    out?: string;
  };
  apps: AppConfig[];
};

export async function parseConfig(configPath: string = FALLBACK_CONFIG) {
  const config: Config = {
    options: {
      arch: "universal",
    },
    apps: [],
  };

  try {
    const json = await readFile(resolve(configPath), {
      encoding: "utf-8",
    });
    const cfg: Config = JSON.parse(json);

    if (cfg.options) {
      config.options = {
        ...config.options,
        ...cfg.options,
      };
    }

    for (const app of cfg.apps) {
      config.apps.push(app);
    }
  } catch (error) {
    throw new Error("Couln't parse config file!");
  }

  return config;
}
