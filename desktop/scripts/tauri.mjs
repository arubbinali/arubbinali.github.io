import { spawn } from "node:child_process";
import { homedir } from "node:os";
import { dirname, delimiter, join } from "node:path";
import { fileURLToPath } from "node:url";
// Rustup was installed without changing system PATH. Only this child inherits it.
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const cli = join(root, "node_modules", "@tauri-apps", "cli", "tauri.js");
const env = {
  ...process.env,
  PATH: `${join(homedir(), ".cargo", "bin")}${delimiter}${process.env.PATH ?? ""}`,
};
const child = spawn(process.execPath, [cli, ...process.argv.slice(2)], {
  cwd: root,
  env,
  stdio: "inherit",
});
child.on("error", (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
