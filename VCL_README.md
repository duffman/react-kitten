# VCL for React - Delphi/Pascal-Inspired Abstraction

A comprehensive Delphi/VCL (Visual Component Library) inspired abstraction layer for React applications, bringing familiar object-oriented patterns, event-driven architecture, and classical component hierarchy to modern React development.

## Overview

VCL for React provides a class-based, decorator-driven approach to building React applications that will feel familiar to Delphi, C++ Builder, and Lazarus developers. It combines the power of React with the structured, event-driven architecture of traditional RAD (Rapid Application Development) tools.

## Features

- **Class-Based Architecture**: Build applications using familiar OOP patterns
- **Decorator Support**: Use `@Application` decorator for clean application setup
- **Event-Driven**: Delphi-style events (onCreate, onDestroy, onClick, etc.)
- **VCL Component Hierarchy**: TObject → TComponent → TControl → Specific Controls
- **Familiar Controls**: TButton, TLabel, TEdit, TMemo, TPanel, TCheckBox, etc.
- **Form/Window Management**: TForm with full lifecycle management
- **React-Kitten Integration**: Seamlessly integrates with react-kitten window management
- **Type Safety**: Full TypeScript support with strong typing

## Quick Start

### Basic Application Structure

```typescript
import {
  Application,
  TApplication,
  TForm,
  TButton,
  TLabel,
  TRunArgs
} from 'react-kitten';

// Define your main form
class MainForm extends TForm {
  private button: TButton;
  private label: TLabel;

  constructor(owner: TComponent | null) {
    super(owner);

    // Form properties
    this.caption = 'Hello World';
    this.width = 400;
    this.height = 300;

    // Create controls
    this.label = new TLabel(this);
    this.label.caption = 'Click the button!';
    this.label.left = 50;
    this.label.top = 50;
    this.insertControl(this.label);

    this.button = new TButton(this);
    this.button.caption = 'Click Me';
    this.button.left = 50;
    this.button.top = 100;
    this.button.onClick = (sender) => {
      this.label.caption = 'Button clicked!';
    };
    this.insertControl(this.button);
  }
}

// Define your application
@Application({
  title: 'My Application',
  theme: 'light'
})
class MyApp {
  mainWindow: MainForm;

  onCreate(runArgs: TRunArgs) {
    this.mainWindow = TApplication.instance.createForm(MainForm);
    TApplication.instance.mainForm = this.mainWindow;
  }

  onDestroy(sender: TObject) {
    // Cleanup
  }
}

// Run the application
const app = new MyApp();
app.run();
```

## Core Concepts

### 1. Application Decorator

The `@Application` decorator transforms a class into the main application:

```typescript
@Application({
  title: 'My App',
  theme: 'dark',
  debug: true
})
class MyApp {
  onCreate(runArgs: TRunArgs) {
    // Application initialization
  }

  onDestroy(sender: TObject) {
    // Application cleanup
  }

  onEvent(event: TEvent) {
    // Global event handler
  }
}
```

### 2. Forms (TForm)

Forms represent windows in your application:

```typescript
class MyForm extends TForm {
  constructor(owner: TComponent | null) {
    super(owner);

    // Set form properties
    this.caption = 'My Form';
    this.width = 600;
    this.height = 400;
    this.position = TPosition.ScreenCenter;

    // Form events
    this.onShow = (sender) => console.log('Form shown');
    this.onClose = (sender, action) => {
      // action.value can be: None, Hide, Free, Minimize
      action.value = TCloseAction.Hide;
    };
  }
}
```

### 3. Controls

VCL provides familiar controls:

#### TLabel - Text Label
```typescript
const label = new TLabel(this);
label.caption = 'Hello World';
label.left = 10;
label.top = 10;
label.font = { size: 16, bold: true };
```

#### TButton - Push Button
```typescript
const button = new TButton(this);
button.caption = 'Click Me';
button.onClick = (sender) => {
  console.log('Button clicked!');
};
```

#### TEdit - Single-line Text Input
```typescript
const edit = new TEdit(this);
edit.text = 'Initial value';
edit.onChange = (sender) => {
  console.log('Text changed:', edit.text);
};
```

