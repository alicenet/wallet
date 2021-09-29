import React from 'react'
import { useFormState } from 'hooks/_hooks';
import { Header, Form, Button } from 'semantic-ui-react';
import utils from '../../util/_util.js';

/**
 * @prop { Function (keystore<JSON>, password<String>) => {...} } loadKeystoreCB -- Additional function to call after pressing "Load This Keystore" -- Most likely a redux action or history push, etc
 * @prop { Boolean } inline -- Compact the form into a single line?
 * @prop { String } defaultPassword --Default password to use? ( Mainly for debugging )
 * @prop { Boolean } showPassword -- Show the password in plain text?
 */
export default function GenerateKeystoreForm({ loadKeystoreCB, inline, defaultPassword = "", showPassword = false }) {

    const [formState, formSetter] = useFormState(["password"])
    const [keystoreDL, setKeystoreDL] = React.useState(false);

    const downloadRef = React.useRef();

    // Set defaults
    React.useEffect(() => {
        formSetter.setPassword(defaultPassword);
    }, []); // eslint-disable-line

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
        let newStoreBlob = await utils.wallet.generateKeystore(true, formState.password.value);
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
            <Form size="mini" className="max-w-lg" >

                <Header as="h4">Generate Keystore</Header>

                <Form.Group widths="equal">

                    <Form.Input
                        label="Keystore Password"
                        type={showPassword ? "text" : "password"} value={formState.password.value}
                        onChange={e => formSetter.setPassword(e.target.value)}
                        action={{ content: "Generate", size: "mini", onClick: generateWallet, icon: "refresh" }}
                    />

                    <Form.Input label="Keystore Download" disabled={!keystoreDL} value={keystoreDL.filename} onChange={setFilename}
                        action={
                            <Button.Group size="mini">
                                <Button content="Download" icon="download" size="mini" color="purple" basic ref={downloadRef} href={keystoreDL ? URL.createObjectURL(keystoreDL.data) : ""} download={keystoreDL.filename} />
                                <Button.Or text="or" />
                                <Button content="Load" icon="arrow alternate circle right" labelPosition="right" color="green" basic onClick={loadKeystore} />
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

        <Form size="mini" className="max-w-lg" >

            <Header as="h4">Generate Keystore</Header>

            <Form.Input
                label="Keystore Password"
                type="password" value={formState.password.value}
                onChange={e => formSetter.setPassword(e.target.value)}
                action={{ content: "Generate", size: "mini", onClick: generateWallet, icon: "refresh", className: "w-28" }}
            />

            <Form.Input label="Keystore Download" disabled={!keystoreDL} value={keystoreDL.filename}
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