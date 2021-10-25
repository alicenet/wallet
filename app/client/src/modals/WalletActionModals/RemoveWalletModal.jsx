import { Modal } from 'semantic-ui-react'
import { useSelector } from 'react-redux'

export default function RemoveWalletModal() {

    const { isOpen, targetWallet } = useSelector(s => ({
        isOpen: s.modal.remove_wallet_modal,
        targetWallet: s.modal.wallet_action_target 
    }))

    return (

        <Modal open={isOpen}>

            <Modal.Content>
                <Modal.Header>
                    Rename Wallet: walletNAME
                </Modal.Header>
            </Modal.Content>

        </Modal>

    )

}