#### TPanel - Container Panel
```typescript
const panel = new TPanel(this);
panel.align = TAlign.Top;
panel.height = 100;
panel.caption = 'Top Panel';

// Add controls to panel
const button = new TButton(this);
panel.insertControl(button);
```

#### TMemo - Multi-line Text
```typescript
const memo = new TMemo(this);
memo.lines = ['Line 1', 'Line 2', 'Line 3'];
memo.wordWrap = true;
memo.scrollBars = 'both';
```

#### TCheckBox - Checkbox
```typescript
const checkbox = new TCheckBox(this);
checkbox.caption = 'Enable Feature';
checkbox.checked = true;
checkbox.onChange = (sender) => {
  console.log('Checked:', checkbox.checked);
};
```

### 4. Layout Management

VCL supports Delphi-style alignment:

```typescript
panel.align = TAlign.Top;     // Dock to top
panel.align = TAlign.Bottom;  // Dock to bottom
panel.align = TAlign.Left;    // Dock to left
panel.align = TAlign.Right;   // Dock to right
panel.align = TAlign.Client;  // Fill remaining space
panel.align = TAlign.None;    // Manual positioning
```

### 5. Component Hierarchy

The VCL component hierarchy mirrors Delphi:

```
TObject (base class)
  └─ TComponent (component management)
      └─ TControl (visual controls)
          ├─ TLabel
          ├─ TButton
          ├─ TEdit
          ├─ TMemo
          ├─ TPanel
          ├─ TCheckBox
          └─ TForm (window)
```

## Events

VCL supports Delphi-style event handlers:

### Common Events

- **onClick**: User clicks the control
- **onDblClick**: User double-clicks
- **onMouseDown**: Mouse button pressed
- **onMouseUp**: Mouse button released
- **onMouseMove**: Mouse moved over control
- **onMouseEnter**: Mouse enters control
- **onMouseLeave**: Mouse leaves control
- **onChange**: Control value changed
- **onResize**: Control resized

### Form-Specific Events

- **onCreate**: Form is created
- **onShow**: Form is shown
- **onHide**: Form is hidden
- **onClose**: Form is closing
- **onActivate**: Form becomes active
- **onDeactivate**: Form loses focus

### Application Events

- **onCreate**: Application starts
- **onDestroy**: Application terminates
- **onEvent**: Generic application event

## Properties

### Form Properties

```typescript
form.caption = 'Window Title';
form.width = 800;
form.height = 600;
form.left = 100;
form.top = 100;
form.color = '#ffffff';
form.visible = true;
form.enabled = true;
form.windowState = TWindowState.Normal; // Normal, Minimized, Maximized
form.position = TPosition.ScreenCenter;
form.borderStyle = TBorderStyle.Sizeable;
```

### Control Properties

```typescript
control.left = 10;
control.top = 20;
control.width = 100;
control.height = 30;
control.align = TAlign.Top;
control.visible = true;
control.enabled = true;
control.color = '#f0f0f0';
control.cursor = TCursor.Pointer;
control.hint = 'Tooltip text';
control.showHint = true;
control.font = {
  name: 'Arial',
  size: 12,
  color: '#000000',
  style: { bold: false, italic: false, underline: false, strikeOut: false }
};
```

## Complete Example

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  Application,
  TApplication,
  TForm,
  TButton,
  TLabel,
  TEdit,
  TPanel,
  TMemo,
  TAlign,
  TPosition,
  TRunArgs,
  TObject
} from 'react-kitten';
import { KittenApplication } from 'react-kitten/vcl';

class CalculatorForm extends TForm {
  private display: TEdit;
  private resultLabel: TLabel;
  private buttonPanel: TPanel;
  private logMemo: TMemo;
  private value: number = 0;

