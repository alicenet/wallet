import React, { useEffect, useRef, useState } from 'react';
import { Button, Form, Header, Icon, Modal } from 'semantic-ui-react'
import { useDispatch, useSelector } from 'react-redux'
import { MODAL_ACTIONS } from 'redux/actions/_actions';
import { electronStoreCommonActions } from 'store/electronStoreHelper';
import utils from 'util/_util';

export default function ExportKeystoreModal() {

    const dispatch = useDispatch()

    const { isOpen, targetWallet } = useSelector(s => ({
        isOpen: s.modal.export_ks_modal,
        targetWallet: s.modal.wallet_action_target,
    }))

    const [password, setPassword] = useState({ value: "", error: "" });
    const [showPass, setShowPass] = useState(false);
    const [keyVisible, setKeyVisible] = useState(false);
    const [keystorePass, setKeystorePass] = useState("");
    const [keystoreDL, setKeystoreDL] = useState(false);
    const [storePassVisible, setStorePassVisible] = useState(false);

    // Download keystore reference
    const downloadRef = useRef();

    const generateWallet = async () => {
        let newStoreBlob = await utils.wallet.generateKeystoreFromPrivK(targetWallet.privK, keystorePass.value, targetWallet.curve, true);
        setKeystoreDL({
            filename: "MadWallet_" + targetWallet.name + ".json",
            data: newStoreBlob
        });
        downloadRef.current.href = URL.createObjectURL(newStoreBlob);
    }

    // Clear on open changes
    useEffect(() => {
        setPassword("");
        setKeystoreDL("");
        setKeystorePass("");
        setStorePassVisible(false);
        setKeyVisible(false);
    }, [isOpen])

    const downloadKeystore = async () => {
        if (!password) {
            return setPassword(state => ({ ...state, error: "Password required." }))
        }
        if (!await electronStoreCommonActions.checkPasswordAgainstPreflightHash(password.value)) {
            setPassword(state => ({ ...state, error: "Incorrect password" }))
            return setKeyVisible(false);
        }
        if (!keystorePass) {
            return setKeystorePass({ error: "Must have a password" })
        }

        // Download KS Logic
        await generateWallet();
    }

    const closeModal = () => {
        dispatch(MODAL_ACTIONS.closeExportKeyStoreModal())
    };

    return (

        <Modal open={isOpen}>

            <Modal.Header>
                <Header as="h4">
                    Export Keystore For Wallet: <span className="text-blue-500">{targetWallet.name}</span>
                </Header>
            </Modal.Header>

            <Modal.Content className="text-sm">

                <p>
                    Exporting a wallet keystore is considered an administrative action.
                </p>
                <p>
                    Please provide your vault password below as well as a password for the exported keystore.
                </p>
                <p>
                    There are no restrictions on this password, but it should be strong.
                </p>

                <Form
                    error={!!keystorePass.error || !!password.error}
                    size="small"
                    className="mt-2"
                    onSubmit={(e) => {
                        e.preventDefault();
                        downloadKeystore();
                    }}
                >

                    <Form.Group>

                        <Form.Input
                            width={6}
                            type={showPass ? "text" : "password"}
                            size="small"
                            label="Vault Password"
                            placeholder="Password"
                            value={password.value}
                            onChange={e => setPassword({ value: e.target.value })}
                            error={!!password.error && { content: password.error }}
                            icon={
                                <Icon color={keyVisible ? "green" : "black"} name={showPass ? "eye" : "eye slash"} link onClick={() => setShowPass(s => !s)}/>
                            }
                        />

                        <Form.Input
                            width={6}
                            type={storePassVisible ? "text" : "password"}
                            value={keystorePass.value}
                            error={!!keystorePass.error && { content: keystorePass.error }}
                            label="Keystore Password"
                            onChange={e => setKeystorePass({ value: e.target.value, error: "" })}
                            icon={
                                <Icon color={"black"} name={storePassVisible ? "eye" : "eye slash"} link onClick={() => setStorePassVisible(s => !s)}/>
                            }
                        />

                    </Form.Group>

                </Form>

            </Modal.Content>

            <Modal.Actions>

                <div className="flex justify-between">
                    <Button size="small" color="orange" content="Close" onClick={closeModal} basic/>
                    <Button
                        size="small"
                        ref={downloadRef}
                        href={keystoreDL ? URL.createObjectURL(keystoreDL.data) : ""} download={keystoreDL.filename}
                        content={password.error || keystorePass.error ? "Try Again" : keystoreDL ? "Download Keystore" : "Create Keystore"}
                        color={password.error || keystorePass.error ? "red" : keystoreDL ? "green" : "purple"}
                        basic onClick={keystoreDL ? closeModal : downloadKeystore}
                    />
                </div>

            </Modal.Actions>

        </Modal>
    )

}