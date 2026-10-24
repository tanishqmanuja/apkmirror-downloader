import { load } from "cheerio";

import { impit } from "../impit";
import { withBaseUrl } from "../utils";

export function getFinalDownloadUrl(downloadPageUrl: string) {
  return impit
    .fetch(downloadPageUrl)
    .then(res => res.text())
    .then(extractRedirectDownloadUrl)
    .then(withBaseUrl)
    .then(url => impit.fetch(url))
    .then(res => res.text())
    .then(extractFinalDownloadUrl)
    .then(withBaseUrl);
}

export function extractRedirectDownloadUrl(downloadPageHtml: string) {
  const $ = load(downloadPageHtml);
  const downloadUrl = $(`a.downloadButton`).attr("href");
  if (!downloadUrl) {
    throw new Error("Could not find redirect download url");
  }
  return downloadUrl;
}

export function extractFinalDownloadUrl(downloadPageHtml: string) {
  const $ = load(downloadPageHtml);
  const downloadUrl = $(`.card-with-tabs a[href]`).attr("href");
  if (!downloadUrl) {
    throw new Error("Could not find final download url");
  }
  return downloadUrl;
}
