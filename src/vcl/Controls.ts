/**
 * Standard VCL Controls
 *
 * Common controls like Button, Label, Panel, Edit, Memo, etc.
 * Similar to Delphi's standard control palette.
 */

import React from 'react';
import { TControl } from './Control';
import { TComponent } from './Component';
import { TNotifyEvent, TAlign } from './types';

/**
 * TLabel - Text label control
 */
export class TLabel extends TControl {
    private _caption: string = 'Label';
    private _autoSize: boolean = false;
    private _wordWrap: boolean = false;
    private _alignment: 'left' | 'center' | 'right' = 'left';

    get caption(): string {
        return this._caption;
    }

    set caption(value: string) {
        this._caption = value;
        this.invalidate();
    }

    get autoSize(): boolean {
        return this._autoSize;
    }

    set autoSize(value: boolean) {
        this._autoSize = value;
        this.invalidate();
    }

    get wordWrap(): boolean {
        return this._wordWrap;
    }

    set wordWrap(value: boolean) {
        this._wordWrap = value;
        this.invalidate();
    }

    get alignment(): 'left' | 'center' | 'right' {
        return this._alignment;
    }

    set alignment(value: 'left' | 'center' | 'right') {
        this._alignment = value;
        this.invalidate();
    }

    render(): React.ReactElement {
        const style: React.CSSProperties = {
            position: this.align === TAlign.None ? 'absolute' : 'relative',
            left: this.align === TAlign.None ? this.left : undefined,
            top: this.align === TAlign.None ? this.top : undefined,
            width: this.autoSize ? 'auto' : this.width,
            height: this.autoSize ? 'auto' : this.height,
            backgroundColor: this.color,
            cursor: this.cursor,
            display: this.visible ? 'block' : 'none',
            fontFamily: this.font.name,
            fontSize: this.font.size,
            color: this.font.color,
            fontWeight: this.font.style.bold ? 'bold' : 'normal',
            fontStyle: this.font.style.italic ? 'italic' : 'normal',
            textDecoration: this.font.style.underline ? 'underline' : 'none',
            textAlign: this._alignment,
            whiteSpace: this._wordWrap ? 'normal' : 'nowrap',
            overflow: 'hidden'
        };

        return React.createElement('label', {
            style,
            title: this.showHint ? this.hint : undefined
        }, this._caption);
    }
}

/**
 * TButton - Push button control
 */
export class TButton extends TControl {
    private _caption: string = 'Button';
    private _default: boolean = false;
    private _cancel: boolean = false;

    constructor(owner: TComponent | null = null) {
        super(owner);
        this.width = 100;
        this.height = 30;
    }

    get caption(): string {
        return this._caption;
    }

    set caption(value: string) {
        this._caption = value;
        this.invalidate();
    }

    get default(): boolean {
        return this._default;
    }

    set default(value: boolean) {
        this._default = value;
    }

    get cancel(): boolean {
        return this._cancel;
    }

    set cancel(value: boolean) {
        this._cancel = value;
    }

    render(): React.ReactElement {
        const style: React.CSSProperties = {
            position: this.align === TAlign.None ? 'absolute' : 'relative',
            left: this.align === TAlign.None ? this.left : undefined,
            top: this.align === TAlign.None ? this.top : undefined,
            width: this.width,
            height: this.height,
            backgroundColor: this.color || '#f0f0f0',
            cursor: this.enabled ? this.cursor : 'not-allowed',
            display: this.visible ? 'block' : 'none',
            fontFamily: this.font.name,
            fontSize: this.font.size,
            color: this.font.color,
            fontWeight: this.font.style.bold ? 'bold' : 'normal',
            fontStyle: this.font.style.italic ? 'italic' : 'normal',
            border: '1px solid #999',
            borderRadius: '4px',
            opacity: this.enabled ? 1 : 0.5
        };

        return React.createElement('button', {
            style,
            disabled: !this.enabled,
            title: this.showHint ? this.hint : undefined,
            onClick: this.onClick ? () => this.onClick!(this) : undefined,
            onDoubleClick: this.onDblClick ? () => this.onDblClick!(this) : undefined
        }, this._caption);
    }
}

/**
 * TPanel - Container panel control
 */
export class TPanel extends TControl {
    private _caption: string = '';
    private _bevelInner: 'none' | 'lowered' | 'raised' = 'none';
    private _bevelOuter: 'none' | 'lowered' | 'raised' = 'raised';

    constructor(owner: TComponent | null = null) {
        super(owner);
        this.width = 200;
        this.height = 150;
        this.color = '#f0f0f0';
    }

