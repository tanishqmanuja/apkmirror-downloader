export function isBun(): boolean {
  return process.versions.bun !== undefined;
}
