import { fileURLToPath } from 'node:url'
import type { BunPlugin } from 'bun'

export interface ClientBundle {
  assets: Map<string, { body: ArrayBuffer, type: string }>
  /** The page that boots the client against a WebSocket endpoint path */
  html(endpoint: string): string
}

const ENTRY = fileURLToPath(new URL('../client/entry.tsx', import.meta.url))
const PACKAGE_ROOT = fileURLToPath(new URL('../../', import.meta.url))

/**
 * The client imports react-kitten from source, which lives outside this
 * package. Bare imports from there (react, classnames, ...) resolve through
 * this package first so the bundle holds exactly one copy of React.
 */
const singleReact: BunPlugin = {
  name: 'subzero-dedupe',
  setup(build) {
    build.onResolve({ filter: /^[^./]/ }, args => {
      if (!args.importer || args.importer.startsWith(PACKAGE_ROOT)) return undefined
      try {
        return { path: Bun.resolveSync(args.path, PACKAGE_ROOT) }
      } catch {
        return undefined
      }
    })
  },
}
const PREFIX = '/_subzero/'

let cached: Promise<ClientBundle> | null = null

/**
 * Bundles the React / react-kitten client with `Bun.build`, in memory, once
 * per process.
 */
export function buildClient(): Promise<ClientBundle> {
  cached ??= build().catch(error => {
    cached = null
    throw error
  })
  return cached
}

async function build(): Promise<ClientBundle> {
  const result = await Bun.build({
    entrypoints: [ENTRY],
    target: 'browser',
    plugins: [singleReact],
    minify: process.env.NODE_ENV === 'production',
    naming: '[name].[ext]',
    define: { 'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'development') },
  })
  if (!result.success) {
    throw new AggregateError(result.logs, 'Building the SubZero client failed')
  }

  const assets: ClientBundle['assets'] = new Map()
  const scripts: string[] = []
  const styles: string[] = []
  for (const output of result.outputs) {
    const name = PREFIX + output.path.replace(/^\.\//, '')
    assets.set(name, { body: await output.arrayBuffer(), type: output.type })
    if (output.kind === 'entry-point') scripts.push(name)
    else if (name.endsWith('.css')) styles.push(name)
  }

  return {
    assets,
    html: endpoint => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>SubZero</title>
  ${styles.map(href => `<link rel="stylesheet" href="${href}">`).join('\n  ')}
  <style>html, body, #root { margin: 0; height: 100%; overflow: hidden; }</style>
</head>
<body>
  <div id="root" data-endpoint="${Bun.escapeHTML(endpoint)}"></div>
  ${scripts.map(src => `<script type="module" src="${src}"></script>`).join('\n  ')}
</body>
</html>`,
  }
}