    get caption(): string {
        return this._caption;
    }

    set caption(value: string) {
        this._caption = value;
        this.invalidate();
    }

    get bevelInner(): 'none' | 'lowered' | 'raised' {
        return this._bevelInner;
    }

    set bevelInner(value: 'none' | 'lowered' | 'raised') {
        this._bevelInner = value;
        this.invalidate();
    }

    get bevelOuter(): 'none' | 'lowered' | 'raised' {
        return this._bevelOuter;
    }

    set bevelOuter(value: 'none' | 'lowered' | 'raised') {
        this._bevelOuter = value;
        this.invalidate();
    }

    render(): React.ReactElement {
        const getBorderStyle = (bevel: 'none' | 'lowered' | 'raised'): string => {
            switch (bevel) {
                case 'lowered': return 'inset';
                case 'raised': return 'outset';
                default: return 'solid';
            }
        };

        const style: React.CSSProperties = {
            position: this.align === TAlign.None ? 'absolute' : 'relative',
            left: this.align === TAlign.None ? this.left : undefined,
            top: this.align === TAlign.None ? this.top : undefined,
            width: this.width,
            height: this.height,
            backgroundColor: this.color,
            cursor: this.cursor,
            display: this.visible ? 'flex' : 'none',
            flexDirection: 'column',
            fontFamily: this.font.name,
            fontSize: this.font.size,
            color: this.font.color,
            borderStyle: getBorderStyle(this._bevelOuter),
            borderWidth: this._bevelOuter !== 'none' ? '2px' : '0',
            borderColor: '#999',
            overflow: 'hidden'
        };

        return React.createElement('div', {
            style,
            title: this.showHint ? this.hint : undefined,
            onClick: this.onClick ? () => this.onClick!(this) : undefined
        }, [
            this._caption && React.createElement('div', {
                key: 'caption',
                style: { padding: '4px', textAlign: 'center' }
            }, this._caption),
            React.createElement('div', {
                key: 'content',
                style: { flex: 1, position: 'relative' }
            }, this.controls.map((control, index) =>
                React.createElement(React.Fragment, { key: index }, control.render())
            ))
        ]);
    }
}

/**
 * TEdit - Single-line text edit control
 */
export class TEdit extends TControl {
    private _text: string = '';
    private _readOnly: boolean = false;
    private _passwordChar: string = '';
    private _maxLength: number = 0;
    private _onChange: TNotifyEvent | null = null;

    constructor(owner: TComponent | null = null) {
        super(owner);
        this.width = 150;
        this.height = 25;
        this.color = '#ffffff';
    }

    get text(): string {
        return this._text;
    }

    set text(value: string) {
        this._text = value;
        this.invalidate();
    }

    get readOnly(): boolean {
        return this._readOnly;
    }

    set readOnly(value: boolean) {
        this._readOnly = value;
        this.invalidate();
    }

    get passwordChar(): string {
        return this._passwordChar;
    }

    set passwordChar(value: string) {
        this._passwordChar = value;
        this.invalidate();
    }

    get maxLength(): number {
        return this._maxLength;
    }

    set maxLength(value: number) {
        this._maxLength = value;
        this.invalidate();
    }

    get onChange(): TNotifyEvent | null {
        return this._onChange;
    }

    set onChange(handler: TNotifyEvent | null) {
        this._onChange = handler;
    }

    render(): React.ReactElement {
        const style: React.CSSProperties = {
            position: this.align === TAlign.None ? 'absolute' : 'relative',
            left: this.align === TAlign.None ? this.left : undefined,
            top: this.align === TAlign.None ? this.top : undefined,
            width: this.width,
            height: this.height,
            backgroundColor: this.color,
            cursor: this.enabled ? 'text' : 'not-allowed',
            display: this.visible ? 'block' : 'none',
            fontFamily: this.font.name,
            fontSize: this.font.size,
            color: this.font.color,
            border: '1px solid #999',
            padding: '2px 4px',
            boxSizing: 'border-box'
        };

        return React.createElement('input', {
            type: this._passwordChar ? 'password' : 'text',
            style,
            value: this._text,
            disabled: !this.enabled,
            readOnly: this._readOnly,
            maxLength: this._maxLength > 0 ? this._maxLength : undefined,
            title: this.showHint ? this.hint : undefined,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                this._text = e.target.value;
                if (this._onChange) {
                    this._onChange(this);
                }
            },
            onClick: this.onClick ? () => this.onClick!(this) : undefined
        });
    }
}

/**
 * TMemo - Multi-line text edit control
 */
