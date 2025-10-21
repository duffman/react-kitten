/**
 * VCL (Visual Component Library) for React
 *
 * A Delphi/Pascal-inspired abstraction layer for building React applications
 * with familiar object-oriented patterns and event-driven architecture.
 *
 * @example
 * ```typescript
 * import { Application, TForm, TButton, TLabel } from '@react-kitten/vcl';
 *
 * @Application({
 *   title: 'My Application'
 * })
 * class MyApp {
 *   mainWindow: MainForm;
 *
 *   onCreate(runArgs: TRunArgs) {
 *     this.mainWindow = Application.createForm(MainForm);
 *     Application.mainForm = this.mainWindow;
 *   }
 * }
 *
 * class MainForm extends TForm {
 *   private button: TButton;
 *   private label: TLabel;
 *
 *   constructor(owner: TComponent | null) {
 *     super(owner);
 *     this.caption = 'Hello World';
 *     this.width = 400;
 *     this.height = 300;
 *
 *     this.button = new TButton(this);
 *     this.button.caption = 'Click Me';
 *     this.button.onClick = () => {
 *       this.label.caption = 'Button clicked!';
 *     };
 *
 *     this.label = new TLabel(this);
 *     this.label.caption = 'Welcome';
 *   }
 * }
 *
 * const app = new MyApp();
 * app.run();
 * ```
 */

// Core types
export * from './types';

// Base classes
export { TObject } from './types';
export { TComponent, Component, getComponentMetadata } from './Component';
export { TControl } from './Control';

// Application
export {
    TApplication,
    App,
    ApplicationDecorator,
    Application,
    getApplicationMetadata
} from './Application';
export type { ApplicationConfig } from './Application';

// Form/Window
export { TForm, Form } from './Form';

// Standard controls
export {
    TLabel,
    TButton,
    TPanel,
    TEdit,
    TMemo,
    TCheckBox
} from './Controls';

// React-Kitten integration
export { KittenForm } from './KittenIntegration';
