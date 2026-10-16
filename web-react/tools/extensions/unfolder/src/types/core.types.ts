import type picomatch from 'picomatch';
import * as vscode from 'vscode'

export type Match = picomatch.Matcher

export type Progress = vscode.Progress<{ message?: string; increment?: number }>