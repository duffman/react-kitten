import '../polyfill'

export type Type<T = unknown> = new (...args: any[]) => T
export type AbstractType<T = unknown> = abstract new (...args: never[]) => T

type Metadata = Record<PropertyKey, unknown>

/**
 * Decorator metadata objects inherit from the parent class' metadata through
 * the prototype chain. Lists must be copied onto the subclass before they are
 * appended to, otherwise the subclass would mutate its parent's list.
 */
export function ownList<T>(metadata: Metadata, key: PropertyKey): T[] {
  if (!Object.hasOwn(metadata, key)) {
    metadata[key] = [...((metadata[key] as T[] | undefined) ?? [])]
  }
  return metadata[key] as T[]
}

export function readMetadata<T>(target: object, key: PropertyKey): T | undefined {
  const metadata = (target as { [Symbol.metadata]?: Metadata })[Symbol.metadata]
  return metadata?.[key] as T | undefined
}

export const META = {
  injectable: Symbol('subzero:injectable'),
  module: Symbol('subzero:module'),
  application: Symbol('subzero:application'),
  published: Symbol('subzero:published'),
  events: Symbol('subzero:events'),
} as const
