# APKMD //APK Mirror Downloader

APKMD is a CLI tool that allows you to download APKs from Apkmirror. This repo also provides a npm package [apkmirror-downloader](https://www.npmjs.com/package/apkmirror-downloader) that allows you to download APKs from APKMirror programatically.

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
  { outDir: "./downloads" } // <-- 🟠 APKMDOptions (optional)
);

apkmd.download(
  { org: "google-inc", repo: "youtube" }, // <-- App (required)
  { type: "apk" } // <-- 🟣 AppOptions (optional), will be merged with APKMDOptions
);

// OR

APKMirrorDownloader.download({ org: "google-inc", repo: "youtube" });
```

🟠 **APKMDOptions Interface**
- arch: Optional. The architecture of the application. For example, arm64-v8a, armeabi-v7a, etc.
- dpi: Optional. The screen density of the application. For example, 240dpi, 320dpi, 480dpi, etc.
- minAndroidVersion: Optional. The minimum Android version that the application is compatible with.
- outDir: Optional. The output directory where the application files will be stored.

🟣 **AppOptions Interface**
- version: Optional. The version of the application.
- arch: Optional, DEFAULT: "universal". The architecture of the application. For example, arm64-v8a, armeabi-v7a, etc.
- dpi: Optional, DEFAULT: "nodpi". The screen density of the application. For example, 240dpi, 320dpi, 480dpi, etc.
- type: Optional, DEFAULT: "apk". The type of the application. Supported types are "apk" and "bundle". 
- minAndroidVersion: Optional. The minimum Android version that the application is compatible with.
- outFile: Optional. The name of the output file where the application will be saved.
- outDir: Optional. The output directory where the application files will be stored.

`AppOptions` will be merged automatically with `APKMDOptions` when download function is called.

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