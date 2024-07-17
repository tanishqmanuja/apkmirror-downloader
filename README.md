![Logo](https://raw.github.com/tanishqmanuja/apkmirror-downloader/main/assets/banner.png?maxAge=2592000)

# APKMirror Downloader

APKMD is a command-line interface (CLI) tool built using Node.js and TypeScript. It is designed to simplify the process of downloading apk files from apk mirror.

## Installation

Download the latest release of the APKMD executable file for your platform from the [Releases page](https://github.com/tanishqmanuja/apkmirror-downloader/releases).

## Usage

### Basic Usage

```bash
apkmd <configFile>
```

- `<configFile>`: Path to the JSON configuration file containing the list of apps to be downloaded. DEFAULT: `apps.json`

### Configuration File (e.g., apps.json)

The configuration file is a JSON file that defines the apps you want to manage and any additional options. Here is an example (`apps.json`):

```json
{
  "options": {
    "arch": "arm64-v8a"
  },
  "apps": [
    {
      "name": "yt",
      "org": "google-inc",
      "repo": "youtube",
      "version": "18.40.34"
    },
    {
      "name": "ytm",
      "org": "google-inc",
      "repo": "youtube-music",
      "bundle": true
    }
  ]
}
```

- **options**: Optional section to define global settings.

  - **arch**: Specifies the target architecture for downloading APKs (e.g., "arm64-v8a").

- **apps**: An array of app objects, each with the following properties:
  - **name**: (Optional) The name of the app.
  - **org**: The APKMirror organization name.
  - **repo**: The APKMirror repository/app name.
  - **version**: (Optional) The specific version of the app. If not provided, the latest version will be used.
  - **bundle**: (Optional) Switch between bundle (APKM) or regular APK. If not set, it defaults to APK.

### Example

```bash
apkmd apps.json
```

This command will read the configuration from `apps.json` and manage the specified apps. You can also drag and drop the config file over apkmd.exe.

> [!NOTE]
> Sometimes, download can fail at random. This is most likely due to rate limit protection by APKMirror using Cloudflare.

## Show your support

Give a ⭐️ if this project helped you!

## License

APKMD is licensed under the [MIT License](LICENSE). Feel free to contribute and improve the tool.
