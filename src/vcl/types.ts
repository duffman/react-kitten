/**
 * VCL Type System - Delphi/Pascal inspired type definitions
 *
 * This module provides the foundational types for building Delphi-style
 * React applications with familiar VCL concepts.
 */

/**
 * TObject - Base class for all VCL objects
 * Similar to Delphi's TObject, provides fundamental object capabilities
 */
export class TObject {
    private _name: string = '';
    private _tag: number = 0;

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get tag(): number {
        return this._tag;
    }

    set tag(value: number) {
        this._tag = value;
    }

    /**
     * Returns the class name of this object
     */
    className(): string {
        return this.constructor.name;
    }

    /**
     * Virtual destructor - override to clean up resources
     */
    destroy(): void {
        // Base implementation - override in derived classes
    }
}

/**
 * TPoint - Represents a 2D point
 */
export interface TPoint {
    x: number;
    y: number;
}

/**
 * TRect - Represents a rectangle
 */
export interface TRect {
    left: number;
    top: number;
    right: number;
    bottom: number;
}

/**
 * TSize - Represents dimensions
 */
export interface TSize {
    width: number;
    height: number;
}

/**
 * TAlign - Component alignment options (Delphi-style)
 */
export enum TAlign {
    None = 'none',
    Left = 'left',
    Right = 'right',
    Top = 'top',
    Bottom = 'bottom',
    Client = 'client',
    Custom = 'custom'
}

/**
 * TMouseButton - Mouse button enumeration
 */
export enum TMouseButton {
    Left = 'left',
    Right = 'right',
    Middle = 'middle'
}

/**
 * TShiftState - Keyboard shift state flags
 */
export interface TShiftState {
    shift: boolean;
    ctrl: boolean;
    alt: boolean;
    meta: boolean;
}

/**
 * TEvent - Base event type
 */
export interface TEvent {
    sender: TObject;
    timestamp: number;
}

/**
 * TNotifyEvent - Standard notification event handler
 * Signature: procedure(Sender: TObject) in Delphi
 */
export type TNotifyEvent = (sender: TObject) => void;

/**
 * TMouseEvent - Mouse event data
 */
export interface TMouseEvent extends TEvent {
    button: TMouseButton;
    shiftState: TShiftState;
    x: number;
    y: number;
}

/**
 * TMouseEventHandler - Mouse event handler type
 */
export type TMouseEventHandler = (sender: TObject, event: TMouseEvent) => void;

/**
 * TKeyEvent - Keyboard event data
 */
export interface TKeyEvent extends TEvent {
    key: string;
    keyCode: number;
    shiftState: TShiftState;
}

/**
 * TKeyEventHandler - Keyboard event handler type
 */
export type TKeyEventHandler = (sender: TObject, event: TKeyEvent) => void;

/**
 * TCloseAction - Window close action enumeration
 */
export enum TCloseAction {
    None = 'none',
    Hide = 'hide',
    Free = 'free',
    Minimize = 'minimize'
}

/**
 * TCloseEvent - Window close event handler
 */
export type TCloseEvent = (sender: TObject, action: { value: TCloseAction }) => void;

/**
 * TRunArgs - Application startup arguments
 */
export interface TRunArgs {
    args: string[];
    env: Record<string, string | undefined>;
}

/**
 * TComponentState - Component lifecycle state
 */
export enum TComponentState {
    Created = 'created',
    Loading = 'loading',
    Loaded = 'loaded',
    Destroying = 'destroying',
    Destroyed = 'destroyed'
}

/**
 * Cursor types (Delphi-style)
 */
export enum TCursor {
    Default = 'default',
    Pointer = 'pointer',
    CrossHair = 'crosshair',
    Hand = 'pointer',
    Move = 'move',
    Text = 'text',
    Wait = 'wait',
    Help = 'help',
    NoDrop = 'no-drop',
    ResizeNS = 'ns-resize',
    ResizeEW = 'ew-resize',
    ResizeNESW = 'nesw-resize',
    ResizeNWSE = 'nwse-resize'
}

/**
 * Window state enumeration
 */
export enum TWindowState {
    Normal = 'normal',
    Minimized = 'minimized',
    Maximized = 'maximized'
}

/**
 * Window position enumeration
 */
export enum TPosition {
    Designed = 'designed',
    Default = 'default',
    DefaultPosOnly = 'defaultPosOnly',
    DefaultSizeOnly = 'defaultSizeOnly',
    ScreenCenter = 'screenCenter',
    DesktopCenter = 'desktopCenter',
    MainFormCenter = 'mainFormCenter',
    OwnerFormCenter = 'ownerFormCenter'
}

/**
 * Border style enumeration
 */
export enum TBorderStyle {
    None = 'none',
    Single = 'single',
    Sizeable = 'sizeable',
    Dialog = 'dialog',
    ToolWindow = 'toolWindow',
    SizeToolWin = 'sizeToolWin'
}

/**
 * Form border icons
 */
export interface TBorderIcons {
    minimize: boolean;
    maximize: boolean;
    close: boolean;
    help: boolean;
}

/**
 * Color type (CSS compatible)
 */
export type TColor = string;

/**
 * Font style flags
 */
export interface TFontStyle {
    bold: boolean;
    italic: boolean;
    underline: boolean;
    strikeOut: boolean;
}

/**
 * Font definition
 */
export interface TFont {
    name: string;
    size: number;
    color: TColor;
    style: TFontStyle;
}

/**
 * Helper function to create shift state from DOM event
 */
export function createShiftState(event: MouseEvent | KeyboardEvent | React.MouseEvent | React.KeyboardEvent): TShiftState {
    return {
        shift: event.shiftKey,
        ctrl: event.ctrlKey,
        alt: event.altKey,
        meta: event.metaKey
    };
}

/**
 * Helper function to create a point
 */
export function Point(x: number, y: number): TPoint {
    return { x, y };
}

/**
 * Helper function to create a rect
 */
export function Rect(left: number, top: number, right: number, bottom: number): TRect {
    return { left, top, right, bottom };
}

/**
 * Helper function to create a size
 */
export function Size(width: number, height: number): TSize {
    return { width, height };
}
