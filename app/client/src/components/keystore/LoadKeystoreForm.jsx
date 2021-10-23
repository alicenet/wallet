import React from 'react'
import { useFormState } from 'hooks/_hooks';
import { Form, Header, Message, Icon, Popup, Checkbox } from 'semantic-ui-react';
import { walletUtils } from 'util/_util';
import { curveTypes } from 'util/wallet';
import { isDebug } from 'util/generic';

/**
 * Verifies a keystore can be unlocked with the given password -- Returns the keystore and password used to unlock it
 * @param { Function ({results}) => {} } submitFunction - Callback function to use -- Provides ({locked, password, success, error, walletName}) => {} 
 * @prop { Bool } hideTitle - Hide the form title?
 * @returns 
 */
export default function LoadKeystoreForm({ submitText, submitFunction, cancelText, cancelFunction, hideTitle }) {

    const [formState, formSetter, onSubmit] = useFormState([
        { name: 'password', type: 'string', isRequired: true, value: isDebug ? "testing" : "" },
        { name: 'walletName', type: 'string', isRequired: true, length: 4, value: isDebug ? "testKeystore" : "" }
    ]);

    const [keystore, setKeystore] = React.useState(false);
    const [error, setError] = React.useState(false);
    const [success, setSuccess] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [curveType, setCurveType] = React.useState(curveTypes.SECP256K1);
    const toggleCurveType = () => setCurveType(s => s === curveTypes.SECP256K1 ? curveTypes.BARRETO_NAEHRIG : curveTypes.SECP256K1)

    // TODO CATCH KEYSTROE CURVE ON LOAD
    React.useEffect(() => {

        let parsed = JSON.parse(keystore);

        if (parsed.curve) {
            setCurveType(parseInt(parsed.curve) === curveTypes.SECP256K1 ? curveTypes.SECP256K1 : curveTypes.BARRETO_NAEHRIG);
        }

    }, [keystore])

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

        let ks = JSON.stringify(Object.assign(JSON.parse(keystore), { curve: curveType }));

        if (unlocked.error) {
            setSuccess(false);
            setError(unlocked.error.message === "Key derivation failed - possibly wrong password" ? "Incorrect password" : unlocked.error.message)
            setLoading(false);
            return submitFunction({ locked: JSON.parse(ks), password: false, walletName: formState.walletName.value, error: unlocked.error.message, success: false });
        }
        else {
            setLoading(false);
            setSuccess(true);
            setError(false);
            return submitFunction({ locked: JSON.parse(ks), password: formState.password.value, walletName: formState.walletName.value, success: true, error: false, });
        }

    }

    return (

        <Form error={error} size="mini" className="max-w-md w-72 text-left" onSubmit={() => onSubmit(loadKeystore)}>

            {!hideTitle && (
                <Header as="h4" textAlign="center">Load A Keystore</Header>
            )}

            <Form.Input
                disabled={success}
                size="mini"
                type="file"
                id="file"
                onChange={(e) => fileChange(e)}
                onClick={e => (e.target.value = null)}
                label={
                    <label className="flex justify-between">
                        Keystore File
                        <Checkbox
                            checked={curveType === curveTypes.BARRETO_NAEHRIG}
                            onChange={toggleCurveType}
                            label={<><label className={"labelCheckbox"}>Use BN Curve</label><Popup size="mini" position="right center" offset={"0,2"}
                                trigger={<Icon name="question circle" className="ml-1 mb-1.5" style={{ marginRight: "-.035rem" }} />} content="Force the address generation by BN Curve. This will be detected if it is in the keystore" /></>}
                            className="flex justify-center items-center text-xs uppercase font-bold relative -top-0" />
                    </label>
                }

            />

            <Form.Input disabled={success}
                label={<><label className="inline">Keystore Password</label><Popup size="mini" position="right center" offset={"4,2"} className="transition-none"
                    trigger={<Icon name="question circle" className="ml-1" />} content="Password to unlock this keystore" /> </>}
                type="password" value={formState.password.value}
                onChange={e => formSetter.setPassword(e.target.value)}
                error={!!formState.password.error && { content: formState.password.error }}
            />

            <Form.Input disabled={success}
                label={<><label className="inline">Wallet Name</label><Popup size="mini" position="right center" offset={"4,2"}
                    trigger={<Icon name="question circle" className="ml-1" />} content="How this keystore will be referenced" /> </>}
                type="text" value={formState.walletName.value}
                onChange={e => formSetter.setWalletName(e.target.value)}
                error={!!formState.walletName.error && { content: formState.walletName.error }}
            />

            <Form.Button fluid size="small" basic loading={loading} className="mt-16"
                onClick={() => onSubmit(loadKeystore)}
                color={error ? "red" : "green"}
                disabled={success}
                content={error ? "Try Again" : success ? "Success" : "Add Wallet"}
                icon={error ? "exclamation" : success ? "checkmark" : "plus"}
            />

            <Form.Button fluid size="small" basic
                icon={success ? "thumbs up" : "x"}
                color={success ? "green" : "orange"}
                onClick={success ? e => e.preventDefault() : (e) => { e.preventDefault(); cancelFunction() }}
                content={success ? "Success, please wait..." : cancelText}
            />

            <Message error className="absolute inset-center w-40">{error}</Message>

        </Form>

    )

}