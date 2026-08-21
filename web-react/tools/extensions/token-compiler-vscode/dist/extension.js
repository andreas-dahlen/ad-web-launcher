// src/extension.ts
import { spawn } from "node:child_process";
import * as vscode2 from "vscode";

// src/config/resolveSettings.ts
import path from "node:path";
import * as vscode from "vscode";
var resolveSettings = {
  getCliSpawnPath(settings) {
    const projectRoot = getProjectRoot(settings);
    const cliFile = settings.get("cliFile");
    if (!cliFile) {
      throw new Error("cliFile setting is missing");
    }
    return path.resolve(projectRoot, cliFile);
  },
  getProjectRootArg(settings) {
    const projectRoot = getProjectRoot(settings);
    const cliFile = this.getCliSpawnPath(settings);
    const cliDirectory = path.dirname(cliFile);
    const compilerDirectory = path.dirname(cliDirectory);
    return path.relative(compilerDirectory, projectRoot);
  },
  getTokenFolder(settings) {
    const tokenFolder = settings.get("tokenFolder");
    if (!tokenFolder) {
      throw new Error("tokenFolder setting is missing");
    }
    return tokenFolder;
  },
  getOutDir(settings) {
    const outDir = settings.get("outDir");
    if (!outDir) {
      throw new Error("outDir setting is missing");
    }
    return outDir;
  }
};
function getProjectRoot(settings) {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    throw new Error("workspace folder is missing");
  }
  const projectRoot = settings.get("projectRoot");
  if (!projectRoot) {
    throw new Error("projectRoot setting is missing");
  }
  return vscode.Uri.joinPath(
    workspaceFolder.uri,
    ...projectRoot.split("/")
  ).fsPath;
}

// src/extension.ts
function activate(context) {
  const output = vscode2.window.createOutputChannel("Token Compiler");
  let compiler;
  function startCompiler() {
    const settings = vscode2.workspace.getConfiguration(
      "tokenCompilerVscode"
    );
    const cliFile = resolveSettings.getCliSpawnPath(settings);
    const projectRoot = resolveSettings.getProjectRootArg(settings);
    const config = {
      tokenFolder: resolveSettings.getTokenFolder(settings),
      outDir: resolveSettings.getOutDir(settings)
    };
    compiler = spawn(
      process.execPath,
      [
        cliFile,
        "exe",
        projectRoot,
        JSON.stringify(config)
      ]
    );
    compiler.stdout?.on("data", (data) => {
      output.append(data.toString());
    });
    compiler.stderr?.on("data", (data) => {
      output.append(data.toString());
    });
  }
  function stopCompiler() {
    compiler?.kill();
    compiler = void 0;
  }
  startCompiler();
  context.subscriptions.push(
    vscode2.workspace.onDidChangeConfiguration((event) => {
      if (!event.affectsConfiguration("tokenCompilerVscode")) {
        return;
      }
      stopCompiler();
      startCompiler();
    }),
    {
      dispose() {
        stopCompiler();
      }
    }
  );
  output.show(true);
}
function deactivate() {
}
export {
  activate,
  deactivate
};
