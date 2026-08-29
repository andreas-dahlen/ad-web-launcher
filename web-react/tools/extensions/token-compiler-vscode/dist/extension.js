// src/extension.ts
import * as vscode6 from "vscode";

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
    getUserOptions() {
      return {
        tokenFolder: settings.get("tokenFolder"),
        outDir: settings.get("outDir"),
        mute: settings.get("mute")
      };
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

// src/terminal/createTerminal.ts
import * as vscode3 from "vscode";

// src/terminal/terminal.ts
import { spawn } from "node:child_process";
import * as vscode2 from "vscode";
var CompilerTerminal = class {
  constructor(cliFile, projectRoot, config) {
    this.cliFile = cliFile;
    this.projectRoot = projectRoot;
    this.config = config;
  }
  cliFile;
  projectRoot;
  config;
  writeEmitter = new vscode2.EventEmitter();
  compiler;
  onDidWrite = this.writeEmitter.event;
  write(data) {
    this.writeEmitter.fire(
      data.replace(/\r?\n/g, "\r\n")
      //needed for terminal formatting
    );
  }
  open() {
    this.write("Starting Token Compiler...\r\n");
    this.compiler = spawn(
      process.execPath,
      [
        this.cliFile,
        "exe",
        this.projectRoot,
        JSON.stringify(this.config)
      ]
    );
    this.compiler.stdout?.on("data", (data) => {
      this.write(data.toString());
    });
    this.compiler.stderr?.on("data", (data) => {
      this.write(data.toString());
    });
    this.compiler.on("exit", (code) => {
      this.write(`\r
Compiler exited with code ${code ?? 0}\r
`);
      this.compiler = void 0;
    });
  }
  close() {
    this.compiler?.kill();
    this.compiler = void 0;
  }
  handleInput(_data) {
  }
};

// src/terminal/createTerminal.ts
function createTerminal(cliFile, projectRoot, config) {
  const pty = new CompilerTerminal(
    cliFile,
    projectRoot,
    config
  );
  return vscode3.window.createTerminal({
    name: "Token Compiler",
    pty
  });
}

// src/vscode/statusBar.ts
import "vscode";
function updateStatusBar(statusBar, terminal) {
  if (terminal) {
    statusBar.text = "$(check) Token Compiler";
    statusBar.tooltip = "Token Compiler: Active";
    statusBar.command = "tokenCompilerVscode.stop";
  } else {
    statusBar.text = "$(circle-outline) Token Compiler";
    statusBar.tooltip = "Token Compiler: Inactive";
    statusBar.command = "tokenCompilerVscode.start";
  }
}

// src/vscode/subscriptions.ts
import * as vscode5 from "vscode";
function createCommandSubscriptions({
  startCompiler,
  stopCompiler,
  restartCompiler
}) {
  return [
    vscode5.commands.registerCommand(
      "tokenCompilerVscode.start",
      startCompiler
    ),
    vscode5.commands.registerCommand(
      "tokenCompilerVscode.stop",
      stopCompiler
    ),
    vscode5.commands.registerCommand(
      "tokenCompilerVscode.restart",
      restartCompiler
    )
  ];
}

// src/extension.ts
function activate(context) {
  const output = vscode6.window.createOutputChannel("Token Compiler");
  output.appendLine("Extension loading...");
  const statusBar = vscode6.window.createStatusBarItem(
    vscode6.StatusBarAlignment.Left
  );
  let terminal;
  context.subscriptions.push(
    ...createCommandSubscriptions({
      startCompiler,
      stopCompiler,
      restartCompiler
    }),
    vscode6.window.onDidCloseTerminal((closedTerminal) => {
      if (closedTerminal !== terminal) {
        return;
      }
      output.appendLine("Stopping compiler service");
      terminal = void 0;
      updateStatusBar(statusBar, terminal);
    }),
    vscode6.workspace.onDidChangeConfiguration((event) => {
      if (!event.affectsConfiguration("tokenCompilerVscode")) {
        return;
      }
      output.appendLine("Configuration changed");
      restartCompiler();
    }),
    {
      dispose() {
        stopCompiler();
      }
    }
  );
  statusBar.show();
  startCompiler();
  function startCompiler() {
    output.appendLine("Starting compiler service");
    if (terminal) {
      terminal.show();
      return;
    }
    const settings = vscode6.workspace.getConfiguration(
      "tokenCompilerVscode"
    );
    const resolver = createSettingsResolver(settings, output);
    terminal = createTerminal(
      resolver.getCliSpawnPath(),
      resolver.getProjectRootArg(),
      resolver.getUserOptions()
    );
    updateStatusBar(statusBar, terminal);
    terminal.show();
  }
  function stopCompiler() {
    output.appendLine("Stopping compiler service");
    terminal?.dispose();
    terminal = void 0;
    updateStatusBar(statusBar, terminal);
  }
  function restartCompiler() {
    stopCompiler();
    startCompiler();
  }
}
function deactivate() {
}
export {
  activate,
  deactivate
};
