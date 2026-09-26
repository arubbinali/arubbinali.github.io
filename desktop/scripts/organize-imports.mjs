import ts from "typescript";
import { readFileSync, writeFileSync } from "node:fs";
const configFile = ts.readConfigFile("tsconfig.json", ts.sys.readFile);
const config = ts.parseJsonConfigFileContent(configFile.config, ts.sys, ".");
const host = {
  getScriptFileNames: () => config.fileNames,
  getScriptVersion: () => "0",
  getScriptSnapshot: (file) =>
    ts.sys.fileExists(file)
      ? ts.ScriptSnapshot.fromString(ts.sys.readFile(file))
      : undefined,
  getCurrentDirectory: ts.sys.getCurrentDirectory,
  getCompilationSettings: () => config.options,
  getDefaultLibFileName: ts.getDefaultLibFilePath,
  fileExists: ts.sys.fileExists,
  readFile: ts.sys.readFile,
  readDirectory: ts.sys.readDirectory,
};
const service = ts.createLanguageService(host);
for (const fileName of config.fileNames) {
  for (const edit of service.organizeImports(
    { type: "file", fileName },
    {},
    {},
  )) {
    let source = readFileSync(edit.fileName, "utf8");
    for (const change of [...edit.textChanges].sort(
      (a, b) => b.span.start - a.span.start,
    )) {
      source =
        source.slice(0, change.span.start) +
        change.newText +
        source.slice(change.span.start + change.span.length);
    }
    writeFileSync(edit.fileName, source);
  }
}
service.dispose();