export class TMemo extends TControl {
    private _lines: string[] = [];
    private _readOnly: boolean = false;
    private _wordWrap: boolean = true;
    private _scrollBars: 'none' | 'vertical' | 'horizontal' | 'both' = 'both';
    private _onChange: TNotifyEvent | null = null;

    constructor(owner: TComponent | null = null) {
        super(owner);
        this.width = 200;
        this.height = 100;
        this.color = '#ffffff';
    }

    get lines(): string[] {
        return [...this._lines];
    }

    set lines(value: string[]) {
        this._lines = [...value];
        this.invalidate();
    }

    get text(): string {
        return this._lines.join('\n');
    }

    set text(value: string) {
        this._lines = value.split('\n');
        this.invalidate();
    }

    get readOnly(): boolean {
        return this._readOnly;
    }

    set readOnly(value: boolean) {
        this._readOnly = value;
        this.invalidate();
    }

    get wordWrap(): boolean {
        return this._wordWrap;
    }

    set wordWrap(value: boolean) {
        this._wordWrap = value;
        this.invalidate();
    }

    get scrollBars(): 'none' | 'vertical' | 'horizontal' | 'both' {
        return this._scrollBars;
    }

    set scrollBars(value: 'none' | 'vertical' | 'horizontal' | 'both') {
        this._scrollBars = value;
        this.invalidate();
    }

    get onChange(): TNotifyEvent | null {
        return this._onChange;
    }

    set onChange(handler: TNotifyEvent | null) {
        this._onChange = handler;
    }

    render(): React.ReactElement {
        const getOverflow = (): string => {
            switch (this._scrollBars) {
                case 'vertical': return 'auto hidden';
                case 'horizontal': return 'hidden auto';
                case 'both': return 'auto';
                default: return 'hidden';
            }
        };

        const style: React.CSSProperties = {
            position: this.align === TAlign.None ? 'absolute' : 'relative',
            left: this.align === TAlign.None ? this.left : undefined,
            top: this.align === TAlign.None ? this.top : undefined,
            width: this.width,
            height: this.height,
            backgroundColor: this.color,
            cursor: this.enabled ? 'text' : 'not-allowed',
            display: this.visible ? 'block' : 'none',
            fontFamily: this.font.name,
            fontSize: this.font.size,
            color: this.font.color,
            border: '1px solid #999',
            padding: '4px',
            boxSizing: 'border-box',
            overflow: getOverflow(),
            whiteSpace: this._wordWrap ? 'pre-wrap' : 'pre',
            resize: 'none'
        };

        return React.createElement('textarea', {
            style,
            value: this.text,
            disabled: !this.enabled,
            readOnly: this._readOnly,
            title: this.showHint ? this.hint : undefined,
            onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => {
                this._lines = e.target.value.split('\n');
                if (this._onChange) {
                    this._onChange(this);
                }
            },
            onClick: this.onClick ? () => this.onClick!(this) : undefined
        });
    }
}

/**
 * TCheckBox - Checkbox control
 */
export class TCheckBox extends TControl {
    private _caption: string = 'CheckBox';
    private _checked: boolean = false;
    private _onChange: TNotifyEvent | null = null;

    constructor(owner: TComponent | null = null) {
        super(owner);
        this.width = 120;
        this.height = 20;
    }

    get caption(): string {
        return this._caption;
    }

    set caption(value: string) {
        this._caption = value;
        this.invalidate();
    }

    get checked(): boolean {
        return this._checked;
    }

    set checked(value: boolean) {
        this._checked = value;
        this.invalidate();
    }

    get onChange(): TNotifyEvent | null {
        return this._onChange;
    }

    set onChange(handler: TNotifyEvent | null) {
        this._onChange = handler;
    }

    render(): React.ReactElement {
        const style: React.CSSProperties = {
            position: this.align === TAlign.None ? 'absolute' : 'relative',
            left: this.align === TAlign.None ? this.left : undefined,
            top: this.align === TAlign.None ? this.top : undefined,
            width: this.width,
            height: this.height,
            cursor: this.enabled ? this.cursor : 'not-allowed',
            display: this.visible ? 'flex' : 'none',
            alignItems: 'center',
            gap: '4px',
            fontFamily: this.font.name,
            fontSize: this.font.size,
            color: this.font.color
        };

        return React.createElement('label', { style }, [
            React.createElement('input', {
                key: 'checkbox',
                type: 'checkbox',
                checked: this._checked,
                disabled: !this.enabled,
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                    this._checked = e.target.checked;
                    if (this._onChange) {
                        this._onChange(this);
                    }
                }
            }),
            React.createElement('span', { key: 'caption' }, this._caption)
        ]);
    }
}
