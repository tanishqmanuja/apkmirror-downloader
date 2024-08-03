import cheerio from "cheerio";

import { isNotNull } from "../../utils/typescript";
import { withBaseUrl } from "../utils";

export function getVersions(repoPageUrl: string) {
  return fetch(repoPageUrl)
    .then(res => res.text())
    .then(extractVersions);
}

export function extractVersions(versionsPageHtml: string) {
  const $ = cheerio.load(versionsPageHtml);
  const table = $('.listWidget:has(a[name="all_versions"])').first();
  if (!table) {
    throw new Error("Could not find versions table");
  }

  const rows = table.children().toArray().slice(2, -1);
  // const moreUrl = table.children().last().find("a").first().attr("href");

  const versions = rows.map(row => {
    const $row = $(row);

    const name = $row.find(".table-cell").eq(1).find("a").first().text().trim();

    const url = $row.find(".table-cell").eq(1).find("a").first().attr("href");

    if (!name || !url) {
      return null;
    }

    return {
      name,
      url: withBaseUrl(url),
    };
  });

  return versions.filter(isNotNull);
}

export type Version = ReturnType<typeof extractVersions>[number];
