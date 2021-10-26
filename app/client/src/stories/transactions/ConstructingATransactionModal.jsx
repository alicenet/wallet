import React from 'react';
import { Button, Container, Header, Modal } from 'semantic-ui-react';

function ConstructingATransactionModal({ children }) {

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

                    <Header content="Constructing a Transaction" as="h3" className="my-0"/>

                    <Container className="flex flex-auto flex-col gap-3 p-5 text-center">

                        <p>On this page you will have the ability to construct a transaction by choosing between <strong>data stores</strong> and <strong>value stores</strong>.</p>

                        <p>A single transaction can have up to 128 stores of either types.</p>

                        <p><strong>Value stores</strong> will be used to transfer MadBytes from one address to another while, <strong>data stores</strong> are used to store a key
                            and value on MadNet for up until the purchased-to epoch.</p>

                        <p>Additionally, you may cancel a <strong>data store</strong> early and receive a refund for the difference of the time used and the expiry epoch.</p>

                    </Container>

                    <Button color="purple" onClick={() => setOpenModal(false)} content="Got it!"/>

                </Modal.Description>

            </Modal.Content>

        </Modal>
    )

}

export default ConstructingATransactionModal;
