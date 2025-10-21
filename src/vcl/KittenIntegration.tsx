/**
 * React-Kitten Integration
 *
 * Bridges VCL forms with react-kitten's Window component system.
 * This allows VCL-style forms to be rendered using the advanced
 * window management features of react-kitten.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { BasicWindow, Manager, Space } from '../components';
import { TForm } from './Form';
import { TComponent } from './Component';
import { TCloseAction } from './types';

/**
 * Props for KittenForm component
 */
interface KittenFormProps {
    form: TForm;
    onClose?: () => void;
}

/**
 * KittenForm - Renders a VCL TForm using react-kitten Window
 *
 * This component bridges VCL forms with react-kitten's window management.
 */
export const KittenForm: React.FC<KittenFormProps> = ({ form, onClose }) => {
    const [, setUpdateTrigger] = useState(0);

    // Force re-render when form properties change
    const forceUpdate = useCallback(() => {
        setUpdateTrigger(prev => prev + 1);
    }, []);

    useEffect(() => {
        // Override form's invalidate to trigger React re-renders
        const originalInvalidate = (form as any).invalidate.bind(form);
        (form as any).invalidate = () => {
            originalInvalidate();
            forceUpdate();
        };

        return () => {
            // Restore original invalidate on unmount
            (form as any).invalidate = originalInvalidate;
        };
    }, [form, forceUpdate]);

    const handleClose = useCallback(() => {
        const action = { value: TCloseAction.Hide };

        if (form.onClose) {
            form.onClose(form, action);
        }

        switch (action.value) {
            case TCloseAction.None:
                // Do nothing
                break;
            case TCloseAction.Hide:
                form.hide();
                if (onClose) onClose();
                break;
            case TCloseAction.Free:
                form.destroy();
                if (onClose) onClose();
                break;
            case TCloseAction.Minimize:
                form.windowState = TCloseAction.Minimize as any;
                break;
        }
    }, [form, onClose]);

    if (!form.visible) {
        return null;
    }

    return (
        <BasicWindow
            title={form.caption}
            initialSize={[form.width, form.height]}
            initialPosition={[form.left, form.top]}
            opened={form.visible}
            onClose={handleClose}
        >
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: form.color,
                    overflow: 'auto',
                    position: 'relative'
                }}
            >
                {form.controls.map((control, index) => (
                    <React.Fragment key={index}>
                        {control.render()}
                    </React.Fragment>
                ))}
            </div>
        </BasicWindow>
    );
};

/**
 * KittenApplication - Main application container for VCL apps
 *
 * Wraps the entire VCL application in react-kitten's Manager and Space.
 */
interface KittenApplicationProps {
    forms: TForm[];
    onFormClose?: (form: TForm) => void;
}

export const KittenApplication: React.FC<KittenApplicationProps> = ({
    forms,
    onFormClose
}) => {
    return (
        <Manager>
            <Space>
                {forms.map((form, index) => (
                    <KittenForm
                        key={form.name || index}
                        form={form}
                        onClose={() => onFormClose?.(form)}
                    />
                ))}
            </Space>
        </Manager>
    );
};

/**
 * Helper to create a react-kitten compatible render function for VCL forms
 */
export function renderVCLApplication(forms: TForm[]): React.ReactElement {
    return <KittenApplication forms={forms} />;
}

/**
 * Enhanced TForm that automatically integrates with react-kitten
 */
export class KittenVCLForm extends TForm {
    constructor(owner: TComponent | null = null) {
        super(owner);
    }

    /**
     * Override render to use KittenForm component
     */
    render(): React.ReactElement {
        return <KittenForm form={this} />;
    }
}
