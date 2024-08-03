import { readFile } from "fs/promises";
import { resolve } from "path";

export function readJsonFile<T = any>(path: string): Promise<T> {
  return readFile(resolve(path), "utf-8").then(JSON.parse);
}
