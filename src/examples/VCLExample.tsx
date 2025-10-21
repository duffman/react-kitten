/**
 * VCL Example Application
 *
 * Demonstrates the Delphi/VCL-style abstraction for React applications.
 * This example shows how to create a traditional object-oriented application
 * with decorators, lifecycle events, and familiar VCL patterns.
 */

import ReactDOM from 'react-dom/client';
import {
    Application as ApplicationDecorator,
    TApplication,
    TForm,
    TButton,
    TLabel,
    TEdit,
    TPanel,
    TMemo,
    TCheckBox,
    TRunArgs,
    TObject,
    TAlign,
    TPosition,
    TCloseAction
} from '../vcl';
import { KittenApplication } from '../vcl/KittenIntegration';

/**
 * Main Form - Demonstrates VCL controls and events
 */
class MainForm extends TForm {
    // Controls (similar to private fields in Delphi)
    private topPanel!: TPanel;
    private titleLabel!: TLabel;
    private nameEdit!: TEdit;
    private greetButton!: TButton;
    private resultLabel!: TLabel;
    private enabledCheckBox!: TCheckBox;
    private bottomPanel!: TPanel;
    private logMemo!: TMemo;
    private clearButton!: TButton;
    private counter: number = 0;

    constructor(owner: TObject | null = null) {
        super(owner as any);

        // Form properties
        this.caption = 'VCL Demo Application';
        this.width = 600;
        this.height = 500;
        this.position = TPosition.ScreenCenter;
        this.color = '#f5f5f5';

        // Set up form events
        this.onCreate = this.formCreate.bind(this);
        this.onShow = this.formShow.bind(this);
        this.onClose = this.formClose.bind(this);

        // Create controls
        this.createControls();
    }

    /**
     * Creates and configures all controls
     */
    private createControls(): void {
        // Top Panel
        this.topPanel = new TPanel(this);
        this.topPanel.align = TAlign.Top;
        this.topPanel.height = 180;
        this.topPanel.color = '#e8e8e8';
        this.topPanel.caption = 'User Input';
        this.insertControl(this.topPanel);

        // Title Label
        this.titleLabel = new TLabel(this);
        this.titleLabel.caption = 'Welcome to VCL for React!';
        this.titleLabel.left = 20;
        this.titleLabel.top = 30;
        this.titleLabel.width = 300;
        this.titleLabel.height = 30;
        this.titleLabel.font = {
            ...this.titleLabel.font,
            size: 18,
            style: { bold: true, italic: false, underline: false, strikeOut: false }
        };
        this.topPanel.insertControl(this.titleLabel);

        // Name Edit
        const nameLabel = new TLabel(this);
        nameLabel.caption = 'Enter your name:';
        nameLabel.left = 20;
        nameLabel.top = 70;
        nameLabel.width = 120;
        this.topPanel.insertControl(nameLabel);

        this.nameEdit = new TEdit(this);
        this.nameEdit.left = 150;
        this.nameEdit.top = 68;
        this.nameEdit.width = 200;
        this.nameEdit.text = '';
        this.nameEdit.hint = 'Type your name here';
        this.nameEdit.showHint = true;
        this.topPanel.insertControl(this.nameEdit);

        // Greet Button
        this.greetButton = new TButton(this);
        this.greetButton.caption = 'Greet Me!';
        this.greetButton.left = 360;
        this.greetButton.top = 66;
        this.greetButton.width = 100;
        this.greetButton.onClick = this.greetButtonClick.bind(this);
        this.topPanel.insertControl(this.greetButton);

        // Result Label
        this.resultLabel = new TLabel(this);
        this.resultLabel.caption = '';
        this.resultLabel.left = 20;
        this.resultLabel.top = 110;
        this.resultLabel.width = 440;
        this.resultLabel.height = 25;
        this.resultLabel.color = '#fff';
        this.resultLabel.font = {
            ...this.resultLabel.font,
            size: 14,
            color: '#0066cc',
            style: { bold: true, italic: false, underline: false, strikeOut: false }
        };
        this.topPanel.insertControl(this.resultLabel);

        // Enabled CheckBox
        this.enabledCheckBox = new TCheckBox(this);
        this.enabledCheckBox.caption = 'Button Enabled';
        this.enabledCheckBox.left = 20;
        this.enabledCheckBox.top = 145;
        this.enabledCheckBox.checked = true;
        this.enabledCheckBox.onChange = this.enabledCheckBoxChange.bind(this);
        this.topPanel.insertControl(this.enabledCheckBox);

        // Bottom Panel (for log)
        this.bottomPanel = new TPanel(this);
        this.bottomPanel.align = TAlign.Client;
        this.bottomPanel.caption = 'Event Log';
        this.bottomPanel.color = '#f0f0f0';
        this.insertControl(this.bottomPanel);

        // Log Memo
        this.logMemo = new TMemo(this);
        this.logMemo.left = 10;
        this.logMemo.top = 30;
        this.logMemo.width = 560;
        this.logMemo.height = 230;
        this.logMemo.readOnly = true;
        this.logMemo.lines = ['Application started...'];
        this.bottomPanel.insertControl(this.logMemo);

        // Clear Button
        this.clearButton = new TButton(this);
        this.clearButton.caption = 'Clear Log';
        this.clearButton.left = 10;
        this.clearButton.top = 270;
        this.clearButton.width = 100;
        this.clearButton.onClick = this.clearButtonClick.bind(this);
        this.bottomPanel.insertControl(this.clearButton);
    }

    /**
     * Form onCreate event handler
     */
    private formCreate(_sender: TObject): void {
        this.log('Form created');
    }

