import { Bun } from "./polyfills/bun";
import { isBun } from "./utils/bun";

if (!isBun()) {
  // @ts-ignore
  globalThis.Bun = Bun;
}
