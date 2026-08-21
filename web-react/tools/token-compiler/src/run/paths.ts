import path from 'node:path'

type Paths = {
  getRoot(): string
  getTokenRoot(): string
  getOutRoot(): string
}

const projectRoot = path.resolve(process.cwd(), '../..')
const sourceRoot = path.join(projectRoot, 'src')
const tokenRoot = path.join(sourceRoot, 'styleTokens/tokens')
const outRoot = path.join(sourceRoot, 'styleTokens/generated')
export const paths: Paths = {
  getRoot() {
    return sourceRoot
  },

  getTokenRoot() {
    return tokenRoot
  },

  getOutRoot() {
    return outRoot
  }
}