    /**
     * Form onShow event handler
     */
    private formShow(_sender: TObject): void {
        this.log('Form shown');
        this.nameEdit.text = '';
    }

    /**
     * Form onClose event handler
     */
    private formClose(_sender: TObject, _action: { value: TCloseAction }): void {
        this.log('Form closing...');
        // You can prevent closing by setting action.value = TCloseAction.None
    }

    /**
     * Greet Button click handler
     */
    private greetButtonClick(_sender: TObject): void {
        this.counter++;
        const name = this.nameEdit.text.trim();

        if (name) {
            this.resultLabel.caption = `Hello, ${name}! (Click #${this.counter})`;
            this.log(`Greeted: ${name}`);
        } else {
            this.resultLabel.caption = 'Please enter your name first!';
            this.log('Greet attempted with empty name');
        }
    }

    /**
     * Enabled CheckBox change handler
     */
    private enabledCheckBoxChange(_sender: TObject): void {
        this.greetButton.enabled = this.enabledCheckBox.checked;
        this.log(`Button ${this.greetButton.enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Clear Button click handler
     */
    private clearButtonClick(_sender: TObject): void {
        this.logMemo.lines = [];
        this.log('Log cleared');
    }

    /**
     * Helper method to add log entries
     */
    private log(message: string): void {
        const timestamp = new Date().toLocaleTimeString();
        const entry = `[${timestamp}] ${message}`;
        this.logMemo.lines = [...this.logMemo.lines, entry];
        this.logMemo.text = this.logMemo.lines.join('\n');
    }
}

/**
 * Second Form - Demonstrates multiple windows
 */
class AboutForm extends TForm {
    private panel: TPanel;
    private titleLabel: TLabel;
    private infoMemo: TMemo;
    private okButton: TButton;

    constructor(owner: TObject | null = null) {
        super(owner as any);

        this.caption = 'About VCL for React';
        this.width = 400;
        this.height = 300;
        this.position = TPosition.ScreenCenter;

        // Panel
        this.panel = new TPanel(this);
        this.panel.align = TAlign.Client;
        this.panel.color = '#ffffff';
        this.insertControl(this.panel);

        // Title
        this.titleLabel = new TLabel(this);
        this.titleLabel.caption = 'VCL for React';
        this.titleLabel.left = 20;
        this.titleLabel.top = 20;
        this.titleLabel.width = 300;
        this.titleLabel.font = {
            ...this.titleLabel.font,
            size: 20,
            style: { bold: true, italic: false, underline: false, strikeOut: false }
        };
        this.panel.insertControl(this.titleLabel);

        // Info
        this.infoMemo = new TMemo(this);
        this.infoMemo.left = 20;
        this.infoMemo.top = 60;
        this.infoMemo.width = 360;
        this.infoMemo.height = 150;
        this.infoMemo.readOnly = true;
        this.infoMemo.wordWrap = true;
        this.infoMemo.scrollBars = 'vertical';
        this.infoMemo.lines = [
            'VCL (Visual Component Library) for React',
            '',
            'A Delphi/Pascal-inspired abstraction that brings',
            'familiar object-oriented patterns to React development.',
            '',
            'Features:',
            '• Class-based components with decorators',
            '• Event-driven architecture',
            '• Familiar VCL controls and properties',
            '• Integrates with react-kitten window management',
            '',
            'Version: 1.0.0'
        ];
        this.infoMemo.text = this.infoMemo.lines.join('\n');
        this.panel.insertControl(this.infoMemo);

        // OK Button
        this.okButton = new TButton(this);
        this.okButton.caption = 'OK';
        this.okButton.left = 150;
        this.okButton.top = 230;
        this.okButton.width = 100;
        this.okButton.onClick = () => this.close();
        this.panel.insertControl(this.okButton);
    }
}

/**
 * Main Application Class
 *
 * This is decorated with @Application to make it the main application.
 * Similar to program MainProgram in Delphi.
 */
@ApplicationDecorator({
    title: 'VCL Demo Application',
    theme: 'light',
    debug: true
})
class MyVCLApplication {
    mainWindow!: MainForm;
    aboutWindow!: AboutForm;

    /**
     * onCreate - Called when application starts
     * Similar to: program initialization in Delphi
     */
    onCreate(runArgs: TRunArgs): void {
        console.log('Application onCreate', runArgs);

        // Create main form
        this.mainWindow = TApplication.instance.createForm(MainForm);
        TApplication.instance.mainForm = this.mainWindow;

        // Create about form (hidden initially)
        this.aboutWindow = TApplication.instance.createForm(AboutForm);
        this.aboutWindow.visible = false;

        // You can set up application-wide settings here
        TApplication.instance.title = 'VCL Demo - React Kitten';
    }

    /**
     * onDestroy - Called when application terminates
     */
    onDestroy(_sender: TObject): void {
        console.log('Application onDestroy');
        // Cleanup code here
    }

    /**
     * onEvent - Generic event handler
     */
    onEvent(event: any): void {
        console.log('Application event:', event);
    }
}

/**
 * Application Entry Point
 *
 * This function initializes and runs the VCL application
 */
export function runVCLExample(): void {
    // Create application instance
    const app = new MyVCLApplication();

    // Run the application (calls onCreate)
    (app as any).run();

    // Get all forms and render them
    const forms = TApplication.instance.forms;

    // Render to DOM
    const root = document.getElementById('root');
    if (root) {
        const reactRoot = ReactDOM.createRoot(root);
        reactRoot.render(<KittenApplication forms={forms as TForm[]} />);
    }
}

/**
 * Export the application class for external use
 */
export { MyVCLApplication };
