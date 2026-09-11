import { copyFile, mkdir, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = join(projectRoot, "media");
const publicRoot = join(projectRoot, "public", "media");
const videos = ["gateway-reel.mp4", "gateway-reel-mobile.mp4", "gateway-light.mp4", "gateway-works.mp4"];

await mkdir(publicRoot, { recursive: true });

for (const video of videos) {
  const source = join(sourceRoot, video);
  const destination = join(publicRoot, video);
  const sourceStats = await stat(source);
  let destinationStats;

  try {
    destinationStats = await stat(destination);
  } catch {
    destinationStats = null;
  }

  if (!destinationStats || destinationStats.size !== sourceStats.size) {
    await copyFile(source, destination);
  }
}

console.log("Gateway video assets are ready for the development and production builds.");
