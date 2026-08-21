// src/extension.ts
import { spawn } from "node:child_process";
import * as vscode2 from "vscode";

// src/config/paths.ts
import * as vscode from "vscode";
var paths = {
  resolveWorkspace() {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      vscode.window.showErrorMessage(
        "[Token Compiler Vscode] no workspace folder"
      );
      throw new Error("workspace folder is missing");
    }
    return workspaceFolder;
  },
  getTokenPath(workspaceFolder) {
    const config = vscode.workspace.getConfiguration(
      "tokenCompilerVscode"
    );
    const tokenFolder = config.get("tokenFolder");
    if (!tokenFolder) {
      throw new Error("tokenFolder setting is missing");
    }
    return vscode.Uri.joinPath(
      workspaceFolder.uri,
      ...tokenFolder.split("/")
    );
  },
  getCliPath(workspaceFolder) {
    const config = vscode.workspace.getConfiguration(
      "tokenCompilerVscode"
    );
    const cliFile = config.get("cliFile");
    if (!cliFile) {
      throw new Error("cliFile setting is missing");
    }
    return vscode.Uri.joinPath(
      workspaceFolder.uri,
      ...cliFile.split("/")
    );
  },
  getGeneratedPath(workspaceFolder) {
    const config = vscode.workspace.getConfiguration(
      "tokenCompilerVscode"
    );
    const outDir = config.get("outDir");
    if (!outDir) {
      throw new Error("outDir setting is missing");
    }
    return vscode.Uri.joinPath(
      workspaceFolder.uri,
      ...outDir.split("/")
    );
  }
};

// src/extension.ts
function activate(context) {
  const workspace3 = paths.resolveWorkspace();
  const output = vscode2.window.createOutputChannel("Token Compiler");
  let compiler;
  function startCompiler() {
    const cliFile = paths.getCliPath(workspace3);
    const tokenFolder = paths.getTokenPath(workspace3);
    const outDir = paths.getGeneratedPath(workspace3);
    const config = {
      rootDir: workspace3.uri.fsPath,
      tokenFolder: tokenFolder.fsPath,
      outDir: outDir.fsPath
    };
    compiler = spawn(
      process.execPath,
      [
        cliFile.fsPath,
        "run",
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
