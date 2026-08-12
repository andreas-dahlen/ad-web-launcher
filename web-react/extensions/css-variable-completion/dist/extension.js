"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const jsonc_parser_1 = require("jsonc-parser");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
function loadVariables(extensionUri) {
    const filePath = (0, node_path_1.join)(extensionUri.fsPath, 'variables.jsonc');
    const contents = (0, node_fs_1.readFileSync)(filePath, 'utf8');
    const parsed = (0, jsonc_parser_1.parse)(contents);
    if (!Array.isArray(parsed)) {
        throw new Error('variables.jsonc must contain an array');
    }
    if (!parsed.every((value) => typeof value === 'string')) {
        throw new Error('variables.jsonc must contain only strings');
    }
    return parsed;
}
class CssVariableCompletionProvider {
    variables;
    constructor(variables) {
        this.variables = variables;
    }
    provideCompletionItems(document, position) {
        const line = document.lineAt(position.line).text;
        const beforeCursor = line.slice(0, position.character);
        // vscode.window.showInformationMessage(
        //   `completion: "${beforeCursor}"`
        // )
        if (/\bvar\([^)]*$/.test(beforeCursor)) {
            return new vscode.CompletionList([], false);
        }
        return new vscode.CompletionList(this.variables.map((variable) => {
            const item = new vscode.CompletionItem(variable, vscode.CompletionItemKind.Variable);
            item.insertText = variable;
            item.filterText = variable;
            return item;
        }), false);
    }
}
function activate(context) {
    const variables = loadVariables(context.extensionUri);
    vscode.window.showInformationMessage(`CSS completion loaded ${variables.length} variables`);
    const provider = new CssVariableCompletionProvider(variables);
    const selector = [
        { language: 'css' },
        { language: 'scss' },
        { language: 'less' },
    ];
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(selector, provider, "-"));
}
function deactivate() { }
