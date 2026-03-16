import type { Variant } from "./scrapers/variants";
import type { AppOptions } from "./types";
import { isUniversalVariant } from "./utils";

export function normalizeVariants(variants: Variant[]): Variant[] {
  const normalized: Variant[] = [];

  // split if multiple archs found like "arm64-v8a + armeabi-v7a"
  for (const v of variants) {
    const archParts = v.arch.split("+").map(a => a.trim());
    if (archParts.length > 1) {
      for (const arch of archParts) {
        normalized.push({ ...v, arch });
      }
    } else {
      normalized.push(v);
    }
  }

  return normalized;
}

export function getFilteredVariant(variants: Variant[], o: AppOptions) {
  variants = normalizeVariants(variants);

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
      v => parseFloat(v.minAndroidVersion) <= parseFloat(o.minAndroidVersion!),
    );
  }

  // filter by type
  variants = variants.filter(v => v.type === o.type);

  return variants[0];
}
