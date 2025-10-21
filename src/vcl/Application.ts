/**
 * Application - Delphi-style application management
 *
 * Provides the @Application decorator and TApplication class for managing
 * React applications in a Delphi/VCL style.
 */

import ReactDOM from 'react-dom/client';
import { TComponent } from './Component';
import { TRunArgs, TEvent } from './types';
import { TForm } from './Form';

/**
 * Application configuration metadata
 */
export interface ApplicationConfig {
    title?: string;
    theme?: 'light' | 'dark' | 'auto';
    scaling?: boolean;
    debug?: boolean;
    [key: string]: any;
}

/**
 * Application metadata storage
 */
const applicationMetadata = new WeakMap<any, ApplicationConfig>();

/**
 * TApplication - Main application class (singleton)
 *
 * Manages application lifecycle, main window, and global events.
 * Similar to Delphi's Application object.
 */
export class TApplication extends TComponent {
    private static _instance: TApplication | null = null;
    private _mainForm: TForm | null = null;
    private _forms: TForm[] = [];
    private _title: string = 'React Application';
    private _terminated: boolean = false;
    private _onEvent: ((event: TEvent) => void) | null = null;
    private _reactRoot: ReactDOM.Root | null = null;
    private _rootElement: HTMLElement | null = null;
    private _config: ApplicationConfig = {};

    /**
     * Gets the singleton Application instance
     */
    static get instance(): TApplication {
        if (!TApplication._instance) {
            TApplication._instance = new TApplication();
        }
        return TApplication._instance;
    }

    /**
     * Main form (window) of the application
     */
    get mainForm(): TForm | null {
        return this._mainForm;
    }

    set mainForm(form: TForm | null) {
        this._mainForm = form;
        if (form && !this._forms.includes(form)) {
            this._forms.push(form);
        }
    }

    /**
     * All forms in the application
     */
    get forms(): ReadonlyArray<TForm> {
        return this._forms;
    }

    /**
     * Application title
     */
    get title(): string {
        return this._title;
    }

    set title(value: string) {
        this._title = value;
        if (typeof document !== 'undefined') {
            document.title = value;
        }
    }

    /**
     * Whether the application has been terminated
     */
    get terminated(): boolean {
        return this._terminated;
    }

    /**
     * Application configuration
     */
    get config(): Readonly<ApplicationConfig> {
        return this._config;
    }

    /**
     * Generic event handler for application-wide events
     */
    get onEvent(): ((event: TEvent) => void) | null {
        return this._onEvent;
    }

    set onEvent(handler: ((event: TEvent) => void) | null) {
        this._onEvent = handler;
    }

    private constructor() {
        super(null);
        this.name = 'Application';
    }

    /**
     * Initializes the application with configuration
     */
    initialize(config: ApplicationConfig = {}): void {
        this._config = { ...config };

        if (config.title) {
            this.title = config.title;
        }

        // Set up global error handling
        if (typeof window !== 'undefined') {
            window.addEventListener('error', (event) => {
                this.handleException(event.error);
            });

            window.addEventListener('unhandledrejection', (event) => {
                this.handleException(event.reason);
            });
        }
    }

    /**
     * Creates a form instance
     */
    createForm<T extends TForm>(
        formClass: new (owner: TComponent | null) => T,
        ..._args: any[]
    ): T {
        const form = new formClass(this);
        this._forms.push(form);
        return form;
    }

    /**
     * Runs the application
     * This is typically called after setting up the main form
     */
    run(_runArgs?: TRunArgs): void {
        if (this._terminated) {
            console.error('Cannot run terminated application');
            return;
        }

        // Fire onCreate with run arguments
        if (this.onCreate) {
            this.onCreate(this);
        }

        // Dispatch application start event
        this.dispatchEvent({
            sender: this,
            timestamp: Date.now()
        });
    }

    /**
     * Renders the application to a DOM element
     */
    render(rootElement: HTMLElement | string): void {
        const element = typeof rootElement === 'string'
            ? document.getElementById(rootElement)
            : rootElement;

        if (!element) {
            throw new Error('Root element not found');
        }

        this._rootElement = element;

        if (!this._reactRoot) {
            this._reactRoot = ReactDOM.createRoot(element);
        }

        if (this._mainForm) {
            const mainFormElement = this._mainForm.render();
            this._reactRoot.render(mainFormElement);
        }
    }

