import React from 'react';
import { Button, Header, Modal } from 'semantic-ui-react';
import { classNames } from "../../../util/_util";

/**
 * Shows a prompt to open a modal regarding forgotten vault password
 * @prop { Boolean } incorrectPwEntered - Has the incorrect password been entered?
 * @returns
 */
export default function ForgottenKeystorePasswordModal({ incorrectPwEntered }) {

    const [isOpen, setOpen] = React.useState(false);

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

                <Header as="h4" color="red">Forgotten Keystore Passwords</Header>

            </Modal.Header>

            <Modal.Content className="text-left">

                <p>
                    Unfortunately, forgetting your keystore password is catastrophic.
                </p>

                <p>
                    Due to the secure nature of keystores, without the password <span className="italic">the wallets inside are not recoverable</span>.
                </p>

                <p>
                    It is advised to search all locations for your password before proceeding to create a new keystore.
                </p>

            </Modal.Content>

            <Modal.Actions className="">

                <Button content="Close" color="orange" onClick={() => toggleOpen(false)} />

            </Modal.Actions>

        </Modal>
    )
}