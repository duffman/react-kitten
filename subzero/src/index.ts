/**
 * SubZero: Delphi-style applications on Bun, rendered by React<Kitten>.
 *
 * The application, its forms and controls run on the server, one instance per
 * connected client (plus an invisible host instance). The browser receives
 * view trees and sends events back over a transport.
 */
import './polyfill'

// Dependency injection
export {
  Injector, InjectionToken, Injectable, inject, runInInjectionContext, DependencyError,
} from './di/injector'
export type {
  Scope, Provider, ProviderToken, ClassProvider, ValueProvider, FactoryProvider, ExistingProvider,
  InjectableOptions, OnInit, OnDestroy,
} from './di/injector'

// Application, modules, plugins
export { Application } from './core/application'
export type { ApplicationOptions, ApplicationHooks, TAppEvent } from './core/application'
export { Module } from './core/module'
export type { ModuleOptions, ModuleWithProviders, ModuleImport, OnModuleInit, OnModuleDestroy } from './core/module'
export { definePlugin } from './core/plugin'
export type { SubZeroPlugin, PluginContext, MessageInterceptor, RouteHandler } from './core/plugin'
export { Logger } from './core/logger'
export type { LogLevel } from './core/logger'
export type { Type } from './core/metadata'
export { healthCheck, sessionLogger, rateLimit } from './plugins'

// Server and transports
export { SubZero, SubZeroServer } from './server/server'
export type { ServerOptions } from './server/server'
export { Session } from './server/session'
export { currentSession } from './server/context'
export { transport, websocket } from './server/websocket'
export type { TransportOptions, WebSocketTransport } from './server/websocket'
export { memoryTransport, MemoryClient } from './server/memory'
export type { MemoryTransport } from './server/memory'
export type { Transport, TransportHost, Connection, ConnectionHandler } from './server/transport'

// VCL
export { TObject, TComponent, published, event } from './vcl/component'
export type { TNotifyEvent } from './vcl/component'
export { TControl } from './vcl/control'
export { TForm } from './vcl/form'
export type { TCloseEvent, TCloseQueryEvent } from './vcl/form'
export { TLabel, TButton, TEdit, TMemo, TCheckBox, TListBox, TPanel, TGroupBox } from './vcl/controls'
export { TApplication, App } from './vcl/application'
export { ShowMessage, MessageDlg } from './vcl/dialogs'
export * from './vcl/types'

// Wire protocol
export type * from './protocol'
