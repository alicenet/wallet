import React, { useEffect, useRef, useState } from 'react';
import { Button, Form, Header, Icon, Modal } from 'semantic-ui-react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormState } from 'hooks/_hooks';
import { MODAL_ACTIONS } from 'redux/actions/_actions';
import { electronStoreCommonActions } from 'store/electronStoreHelper';
import utils from 'util/_util';

export default function ExportKeystoreModal() {

    const dispatch = useDispatch();

    const { isOpen, targetWallet, optout } = useSelector(s => ({
        isOpen: s.modal.export_ks_modal,
        targetWallet: s.modal.wallet_action_target,
        optout: s.vault.optout,
    }));

    const [showPass, setShowPass] = useState(false);
    const [keyVisible, setKeyVisible] = useState(false);
    const [keystoreDL, setKeystoreDL] = useState(false);
    const [storePassVisible, setStorePassVisible] = useState(false);

    const [formState, formSetter, onSubmit] = useFormState([
        { name: 'vaultPassword', display: 'Vault Password', type: 'password', isRequired: true },
        { name: 'keystorePassword', display: 'Keystore Password', type: 'password', isRequired: true },
    ]);

    // Download keystore reference
    const downloadRef = useRef();

    const generateWallet = async () => {
        const newStoreBlob = await utils.wallet.generateKeystoreFromPrivK(targetWallet.privK, formState.keystorePassword.value, targetWallet.curve, true);
        setKeystoreDL({
            filename: "MadWallet_" + targetWallet.name + ".json",
            data: newStoreBlob
        });
        downloadRef.current.href = URL.createObjectURL(newStoreBlob);
    };

    useEffect(() => {
        if (formState.vaultPassword.isRequired !== !optout) {
            formSetter.setVaultPasswordIsRequired(!optout);
        }
    }, [formSetter, optout]);

    // Clear on open changes
    useEffect(() => {
        formSetter.setVaultPassword("");
        formSetter.setKeystorePassword("");
        setKeystoreDL("");
        setStorePassVisible(false);
        setKeyVisible(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    const downloadKeystore = async () => {
        if (!optout && !await electronStoreCommonActions.checkPasswordAgainstPreflightHash(formState.vaultPassword.value)) {
            formSetter.setVaultPasswordError("Incorrect password");
            return setKeyVisible(false);
        }

        // Download KS Logic
        await generateWallet();
    };

    const closeModal = () => {
        dispatch(MODAL_ACTIONS.closeExportKeyStoreModal())
    };

    const submit = e => {
        onSubmit(async () => {
            e.preventDefault();
            downloadKeystore();
        });
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
                    error={!!formState.keystorePassword.error || !!formState.vaultPassword.error}
                    size="small"
                    className="mt-2"
                    onSubmit={submit}
                >

                    <Form.Group>

                        {!optout && <Form.Input
                            width={6}
                            type={showPass ? "text" : "password"}
                            size="small"
                            label="Vault Password"
                            placeholder="Vault Password"
                            value={formState.vaultPassword.value}
                            onChange={e => formSetter.setVaultPassword(e.target.value)}
                            error={!!formState.vaultPassword.error && { content: formState.vaultPassword.error }}
                            icon={
                                <Icon color={keyVisible ? "green" : "black"} name={showPass ? "eye" : "eye slash"} link onClick={() => setShowPass(s => !s)} />
                            } />
                        }

                        <Form.Input
                            width={6}
                            type={storePassVisible ? "text" : "password"}
                            value={formState.keystorePassword.value}
                            error={!!formState.keystorePassword.error && { content: formState.keystorePassword.error }}
                            label="Keystore Password"
                            placeholder="Keystore Password"
                            onChange={e => formSetter.setKeystorePassword(e.target.value)}
                            icon={
                                <Icon color={"black"} name={storePassVisible ? "eye" : "eye slash"} link onClick={() => setStorePassVisible(s => !s)} />
                            }
                        />

                    </Form.Group>

                </Form>

            </Modal.Content>

            <Modal.Actions>

                <div className="flex justify-between">

                    <Button size="small" className="transparent" content="Close" onClick={closeModal} basic />

                    <Button
                        size="small"
                        ref={downloadRef}
                        href={keystoreDL ? URL.createObjectURL(keystoreDL.data) : ""} download={keystoreDL.filename}
                        content={(!optout && formState.vaultPassword.error) || formState.keystorePassword.error ? "Try Again" : keystoreDL ? "Download Keystore" : "Create Keystore"}
                        color="teal"
                        onClick={keystoreDL ? closeModal : submit}
                    />

                </div>

            </Modal.Actions>

        </Modal>
    )

}
