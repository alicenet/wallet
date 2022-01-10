import React, { useEffect, useState } from 'react'
import { useFormState } from 'hooks/_hooks';
import { Checkbox, Form, Header, Icon, Message, Popup } from 'semantic-ui-react';

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
        { name: 'privateKey', display: 'Private Key', type: 'string', isRequired: true, },
        { name: 'walletName', display: 'Wallet Name', type: 'string', isRequired: true, length: 4, value: isDebug ? "testPrivK" : "" },
    ]);

    const [error, setError] = useState(false);
    const [ks, setKS] = useState(null);
    const [success] = useState(false);
    const [loading, setLoading] = useState(false);
    const [curveType, setCurveType] = useState(curveTypes.SECP256K1);
    const toggleCurveType = () => setCurveType(s => s === curveTypes.SECP256K1 ? curveTypes.BARRETO_NAEHRIG : curveTypes.SECP256K1)

    const verifyPrivKey = async () => {
        try {
            const generatedKS = await walletUtils.generateKeystoreFromPrivK(formState.privateKey.value, "", curveType);
            setKS(generatedKS);
        } catch (ex) {
            log.error(ex);
            setError(ex.message);
        }
    }

    useEffect(() => {
        async function triggerVerifyPrivKey() {
            await verifyPrivKey();
        }

        if (loading) {
            setKS(null);
            setError(false);
            triggerVerifyPrivKey();
        }
    }, [loading]);

    useEffect(() => {
        if (ks) {
            if (!error) {
                submitFunction({
                    locked: ks,
                    password: "",
                    walletName: formState.walletName.value,
                    success: true,
                    error: false,
                });
            }
            else {
                setLoading(false);
            }
        }
    }, [ks, error, submitFunction]);

    return (

        <Form error={error} size="mini" className="max-w-md w-72 text-left" onSubmit={() => onSubmit(() => setLoading(true))}>

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
                            label={
                                <>
                                    <label className={"labelCheckbox"}>Use BN Curve</label>
                                    <Popup
                                        size="mini"
                                        position="right center"
                                        offset={"0,2"}
                                        trigger={<Icon name="question circle" className="ml-1 mb-1.5" style={{ marginRight: "-.035rem" }}/>}
                                        content="Generate public address with BN Curve"/>
                                </>
                            }
                            className="flex justify-center items-center text-xs uppercase font-bold relative top-0"
                        />
                    </label>
                }
                error={!!formState.privateKey.error && { content: formState.privateKey.error }}
            />

            <Form.Input
                label={
                    <>
                        <label className="inline text-left">Wallet Name</label>
                        <Popup
                            size="mini"
                            position="right center"
                            offset={"4,2"}
                            trigger={
                                <Icon name="question circle" className="ml-1"/>
                            }
                            content="How this wallet will be referenced"
                        />
                    </>
                }
                type="text" value={formState.walletName.value}
                onChange={e => formSetter.setWalletName(e.target.value)}
                error={!!formState.walletName.error && { content: formState.walletName.error }}
            />

            <Form.Button
                fluid
                size="small"
                basic
                loading={loading}
                className="mt-16"
                onClick={() => onSubmit(() => setLoading(true))}
                color={error ? "red" : "green"}
                disabled={success}
                content={error ? "Try Again" : success ? "Success" : submitText || "Add Wallet"}
                icon={error ? "exclamation" : success ? "checkmark" : "plus"}
            />

            <Form.Button
                fluid
                size="small"
                basic
                loading={loading}
                icon={success ? "thumbs up" : "x"}
                color={success ? "green" : "orange"}
                onClick={success ? e => e.preventDefault() : (e) => {
                    e.preventDefault();
                    cancelFunction();
                }}
                content={success ? "Success, please wait..." : cancelText}
            />

            <Message error className="absolute inset-center w-full">{error}</Message>

        </Form>

    )

}
