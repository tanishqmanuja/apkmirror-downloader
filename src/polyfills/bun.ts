import { createWriteStream, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { Readable } from "node:stream";
import { finished } from "node:stream/promises";

function write(dest: string, input: Response) {
  if (input instanceof Response) {
    if (input.body === null) {
      throw new Error(`Cannot write a response with no body to ${dest}`);
    }

    const dir = dirname(dest);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    return finished(
      Readable.fromWeb(input.body as any).pipe(
        createWriteStream(dest, { flags: "w" }),
      ),
    ).then(() => 0);
  }

  throw new Error(`Write Not implemented for ${input}`);
}

export const Bun = {
  write,
};
