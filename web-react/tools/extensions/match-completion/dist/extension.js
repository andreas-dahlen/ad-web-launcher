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
    const trigger = trimmedKey.at(0);
    if (!trigger) continue;
    triggers.add(trigger);
    const current = byTrigger.get(trigger);
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
  output.appendLine(`[matchCompletion] keys registered: ${matchTable.byTrigger.values().flatMap((entries) => entries.map((entry) => entry.matcher)).toArray().join(", ")}`);
  const provider = {
    provideCompletionItems(document, position) {
      const line = document.lineAt(position.line).text;
      const prefix = line.slice(0, position.character);
      const trigger = prefix.at(0);
      if (!trigger) {
        return new vscode2.CompletionList([], true);
      }
      const matches = matchTable.byTrigger.get(trigger) ?? [];
      const completions = matches.flatMap(
        (match) => match.suggestions.map((suggestion) => {
          const completion2 = new vscode2.CompletionItem(
            suggestion,
            vscode2.CompletionItemKind.Text
          );
          completion2.insertText = suggestion;
          completion2.filterText = match.matcher;
          return completion2;
        })
      );
      output.appendLine(
        `[matchCompletion] returning: ${completions.map((completion2) => completion2.label).join(", ")}`
      );
      return new vscode2.CompletionList(
        completions,
        true
      );
    }
  };
  const selectors = languages2.map((language) => ({
    scheme: "file",
    language
  }));
  const completion = vscode2.languages.registerCompletionItemProvider(
    selectors,
    provider,
    ...matchTable.triggers
  );
  output.appendLine("[matchCompletion] provider registered.");
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
    disposables.push(completion);
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
