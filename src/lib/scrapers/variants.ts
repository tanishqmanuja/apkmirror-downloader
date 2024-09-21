import { load } from "cheerio";
import { match } from "ts-pattern";

import { isNotNull } from "../../utils/typescript";
import { SUPPORTED_APP_TYPES } from "../types";
import { withBaseUrl } from "../utils";

export function getVariants(variantsPageUrl: string) {
  return fetch(variantsPageUrl)
    .then(res => res.text())
    .then(extractVariants);
}

export function extractVariants(variantsPageHtml: string) {
  const $ = load(variantsPageHtml);

  const table = $(".variants-table").first();
  if (!table) {
    throw new Error("Could not find variants table");
  }

  const [_header, ...rows] = table.children().toArray();

  const variants = rows.map(row => {
    const $row = $(row);
    const $variant = $row.find(".table-cell").first();

    const version = $variant.find("a").first().text().trim();

    const type = match($variant.find("span").text().trim())
      .when(
        t => t.includes("APK"),
        () => SUPPORTED_APP_TYPES.apk,
      )
      .when(
        t => t.includes("BUNDLE"),
        () => SUPPORTED_APP_TYPES.bundle,
      )
      .otherwise(() => "unknown");

    const arch = $row.find(".table-cell").eq(1).text();
    const minAndroidVersion = $row.find(".table-cell").eq(2).text();
    const dpi = $row.find(".table-cell").eq(3).text();
    const url = $row.find(".table-cell").eq(4).find("a").attr("href");

    if (!url) {
      return null;
    }

    return {
      version,
      type,
      arch,
      minAndroidVersion,
      dpi,
      url: withBaseUrl(url),
    };
  });

  return variants.filter(isNotNull);
}

export type Variant = ReturnType<typeof extractVariants>[number];
