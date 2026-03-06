import { existsSync } from "fs";

import { match } from "ts-pattern";

import { cleanObject } from "../utils/object";
import { ensureExtension } from "../utils/path";
import type { LooseAutocomplete } from "../utils/types";
import { getFilteredVariant } from "./helpers";
import { getFinalDownloadUrl } from "./scrapers/downloads";
import { getVariants, RedirectError } from "./scrapers/variants";
import { getVersions } from "./scrapers/versions";
import type { App, AppArch, AppOptions, SpecialAppVersionToken } from "./types";
import {
  extractFileNameFromUrl,
  isAlphaVersion,
  isBetaVersion,
  isSpecialAppVersionToken,
  isStableVersion,
  isUniversalVariant,
  makeRepoUrl,
  makeVariantsUrl,
} from "./utils";

export type APKMDOptions = {
  arch?: AppOptions["arch"];
  dpi?: AppOptions["dpi"];
  minAndroidVersion?: AppOptions["minAndroidVersion"];
  outDir?: AppOptions["outDir"];
};

const DEFAULT_APP_OPTIONS = {
  type: "apk",
  version: "stable",
  arch: "universal",
  dpi: "nodpi",
  overwrite: true,
} satisfies AppOptions;

export type APKMDOptionsWithSuggestions = APKMDOptions & {
  arch?: LooseAutocomplete<AppArch>;
};

export type AppOptionsWithSuggestions = AppOptions & {
  arch?: LooseAutocomplete<AppArch>;
  version?: LooseAutocomplete<SpecialAppVersionToken>;
};

export class APKMirrorDownloader {
  #options: APKMDOptions;

  constructor(options: APKMDOptionsWithSuggestions = {}) {
    this.#options = cleanObject(options);
  }

  download(app: App, options: AppOptionsWithSuggestions = {}) {
    const o = {
      ...DEFAULT_APP_OPTIONS,
      ...this.#options,
      ...cleanObject(options),
    };
    return APKMirrorDownloader.download(app, o);
  }

  static async download(app: App, options: AppOptionsWithSuggestions = {}) {
    const o = { ...DEFAULT_APP_OPTIONS, ...cleanObject(options) };

    let variantsUrl: string | undefined;
    if (isSpecialAppVersionToken(o.version)) {
      const repoUrl = makeRepoUrl(app);
      const versions = await getVersions(repoUrl);

      const selectedVersion = match(o.version)
        .with("latest", () => versions[0])
        .with("beta", () => versions.find(isBetaVersion))
        .with("alpha", () => versions.find(isAlphaVersion))
        .otherwise(() => versions.find(isStableVersion));

      if (!selectedVersion) {
        throw new Error(`Could not find any suitable ${o.version} version`);
      }

      variantsUrl = selectedVersion.url;
      console.log(`Downloading ${selectedVersion.name}...`);
    } else {
      variantsUrl = makeVariantsUrl(app, o.version);
      console.log(`Downloading ${app.repo} ${o.version}...`);
    }

    if (!variantsUrl) {
      throw new Error("Could not find any suitable version");
    }

    const result = await getVariants(variantsUrl)
      .then(variants => ({ redirected: false as const, variants }))
      .catch(err => {
        if (err instanceof RedirectError) {
          return {
            redirected: true as const,
            url: err.message,
            variants: null,
          };
        }

        throw err;
      });

    let selectedVariant = null;
    if (result.redirected) {
      console.warn(
        "[WARNING]",
        `Only single variant is supported for ${app.org}/${app.repo}`,
      );
      selectedVariant = {
        url: result.url,
      };
    } else {
      selectedVariant = getFilteredVariant(result.variants, o);
      if (!selectedVariant && o.fallbackArch) {
        console.log("Using fallback arch:", o.fallbackArch);
        selectedVariant = getFilteredVariant(result.variants, {
          ...o,
          arch: o.fallbackArch,
        });
      }
    }

    if (!selectedVariant) {
      throw new Error("Could not find any suitable variant");
    }

    const finalDownloadUrl = await getFinalDownloadUrl(selectedVariant.url);

    return fetch(finalDownloadUrl).then(async res => {
      const filename = extractFileNameFromUrl(res.url);
      const extension = filename.split(".").pop()!;

      const outDir = o.outDir ?? ".";
      const outFile = ensureExtension(o.outFile ?? filename, extension);
      const dest = `${outDir}/${outFile}`;

      if (!o.overwrite && existsSync(dest)) {
        return { dest, skipped: true as const };
      }

      await Bun.write(dest, res);
      return { dest, skipped: false as const };
    });
  }
}