    /**
     * Terminates the application
     */
    terminate(): void {
        if (this._terminated) {
            return;
        }

        this._terminated = true;

        // Destroy all forms
        while (this._forms.length > 0) {
            const form = this._forms[0];
            form.destroy();
            this._forms.splice(0, 1);
        }

        // Unmount React root
        if (this._reactRoot && this._rootElement) {
            this._reactRoot.unmount();
            this._reactRoot = null;
        }

        // Call onDestroy
        if (this.onDestroy) {
            this.onDestroy(this);
        }

        this.destroy();
    }

    /**
     * Handles uncaught exceptions
     */
    handleException(error: any): void {
        console.error('Application exception:', error);

        // You can override this in your application class to provide custom error handling
        if (this._config.debug) {
            // In debug mode, show error details
            alert(`Error: ${error.message || error}`);
        }
    }

    /**
     * Dispatches an application event
     */
    dispatchEvent(event: TEvent): void {
        if (this._onEvent) {
            this._onEvent(event);
        }
    }

    /**
     * Processes pending messages (React equivalent)
     * In web context, this allows React to process updates
     */
    processMessages(): void {
        // In web environment, this is handled by the browser event loop
        // We can use this for testing or special scenarios
    }
}

/**
 * Global Application instance (like Delphi's Application variable)
 * Note: Also available via TApplication.instance
 */
export const App = TApplication.instance;

/**
 * @Application decorator
 *
 * Decorates a class to mark it as the main application class.
 * The decorated class should extend or be compatible with application structure.
 *
 * @example
 * ```typescript
 * @Application({
 *   title: 'My App',
 *   theme: 'dark'
 * })
 * class MyApp {
 *   mainWindow: MyMainForm;
 *
 *   onCreate(sender: TObject) {
 *     this.mainWindow = Application.createForm(MyMainForm);
 *     Application.mainForm = this.mainWindow;
 *   }
 *
 *   onDestroy(sender: TObject) {
 *     // Cleanup
 *   }
 * }
 * ```
 */
export function ApplicationDecorator(config: ApplicationConfig = {}): ClassDecorator {
    return function <T extends Function>(target: T): T {
        // Store metadata
        applicationMetadata.set(target, config);

        // Create a wrapper class
        const WrappedClass = class extends (target as any) {
            constructor(...args: any[]) {
                super(...args);

                // Initialize the Application singleton with config
                App.initialize(config);

                // Set up onCreate handler
                if (typeof this.onCreate === 'function') {
                    App.onCreate = (_sender) => {
                        const runArgs: TRunArgs = {
                            args: typeof process !== 'undefined' ? process.argv.slice(2) : [],
                            env: typeof process !== 'undefined' ? process.env : {}
                        };
                        this.onCreate.call(this, runArgs);
                    };
                }

                // Set up onDestroy handler
                if (typeof this.onDestroy === 'function') {
                    App.onDestroy = (sender) => {
                        this.onDestroy.call(this, sender);
                    };
                }

                // Set up onEvent handler
                if (typeof this.onEvent === 'function') {
                    App.onEvent = (event) => {
                        this.onEvent.call(this, event);
                    };
                }
            }

            /**
             * Starts the application
             */
            run(): void {
                App.run();

                // Auto-render if mainForm is set
                if (App.mainForm) {
                    const rootElement = document.getElementById('root')
                        || document.getElementById('app')
                        || document.body;

                    App.render(rootElement);
                }
            }

            /**
             * Gets the Application instance
             */
            get app(): TApplication {
                return App;
            }
        };

        // Preserve class name
        Object.defineProperty(WrappedClass, 'name', {
            value: target.name,
            writable: false
        });

        return WrappedClass as any;
    };
}

/**
 * Export as default named export for cleaner syntax
 */
export { ApplicationDecorator as Application };

/**
 * Gets application metadata
 */
export function getApplicationMetadata(target: any): ApplicationConfig | undefined {
    return applicationMetadata.get(target);
}
