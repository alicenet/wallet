import React from 'react'
import { useFormState } from 'hooks/_hooks';
import { Header, Form, Message } from 'semantic-ui-react';
import { useDispatch } from 'react-redux';
import utils from '../../util/_util.js';
import { classNames } from 'util/generic.js';

/**
 * @prop LoadKeystoreCB -- Additional function to call after pressing "Load This Keystore" -- Most likely a redux action or history push, etc
 */
export default function LoadKeystoreForm({ LoadKeystoreCB }) {

    const [formState, formSetter] = useFormState(["password"])
    const [keystoreDL, setKeystoreDL] = React.useState(false);

    const downloadRef = React.useRef();

    const loadKeystore = () => {
        let fr = new FileReader();
        fr.readAsText(keystoreDL.data)
        fr.onload = (res) => {
            let ksJSON = JSON.parse(res.target.result);
            console.log(ksJSON);
            if (LoadKeystoreCB) {
                LoadKeystoreCB();
            }
        }
    }

    const generateWallet = async () => {
        let newStoreBlob = await utils.wallet.generateKeystore(true, formState.password.value);
        setKeystoreDL({
            filename: "MadNet-Wallet_" + Date.now() + ".json",
            data: newStoreBlob
        });
        downloadRef.current.href = URL.createObjectURL(newStoreBlob);
    }

    return (

        <Form size="mini" >

            <Header as="h4">Generate A Keystore</Header>

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