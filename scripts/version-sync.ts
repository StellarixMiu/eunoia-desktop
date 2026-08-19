/* eslint-disable node/prefer-global/process */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const checkOnly = process.argv.includes('--check')

const VERSION_RE = /^\d+\.\d+\.\d+(?:-[0-9A-Z.-]+)?$/i

interface Target {
  path: string
  read: () => string | undefined
  apply: (version: string) => void
}

function readVersion(): string {
  const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
  const version = pkg.version
  if (typeof version !== 'string' || !VERSION_RE.test(version))
    throw new Error(`[version-sync] invalid package.json version: ${String(version)}`)
  return version
}

function patchJsonVersion(file: string): (version: string) => void {
  const target = resolve(root, file)
  const data = JSON.parse(readFileSync(target, 'utf8'))
  return (version) => {
    data.version = version
    writeFileSync(target, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
  }
}

function patchTomlPackageVersion(file: string): (version: string) => void {
  const target = resolve(root, file)
  const original = readFileSync(target, 'utf8')
  return (version) => {
    const patched = original.replace(/^version\s*=\s*"[^"]+"/m, `version = "${version}"`)
    if (patched === original)
      throw new Error(`[version-sync] no [package] version found in ${file}`)
    writeFileSync(target, patched, 'utf8')
  }
}

function patchCargoLockVersion(file: string): (version: string) => void {
  const target = resolve(root, file)
  const original = readFileSync(target, 'utf8')
  return (version) => {
    const patched = original.replace(/^(name = "eunoia"\r?\nversion = ")[^"]+(")/m, (whole, head, tail) => `${head}${version}${tail}`)
    if (patched === original)
      throw new Error(`[version-sync] no eunoia entry found in ${file}`)
    writeFileSync(target, patched, 'utf8')
  }
}

const targets: Target[] = [
  {
    path: 'src-tauri/tauri.conf.json',
    read: () => JSON.parse(readFileSync(resolve(root, 'src-tauri/tauri.conf.json'), 'utf8')).version,
    apply: patchJsonVersion('src-tauri/tauri.conf.json'),
  },
  {
    path: 'src-tauri/Cargo.toml',
    read: () => readFileSync(resolve(root, 'src-tauri/Cargo.toml'), 'utf8').match(/^version\s*=\s*"([^"]+)"/m)?.[1],
    apply: patchTomlPackageVersion('src-tauri/Cargo.toml'),
  },
  {
    path: 'src-tauri/Cargo.lock',
    read: () => readFileSync(resolve(root, 'src-tauri/Cargo.lock'), 'utf8').match(/^name = "eunoia"\r?\nversion = "([^"]+)"/m)?.[1],
    apply: patchCargoLockVersion('src-tauri/Cargo.lock'),
  },
]

export function run() {
  const version = readVersion()
  let drifted = false

  for (const target of targets) {
    const current = target.read()
    if (current === version)
      continue

    drifted = true
    console.log(`[version-sync] ${target.path}: ${String(current)} -> ${version}`)
    if (!checkOnly)
      target.apply(version)
  }

  if (checkOnly && drifted) {
    console.error('[version-sync] versions out of sync (run version:sync to fix)')
    process.exit(1)
  }

  if (!drifted)
    console.log(`[version-sync] all versions match ${version}`)
}

if (import.meta.main)
  run()
