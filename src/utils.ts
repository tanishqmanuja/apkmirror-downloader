import { createWriteStream } from "fs";
import { mkdir } from "fs/promises";
import { Readable } from "stream";
import { finished } from "stream/promises";

export async function downloadAPK(url: string, name: string): Promise<void> {
  const DOWNLOAD_PATH = "downloads";

  const path = `${DOWNLOAD_PATH}/${name}.apk`;
  await mkdir(DOWNLOAD_PATH, { recursive: true });

  const response = await fetch(url);

  const contentType = response.headers.get("Content-Type");
  const isAPK = contentType == "application/vnd.android.package-archive";

  const body = response.body;

  if (body != null && isAPK) {
    const fileStream = createWriteStream(path, { flags: "w" });
    await finished(Readable.fromWeb(body).pipe(fileStream));
  } else {
    throw new Error("An error occured while trying to download the file");
  }
}

export async function waitForKeypressExit(exitCode = 0) {
  console.log("\nPress any key to exit ...");
  process.stdin.setRawMode(true);
  return new Promise<void>((resolve) =>
    process.stdin.once("data", () => {
      process.stdin.setRawMode(false);
      resolve();
    })
  ).finally(() => process.exit(exitCode));
}
