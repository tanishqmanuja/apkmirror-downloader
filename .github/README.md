![Logo](https://raw.github.com/tanishqmanuja/static/main/banners/apkmirror-downloader.png?maxAge=2592000)

# APKMD //APKMirror Downloader

[![Downloads][downloads-shield]][downloads-url]
[![NPM Version][npm-shield]][npm-url]
![GitHub Workflow Status][ci-status-shield]
[![Language][language-shield]][language-url]
[![License][license-shield]][license-url]

APKMD is a CLI tool that allows you to download APKs from Apkmirror. This repo also provides a npm package [apkmirror-downloader](https://www.npmjs.com/package/apkmirror-downloader) that allows you to do the same programatically.

## 🚀 Install

Using `npm`

```bash
npm install apkmirror-downloader
```

Using `bun`

```bash
bun add apkmirror-downloader
```

Or use any other package manager like `yarn` or `pnpm`

## 📃 Usage

```ts
import { APKMirrorDownloader } from "apkmirror-downloader";

const apkmd = new APKMirrorDownloader(
  { outDir: "./downloads" }, // <-- 🟠 APKMDOptions (optional)
);

apkmd.download(
  { org: "google-inc", repo: "youtube" }, // <-- App (required)
  { type: "apk" }, // <-- 🟣 AppOptions (optional), will be merged with APKMDOptions
);

// OR

APKMirrorDownloader.download({ org: "google-inc", repo: "youtube" });
```

🟠 **APKMDOptions Interface**

- arch: Optional. The architecture of the application. For example, arm64-v8a, armeabi-v7a, etc.
- dpi: Optional. The screen density of the application. For example, 240dpi, 320dpi, 480dpi, etc.
- outDir: Optional. The output directory where the application files will be stored.

🟣 **AppOptions Interface**

- version: Optional. The version of the application.
- arch: Optional, DEFAULT: "universal". The architecture of the application. For example, arm64-v8a, armeabi-v7a, etc.
- dpi: Optional, DEFAULT: "nodpi". The screen density of the application. For example, 240dpi, 320dpi, 480dpi, etc.
- type: Optional, DEFAULT: "apk". The type of the application. Supported types are "apk" and "bundle".
- outFile: Optional. The name of the output file where the application will be saved.
- outDir: Optional. The output directory where the application files will be stored.

`AppOptions` will be merged automatically with `APKMDOptions` when download function is called.

> [!WARNING]
> Sometimes, download can fail at random. This is most likely due to rate limit protection by APKMirror using Cloudflare.

## ⚡ CLI

CLI can be downloaded from [releases](https://github.com/tanishqmanuja/apkmirror-downloader/releases/latest) section.

Usage can be found using the following command

```bash
apkmd --help
```

For downloading multiple apks use apps.json file

```bash
apkmd apps.json
```

```json
{
  "options": {
    "arch": "arm64-v8a",
    "outDir": "downloads"
  },
  "apps": [
    {
      "org": "google-inc",
      "repo": "youtube-music",
      "outFile": "ytm"
    },
    {
      "org": "google-inc",
      "repo": "youtube",
      "outFile": "yt",
      "version": "18.40.34"
    }
  ]
}
```

## 🐱 Show your support

Give a ⭐️ if this project helped you!

## 👨‍💻 Projects to checkout

- [**gh-apkmirror-dl**](https://github.com/Yakov5776/gh-apkmirror-dl) by [**Yakov**](https://github.com/Yakov5776) \
  ➡️ A GitHub Action to download APKs from Apkmirror

## 💀 Disclaimer

THIS PROJECT IS NOT ASSOCIATED OR ENDORSED BY APKMIRROR. The project is provided "as is" without warranty of any kind, either express or implied. Use at your own risk.

<!-- Shields -->

[ci-status-shield]: https://img.shields.io/github/actions/workflow/status/tanishqmanuja/apkmirror-downloader/ci.yaml?branch=main&style=for-the-badge&label=ci
[downloads-shield]: https://img.shields.io/github/downloads/tanishqmanuja/apkmirror-downloader/total?style=for-the-badge&logo=github
[downloads-url]: https://github.com/tanishqmanuja/apkmirror-downloader/releases/latest
[language-shield]: https://img.shields.io/github/languages/top/tanishqmanuja/apkmirror-downloader?style=for-the-badge
[language-url]: https://www.typescriptlang.org/
[license-shield]: https://img.shields.io/github/license/tanishqmanuja/apkmirror-downloader?style=for-the-badge
[license-url]: https://github.com/tanishqmanuja/apkmirror-downloader/blob/main/LICENSE.md
[npm-shield]: https://img.shields.io/npm/v/apkmirror-downloader?style=for-the-badge
[npm-url]: https://www.npmjs.com/package/apkmirror-downloader
