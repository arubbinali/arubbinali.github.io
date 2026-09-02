import { cp, readdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const buildRoot = join(projectRoot, "build");

for (const entry of await readdir(buildRoot)) {
  await cp(join(buildRoot, entry), join(projectRoot, entry), {
    recursive: true,
    force: true,
  });
}

console.log("Production build synced to the main-branch root used by GitHub Pages.");
