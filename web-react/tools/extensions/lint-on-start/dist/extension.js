// src/extension.ts
import * as vscode8 from "vscode";

// src/helpers/handleLaunch.ts
import * as vscode7 from "vscode";

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
    let problemCount = 0;
    for (const fileDiagnostics of parsed.values()) {
      problemCount += fileDiagnostics.length;
    }
    output.appendLine(
      `oxlint: ${problemCount} problem${problemCount === 1 ? "" : "s"}`
    );
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

// src/runners/runEslint.ts
import path2 from "node:path";
import { spawn as spawn2 } from "node:child_process";
import * as vscode6 from "vscode";

// src/matchers/parseEslint.ts
import * as vscode5 from "vscode";
function parseESLint(output) {
  const results = JSON.parse(output);
  return results.map((result) => ({
    filePath: result.filePath,
    diagnostics: result.messages.map((message) => {
      const diagnostic = new vscode5.Diagnostic(
        new vscode5.Range(
          message.line - 1,
          message.column - 1,
          (message.endLine ?? message.line) - 1,
          (message.endColumn ?? message.column) - 1
        ),
        message.message,
        message.severity === 2 ? vscode5.DiagnosticSeverity.Error : vscode5.DiagnosticSeverity.Warning
      );
      diagnostic.code = message.ruleId ?? void 0;
      diagnostic.source = "Lint on Start";
      return diagnostic;
    })
  }));
}

// src/runners/runEslint.ts
function runEslint(projectRoot, output, diagnostics) {
  const child = spawn2(
    "npm",
    ["run", "eslint", "--", "--format=json"],
    {
      cwd: projectRoot
    }
  );
  let stdout = "";
  child.stdout.on("data", (data) => {
    stdout += data.toString();
  });
  child.stderr.on("data", (data) => {
    output.append(data.toString());
  });
  child.on("close", () => {
    const parsed = parseESLint(stdout);
    let problemCount = 0;
    for (const result of parsed) {
      const filePath = path2.resolve(
        projectRoot,
        result.filePath
      );
      diagnostics.set(
        vscode6.Uri.file(filePath),
        result.diagnostics
      );
      problemCount += result.diagnostics.length;
    }
    output.appendLine(
      `eslint: ${problemCount} problem${problemCount === 1 ? "" : "s"}`
    );
  });
}

// src/helpers/handleLaunch.ts
function handleLaunch(output, diagnostics) {
  const settings = vscode7.workspace.getConfiguration(
    "lintOnStart"
  );
  const projectRoot = resolveRoot(settings, output);
  const allowed = resolveRunners(settings);
  if (allowed.oxlint) {
    runOxlint(projectRoot, output, diagnostics);
  }
  if (allowed.eslint) {
    runEslint(projectRoot, output, diagnostics);
  }
  if (allowed.stylelint) {
  }
}

// src/extension.ts
function activate(context) {
  const output = vscode8.window.createOutputChannel("Lint on Start");
  context.subscriptions.push(output);
  const diagnostics = vscode8.languages.createDiagnosticCollection("lint-on-start");
  context.subscriptions.push(diagnostics);
  output.appendLine("[Lint on Start] loaded");
  const launch = () => {
    diagnostics.clear();
    handleLaunch(output, diagnostics);
  };
  launch();
  context.subscriptions.push(
    vscode8.workspace.onDidChangeConfiguration((event) => {
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
    vscode8.workspace.onDidSaveTextDocument((document) => {
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
