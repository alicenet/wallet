import React, { useContext, useEffect, useState } from 'react';
import { Button, Form, Header, Icon, Message, Modal } from 'semantic-ui-react'
import { useDispatch, useSelector } from 'react-redux'
import head from 'lodash/head';
import { MODAL_ACTIONS, VAULT_ACTIONS } from 'redux/actions/_actions';
import { electronStoreCommonActions } from 'store/electronStoreHelper';
import { useFormState } from 'hooks/_hooks';
import { WalletHubContext } from 'context/WalletHubContext';
import FocusTrap from 'focus-trap-react';

export default function RemoveWalletModal() {

    const dispatch = useDispatch()

    const { isOpen, targetWallet, exists, optout, wallets } = useSelector(s => ({
        isOpen: s.modal.remove_wallet_modal,
        targetWallet: s.modal.wallet_action_target,
        exists: s.vault.exists,
        optout: s.vault.optout,
        wallets: s.vault.wallets
    }));

    const [formState, formSetter, onSubmit] = useFormState([
        { name: 'password', display: 'Vault Password', type: 'password', isRequired: true }
    ]);

    const { setSelectedWallet } = useContext(WalletHubContext);

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

    // Clear on open changes
    useEffect(() => {
        formSetter.setPassword('');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    const removeWallet = async () => {
        setLoading(true);
        setError('');
        try {
            if (exists && !await electronStoreCommonActions.checkPasswordAgainstPreflightHash(formState.password.value)) {
                setLoading(false);
                return setError('Incorrect password');
            }
    
            let deleteWallet = await dispatch(VAULT_ACTIONS.removeWalletByAddress(targetWallet, formState.password.value, optout, exists));
            setLoading(false);
            if (deleteWallet.error) {
                return setError(deleteWallet.error);
            }
            else {
                closeModal();
                const walletHead = head(wallets.internal) || head(wallets.external);
                setSelectedWallet(walletHead);
            }
        } catch(exc) {
            setLoading(false);
            return setError('An Error Has Ocurred');
        }
        
    };

    const closeModal = () => {
        setLoading(false);
        setError('');
        setShowPass(false);
        dispatch(MODAL_ACTIONS.closeRemoveWalletModal())
    };

    const submit = e => {
        onSubmit(async () => {
            e.preventDefault();
            removeWallet();
        });
    };

    return (

        <Modal open={isOpen}>
            <FocusTrap>
                <div>
                    <div className="p-4">
                        <Modal.Header>
                            <Header as="h4">
                                Remove {targetWallet.isInternal ? "Internal" : "External"} Wallet: <span className="text-blue-500">{targetWallet.name}</span>
                            </Header>
                        </Modal.Header>

                        
                        <Modal.Content className="text-sm">
                        
                            {exists ?
                                <>
                                    <p>
                                        Removing a wallet is considered an administrative action.
                                    </p>
                                    <p>
                                        Please provide your vault password below to confirm this removal.
                                    </p>
                                </> :
                                <p>
                                    Please confirm before deleting
                                </p>}
                            
                                <Form
                                    error={!!error}
                                    size="small"
                                    className="mt-2"
                                    onSubmit={submit}
                                >

                                    <Form.Group>
                                        
                                            {exists && 
                                            <Form.Input
                                                width={6}
                                                type={showPass ? "text" : "password"}
                                                size="small"
                                                label="Vault Password"
                                                placeholder="Password"
                                                value={formState.password.value}
                                                onChange={e => formSetter.setPassword(e.target.value)}
                                                error={!!error}
                                                icon={<Icon name={showPass ? "eye" : "eye slash"} link onClick={() => setShowPass(s => !s)} />}
                                            />}
                                        
                                    </Form.Group>

                                </Form>
                            

                            {error && <Message color={error ? "red" : "purple"}>{error}</Message>}
                            
                        </Modal.Content>
                    </div>
                                      
                    <Modal.Actions className="border-solid border-t-1 border-b-0 border-l-0 border-r-0 border-gray-300 bg-gray-100 p-4">
                            <div className="flex justify-between">
                                <Button size="small" className="transparent" content="Close" onClick={closeModal} basic />
                                <Button size="small" content={error ? "Try Again" : "Delete Wallet"} color="teal" onClick={removeWallet} loading={loading && !error} disabled={!formState.password.value}/>
                            </div>
                    </Modal.Actions> 
                </div>
            </FocusTrap>

        </Modal>

    )

}