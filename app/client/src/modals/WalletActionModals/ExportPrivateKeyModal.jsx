import { Modal } from 'semantic-ui-react'
import { useSelector } from 'react-redux'

export default function ExportPrivateKeyModal() {

    const { isOpen, targetWallet } = useSelector(s => ({
        isOpen: s.modal.export_privK_modal,
        targetWallet: s.modal.wallet_action_target 
    }))

    return (

        <Modal>

            <Modal.Content>
                <Modal.Header>
                    Rename Wallet: walletNAME
                </Modal.Header>
            </Modal.Content>

        </Modal>

    )

}