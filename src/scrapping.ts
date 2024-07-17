import cheerio from "cheerio";

const BASE_URL = "https://www.apkmirror.com";

async function getHtmlForApkMirror(url: string) {
  return fetch(BASE_URL + url).then((r) => r.text());
}

async function getDownloadPageUrl(downloadPageUrl: string) {
  const html = await getHtmlForApkMirror(downloadPageUrl);
  const $ = cheerio.load(html);

  const downloadUrl = $(`a.downloadButton`).attr("href");

  if (!downloadUrl) {
    throw new Error("Could not find download page url");
  }

  return downloadUrl;
}

async function getDirectDownloadUrl(downloadPageUrl: string) {
  const html = await getHtmlForApkMirror(downloadPageUrl);
  const $ = cheerio.load(html);

  const downloadUrl = $(`.card-with-tabs a[href]`).attr("href");

  if (!downloadUrl) {
    throw new Error("Could not find direct download url");
  }

  return downloadUrl;
}

function extractVersion(input: string) {
  const versionRegex = /\b\d+(\.\d+)+(-\S+)?\b/;
  const match = input.match(versionRegex);

  return match ? match[0] : undefined;
}

export async function getStableLatestVersion(org: string, repo: string) {
  const apkmUrl = `https://www.apkmirror.com/apk/${org}/${repo}`;

  const response = await fetch(apkmUrl);
  const html = await response.text();
  const $ = cheerio.load(html);

  const versions = $(
    `#primary > div.listWidget.p-relative > div > div.appRow > div > div:nth-child(2) > div > h5 > a`
  )
    .toArray()
    .map((v) => $(v).text());

  const stableVersion = versions.filter(
    (v) => !v.includes("alpha") && !v.includes("beta")
  )[0];

  if (!stableVersion) {
    throw new Error("Could not find stable version");
  }

  return extractVersion(stableVersion);
}

export async function getDownloadUrl(downloadPageUrl: string) {
  return getDownloadPageUrl(downloadPageUrl)
    .then((d) => getDirectDownloadUrl(d))
    .then((d) => BASE_URL + d);
}

export async function getVariants(org: string, repo: string, version: string, bundle: bool) {
  const apkmUrl = `https://www.apkmirror.com/apk/${org}/${repo}/${repo}-${version.replaceAll(
    ".",
    "-"
  )}-release`;

  const response = await fetch(apkmUrl);
  const html = await response.text();
  const $ = cheerio.load(html);

  var rows;
  if (bundle) {
    rows = $('.variants-table .table-row:has(span.apkm-badge:contains("BUNDLE"))');
  } else {
    rows = $('.variants-table .table-row:has(span.apkm-badge:contains("APK"))');
  }

  const parsedData: {
    variant: string;
    arch: string;
    version: string;
    dpi: string;
    url: string;
  }[] = [];

  rows.each((_index, row) => {
    const columns = $(row).find(".table-cell");

    const variant = $(columns[0]).text().trim();
    const arch = $(columns[1]).text().trim();
    const version = $(columns[2]).text().trim();
    const dpi = $(columns[3]).text().trim();
    const url = $(columns[4]).find("a").attr("href");

    if (!variant || !arch || !version || !dpi || !url) {
      return;
    }

    const rowData = {
      variant,
      arch,
      version,
      dpi,
      url,
    };

    parsedData.push(rowData);
  });

  return parsedData;
}
