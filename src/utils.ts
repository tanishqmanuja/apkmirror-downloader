import { createWriteStream } from "fs";
import { mkdir } from "fs/promises";
import { Readable } from "stream";
import { finished } from "stream/promises";

export async function downloadAPK(url: string, name: string): Promise<void> {
  const DOWNLOAD_PATH = "downloads";
  await mkdir(DOWNLOAD_PATH, { recursive: true });

  const response = await fetch(url);

  const contentType = response.headers.get("Content-Type");
  const isAPK = contentType == "application/vnd.android.package-archive";

  // content type for apkm is application/octet-stream, so at least we can check for extension then
  var isAPKM = false;
  const apkmRegex = /.*\/(.*apkmirror.com.apkm)/;
  if (response.url.match(apkmRegex) != null) {
    isAPKM = true;
  }

  var ext;
  if (isAPKM) {
    ext = "apkm";
  } else if (isAPK) {
    ext = "apk";
  }
  var path = `${DOWNLOAD_PATH}/${name}.${ext}`;

  const body = response.body;

  if (body != null && (isAPK || isAPKM)) {
    const fileStream = createWriteStream(path, { flags: "w" });
    await finished(Readable.fromWeb(body).pipe(fileStream));
  } else {
    throw new Error("An error occured while trying to download the file");
  }
}

export async function waitForKeypressExit(exitCode = 0) {
  if (!process.stdin.isTTY) {
    return;
  }

  console.log("\nPress any key to exit ...");
  process.stdin.setRawMode(true);
  return new Promise<void>((resolve) =>
    process.stdin.once("data", () => {
      process.stdin.setRawMode(false);
      resolve();
    })
  ).finally(() => process.exit(exitCode));
}
