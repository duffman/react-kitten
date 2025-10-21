/**
 * TControl - Base class for visual VCL components
 *
 * Provides common properties and methods for all visual controls
 * similar to Delphi's TControl class.
 */

import React from 'react';
import { TComponent } from './Component';
import {
    TAlign,
    TColor,
    TCursor,
    TNotifyEvent,
    TMouseEventHandler,
    TFont
} from './types';

/**
 * TControl - Base visual control class
 */
export class TControl extends TComponent {
    // Layout properties
    private _left: number = 0;
    private _top: number = 0;
    private _width: number = 100;
    private _height: number = 50;
    private _align: TAlign = TAlign.None;
    // TODO: Implement anchors functionality for responsive resizing
    // private _anchors: { left: boolean; top: boolean; right: boolean; bottom: boolean } = {
    //     left: true,
    //     top: true,
    //     right: false,
    //     bottom: false
    // };

    // Visual properties
    private _visible: boolean = true;
    private _enabled: boolean = true;
    private _color: TColor = 'transparent';
    private _cursor: TCursor = TCursor.Default;
    private _hint: string = '';
    private _showHint: boolean = false;

    // Font
    private _font: TFont = {
        name: 'Arial',
        size: 12,
        color: '#000000',
        style: {
            bold: false,
            italic: false,
            underline: false,
            strikeOut: false
        }
    };

    // Hierarchy
    private _parent: TControl | TComponent | null = null;
    private _controls: TControl[] = [];

    // Events
    private _onClick: TNotifyEvent | null = null;
    private _onDblClick: TNotifyEvent | null = null;
    private _onMouseDown: TMouseEventHandler | null = null;
    private _onMouseUp: TMouseEventHandler | null = null;
    private _onMouseMove: TMouseEventHandler | null = null;
    private _onMouseEnter: TNotifyEvent | null = null;
    private _onMouseLeave: TNotifyEvent | null = null;
    private _onResize: TNotifyEvent | null = null;

    constructor(owner: TComponent | null = null) {
        super(owner);
    }

    // ===== Layout Properties =====

    get left(): number {
        return this._left;
    }

    set left(value: number) {
        if (this._left !== value) {
            this._left = value;
            this.invalidate();
        }
    }

    get top(): number {
        return this._top;
    }

