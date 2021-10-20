import React from 'react'
import { useFormState } from 'hooks/_hooks';
import { Form, Header, Message, Icon, Popup } from 'semantic-ui-react';
import { walletUtils } from 'util/_util';

/**
 * Unlock a keystore
 * @param { Function (keystore, walletName) => {} } submitFunction - Callback function to use -- Provides (keystore, walletName) => {} 
 * @prop { Bool } hideTitle - Hide the form title?
 * @returns 
 */
export default function LoadKeystoreForm({ submitText, submitFunction, cancelText, cancelFunction, hideTitle }) {

    const [formState, formSetter, onSubmit] = useFormState([
        { name: 'password', type: 'password', isRequired: true },
        { name: 'walletName', type: 'string', isRequired: true, length: 4 }
    ]);
    const [keystore, setKeystore] = React.useState(false);
    const [error, setError] = React.useState(false);
    const [success, setSuccess] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    const anyFormErrors = formState.password.error || formState.walletName.error; 

    console.log(anyFormErrors);

    const fileChange = (e) => {
        let file = e.target.files[0];
        let reader = new FileReader();
        reader.readAsText(file);
        reader.onabort = () => { setError("Aborted loading keystore file") }
        reader.onerror = () => { setError("Error loading keystore file") }
        reader.onload = () => {
            setKeystore(reader.result);
        };
    }

    const loadKeystore = () => {
        setLoading(true);
        let unlocked = walletUtils.unlockKeystore(keystore, formState.password.value)
        if (unlocked.error) {
            setSuccess(false);
            setError(unlocked.error.message === "Key derivation failed - possibly wrong password" ? "Incorrect password" : unlocked.error.message)
            setLoading(false);
            return submitFunction({ unlocked: unlocked, walletName: formState.walletName.value, error: unlocked.error.message });
        }
        else {
            setLoading(false);
            setSuccess(true);
            setError(false);
            return submitFunction({ unlocked: unlocked, walletName: formState.walletName.value, success: true });
        }

    }

    console.log(formState);

    return (

        <Form error={error} size="mini" className="max-w-md w-72 text-left" onSubmit={ () => onSubmit(loadKeystore)}>

            {!hideTitle && (
                <Header as="h4" textAlign="center">Load A Keystore</Header>
            )}

            <Form.Input
                size="mini"
                type="file"
                id="file"
                onChange={(e) => fileChange(e)}
                onClick={e => (e.target.value = null)}
                label={<><label className="inline">Keystore</label><Popup size="mini" position="right center" offset={"4,2"}
                    trigger={<Icon name="question circle" className="ml-1" />} content="Keystore to load" /> </>} />

            <Form.Input
                label={<><label className="inline">Keystore Password</label><Popup size="mini" position="right center" offset={"4,2"}
                    trigger={<Icon name="question circle" className="ml-1" />} content="Password to unlock this keystore" /> </>}
                type="password" value={formState.password.value}
                onChange={e => formSetter.setPassword(e.target.value)}
                error={!!formState.password.error && {content: formState.password.error}}
            />

            <Form.Input
                label={<><label className="inline">Wallet Name</label><Popup size="mini" position="right center" offset={"4,2"}
                    trigger={<Icon name="question circle" className="ml-1" />} content="How this keystore will be referenced" /> </>}
                type="text" value={formState.walletName.value}
                onChange={e => formSetter.setWalletName(e.target.value)}
                error={!!formState.walletName.error && {content: formState.walletName.error}}
            />

            <Form.Button fluid size="small" basic loading={loading} className="mt-16"
                onClick={() => onSubmit(loadKeystore)}
                color={error ? "red" : "green"}
                disabled={success}
                content={error ? "Try Again" : success ? "Success" : "Add Wallet"}
                icon={error ? "exclamation" : success ? "checkmark" : "plus"}
                content={error ? "Try Again" : submitText}
            />

            <Form.Button fluid size="small" basic 
                icon={success ? "thumbs up" : "x"}
                color={success ? "green" : "orange"}
                onClick={success ? e => e.preventDefault() : cancelFunction}
                content={success ? "Success, please wait..." : cancelText}
            />

            <Message error className="absolute inset-center w-40">{error}</Message>

        </Form>

    )

}