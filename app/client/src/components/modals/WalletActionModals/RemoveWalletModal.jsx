import React from 'react';
import { Modal, Header, Form, Icon, Button } from 'semantic-ui-react'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux';
import { MODAL_ACTIONS } from 'redux/actions/_actions';

export default function ExportPrivateKeyModal() {

    const dispatch = useDispatch()

    const { isOpen, targetWallet, vaultExists } = useSelector(s => ({
        isOpen: s.modal.remove_wallet_modal,
        targetWallet: s.modal.wallet_action_target,
        vaultExists: s.vault.exists,
    }))

    const [password, setPassword] = React.useState({ value: "", error: "" });
    const [showPass, setShowPass] = React.useState(false);

    // Clear on open changes
    React.useEffect(() => {
        setPassword("");
    }, [isOpen])

    const removeWallet = async () => {
        // => TBD
    }

    const closeModal = () => {
        dispatch(MODAL_ACTIONS.closeRemoveWalletModal())
    };

    return (

        <Modal open={isOpen}>

            <Modal.Header>
                <Header as="h4">
                    Remove {targetWallet.isInternal ? "Internal" : "External" } Wallet: <span className="text-blue-500">{targetWallet.name}</span>
                </Header>
            </Modal.Header>

            <Modal.Content className="text-sm">
                <p>
                    Removing a wallet is considered an administrative action.
                </p>
                <p>
                    Please provide your {vaultExists ? "vault" : "administrative"} password below to confirm this removal.
                </p>

                <Form error={!!password.error} size="small" className="mt-2" onSubmit={(e) => { e.preventDefault(); removeWallet(); }}>

                    <Form.Group widths>

                        <Form.Input width={6} type={showPass ? "text" : "password"} size="small" label={(vaultExists ? "Vault " : "Admin ") + "Password"} placeholder="Password"
                            value={password.value}
                            onChange={e => setPassword({ value: e.target.value })}
                            error={!!password.error && { content: password.error }}
                            icon={<Icon name={showPass ? "eye" : "eye slash"} link onClick={() => setShowPass(s => !s)}/>}
                        />

                    </Form.Group>

                </Form>

            </Modal.Content>

            <Modal.Actions>

                <div className="flex justify-between">
                    <Button size="small" color="orange" content="Close" onClick={closeModal} basic />
                    <Button size="small" content={password.error ? "Try Again" : "Delete Wallet"} color={password.error ? "red" : "purple"} basic onClick={removeWallet} />
                </div>

            </Modal.Actions>

        </Modal>

    )

}