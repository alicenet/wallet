import React, { useEffect, useState } from 'react';
import { Button, Form, Header, Message, Modal } from 'semantic-ui-react';
import { useDispatch, useSelector } from 'react-redux';

import { stringUtils } from 'util/_util';
import { useFormState } from 'hooks/_hooks';
import { MODAL_ACTIONS, VAULT_ACTIONS } from 'redux/actions/_actions';
import { electronStoreCommonActions } from 'store/electronStoreHelper';
import FocusTrap from 'focus-trap-react';

export default function RenameWalletModal() {

    const dispatch = useDispatch()

    const { isOpen, targetWallet } = useSelector(s => ({
        isOpen: s.modal.rename_wallet_modal,
        targetWallet: s.modal.wallet_action_target,
    }));

    const [formState, formSetter, onSubmit] = useFormState([
        { name: 'name', display: 'Wallet Name', type: 'string', isRequired: true },
        { name: 'password', display: "Password", type: 'string', isRequired: true },
    ]);

    // Anytime open changes, clear forms
    useEffect(() => {
        formSetter.setName("");
        formSetter.setPassword("");
    }, [isOpen]); // eslint-disable-line

    const closeModal = () => {
        dispatch(MODAL_ACTIONS.closeRenameWalletModal());
    };

    const [error, setError] = useState();
    const [loading, setLoading] = useState(false);

    const updateName = async () => {
        setLoading(true);
        if (!await electronStoreCommonActions.checkPasswordAgainstPreflightHash(formState.password.value)) {
            setLoading(false);
            return formSetter.setPasswordError("Incorrect password");
        }
        let renamed = await dispatch(VAULT_ACTIONS.renameWalletByAddress(targetWallet, formState.name.value, formState.password.value));
        setLoading(false);
        if (renamed.error) {
            return setError(renamed.error);
        }
        else {
            closeModal();
        }
    }

    return (

        <Modal open={isOpen} onClose={closeModal}>
            <FocusTrap>
                <div>
                    <div className="p-4">

                        <Modal.Header>
                            <Header as="h4">
                                Rename Wallet: <span className="text-blue-500">{targetWallet.name}</span>
                                <Header.Subheader>
                                    Give a friendly name in reference to address: <span className="text-purple-500">{stringUtils.splitStringWithEllipsis(targetWallet.address, 4)}</span>
                                </Header.Subheader>
                            </Header>
                        </Modal.Header>

                        <Modal.Content className="text-sm">

                            <p>
                                Renaming your wallet is considered an administrative action.
                            </p>
                            <p>
                                Please provide your vault password and desired wallet name below.
                            </p>

                            <Form
                                error={!!error}
                                size="small"
                                className="mt-8"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    onSubmit(updateName);
                                }}
                            >

                                <Form.Group>

                                    <Form.Input
                                        width={10}
                                        size="small"
                                        label="New Wallet Name"
                                        placeholder="Wallet #2"
                                        value={formState.name.value}
                                        onChange={e => formSetter.setName(e.target.value)}
                                        error={!!formState.name.error && { content: formState.name.error }}
                                    />
                                    <Form.Input
                                        width={6}
                                        type="password"
                                        size="small"
                                        label="Vault Password"
                                        placeholder="Password"
                                        value={formState.password.value}
                                        onChange={e => formSetter.setPassword(e.target.value)}
                                        error={!!formState.password.error && { content: formState.password.error }}
                                    />

                                </Form.Group>

                                <Message error size="mini" content="test"/>

                            </Form>

                        </Modal.Content>
                    </div>

                    <Modal.Actions className="border-solid border-t-1 border-b-0 border-l-0 border-r-0 border-gray-300 bg-gray-100 p-4">

                        <div className="flex justify-between">

                            <Button
                                size="small"
                                className="transparent"
                                content="Close"
                                onClick={closeModal}
                                basic
                            />

                            <Button
                                size="small"
                                content={error ? "Try Again" : "Save Wallet Name"}
                                color="teal"
                                onClick={() => onSubmit(updateName)}
                                loading={loading}
                            />

                        </div>

                    </Modal.Actions>
                </div>
            </FocusTrap>
        </Modal>

    )

}