  constructor(owner: TObject | null) {
    super(owner as any);

    this.caption = 'Calculator';
    this.width = 400;
    this.height = 500;
    this.position = TPosition.ScreenCenter;

    // Display
    this.display = new TEdit(this);
    this.display.align = TAlign.Top;
    this.display.height = 40;
    this.display.text = '0';
    this.display.readOnly = true;
    this.insertControl(this.display);

    // Result Label
    this.resultLabel = new TLabel(this);
    this.resultLabel.align = TAlign.Top;
    this.resultLabel.height = 30;
    this.resultLabel.alignment = 'right';
    this.resultControl(this.resultLabel);

    // Button Panel
    this.buttonPanel = new TPanel(this);
    this.buttonPanel.align = TAlign.Top;
    this.buttonPanel.height = 200;
    this.insertControl(this.buttonPanel);

    // Create number buttons
    for (let i = 0; i < 10; i++) {
      const btn = new TButton(this);
      btn.caption = String(i);
      btn.left = 10 + (i % 3) * 80;
      btn.top = 10 + Math.floor(i / 3) * 40;
      btn.width = 70;
      btn.onClick = () => this.numberClick(i);
      this.buttonPanel.insertControl(btn);
    }

    // Log Memo
    this.logMemo = new TMemo(this);
    this.logMemo.align = TAlign.Client;
    this.logMemo.readOnly = true;
    this.insertControl(this.logMemo);
  }

  private numberClick(num: number): void {
    this.value = this.value * 10 + num;
    this.display.text = String(this.value);
    this.log(`Number ${num} clicked`);
  }

  private log(message: string): void {
    this.logMemo.lines = [...this.logMemo.lines, message];
    this.logMemo.text = this.logMemo.lines.join('\n');
  }
}

@Application({
  title: 'Calculator App',
  theme: 'light'
})
class CalculatorApp {
  mainWindow: CalculatorForm;

  onCreate(runArgs: TRunArgs) {
    this.mainWindow = TApplication.instance.createForm(CalculatorForm);
    TApplication.instance.mainForm = this.mainWindow;
  }
}

// Run
const app = new CalculatorApp();
app.run();

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<KittenApplication forms={TApplication.instance.forms as TForm[]} />);
```

## Integration with React-Kitten

VCL forms automatically integrate with react-kitten's advanced window management:

- **Draggable Windows**: All forms are draggable
- **Resizable**: Forms can be resized by users
- **Window Snapping**: Magnetic window snapping
- **Multiple Workspaces**: Support for multiple spaces
- **Stage Manager**: Minimize windows to side panel

Use `KittenApplication` component to render VCL forms with full react-kitten features:

```typescript
import { KittenApplication } from 'react-kitten/vcl';

root.render(
  <KittenApplication
    forms={TApplication.instance.forms as TForm[]}
    onFormClose={(form) => console.log('Form closed:', form.caption)}
  />
);
```

## Type System

VCL provides Delphi-compatible types:

```typescript
TObject          // Base object
TComponent       // Component base
TControl         // Visual control base
TForm            // Form/Window
TPoint           // { x, y }
TRect            // { left, top, right, bottom }
TSize            // { width, height }
TColor           // string (CSS color)
TFont            // Font definition
TAlign           // Alignment enum
TCursor          // Cursor type
TWindowState     // Window state
TPosition        // Window position
TBorderStyle     // Border style
TEvent           // Base event
TNotifyEvent     // (sender: TObject) => void
TMouseEvent      // Mouse event data
TKeyEvent        // Keyboard event data
TCloseEvent      // Close event handler
```

## Best Practices

1. **Always call super() in constructors**
   ```typescript
   constructor(owner: TComponent | null) {
     super(owner);
     // Your initialization
   }
   ```

2. **Use insertControl() to add controls**
   ```typescript
   this.insertControl(button);
   ```

3. **Clean up in onDestroy**
   ```typescript
   onDestroy(sender: TObject) {
     // Release resources
   }
   ```

4. **Use bind() for event handlers**
   ```typescript
   this.button.onClick = this.handleClick.bind(this);
   ```

5. **Set form position for better UX**
   ```typescript
   this.position = TPosition.ScreenCenter;
   ```

## License

VCL for React is part of the react-kitten project and is licensed under the MIT License.

## Credits

Created as part of react-kitten by Oğuzhan Eroğlu
Inspired by Borland Delphi's Visual Component Library
