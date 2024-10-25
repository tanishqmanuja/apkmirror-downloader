import { existsSync } from "fs";

import { match } from "ts-pattern";

import { cleanObject } from "../utils/object";
import { ensureExtension } from "../utils/path";
import type { LooseAutocomplete } from "../utils/types";
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
      let variants = result.variants;

      // filter by arch
      if (o.arch !== "universal" && o.arch !== "noarch") {
        variants = variants.find(v => v.arch === o.arch)
          ? variants.filter(v => v.arch === o.arch)
          : variants.filter(isUniversalVariant); // fallback to universal
      } else {
        variants = variants.filter(isUniversalVariant);
      }

      // filter by dpi
      if (o.dpi !== "*" && o.dpi !== "any") {
        variants = variants.filter(v => v.dpi === o.dpi);
      }

      // filter by minAndroidVersion
      if (o.minAndroidVersion) {
        variants = variants.filter(
          v =>
            parseFloat(v.minAndroidVersion) <= parseFloat(o.minAndroidVersion!),
        );
      }

      // filter by type
      variants = variants.filter(v => v.type === o.type);

      selectedVariant = variants[0];
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
