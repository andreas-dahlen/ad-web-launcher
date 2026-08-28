// src/extension.ts
import { spawn } from "node:child_process";
import * as vscode2 from "vscode";

// src/config/resolveSettings.ts
import path from "node:path";
import * as vscode from "vscode";
function createSettingsResolver(settings, output) {
  const projectRoot = getProjectRoot(settings, output);
  const cliFile = settings.get("cliFile");
  if (!cliFile) {
    output.appendLine("ERROR: cliFile setting is missing");
    throw new Error(" ");
  }
  const cliPath = path.resolve(projectRoot, cliFile);
  const compilerDirectory = path.dirname(path.dirname(cliPath));
  return {
    getCliSpawnPath() {
      return cliPath;
    },
    getProjectRootArg() {
      return path.relative(compilerDirectory, projectRoot);
    },
    getTokenFolder() {
      return settings.get("tokenFolder") ?? null;
    },
    getOutDir() {
      return settings.get("outDir") ?? null;
    },
    getMuteSetting() {
      return settings.get("mute") ?? false;
    }
  };
}
function getProjectRoot(settings, output) {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    output.appendLine("ERROR: workspace folder is missing");
    throw new Error(" ");
  }
  const projectRoot = settings.get("projectRoot");
  if (!projectRoot) {
    output.appendLine("ERROR: projectRoot setting is missing");
    throw new Error(" ");
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
    output.appendLine(`Started extension`);
    const settings = vscode2.workspace.getConfiguration(
      "tokenCompilerVscode"
    );
    const resolver = createSettingsResolver(settings, output);
    const cliFile = resolver.getCliSpawnPath();
    const projectRoot = resolver.getProjectRootArg();
    const config = {
      tokenFolder: resolver.getTokenFolder(),
      outDir: resolver.getOutDir(),
      mute: resolver.getMuteSetting()
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
