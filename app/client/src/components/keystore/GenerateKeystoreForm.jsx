import React from 'react'
import { useFormState } from 'hooks/_hooks';
import { Button, Checkbox, Form, Header } from 'semantic-ui-react';
import utils from 'util/_util.js';
import { curveTypes } from 'util/wallet.js';

/**
 * @prop { Function (keystore<JSON>, password<String>) => {...} } loadKeystoreCB -- Additional function to call after pressing "Load This Keystore" -- Most likely a redux action or history push, etc
 * @prop { Boolean } inline -- Compact the form into a single line?
 * @prop { String } defaultPassword --Default password to use? ( Mainly for debugging )
 * @prop { Boolean } showPassword -- Show the password in plain text?
 * @prop { String } customTitle -- Use a custom form title?
 */
export default function GenerateKeystoreForm({ loadKeystoreCB, inline, defaultPassword = "", showPassword = false, customTitle = "Generate Keystore" }) {

    const [formState, formSetter] = useFormState([{ name: 'password', type: 'password', value: defaultPassword, isRequired: true }]);
    const [keystoreDL, setKeystoreDL] = React.useState(false);
    const [curveType, setCurveType] = React.useState(curveTypes.SECP256K1);
    const toggleCurveType = () => setCurveType(s => (s === curveTypes.SECP256K1 ? curveTypes.BARRETO_NAEHRIG : curveTypes.SECP256K1));

    const downloadRef = React.useRef();

    // TODO ADD CURVE SWITCH

    const loadKeystore = () => {
        let fr = new FileReader();
        fr.readAsText(keystoreDL.data)
        fr.onload = (res) => {
            let ksJSON = JSON.parse(res.target.result);
            if (loadKeystoreCB) {
                loadKeystoreCB(ksJSON, formState.password.value);
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

    const setFilename = async (e) => {
        setKeystoreDL(s => ({
            filename: "a",
            ...s
        }));
    }

    ////////////////////
    // Inline Version //
    ////////////////////
    if (inline) {
        return (
            <Form size="mini" className="max-w-lg">

                <Header as="h4">{customTitle}</Header>

                <Form.Group widths="equal">

                    <Form.Input
                        label={
                            <label className="flex justify-between">Password
                                <Checkbox checked={curveType === curveTypes.BARRETO_NAEHRIG} onChange={toggleCurveType}
                                          label={<label className={"labelCheckbox"}>Use BN Curve</label>}
                                          className="flex justify-center items-center text-xs uppercase font-bold relative -top-0"/>
                            </label>}
                        type={showPassword ? "text" : "password"} value={formState.password.value}
                        onChange={e => formSetter.setPassword(e.target.value)}
                        action={{ content: "Generate", size: "mini", onClick: generateWallet, icon: "refresh" }}
                    />

                    <Form.Input label="Keystore Download" disabled={!keystoreDL} value={keystoreDL.filename} onChange={setFilename}
                                action={
                                    <Button.Group size="mini">
                                        <Button content="Download" icon="download" size="mini" color="purple" basic ref={downloadRef}
                                                href={keystoreDL ? URL.createObjectURL(keystoreDL.data) : ""} download={keystoreDL.filename}/>
                                        <Button.Or text="or"/>
                                        <Button content="Load" icon="arrow alternate circle right" labelPosition="right" color="green" basic onClick={loadKeystore}/>
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
    return (

        <Form size="mini" className="max-w-lg">

            <Header as="h4">{customTitle}</Header>

            <Form.Input
                label="Keystore Password"
                type="password" value={formState.password.value}
                onChange={e => formSetter.setPassword(e.target.value)}
                action={{ content: "Generate", size: "mini", onClick: generateWallet, icon: "refresh", className: "w-28" }}
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

            <Form.Button color="green" basic className="mt-6"
                         content="Load This Keystore" onClick={loadKeystore}
            />

        </Form>

    )

}