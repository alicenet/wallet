import React, { useEffect, useState } from 'react';
import { Button, Form, Header, Icon, Modal, Placeholder } from 'semantic-ui-react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormState } from 'hooks/_hooks';
import { stringUtils } from 'util/_util';
import { MODAL_ACTIONS } from 'redux/actions/_actions';
import { electronStoreCommonActions } from 'store/electronStoreHelper';
import utils from 'util/_util';

export default function ExportPrivateKeyModal() {

    const dispatch = useDispatch()

    const { isOpen, targetWallet } = useSelector(s => ({
        isOpen: s.modal.export_privK_modal,
        targetWallet: s.modal.wallet_action_target,
    }))

    const [showPass, setShowPass] = useState(false);
    const [keyVisible, setKeyVisible] = useState(false);

    const [visibleTime, setVisibleTime] = useState(0);
    const [copyClick, setCopyClick] = useState(0);

    const [formState, formSetter, onSubmit] = useFormState([
        { name: 'vaultPassword', display: 'Vault Password', type: 'password', isRequired: true }
    ]);

    // Countdown for visibility
    useEffect(() => {
        if (visibleTime !== 0 && visibleTime > 0 && visibleTime < 15) {
            setTimeout(() => {
                setVisibleTime(s => s - 1)
            }, 1000)
        }
    }, [visibleTime])

    // Clear on open changes
    useEffect(() => {
        setKeyVisible(false);
        setVisibleTime(0);
        formSetter.setVaultPassword("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen])

    const showKey = async () => {
        if (!formState.vaultPassword) {
            return formSetter.setVaultPassword(state => ({ ...state, error: "Password required." }))
        }
        if (!await electronStoreCommonActions.checkPasswordAgainstPreflightHash(formState.vaultPassword.value)) {
            formSetter.setVaultPassword(state => ({ ...state, error: "Incorrect password" }))
            return setKeyVisible(false);
        }
        setKeyVisible(true);
        setVisibleTime(14);
        formSetter.setVaultPassword(state => ({ ...state, value: "" }));
        setTimeout(() => {
            setKeyVisible(false);
        }, 14000)
    }

    const closeModal = () => {
        dispatch(MODAL_ACTIONS.closeExportPrivateKeyModal())
    };

    const copyPkey = () => {
        setCopyClick(true);
        utils.generic.copyToClipboard(targetWallet.privK);
        setTimeout(() => {
            setCopyClick(false);
        }, 2150)
    }

    const submit = e => {
        onSubmit( async () => {
            e.preventDefault();
            showKey();
        });
    }

    return (

        <Modal open={isOpen}>

            <Modal.Header>
                <Header as="h4">
                    Show Private Key For Wallet: <span className="text-blue-500">{targetWallet.name}</span>
                    <Header.Subheader>
                        Showing PrivK For Address: <span className="text-purple-500">{stringUtils.splitStringWithEllipsis(targetWallet.address, 4)}</span>
                    </Header.Subheader>
                </Header>
            </Modal.Header>

            <Modal.Content className="text-sm">

                <p>
                    Showing your private key is considered an administrative action.
                </p>
                <p>
                    Please provide your vault password below to show your private key for 15 seconds.
                </p>

                <div className="mt-2">
                    <Header>Your Private Key
                        <span className="text-xs ml-4 text-gray-400">
                            {visibleTime !== 0 && "Vanishing in " + String(visibleTime)}
                        </span>
                    </Header>
                </div>

                {keyVisible ? (<div className="h-10 flex items-center cursor-pointer hover:text-gray-600" onClick={copyPkey}>
                        {targetWallet.privK}
                        <Icon name="copy outline" className="ml-1 mb-2 cursor-pointer"/>
                        {!!copyClick && (
                            <div className="relative inline text-xs mb-2 text-gray-500">
                                Copied to clipboard!
                            </div>
                        )}
                    </div>) :
                    <Placeholder className="h-10">
                        <Placeholder.Line/>
                    </Placeholder>
                }

                <Form
                    error={!!formState.vaultPassword.error}
                    size="small"
                    className="mt-2"
                    onSubmit={submit}
                >

                    <Form.Group>

                        <Form.Input
                            width={6}
                            type={showPass ? "text" : "password"}
                            size="small"
                            label="Vault Password"
                            placeholder="Vault Password"
                            value={formState.vaultPassword.value}
                            onChange={e => formSetter.setVaultPassword(e.target.value)}
                            error={!!formState.vaultPassword.error && { content: formState.vaultPassword.error }}
                            icon={
                                <Icon
                                    color={keyVisible ? "green" : "black"}
                                    name={keyVisible ? "thumbs up" : showPass ? "eye" : "eye slash"}
                                    link
                                    onClick={keyVisible ? null : () => setShowPass(s => !s)}
                                />
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
                        content={formState.vaultPassword.error ? "Try Again" : "Show Key"}
                        disabled={visibleTime !== 0}
                        color={formState.vaultPassword.error ? "red" : "purple"}
                        basic
                        onClick={showKey}
                    />
                </div>

            </Modal.Actions>

        </Modal>

    )

}