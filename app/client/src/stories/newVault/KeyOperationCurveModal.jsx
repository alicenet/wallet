import React from 'react';

import { Button, Container, Header, Modal } from 'semantic-ui-react';

function KeyOperationCurveModal({ children }) {

    const [openModal, setOpenModal] = React.useState(false)

    return (
        <Modal
            onClose={() => setOpenModal(false)}
            onOpen={() => setOpenModal(true)}
            open={openModal}
            dimmer="inverted"
            trigger={children}
        >

            <Modal.Content>

                <Modal.Description className="flex flex-col items-center gap-10">

                    <Header content="Key Operation Curve" as="h3" className="my-0"/>

                    <Container className="flex flex-auto flex-col gap-3 p-5 text-center">

                        <p>Mad Wallet allows you to set the default ECC for generating the key pair.</p>

                        <p>ECC types are set on a per vault basis and will be used for all wallets
                            generated with this seed.</p>

                        <p>If you change from the default type, make a note of it for when you import
                            your seed for recovery.</p>

                        <p>Additional wallets of the opposing type can be generated or imported if
                            necessary, but will not be recoverable by the vault seed phrase.</p>

                    </Container>

                    <Button color="purple" onClick={() => setOpenModal(false)} content="Got it!"/>

                </Modal.Description>

            </Modal.Content>

        </Modal>
    )

}

export default KeyOperationCurveModal;
