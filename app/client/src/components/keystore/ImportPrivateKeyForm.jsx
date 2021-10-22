import React from 'react'
import { useFormState } from 'hooks/_hooks';
import { Form, Header, Message, Icon, Popup, Checkbox } from 'semantic-ui-react';
import { walletUtils } from 'util/_util';
import { curveTypes } from 'util/wallet';
import { default_log as log } from 'log/logHelper'
import { isDebug } from 'util/generic';

/**
 * Verifies a privateKey string and calls the passed callback with a temporary keystore object with password ""
 * @param { Function ({results}) => {} } submitFunction - Callback function to use -- Provides ({locked, password, success, error, walletName}) => {} 
 * @prop { Bool } hideTitle - Hide the form title?
 * @returns 
 */
export default function ImportPrivateKeyForm({ submitText, submitFunction, cancelText, cancelFunction, hideTitle }) {

    const [formState, formSetter, onSubmit] = useFormState([
        { name: 'privateKey', type: 'string', isRequired: true, },
        { name: 'walletName', type: 'string', isRequired: true, length: 4, value: isDebug ? "testPrivK" : "" }
    ]);

    const [error, setError] = React.useState(false);
    const [success, setSuccess] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [curveType, setCurveType] = React.useState(curveTypes.SECP256K1);
    const toggleCurveType = () => setCurveType(s => s === curveTypes.SECP256K1 ? curveTypes.BARRETO_NAEHRIG : curveTypes.SECP256K1)

    const verifyPrivKey = () => {
        try {
            // Passback a temporarily wrapped keystore for simplicity with password ""
            let ks = walletUtils.generateKeystoreFromPrivK(formState.privateKey.value, "", curveType)
            setError(false);
            submitFunction({
                locked: ks, 
                password: "", 
                walletName: formState.walletName.value, 
                success: true, 
                error: false, 
            });
        } catch (ex) {
            log.error(ex);
            setError(ex.message);
        }
    }

    return (

        <Form error={error} size="mini" className="max-w-md w-72 text-left" onSubmit={() => onSubmit(verifyPrivKey)}>

            {!hideTitle && (
                <Header as="h4" textAlign="center">Load A Keystore</Header>
            )}

            <Form.Input
                type="text"
                onChange={(e) => formSetter.setPrivateKey(e.target.value)}
                value={formState.privateKey.value}
                placeholder="0x..."
                label={
                    <label className="flex justify-between">
                        Private Key
                        <Checkbox
                            checked={curveType === curveTypes.BARRETO_NAEHRIG}
                            onChange={toggleCurveType}
                            label={<><label className={"labelCheckbox"}>Use BN Curve</label><Popup size="mini" position="right center" offset={"0,2"}
                                trigger={<Icon name="question circle" className="ml-1 mb-1.5" style={{ marginRight: "-.035rem" }} />} content="Generate public address with BN Curve" /></>}
                            className="flex justify-center items-center text-xs uppercase font-bold relative -top-0" />
                    </label>
                }
                error={!!formState.privateKey.error && { content: formState.privateKey.error }}

            />


            <Form.Input
                label={<><label className="inline">Wallet Name</label><Popup size="mini" position="right center" offset={"4,2"}
                    trigger={<Icon name="question circle" className="ml-1" />} content="How this wallet will be referenced" /> </>}
                type="text" value={formState.walletName.value}
                onChange={e => formSetter.setWalletName(e.target.value)}
                error={!!formState.walletName.error && { content: formState.walletName.error }}
            />

            <Form.Button fluid size="small" basic loading={loading} className="mt-16"
                onClick={() => onSubmit(verifyPrivKey)}
                color={error ? "red" : "green"}
                disabled={success}
                content={error ? "Try Again" : success ? "Success" : "Add Wallet"}
                icon={error ? "exclamation" : success ? "checkmark" : "plus"}
                content={error ? "Try Again" : submitText}
            />

            <Form.Button fluid size="small" basic
                icon={success ? "thumbs up" : "x"}
                color={success ? "green" : "orange"}
                onClick={success ? e => e.preventDefault() : (e) => { e.preventDefault(); cancelFunction() }}
                content={success ? "Success, please wait..." : cancelText}
            />

            <Message error className="absolute inset-center w-full">{error}</Message>

        </Form>

    )

}