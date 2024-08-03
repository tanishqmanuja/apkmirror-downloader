export function ensureExtension(path: string, extension: string) {
  if (!extension.startsWith(".")) {
    extension = `.${extension}`;
  }

  if (!path.endsWith(extension)) {
    return `${path}${extension}`;
  }

  return path;
}
