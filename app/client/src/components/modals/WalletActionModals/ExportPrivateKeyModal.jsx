import React, { useEffect, useState } from 'react';
import { Button, Form, Header, Icon, Modal, Placeholder } from 'semantic-ui-react'
import { useDispatch, useSelector } from 'react-redux'
import { stringUtils } from 'util/_util'
import { MODAL_ACTIONS } from 'redux/actions/_actions';
import { electronStoreCommonActions } from 'store/electronStoreHelper';
import copy from 'copy-to-clipboard';

export default function ExportPrivateKeyModal() {

    const dispatch = useDispatch()

    const { isOpen, targetWallet } = useSelector(s => ({
        isOpen: s.modal.export_privK_modal,
        targetWallet: s.modal.wallet_action_target,
    }))

    const [password, setPassword] = useState({ value: "", error: "" });
    const [showPass, setShowPass] = useState(false);
    const [keyVisible, setKeyVisible] = useState(false);

    const [visibleTime, setVisibleTime] = useState(0);
    const [copyClick, setCopyClick] = useState(0);

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
        setPassword("");
    }, [isOpen])

    const showKey = async () => {
        if (!password) {
            return setPassword(state => ({ ...state, error: "Password required." }))
        }
        if (!await electronStoreCommonActions.checkPasswordAgainstPreflightHash(password.value)) {
            setPassword(state => ({ ...state, error: "Incorrect password" }))
            return setKeyVisible(false);
        }
        setKeyVisible(true);
        setVisibleTime(14);
        setPassword(state => ({ ...state, value: "" }));
        setTimeout(() => {
            setKeyVisible(false);
        }, 14000)
    }

    const closeModal = () => {
        dispatch(MODAL_ACTIONS.closeExportPrivateKeyModal())
    };

    const copyPkey = () => {
        setCopyClick(true);
        copy(targetWallet.privK);
        setTimeout(() => {
            setCopyClick(false);
        }, 2150)
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
                    error={!!password.error}
                    size="small"
                    className="mt-2"
                    onSubmit={(e) => {
                        e.preventDefault();
                        showKey();
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
                        content={password.error ? "Try Again" : "Show Key"}
                        disabled={visibleTime !== 0}
                        color={password.error ? "red" : "purple"}
                        basic
                        onClick={showKey}
                    />
                </div>

            </Modal.Actions>

        </Modal>

    )

}