export type TColor = string

export enum TAlign {
  None = 'none',
  Top = 'top',
  Bottom = 'bottom',
  Left = 'left',
  Right = 'right',
  Client = 'client',
}

export enum TPosition {
  Designed = 'designed',
  Default = 'default',
  ScreenCenter = 'screenCenter',
}

export enum TCloseAction {
  None = 'none',
  Hide = 'hide',
  Free = 'free',
}

export enum TModalResult {
  None = 'none',
  Ok = 'ok',
  Cancel = 'cancel',
  Yes = 'yes',
  No = 'no',
  Abort = 'abort',
  Retry = 'retry',
  Ignore = 'ignore',
}

export enum TMsgDlgType {
  Information = 'information',
  Warning = 'warning',
  Error = 'error',
  Confirmation = 'confirmation',
  Custom = 'custom',
}

export interface TFont {
  name?: string
  size?: number
  color?: TColor
  bold?: boolean
  italic?: boolean
  underline?: boolean
}

export interface TRunArgs {
  /** Process arguments of the server */
  args: string[]
  env: Record<string, string | undefined>
  /** Query parameters the client connected with */
  params: Record<string, string>
  sessionId: string
  /** True for the invisible host instance that has no client */
  headless: boolean
}
