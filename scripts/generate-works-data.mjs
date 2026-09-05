import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = await readFile(resolve(root, "d", "Docs.html"), "utf8");

const decodeEntities = (value) => value
  .replace(/&#(\d+);/g, (_, number) => String.fromCodePoint(Number(number)))
  .replace(/&#x([0-9a-f]+);/gi, (_, number) => String.fromCodePoint(parseInt(number, 16)))
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&")
  .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&nbsp;/g, " ");
const decodeText = (value) => decodeEntities(value.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, ""));

const snippets = [];
const pattern = /<pre[^>]*>\s*<code([^>]*)>([\s\S]*?)<\/code>\s*<\/pre>/gi;
let match;
while ((match = pattern.exec(source))) {
  // Preserve comparison operators such as <= instead of mistaking them for tags.
  const code = decodeEntities(match[2]).trim();
  if (!code) continue;
  const before = source.slice(0, match.index);
  const titleWindow = before.slice(Math.max(0, before.length - 2200));
  const titles = [...titleWindow.matchAll(/<(?:h2|h5)[^>]*(?:class=["'][^"']*(?:project-heading|code-snippet-title)[^"']*["'])?[^>]*>([\s\S]*?)<\/(?:h2|h5)>/gi)];
  const title = decodeText(titles.at(-1)?.[1] || `Code excerpt ${snippets.length + 1}`).replace(/\s+/g, " ").trim();
  const ids = [...before.matchAll(/<div[^>]+id=["']([^"']+-docs)["']/gi)];
  const language = match[1].match(/language-([\w-]+)/i)?.[1] || "text";
  snippets.push({ id: `code-${snippets.length + 1}`, title, section: (ids.at(-1)?.[1] || "documentation").replace(/-/g, " "), language, code });
}

const outputPath = resolve(root, "src", "generated", "worksData.js");
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `// Generated from d/Docs.html. Do not edit by hand.\nexport const WORKS_CODE_SNIPPETS = ${JSON.stringify(snippets, null, 2)};\n`, "utf8");
console.log(`Generated ${snippets.length} portfolio code snippets.`);
