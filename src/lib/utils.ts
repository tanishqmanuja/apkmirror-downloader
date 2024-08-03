import type { Variant } from "./scrapers/variants";
import type { Version } from "./scrapers/versions";
import {
  SPECIAL_APP_VERSION_TOKENS,
  type App,
  type SpecialAppVersionToken,
} from "./types";

export function withBaseUrl(endpoint: string) {
  if (endpoint.startsWith("/")) {
    return `https://www.apkmirror.com${endpoint}`;
  }

  return `https://www.apkmirror.com/${endpoint}`;
}

export function makeRepoUrl({ org, repo }: App) {
  return withBaseUrl(`/apk/${org}/${repo}`);
}

export function makeVariantsUrl({ org, repo }: App, version: string) {
  return withBaseUrl(
    `/apk/${org}/${repo}/${repo}-${version.replaceAll(".", "-")}-release/`,
  );
}

export function extractFileNameFromUrl(url: string) {
  const urlobj = new URL(url);
  const parts = urlobj.pathname.split("/");
  const filename = decodeURI(parts[parts.length - 1]);
  return filename;
}

export function isSpecialAppVersionToken<T>(
  token: string,
): token is SpecialAppVersionToken {
  return (SPECIAL_APP_VERSION_TOKENS as readonly string[]).includes(token);
}

export function isUniversalVariant(variant: Variant) {
  return variant.arch === "universal" || variant.arch === "noarch";
}

export function isAlphaVersion(version: Version) {
  return version.name.toLowerCase().includes("alpha");
}

export function isBetaVersion(version: Version) {
  return version.name.toLowerCase().includes("beta");
}

export function isStableVersion(version: Version) {
  return (
    !version.name.toLowerCase().includes("alpha") &&
    !version.name.toLowerCase().includes("beta")
  );
}
