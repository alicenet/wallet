import React from 'react';
import { Button, Checkbox, Header, Modal } from 'semantic-ui-react';
import { electronStoreUtilityActions } from 'store/electronStoreHelper';
import { useSelector } from 'react-redux';
import { MODAL_ACTIONS } from 'redux/actions/_actions';
import { useDispatch } from 'react-redux';

/**
 * Shows a prompt to open a modal regarding forgotten vault password
 * @prop { Boolean } incorrectPwEntered - Has the incorrect password been entered?
 * @returns
 */
export default function ResetWalletModal() {

    const [okWithDelete, setOkWithDelete] = React.useState(false);
    const [doubleCheck, setDoubleCheck] = React.useState(false);

    const dispatch = useDispatch();
    const { isOpen } = useSelector(state => ({ isOpen: state.modal.reset_wallet_modal }));

    const toggleOkWithDelete = () => setOkWithDelete(s => !s);
    const toggleDoubleCheck = () => setDoubleCheck(s => !s);

    const [resetting, setResetting] = React.useState(false);

    const toggleOpen = () => {
        return isOpen ? dispatch(MODAL_ACTIONS.closeResetWalletModal()) : dispatch(MODAL_ACTIONS.openResetWalletModal());
    };

    const deleteTheVault = async () => {
        setResetting(true);
        await electronStoreUtilityActions.completelyDeleteElectronStore();
        window.location.reload(true);
    }

    return (
        <Modal
            open={isOpen}
            onOpen={toggleOpen}
            onClose={toggleOpen}
            size="fullscreen"
        >

            <Modal.Header>

                <Header as="h4" color="red">Full Wallet Reset</Header>

            </Modal.Header>

            <Modal.Content className="text-left">

                <p>
                    On this page you can completely reset MadWallet to its initial settings.
                </p>

                <p>
                    This action will completely remove any vaults associated with MadWallet, as well as any stored settings.
                </p>

                <p>
                    Please make sure you backup any keys that you would like to backup before proceeding with this.
                </p>

                <p>
                    As a safe guard this action does not remove the latest backup (.bak) file and should be done manually.
                </p>

                <p>
                    Please be aware this <span className="font-bold">will remove the existing vault and it will be lost forever</span>.
                </p>

            </Modal.Content>

            <Modal.Actions className="flex justify-between items-center">

                <div className="flex flex-col gap-4 text-left">

                    <Checkbox label="I acknowledge this will delete my current vault" checked={okWithDelete} onChange={toggleOkWithDelete} />

                    <Checkbox label="I want to reset the wallet" checked={doubleCheck} onChange={toggleDoubleCheck} />

                </div>

                <Button loading={resetting} content="Reset Wallet" color="red" disabled={!okWithDelete || !doubleCheck} onClick={deleteTheVault} />

            </Modal.Actions>

        </Modal>
    )
}