    set top(value: number) {
        if (this._top !== value) {
            this._top = value;
            this.invalidate();
        }
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

    get align(): TAlign {
        return this._align;
    }

    set align(value: TAlign) {
        if (this._align !== value) {
            this._align = value;
            this.realign();
        }
    }

    // ===== Visual Properties =====

    get visible(): boolean {
        return this._visible;
    }

    set visible(value: boolean) {
        if (this._visible !== value) {
            this._visible = value;
            this.invalidate();
        }
    }

    get enabled(): boolean {
        return this._enabled;
    }

    set enabled(value: boolean) {
        if (this._enabled !== value) {
            this._enabled = value;
            this.invalidate();
        }
    }

    get color(): TColor {
        return this._color;
    }

    set color(value: TColor) {
        if (this._color !== value) {
            this._color = value;
            this.invalidate();
        }
    }

    get cursor(): TCursor {
        return this._cursor;
    }

    set cursor(value: TCursor) {
        if (this._cursor !== value) {
            this._cursor = value;
            this.invalidate();
        }
    }

    get hint(): string {
        return this._hint;
    }

    set hint(value: string) {
        this._hint = value;
    }

    get showHint(): boolean {
        return this._showHint;
    }

    set showHint(value: boolean) {
        this._showHint = value;
    }

    get font(): TFont {
        return { ...this._font };
    }

    set font(value: Partial<TFont>) {
        this._font = { ...this._font, ...value };
        this.invalidate();
    }

    // ===== Hierarchy =====

    get parent(): TControl | TComponent | null {
        return this._parent;
    }

    set parent(value: TControl | TComponent | null) {
        if (this._parent !== value) {
            if (this._parent && this._parent instanceof TControl) {
                this._parent.removeControl(this);
            }
            this._parent = value;
        }
    }

    get controls(): ReadonlyArray<TControl> {
        return this._controls;
    }

    get controlCount(): number {
        return this._controls.length;
    }

    // ===== Events =====

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

    get onMouseDown(): TMouseEventHandler | null {
        return this._onMouseDown;
    }

    set onMouseDown(handler: TMouseEventHandler | null) {
        this._onMouseDown = handler;
    }

    get onMouseUp(): TMouseEventHandler | null {
        return this._onMouseUp;
    }

    set onMouseUp(handler: TMouseEventHandler | null) {
        this._onMouseUp = handler;
    }

    get onMouseMove(): TMouseEventHandler | null {
        return this._onMouseMove;
    }

    set onMouseMove(handler: TMouseEventHandler | null) {
        this._onMouseMove = handler;
    }

    get onMouseEnter(): TNotifyEvent | null {
        return this._onMouseEnter;
    }

    set onMouseEnter(handler: TNotifyEvent | null) {
        this._onMouseEnter = handler;
    }

    get onMouseLeave(): TNotifyEvent | null {
        return this._onMouseLeave;
    }

    set onMouseLeave(handler: TNotifyEvent | null) {
        this._onMouseLeave = handler;
    }

    get onResize(): TNotifyEvent | null {
        return this._onResize;
    }

    set onResize(handler: TNotifyEvent | null) {
        this._onResize = handler;
    }

    // ===== Methods =====

    /**
     * Inserts a control into this control's children
     */
    insertControl(control: TControl): void {
        if (!this._controls.includes(control)) {
            this._controls.push(control);
            control.parent = this;
            this.invalidate();
        }
    }

    /**
     * Removes a control from this control's children
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
     * Shows the control
     */
    show(): void {
        this.visible = true;
    }

    /**
     * Hides the control
     */
    hide(): void {
        this.visible = false;
    }

    /**
     * Brings control to front (z-order)
     */
    bringToFront(): void {
        if (this._parent && this._parent instanceof TControl) {
            const controls = [...this._parent._controls];
            const index = controls.indexOf(this);
            if (index !== -1) {
                controls.splice(index, 1);
                controls.push(this);
                this._parent._controls = controls;
                this.invalidate();
            }
        }
    }

    /**
     * Sends control to back (z-order)
     */
    sendToBack(): void {
        if (this._parent && this._parent instanceof TControl) {
            const controls = [...this._parent._controls];
            const index = controls.indexOf(this);
            if (index !== -1) {
                controls.splice(index, 1);
                controls.unshift(this);
                this._parent._controls = controls;
                this.invalidate();
            }
        }
    }

    /**
     * Sets bounds (position and size) in one call
     */
    setBounds(left: number, top: number, width: number, height: number): void {
        const changed = this._left !== left || this._top !== top ||
            this._width !== width || this._height !== height;

        if (changed) {
            this._left = left;
            this._top = top;
            this._width = width;
            this._height = height;
            this.doResize();
        }
    }

    /**
     * Invalidates the control, triggering a re-render
     */
    protected invalidate(): void {
        // This will trigger React re-render when implemented
    }

    /**
     * Realigns child controls based on their align property
     */
    protected realign(): void {
        // Calculate positions for aligned controls
        let clientRect = {
            left: 0,
            top: 0,
            right: this._width,
            bottom: this._height
        };

        // Process controls in order: top, bottom, left, right, client
        const processAlign = (align: TAlign) => {
            for (const control of this._controls) {
                if (control.align === align && control.visible) {
                    switch (align) {
                        case TAlign.Top:
                            control.setBounds(clientRect.left, clientRect.top,
                                clientRect.right - clientRect.left, control.height);
                            clientRect.top += control.height;
                            break;
                        case TAlign.Bottom:
                            control.setBounds(clientRect.left,
                                clientRect.bottom - control.height,
                                clientRect.right - clientRect.left, control.height);
                            clientRect.bottom -= control.height;
                            break;
                        case TAlign.Left:
                            control.setBounds(clientRect.left, clientRect.top,
                                control.width, clientRect.bottom - clientRect.top);
                            clientRect.left += control.width;
                            break;
                        case TAlign.Right:
                            control.setBounds(clientRect.right - control.width,
                                clientRect.top, control.width,
                                clientRect.bottom - clientRect.top);
                            clientRect.right -= control.width;
                            break;
                        case TAlign.Client:
                            control.setBounds(clientRect.left, clientRect.top,
                                clientRect.right - clientRect.left,
                                clientRect.bottom - clientRect.top);
                            break;
                    }
                }
            }
        };

        processAlign(TAlign.Top);
        processAlign(TAlign.Bottom);
        processAlign(TAlign.Left);
        processAlign(TAlign.Right);
        processAlign(TAlign.Client);

        this.invalidate();
    }

    /**
     * Called when control is resized
     */
    protected doResize(): void {
        if (this._onResize) {
            this._onResize(this);
        }
        this.realign();
        this.invalidate();
    }

    /**
     * Renders the control to a React element
     */
    render(): React.ReactElement {
        // Base implementation - override in derived classes
        const style: React.CSSProperties = {
            position: this.align === TAlign.None ? 'absolute' : 'relative',
            left: this.align === TAlign.None ? this.left : undefined,
            top: this.align === TAlign.None ? this.top : undefined,
            width: this.width,
            height: this.height,
            backgroundColor: this.color,
            cursor: this.cursor,
            display: this.visible ? 'block' : 'none',
            fontFamily: this.font.name,
            fontSize: this.font.size,
            color: this.font.color,
            fontWeight: this.font.style.bold ? 'bold' : 'normal',
            fontStyle: this.font.style.italic ? 'italic' : 'normal',
            textDecoration: this.font.style.underline ? 'underline' : 'none'
        };

        return React.createElement('div', {
            style,
            title: this.showHint ? this.hint : undefined,
            onClick: this._onClick ? () => this._onClick!(this) : undefined,
            onDoubleClick: this._onDblClick ? () => this._onDblClick!(this) : undefined
        }, this._controls.map((control, index) =>
            React.createElement(React.Fragment, { key: index }, control.render())
        ));
    }

    /**
     * Override destroy to clean up child controls
     */
    destroy(): void {
        // Destroy all child controls
        while (this._controls.length > 0) {
            const control = this._controls[0];
            control.destroy();
        }

        super.destroy();
    }
}
