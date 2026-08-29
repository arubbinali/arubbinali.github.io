import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const contentRoot = join(root, "public", "light", "content");
const output = join(root, "src", "generated", "lightData.js");

function walk(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const content = Object.fromEntries(
  walk(contentRoot)
    .filter((path) => path.endsWith(".md"))
    .map((path) => [relative(contentRoot, path).replaceAll("\\", "/"), readFileSync(path, "utf8")])
);

let commits = [];
try {
  const raw = execFileSync("git", ["log", "-12", "--date=iso-strict", "--pretty=format:%h%x09%ad%x09%s"], { cwd: root, encoding: "utf8" });
  commits = raw.split(/\r?\n/).filter(Boolean).map((line) => {
    const [hash, date, ...message] = line.split("\t");
    return { hash, date, message: message.join(" ") || "Site update" };
  });
} catch {
  commits = [];
}

mkdirSync(dirname(output), { recursive: true });
writeFileSync(
  output,
  `// Generated from public/light/content and git history. Do not edit by hand.\nexport const LIGHT_CONTENT = ${JSON.stringify(content, null, 2)};\nexport const SITE_COMMITS = ${JSON.stringify(commits, null, 2)};\n`,
  "utf8"
);
