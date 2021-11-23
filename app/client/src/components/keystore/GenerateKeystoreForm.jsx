import React from 'react'
import { useFormState } from 'hooks/_hooks';
import { Button, Checkbox, Form, Header, Icon } from 'semantic-ui-react';
import utils from 'util/_util.js';
import { curveTypes } from 'util/wallet.js';

/**
 * @prop { Function (keystore<JSON>, password<String>) => {...} } submitFunction -- Additional function to call after pressing "Load This Keystore" -- Most likely a redux action or history push, etc
 * @prop { Boolean } inline -- Compact the form into a single line?
 * @prop { String } defaultPassword --Default password to use? ( Mainly for debugging )
 * @prop { Boolean } showPassword -- Show the password in plain text?
 * @prop { String } customTitle -- Use a custom form title?
 * @prop { String } hideTitle -- Hide the title?
 */
export default function GenerateKeystoreForm(
    {
        cancelText,
        cancelFunction,
        submitText,
        submitFunction,
        inline,
        defaultPassword = "",
        customTitle = "Generate Keystore",
        hideTitle
    }
) {
    const [formState, formSetter, onSubmit] = useFormState([
        { name: 'password', type: 'password', value: defaultPassword, isRequired: true },
        { name: 'verifiedPassword', display: 'Verify Password', type: 'verified-password', isRequired: true }
    ]);
    const [showPassword, setShowPassword] = React.useState(false);
    const [keystoreDL, setKeystoreDL] = React.useState(false);
    const [curveType, setCurveType] = React.useState(curveTypes.SECP256K1);
    const toggleCurveType = () => setCurveType(s => (s === curveTypes.SECP256K1 ? curveTypes.BARRETO_NAEHRIG : curveTypes.SECP256K1));

    const downloadRef = React.useRef();

    // CAT TODO ADD CURVE SWITCH

    const loadKeystore = () => {
        let fr = new FileReader();
        fr.readAsText(keystoreDL.data)
        fr.onload = (res) => {
            let ksJSON = JSON.parse(res.target.result);
            if (submitFunction) {
                submitFunction(ksJSON, formState.password.value);
            }
        }
    }

    const generateWallet = async () => {
        let newStoreBlob = await utils.wallet.generateKeystore(true, formState.password.value, curveType);
        setKeystoreDL({
            filename: "MadWallet_" + Date.now() + ".json",
            data: newStoreBlob
        });
        downloadRef.current.href = URL.createObjectURL(newStoreBlob);
    }

    const setFilename = async () => {
        setKeystoreDL(s => ({
            filename: "a",
            ...s
        }));
    }

    ////////////////////
    // Inline Version // -- Deprecated -- DEBUG Menu only
    ////////////////////
    if (inline) {
        return (
            <Form size="mini" className="max-w-lg" onSubmit={e => e.preventDefault()}>

                {!hideTitle && <Header as="h4">{customTitle}</Header>}

                <Form.Group widths="equal">

                    <Form.Input
                        label={
                            <label className="flex justify-between">
                                Password
                                <Checkbox
                                    checked={curveType === curveTypes.BARRETO_NAEHRIG}
                                    onChange={toggleCurveType}
                                    label={<label className={"labelCheckbox"}>Use BN Curve</label>}
                                    className="flex justify-center items-center text-xs uppercase font-bold relative -top-0"
                                />
                            </label>
                        }
                        type={showPassword ? "text" : "password"} value={formState.password.value}
                        onChange={e => formSetter.setPassword(e.target.value)}
                        action={{ content: "Generate", size: "mini", onClick: generateWallet, icon: "refresh" }}
                    />

                    <Form.Input
                        label="Keystore Download"
                        disabled={!keystoreDL}
                        value={keystoreDL.filename}
                        onChange={setFilename}
                        action={
                            <Button.Group size="mini">
                                <Button
                                    content="Download"
                                    icon="download"
                                    size="mini"
                                    color="purple"
                                    basic ref={downloadRef}
                                    href={keystoreDL ? URL.createObjectURL(keystoreDL.data) : ""} download={keystoreDL.filename}
                                />
                                <Button.Or text="or" />
                                <Button
                                    content="Load"
                                    icon="arrow alternate circle right"
                                    labelPosition="right"
                                    color="green"
                                    basic
                                    onClick={loadKeystore}
                                />
                            </Button.Group>
                        }
                    />

                </Form.Group>

            </Form>
        )
    }

    /////////////////////
    // Column Version //
    ////////////////////
    return (<>

        <Form size="mini" className="w-96 mb-12 mini-error-form text-left">

            {!hideTitle && <Header as="h4">{customTitle}</Header>}

            <Form.Input
                size="small"
                label="Keystore Password"
                icon={<Icon name={showPassword ? "eye" : "eye slash"} onClick={() => setShowPassword(s => !s)} link />}
                type={showPassword ? "string" : "password"} value={formState.password.value}
                onChange={e => formSetter.setPassword(e.target.value)}
                error={!!formState.password.error && { content: formState.password.error }}
            />

            <Form.Input
                size="small"
                label={
                    <label className="flex justify-between">
                        Verify Keystore Password
                        <Checkbox
                            checked={curveType === curveTypes.BARRETO_NAEHRIG}
                            onChange={toggleCurveType}
                            label={<label className={"labelCheckbox"}>Use BN Curve</label>}
                            className="flex justify-center items-center text-xs uppercase font-bold relative -top-0"
                        />
                    </label>
                } 
                type={showPassword ? "string" : "password"} value={formState.verifiedPassword.value}
                onChange={e => formSetter.setVerifiedPassword(e.target.value)}
                action={{ content: "Generate", size: "mini", onClick: () => onSubmit(generateWallet), icon: "refresh", className: "w-28" }}
                error={!!formState.verifiedPassword.error && { content: formState.verifiedPassword.error }}
            />

            <Form.Input
                label="Keystore Download"
                disabled={!keystoreDL}
                value={keystoreDL.filename}
                action={{
                    content: "Download",
                    icon: "download",
                    size: "mini",
                    ref: downloadRef,
                    href: keystoreDL ? URL.createObjectURL(keystoreDL.data) : "",
                    download: keystoreDL.filename,
                    className: "w-28",
                }}
            />

        </Form>

        <div className="flex justify-between mt-12 w-96">
            <Form.Button basic content={cancelText} color="orange" onClick={cancelFunction} />
            <Form.Button disabled={!keystoreDL} color="green" basic content={submitText} onClick={loadKeystore} />
        </div>

    </>)

}