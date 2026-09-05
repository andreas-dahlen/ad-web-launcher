import { spawn, type ChildProcess } from 'node:child_process'
import * as vscode from 'vscode'
import type { UserOptions } from './terminal.types.ts'

export class CompilerTerminal implements vscode.Pseudoterminal {

  private readonly writeEmitter = new vscode.EventEmitter<string>()
  private compiler: ChildProcess | undefined

  readonly onDidWrite = this.writeEmitter.event

  constructor(
    private readonly cliFile: string,
    private readonly projectRoot: string,
    private readonly config: UserOptions,
  ) { }

  private write(data: string): void {
    this.writeEmitter.fire(
      data.replace(/\r?\n/g, '\r\n'), //needed for terminal formatting
    )
  }

  open(): void {
    this.write('Starting Token Compiler...\r\n')

    this.compiler = spawn(
      process.execPath,
      [
        this.cliFile,
        'exe',
        this.projectRoot,
        JSON.stringify(this.config),
      ],
    )

    this.compiler.stdout?.on('data', data => {
      this.write(data.toString())
    })

    this.compiler.stderr?.on('data', data => {
      this.write(data.toString())
    })

    this.compiler.on('exit', code => {
      this.write(`\r\nCompiler exited with code ${code ?? 0}\r\n`)
      this.compiler = undefined
    })
  }

  close(): void {
    this.compiler?.kill()
    this.compiler = undefined
  }

  handleInput(_data: string): void {
    // Interactive commands will go here.
  }

}
