// src/extension.ts
import * as vscode6 from "vscode";

// src/helpers/handleLaunch.ts
import * as vscode5 from "vscode";

// src/helpers/resolveRunners.ts
import "vscode";
function resolveRunners(settings) {
  return {
    oxlint: settings.get("oxlint", false),
    eslint: settings.get("eslint", false),
    stylelint: settings.get("stylelint", false)
  };
}

// src/runners/runOxlint.ts
import path from "node:path";
import { spawn } from "node:child_process";
import * as vscode3 from "vscode";

// src/matchers/parseOxlint.ts
import * as vscode2 from "vscode";
var pattern = /^(.+):(\d+):(\d+):\s+(.*)\s+\[(Error|Warning)\/([^\]]+)\]$/;
function parseDiagnostic(line) {
  const match = pattern.exec(line);
  if (!match) {
    return;
  }
  const filePath = match[1];
  const lineNumber = Number(match[2]) - 1;
  const columnNumber = Number(match[3]) - 1;
  const message = match[4];
  const severity = match[5];
  const code = match[6];
  const diagnostic = new vscode2.Diagnostic(
    new vscode2.Range(
      lineNumber,
      columnNumber,
      lineNumber,
      columnNumber
    ),
    message,
    severity === "Error" ? vscode2.DiagnosticSeverity.Error : vscode2.DiagnosticSeverity.Warning
  );
  diagnostic.source = "LoS";
  diagnostic.code = code;
  return {
    filePath,
    diagnostic
  };
}

// src/runners/runOxlint.ts
function runOxlint(projectRoot, output, diagnostics) {
  const child = spawn(
    "npm",
    ["run", "oxlint", "--", "--format=unix"],
    {
      cwd: projectRoot
    }
  );
  const parsed = /* @__PURE__ */ new Map();
  child.stdout.on("data", (data) => {
    const text = data.toString();
    output.append(text);
    for (const line of text.split("\n")) {
      const result = parseDiagnostic(line);
      if (!result) {
        continue;
      }
      const filePath = path.resolve(
        projectRoot,
        result.filePath
      );
      const existing = parsed.get(filePath) ?? [];
      existing.push(result.diagnostic);
      parsed.set(filePath, existing);
    }
  });
  child.stderr.on("data", (data) => {
    output.append(data.toString());
  });
  child.on("close", () => {
    for (const [filePath, fileDiagnostics] of parsed) {
      diagnostics.set(
        vscode3.Uri.file(filePath),
        fileDiagnostics
      );
    }
  });
}

// src/helpers/resolveRoot.ts
import * as vscode4 from "vscode";
function resolveRoot(settings, output) {
  const workspaceFolder = vscode4.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    output.appendLine(
      "[Lint on Start] ERROR: workspace folder is missing"
    );
    throw new Error("Workspace folder is missing");
  }
  const projectRoot = settings.get("projectRoot");
  if (!projectRoot) {
    output.appendLine(
      "[Lint on Start] ERROR: projectRoot setting is missing"
    );
    throw new Error("projectRoot setting is missing");
  }
  return vscode4.Uri.joinPath(
    workspaceFolder.uri,
    ...projectRoot.split("/")
  ).fsPath;
}

// src/helpers/handleLaunch.ts
function handleLaunch(output, diagnostics) {
  const settings = vscode5.workspace.getConfiguration(
    "lintOnStart"
  );
  const projectRoot = resolveRoot(settings, output);
  const allowed = resolveRunners(settings);
  if (allowed.oxlint) {
    runOxlint(projectRoot, output, diagnostics);
  }
  if (allowed.eslint) {
  }
  if (allowed.stylelint) {
  }
}

// src/extension.ts
function activate(context) {
  const output = vscode6.window.createOutputChannel("Lint on Start");
  context.subscriptions.push(output);
  const diagnostics = vscode6.languages.createDiagnosticCollection("lint-on-start");
  context.subscriptions.push(diagnostics);
  output.appendLine("[Lint on Start] loaded");
  const launch = () => {
    diagnostics.clear();
    handleLaunch(output, diagnostics);
  };
  launch();
  context.subscriptions.push(
    vscode6.workspace.onDidChangeConfiguration((event) => {
      if (!event.affectsConfiguration("lintOnStart")) {
        return;
      }
      output.appendLine(
        "[Lint on Start] configuration changed. Relaunching."
      );
      launch();
    }),
    // vscode.window.onDidChangeActiveTextEditor(editor => {
    //   if (!editor) {
    //     return
    //   }
    //   output.appendLine(
    //     `[Lint on Start] active: ${editor.document.uri.fsPath}`,
    //   )
    //   diagnostics.delete(editor.document.uri)
    // }),
    vscode6.workspace.onDidSaveTextDocument((document) => {
      diagnostics.delete(document.uri);
    })
  );
}
function deactivate() {
}
export {
  activate,
  deactivate
};
