/**
 * VCL Demo - Quick Start Example
 *
 * A simple, self-contained example demonstrating the VCL abstraction.
 * This can be used as a template for building Delphi-style React applications.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import {
    Application as ApplicationDecorator,
    TApplication,
    TForm,
    TButton,
    TLabel,
    TEdit,
    TPanel,
    TAlign,
    TPosition,
    TRunArgs,
    TObject,
    TComponent
} from './vcl';
import { KittenApplication } from './vcl/KittenIntegration';

/**
 * Simple Form Example
 */
class HelloWorldForm extends TForm {
    private titleLabel: TLabel;
    private nameEdit: TEdit;
    private greetButton: TButton;
    private messageLabel: TLabel;

    constructor(owner: TComponent | null) {
        super(owner);

        // Form setup
        this.caption = 'Hello World - VCL Demo';
        this.width = 500;
        this.height = 300;
        this.position = TPosition.ScreenCenter;
        this.color = '#f0f0f0';

        // Create a panel for better organization
        const panel = new TPanel(this);
        panel.align = TAlign.Client;
        panel.caption = '';
        panel.color = '#ffffff';
        this.insertControl(panel);

        // Title
        this.titleLabel = new TLabel(this);
        this.titleLabel.caption = 'Welcome to VCL for React!';
        this.titleLabel.left = 50;
        this.titleLabel.top = 30;
        this.titleLabel.width = 400;
        this.titleLabel.font = {
            ...this.titleLabel.font,
            size: 18,
            color: '#2c3e50',
            style: { bold: true, italic: false, underline: false, strikeOut: false }
        };
        panel.insertControl(this.titleLabel);

        // Name label
        const nameLabel = new TLabel(this);
        nameLabel.caption = 'Your Name:';
        nameLabel.left = 50;
        nameLabel.top = 80;
        panel.insertControl(nameLabel);

        // Name input
        this.nameEdit = new TEdit(this);
        this.nameEdit.left = 150;
        this.nameEdit.top = 78;
        this.nameEdit.width = 250;
        this.nameEdit.hint = 'Enter your name';
        this.nameEdit.showHint = true;
        panel.insertControl(this.nameEdit);

        // Greet button
        this.greetButton = new TButton(this);
        this.greetButton.caption = 'Say Hello!';
        this.greetButton.left = 150;
        this.greetButton.top = 120;
        this.greetButton.width = 120;
        this.greetButton.onClick = this.handleGreetClick.bind(this);
        panel.insertControl(this.greetButton);

        // Message label
        this.messageLabel = new TLabel(this);
        this.messageLabel.caption = '';
        this.messageLabel.left = 50;
        this.messageLabel.top = 170;
        this.messageLabel.width = 400;
        this.messageLabel.font = {
            ...this.messageLabel.font,
            size: 16,
            color: '#27ae60',
            style: { bold: true, italic: true, underline: false, strikeOut: false }
        };
        panel.insertControl(this.messageLabel);
    }

    private handleGreetClick(_sender: TObject): void {
        const name = this.nameEdit.text.trim();
        if (name) {
            this.messageLabel.caption = `Hello, ${name}! Welcome to VCL for React! 👋`;
        } else {
            this.messageLabel.caption = 'Please enter your name first!';
            this.messageLabel.font = {
                ...this.messageLabel.font,
                color: '#e74c3c'
            };

            // Reset color after 2 seconds
            setTimeout(() => {
                this.messageLabel.font = {
                    ...this.messageLabel.font,
                    color: '#27ae60'
                };
            }, 2000);
        }
    }
}

/**
 * Application Class with @Application decorator
 */
@ApplicationDecorator({
    title: 'VCL Hello World Demo',
    theme: 'light'
})
class HelloWorldApp {
    mainWindow!: HelloWorldForm;

    onCreate(runArgs: TRunArgs): void {
        console.log('🚀 VCL Application starting...', runArgs);

        // Create the main form
        this.mainWindow = TApplication.instance.createForm(HelloWorldForm);
        TApplication.instance.mainForm = this.mainWindow;

        console.log('✅ Main window created');
    }

    onDestroy(_sender: TObject): void {
        console.log('👋 VCL Application shutting down...');
    }
}

/**
 * Bootstrap and run the VCL application
 */
export function runVCLDemo(): void {
    console.log('Starting VCL Demo...');

    // Create and run the application
    const app = new HelloWorldApp();
    (app as any).run();

    // Render to DOM
    const rootElement = document.getElementById('root');
    if (rootElement) {
        const reactRoot = ReactDOM.createRoot(rootElement);
        reactRoot.render(
            <React.StrictMode>
                <KittenApplication forms={TApplication.instance.forms as TForm[]} />
            </React.StrictMode>
        );
    } else {
        console.error('Root element not found!');
    }
}

/**
 * Auto-run if this is the main module
 */
if (import.meta.env.DEV) {
    // Uncomment the line below to auto-run the demo in development mode
    // runVCLDemo();
}

export default HelloWorldApp;
