/**
 * TForm - Delphi-style Form/Window component
 *
 * Represents a window/form with VCL-style properties and events.
 * Integrates with react-kitten's Window component.
 */

import React from 'react';
import { TComponent } from './Component';
import {
    TNotifyEvent,
    TCloseEvent,
    TCloseAction,
    TWindowState,
    TPosition,
    TBorderStyle,
    TBorderIcons,
    TColor
} from './types';
import { TControl } from './Control';

/**
 * TForm - Form/Window class
 */
export class TForm extends TComponent {
    // Visual properties
    private _caption: string = 'Form';
    private _width: number = 800;
    private _height: number = 600;
    private _left: number = 100;
    private _top: number = 100;
    private _color: TColor = '#ffffff';
    private _visible: boolean = true;
    private _enabled: boolean = true;

    // Window properties
    private _windowState: TWindowState = TWindowState.Normal;
    private _position: TPosition = TPosition.Default;
    private _borderStyle: TBorderStyle = TBorderStyle.Sizeable;
    private _borderIcons: TBorderIcons = {
        minimize: true,
        maximize: true,
        close: true,
        help: false
    };

    // Form state
    private _active: boolean = false;
    private _controls: TControl[] = [];

    // Events
    private _onShow: TNotifyEvent | null = null;
    private _onHide: TNotifyEvent | null = null;
    private _onClose: TCloseEvent | null = null;
    private _onActivate: TNotifyEvent | null = null;
    private _onDeactivate: TNotifyEvent | null = null;
    private _onResize: TNotifyEvent | null = null;
    private _onMove: TNotifyEvent | null = null;
    private _onClick: TNotifyEvent | null = null;
    private _onDblClick: TNotifyEvent | null = null;
    // TODO: Implement additional mouse/keyboard events
    // private _onMouseDown: ((sender: TComponent, event: TMouseEvent) => void) | null = null;
    // private _onMouseUp: ((sender: TComponent, event: TMouseEvent) => void) | null = null;
    // private _onMouseMove: ((sender: TComponent, event: TMouseEvent) => void) | null = null;
    // private _onKeyDown: ((sender: TComponent, event: TKeyEvent) => void) | null = null;
    // private _onKeyUp: ((sender: TComponent, event: TKeyEvent) => void) | null = null;
    // private _onKeyPress: ((sender: TComponent, event: TKeyEvent) => void) | null = null;

    // TODO: React integration for custom rendering
    // private _reactElement: React.ReactElement | null = null;

    constructor(owner: TComponent | null = null) {
        super(owner);
    }

    // ===== Properties =====

    get caption(): string {
        return this._caption;
    }

    set caption(value: string) {
        this._caption = value;
        this.invalidate();
    }

    get width(): number {
        return this._width;
    }

    set width(value: number) {
        if (this._width !== value) {
            this._width = value;
            this.doResize();
        }
    }

    get height(): number {
        return this._height;
    }

    set height(value: number) {
        if (this._height !== value) {
            this._height = value;
            this.doResize();
        }
    }

    get left(): number {
        return this._left;
    }

    set left(value: number) {
        if (this._left !== value) {
            this._left = value;
            this.doMove();
        }
    }

    get top(): number {
        return this._top;
    }

    set top(value: number) {
        if (this._top !== value) {
            this._top = value;
            this.doMove();
        }
    }

    get color(): TColor {
        return this._color;
    }

    set color(value: TColor) {
        this._color = value;
        this.invalidate();
    }

    get visible(): boolean {
        return this._visible;
    }

    set visible(value: boolean) {
        if (this._visible !== value) {
            this._visible = value;
            if (value) {
                this.doShow();
            } else {
                this.doHide();
            }
        }
    }

    get enabled(): boolean {
        return this._enabled;
    }

    set enabled(value: boolean) {
        this._enabled = value;
        this.invalidate();
    }

    get windowState(): TWindowState {
        return this._windowState;
    }

    set windowState(value: TWindowState) {
        this._windowState = value;
        this.invalidate();
    }

    get position(): TPosition {
        return this._position;
    }

    set position(value: TPosition) {
        this._position = value;
    }

    get borderStyle(): TBorderStyle {
        return this._borderStyle;
    }

    set borderStyle(value: TBorderStyle) {
        this._borderStyle = value;
        this.invalidate();
    }

    get borderIcons(): TBorderIcons {
        return { ...this._borderIcons };
    }

    set borderIcons(value: Partial<TBorderIcons>) {
        this._borderIcons = { ...this._borderIcons, ...value };
        this.invalidate();
    }

    get active(): boolean {
        return this._active;
    }

    get controls(): ReadonlyArray<TControl> {
        return this._controls;
    }

    get controlCount(): number {
        return this._controls.length;
    }

    // ===== Events =====

    get onShow(): TNotifyEvent | null {
        return this._onShow;
    }

    set onShow(handler: TNotifyEvent | null) {
        this._onShow = handler;
    }

    get onHide(): TNotifyEvent | null {
        return this._onHide;
    }

    set onHide(handler: TNotifyEvent | null) {
        this._onHide = handler;
    }

    get onClose(): TCloseEvent | null {
        return this._onClose;
    }

    set onClose(handler: TCloseEvent | null) {
        this._onClose = handler;
    }

    get onActivate(): TNotifyEvent | null {
        return this._onActivate;
    }

