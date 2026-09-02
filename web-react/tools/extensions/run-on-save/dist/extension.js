// src/extension.ts
import * as vscode6 from "vscode";

// src/helpers/resolvePath.ts
import path from "node:path";
import * as vscode from "vscode";
function resolvePath(settings, fileName, output) {
  const projectRoot = getProjectRoot(settings, output);
  return { filePath: path.resolve(projectRoot, fileName), projectRoot };
}
function getProjectRoot(settings, output) {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    output.appendLine("[Run on save] ERROR: workspace folder is missing");
    throw new Error("Workspace folder is missing");
  }
  const projectRoot = settings.get("projectRoot");
  if (!projectRoot) {
    output.appendLine("[Run on save] ERROR: projectRoot setting is missing");
    throw new Error("projectRoot setting is missing");
  }
  return vscode.Uri.joinPath(
    workspaceFolder.uri,
    ...projectRoot.split("/")
  ).fsPath;
}

// src/helpers/handleRun.ts
import "vscode";

// src/helpers/resolveRunners.ts
import path2 from "node:path";
import "vscode";
function resolveRunners(settings, filePath) {
  const extension = path2.extname(filePath);
  const lint = /* @__PURE__ */ new Set([".ts", ".js", ".tsx", ".jsx"]);
  const style = /* @__PURE__ */ new Set([".css", ".scss"]);
  return {
    oxlint: settings.get("oxlint", true) && lint.has(extension),
    eslint: settings.get("eslint", false) && lint.has(extension),
    stylelint: settings.get("stylelint", false) && style.has(extension)
  };
}

// src/runners/runOxlint.ts
import { spawn } from "node:child_process";
import * as vscode4 from "vscode";

// src/matchers/parseOxlint.ts
import * as vscode3 from "vscode";
var pattern = /^(.+):(\d+):(\d+):\s+(.*)\s+\[(Error|Warning)\/([^\]]+)\]$/;
function parseDiagnostic(line) {
  const match = pattern.exec(line);
  if (!match) {
    return;
  }
  const lineNumber = Number(match[2]) - 1;
  const columnNumber = Number(match[3]) - 1;
  const message = match[4];
  const severity = match[5];
  const code = match[6];
  const diagnostic = new vscode3.Diagnostic(
    new vscode3.Range(
      lineNumber,
      columnNumber,
      lineNumber,
      columnNumber
    ),
    message,
    severity === "Error" ? vscode3.DiagnosticSeverity.Error : vscode3.DiagnosticSeverity.Warning
  );
  diagnostic.code = code;
  return diagnostic;
}

// src/runners/runOxlint.ts
function runOxlint(filePaths, output, diagnostics) {
  const child = spawn(
    "npm",
    ["run", "oxlint", "--", "--format=unix", filePaths.filePath],
    {
      cwd: filePaths.projectRoot
    }
  );
  const parsed = [];
  child.stdout.on("data", (data) => {
    const lines = data.toString().split("\n");
    for (const line of lines) {
      const diagnostic = parseDiagnostic(line);
      if (diagnostic) {
        parsed.push(diagnostic);
      }
    }
    output.append(data.toString());
  });
  child.stdout.on("data", (data) => {
    output.append(data.toString());
  });
  child.stderr.on("data", (data) => {
    output.append(data.toString());
  });
  child.on("close", () => {
    diagnostics.set(
      vscode4.Uri.file(filePaths.filePath),
      parsed
    );
  });
}

// src/helpers/handleRun.ts
async function handleRun(settings, filePaths, output, diagnostics) {
  const allowed = resolveRunners(settings, filePaths.filePath);
  if (allowed.oxlint) {
    runOxlint(filePaths, output, diagnostics);
  }
  if (allowed.eslint) {
  }
  if (allowed.stylelint) {
  }
}

// src/extension.ts
function activate(context) {
  const output = vscode6.window.createOutputChannel("Run on save");
  context.subscriptions.push(output);
  const diagnostics = vscode6.languages.createDiagnosticCollection("run-on-save");
  context.subscriptions.push(diagnostics);
  output.appendLine("[Run on save] loaded");
  let runtime;
  const launch = () => {
    runtime?.dispose();
    const settings = vscode6.workspace.getConfiguration("runOnSave");
    runtime = vscode6.workspace.onDidSaveTextDocument((document) => {
      output.appendLine(
        `[Run on save] saved: ${document.fileName}`
      );
      const filePaths = resolvePath(
        settings,
        document.fileName,
        output
      );
      handleRun(settings, filePaths, output, diagnostics);
    });
  };
  launch();
  context.subscriptions.push(
    vscode6.workspace.onDidChangeConfiguration((event) => {
      if (!event.affectsConfiguration("runOnSave")) {
        return;
      }
      output.appendLine(
        "[Run on save] configuration changed. Relaunching."
      );
      launch();
    })
  );
}
function deactivate() {
}
export {
  activate,
  deactivate
};
