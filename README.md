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
      "repo": "youtube-music"
    }
  ]
}
```

- **options**: Optional section to define global settings.

  - **arch**: Specifies the target architecture for downloading APKs (e.g., "arm64-v8a").

- **apps**: An array of app objects, each with the following properties:
  - **name**: The name of the app.
  - **org**: The APKMirror organization name.
  - **repo**: The APKMirror repository/app name.
  - **version**: (Optional) The specific version of the app. If not provided, the latest version will be used.

### Example

```bash
apkmd apps.json
```

This command will read the configuration from `apps.json` and manage the specified apps. You can also drag and drop the config file over apkmd.exe.

## License

APKMD is licensed under the [MIT License](LICENSE). Feel free to contribute and improve the tool.

## Issues

If you encounter any issues or have suggestions for improvement, please [open an issue on GitHub](https://github.com/tanishqmanuja/apkmirror-downloader/issues).

## Contributing

If you want to contribute to the development of APKMD, feel free to contact me.

---

Thank you for using APKMD! If you have any questions or need further assistance, feel free to reach out on the [GitHub repository](https://github.com/your-username/apkmd).
