/**
 * TComponent - Base class for all VCL components
 *
 * Provides component lifecycle management, ownership, and event handling
 * similar to Delphi's TComponent class.
 */

import { TObject, TNotifyEvent, TComponentState } from './types';

/**
 * TComponent - Base component class
 */
export class TComponent extends TObject {
    private _owner: TComponent | null = null;
    private _components: TComponent[] = [];
    private _state: TComponentState = TComponentState.Created;
    private _onCreate: TNotifyEvent | null = null;
    private _onDestroy: TNotifyEvent | null = null;

    /**
     * Component owner (parent component that manages lifetime)
     */
    get owner(): TComponent | null {
        return this._owner;
    }

    /**
     * Child components owned by this component
     */
    get components(): ReadonlyArray<TComponent> {
        return this._components;
    }

    /**
     * Current component state
     */
    get componentState(): TComponentState {
        return this._state;
    }

    /**
     * Number of owned components
     */
    get componentCount(): number {
        return this._components.length;
    }

    /**
     * onCreate event - fires when component is created
     */
    get onCreate(): TNotifyEvent | null {
        return this._onCreate;
    }

    set onCreate(handler: TNotifyEvent | null) {
        this._onCreate = handler;
    }

    /**
     * onDestroy event - fires before component is destroyed
     */
    get onDestroy(): TNotifyEvent | null {
        return this._onDestroy;
    }

    set onDestroy(handler: TNotifyEvent | null) {
        this._onDestroy = handler;
    }

    /**
     * Constructor
     * @param owner - Component that owns this component (manages lifetime)
     */
    constructor(owner: TComponent | null = null) {
        super();
        this._owner = owner;

        if (owner) {
            owner.insertComponent(this);
        }

        this.loaded();
    }

    /**
     * Inserts a component into the owned components list
     */
    insertComponent(component: TComponent): void {
        if (!this._components.includes(component)) {
            this._components.push(component);
        }
    }

    /**
     * Removes a component from the owned components list
     */
    removeComponent(component: TComponent): void {
        const index = this._components.indexOf(component);
        if (index !== -1) {
            this._components.splice(index, 1);
        }
    }

    /**
     * Called after component is fully loaded
     */
    protected loaded(): void {
        this._state = TComponentState.Loaded;
        if (this._onCreate) {
            this._onCreate(this);
        }
    }

    /**
     * Destroys this component and all owned components
     */
    destroy(): void {
        if (this._state === TComponentState.Destroying || this._state === TComponentState.Destroyed) {
            return;
        }

        this._state = TComponentState.Destroying;

        // Fire onDestroy event
        if (this._onDestroy) {
            try {
                this._onDestroy(this);
            } catch (error) {
                console.error('Error in onDestroy handler:', error);
            }
        }

        // Destroy all owned components
        while (this._components.length > 0) {
            const component = this._components[0];
            component.destroy();
        }

        // Remove from owner
        if (this._owner) {
            this._owner.removeComponent(this);
            this._owner = null;
        }

        this._state = TComponentState.Destroyed;
        super.destroy();
    }

    /**
     * Finds a component by name
     */
    findComponent(name: string): TComponent | null {
        if (this.name === name) {
            return this;
        }

        for (const component of this._components) {
            const found = component.findComponent(name);
            if (found) {
                return found;
            }
        }

        return null;
    }

    /**
     * Returns true if this component owns the specified component
     */
    hasComponent(component: TComponent): boolean {
        return this._components.includes(component);
    }
}

/**
 * Component decorator metadata storage
 */
const componentMetadata = new WeakMap<any, ComponentMetadata>();

/**
 * Component metadata interface
 */
export interface ComponentMetadata {
    name?: string;
    defaultName?: string;
    [key: string]: any;
}

/**
 * Component class decorator
 * Used to add metadata to component classes
 */
export function Component(metadata: ComponentMetadata = {}): ClassDecorator {
    return function (target: any) {
        componentMetadata.set(target, metadata);
        return target;
    };
}

/**
 * Gets component metadata for a class
 */
export function getComponentMetadata(target: any): ComponentMetadata | undefined {
    return componentMetadata.get(target);
}
