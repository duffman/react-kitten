/**
 * TC39 decorator metadata needs `Symbol.metadata`. Bun does not define it yet,
 * so it must exist before any decorated class is evaluated. Every module that
 * exports a decorator imports this file first.
 */
(Symbol as { metadata?: symbol }).metadata ??= Symbol.for('Symbol.metadata')

export {}
