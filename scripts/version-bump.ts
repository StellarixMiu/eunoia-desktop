/* eslint-disable node/prefer-global/process */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { run } from './version-sync'

const root = resolve(import.meta.dirname, '..')

const segment = process.argv[2] ?? 'patch'
if (!['patch', 'minor', 'major'].includes(segment)) {
  console.error('[version-bump] usage: bun run scripts/version-bump.ts [patch|minor|major]')
  process.exit(1)
}

const pkgPath = resolve(root, 'package.json')
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
const [major, minor, patch] = pkg.version.split('.').map((n: string) => Number.parseInt(n, 10))

switch (segment) {
  case 'major':
    pkg.version = `${major + 1}.0.0`
    break
  case 'minor':
    pkg.version = `${major}.${minor + 1}.0`
    break
  default:
    pkg.version = `${major}.${minor}.${patch + 1}`
}

writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8')
console.log(`[version-bump] package.json -> ${pkg.version}`)
run()