    set onActivate(handler: TNotifyEvent | null) {
        this._onActivate = handler;
    }

    get onDeactivate(): TNotifyEvent | null {
        return this._onDeactivate;
    }

    set onDeactivate(handler: TNotifyEvent | null) {
        this._onDeactivate = handler;
    }

    get onResize(): TNotifyEvent | null {
        return this._onResize;
    }

    set onResize(handler: TNotifyEvent | null) {
        this._onResize = handler;
    }

    get onMove(): TNotifyEvent | null {
        return this._onMove;
    }

    set onMove(handler: TNotifyEvent | null) {
        this._onMove = handler;
    }

    get onClick(): TNotifyEvent | null {
        return this._onClick;
    }

    set onClick(handler: TNotifyEvent | null) {
        this._onClick = handler;
    }

    get onDblClick(): TNotifyEvent | null {
        return this._onDblClick;
    }

    set onDblClick(handler: TNotifyEvent | null) {
        this._onDblClick = handler;
    }

    // ===== Methods =====

    /**
     * Shows the form
     */
    show(): void {
        this.visible = true;
    }

    /**
     * Hides the form
     */
    hide(): void {
        this.visible = false;
    }

    /**
     * Shows the form modally (blocks interaction with other forms)
     * Note: In web context, this is simulated
     */
    showModal(): Promise<any> {
        this.show();
        // In a real implementation, this would return a promise that resolves when the form closes
        return new Promise((resolve) => {
            const originalOnClose = this._onClose;
            this._onClose = (sender, action) => {
                if (originalOnClose) {
                    originalOnClose(sender, action);
                }
                resolve(action.value);
            };
        });
    }

    /**
     * Closes the form
     */
    close(): void {
        const action = { value: TCloseAction.Hide };

        if (this._onClose) {
            this._onClose(this, action);
        }

        switch (action.value) {
            case TCloseAction.None:
                // Do nothing
                break;
            case TCloseAction.Hide:
                this.hide();
                break;
            case TCloseAction.Free:
                this.destroy();
                break;
            case TCloseAction.Minimize:
                this.windowState = TWindowState.Minimized;
                break;
        }
    }

    /**
     * Centers the form on screen
     */
    centerScreen(): void {
        if (typeof window !== 'undefined') {
            this._left = (window.innerWidth - this._width) / 2;
            this._top = (window.innerHeight - this._height) / 2;
            this.doMove();
        }
    }

    /**
     * Adds a control to the form
     */
    insertControl(control: TControl): void {
        if (!this._controls.includes(control)) {
            this._controls.push(control);
            control.parent = this;
            this.invalidate();
        }
    }

    /**
     * Removes a control from the form
     */
    removeControl(control: TControl): void {
        const index = this._controls.indexOf(control);
        if (index !== -1) {
            this._controls.splice(index, 1);
            if (control.parent === this) {
                control.parent = null;
            }
            this.invalidate();
        }
    }

    /**
     * Invalidates the form, triggering a re-render
     */
    protected invalidate(): void {
        // Trigger React re-render
        // This will be implemented when we integrate with React
    }

    /**
     * Called when form is shown
     */
    protected doShow(): void {
        if (this._onShow) {
            this._onShow(this);
        }
    }

    /**
     * Called when form is hidden
     */
    protected doHide(): void {
        if (this._onHide) {
            this._onHide(this);
        }
    }

    /**
     * Called when form is activated
     */
    protected doActivate(): void {
        this._active = true;
        if (this._onActivate) {
            this._onActivate(this);
        }
    }

    /**
     * Called when form is deactivated
     */
    protected doDeactivate(): void {
        this._active = false;
        if (this._onDeactivate) {
            this._onDeactivate(this);
        }
    }

    /**
     * Called when form is resized
     */
    protected doResize(): void {
        if (this._onResize) {
            this._onResize(this);
        }
        this.invalidate();
    }

    /**
     * Called when form is moved
     */
    protected doMove(): void {
        if (this._onMove) {
            this._onMove(this);
        }
        this.invalidate();
    }

    /**
     * Renders the form to a React element
     * This is the bridge between VCL-style code and React
     */
    render(): React.ReactElement {
        // This will be implemented to create the actual React component
        // For now, return a placeholder
        return React.createElement('div', {
            style: {
                width: this._width,
                height: this._height,
                backgroundColor: this._color,
                display: this._visible ? 'block' : 'none'
            }
        }, this._caption);
    }

    /**
     * Override destroy to clean up controls
     */
    destroy(): void {
        // Destroy all controls
        while (this._controls.length > 0) {
            const control = this._controls[0];
            control.destroy();
        }

        super.destroy();
    }
}

/**
 * Form decorator for class-based forms
 */
export function Form(config: {
    caption?: string;
    width?: number;
    height?: number;
    position?: TPosition;
} = {}): ClassDecorator {
    return function (target: any) {
        const originalConstructor = target;

        const newConstructor: any = function (...args: any[]) {
            const instance = new originalConstructor(...args);

            // Apply configuration
            if (config.caption) instance.caption = config.caption;
            if (config.width) instance.width = config.width;
            if (config.height) instance.height = config.height;
            if (config.position) instance.position = config.position;

            return instance;
        };

        // Preserve prototype
        newConstructor.prototype = originalConstructor.prototype;

        return newConstructor;
    };
}
