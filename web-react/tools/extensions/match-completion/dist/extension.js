// src/extension.ts
import * as vscode3 from "vscode";

// src/config/getConfig.ts
import * as vscode from "vscode";
function getConfig(output) {
  const settings = vscode.workspace.getConfiguration(
    "matchCompletion"
  );
  const languages2 = settings.get("languages");
  if (!languages2) {
    output.appendLine(
      "[matchCompletion] found no languages enabled in settings.json."
    );
    return;
  }
  const suggestions = settings.get("suggestions");
  if (!suggestions) {
    output.appendLine(
      "[matchCompletion] found no suggestions in settings.json."
    );
    return;
  }
  return {
    languages: languages2,
    suggestions
  };
}

// src/config/createMatchingTable.ts
function createMatchingTable(config) {
  const triggers = /* @__PURE__ */ new Set();
  const byTrigger = /* @__PURE__ */ new Map();
  for (const [key, suggestions] of Object.entries(config.suggestions)) {
    const trimmedKey = key.trim();
    const trigger = trimmedKey.slice(-1);
    const current = byTrigger.get(trigger);
    triggers.add(trigger);
    const match = {
      matcher: trimmedKey,
      suggestions
    };
    if (current) {
      byTrigger.set(trigger, [...current, match]);
    } else {
      byTrigger.set(trigger, [match]);
    }
  }
  return {
    triggers: [...triggers],
    byTrigger
  };
}

// src/core/createCompletionProvider.ts
import * as vscode2 from "vscode";
function createCompletionProvider(languages2, matchTable, output) {
  output.appendLine(
    `[matchCompletion] registering provider for: ${languages2.join(", ")}`
  );
  output.appendLine(
    `[matchCompletion] triggers: ${matchTable.triggers.join(", ")}`
  );
  const provider = {
    provideCompletionItems(document, position) {
      const line = document.lineAt(position.line).text;
      const prefix = line.slice(0, position.character);
      const trigger = prefix.at(-1);
      output.appendLine(
        `[matchCompletion] completion requested: "${prefix}"`
      );
      if (!trigger) {
        output.appendLine(
          "[matchCompletion] no trigger character."
        );
        return;
      }
      const matches = matchTable.byTrigger.get(trigger);
      if (!matches) {
        output.appendLine(
          `[matchCompletion] no matches for trigger "${trigger}".`
        );
        return;
      }
      output.appendLine(
        `[matchCompletion] checking ${matches.length} match(es) for "${trigger}".`
      );
      const completes = [];
      for (const match of matches) {
        if (!prefix.endsWith(match.matcher)) {
          output.appendLine(
            `[matchCompletion] no match: "${match.matcher}".`
          );
          continue;
        }
        output.appendLine(
          `[matchCompletion] matched: "${match.matcher}".`
        );
        for (const suggestion of match.suggestions) {
          completes.push(
            new vscode2.CompletionItem(
              suggestion,
              vscode2.CompletionItemKind.Text
            )
          );
        }
      }
      output.appendLine(
        `[matchCompletion] returning ${completes.length} completion(s).`
      );
      return completes;
    }
  };
  const completion = vscode2.languages.registerCompletionItemProvider(
    languages2,
    provider,
    ...matchTable.triggers
  );
  return vscode2.Disposable.from(completion);
}

// src/extension.ts
function activate(context) {
  const output = vscode3.window.createOutputChannel("match Completion");
  context.subscriptions.push(output);
  output.appendLine("[match completion] loaded");
  let runtime;
  const launch = () => {
    runtime?.dispose();
    const config = getConfig(output);
    if (!config) return;
    const disposables = [];
    const matchTable = createMatchingTable(config);
    const completion = createCompletionProvider(
      config.languages,
      matchTable,
      output
    );
    if (completion) {
      disposables.push(completion);
    }
    runtime = vscode3.Disposable.from(...disposables);
  };
  launch();
  context.subscriptions.push(
    vscode3.workspace.onDidChangeConfiguration((event) => {
      if (!event.affectsConfiguration("matchCompletion")) {
        return;
      }
      output.appendLine(
        "[match completion] configuration changed. Relaunching."
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
