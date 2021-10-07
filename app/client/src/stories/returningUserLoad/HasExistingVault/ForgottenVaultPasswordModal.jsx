import React from 'react';

import { Button, Checkbox, Header, Modal } from 'semantic-ui-react';

import { classNames } from 'util/_util';

/**
 * Shows a prompt to open a modal regarding forgotten vault password
 * @prop { Boolean } incorrectPwEntered - Has the incorrect password been entered?
 * @returns
 */
export default function ForgottenVaultPasswordModal({ incorrectPwEntered }) {

    const [okWithDelete, setOkWithDelete] = React.useState(false);
    const [doubleCheck, setDoubleCheck] = React.useState(false);
    const [isOpen, setOpen] = React.useState(false);

    const toggleOkWithDelete = () => setOkWithDelete(s => !s);
    const toggleDoubleCheck = () => setDoubleCheck(s => !s);
    const toggleOpen = () => setOpen(s => !s);

    return (
        <Modal
            open={isOpen}
            onOpen={toggleOpen}
            onClose={toggleOpen}
            size="fullscreen"
            trigger={
                <p className={classNames("p-1 font-bold text-xs text-red-400 uppercase hover:text-red-600 cursor-pointer", { 'hidden': !incorrectPwEntered })}>
                    Did you forget your password?
                </p>
            }>

            <Modal.Header>

                <Header as="h4" color="red">Forgotten Vault Password</Header>

            </Modal.Header>

            <Modal.Content className="text-left">

                <p>
                    Unfortunately, forgetting your vault password is catastrophic.
                </p>

                <p>
                    Due to the secure nature of the vault, without the password <span className="italic">the wallets inside are not recoverable</span>.
                </p>

                <p>
                    It is advised to search all locations for your password before proceeding to create a new vault.
                </p>

                <p>
                    If you absolutely cannot find your password, you can delete this vault to create a new one.
                </p>

                <p>
                    Please be aware this <span className="font-bold">will remove the existing vault and it will be lost forever</span>.
                </p>

            </Modal.Content>

            <Modal.Actions className="flex justify-between items-center">

                <div className="flex flex-col gap-4 text-left">

                    <Checkbox label="I acknowledge this will delete my current vault" checked={okWithDelete} onChange={toggleOkWithDelete}/>

                    <Checkbox label="I am sure I want to create a new vault -- I don't need it" checked={doubleCheck} onChange={toggleDoubleCheck}/>

                </div>

                <Button content="Create New Vault" color="red" disabled={!okWithDelete || !doubleCheck}/>

            </Modal.Actions>

        </Modal>
    )
}