import React, { useState } from 'react';

import { Button, Container, Header, Modal } from 'semantic-ui-react';

function DeterministicWalletGenerationModal({ children }) {

    const [openModal, setOpenModal] = useState(false);

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

                    <Header content="Deterministic Wallet Generation" as="h3" className="my-0" />

                    <Container className="flex flex-auto flex-col gap-3 p-5 text-center">

                        <p>Mad wallet uses the BIP44 standard to implement Seed Phrases and
                            Deterministic Wallets.</p>

                        <p>Similar to other wallet software, only the wallets generated inside the Mad
                            Wallet application are covered by the seed recovery phrase. If additional
                            imported wallets are used you must retain the private keys for those
                            respective wallets or risk losing access to them.</p>

                    </Container>

                    <Button color="teal" onClick={() => setOpenModal(false)} content="Got it!" />

                </Modal.Description>

            </Modal.Content>

        </Modal>
    )

}

export default DeterministicWalletGenerationModal;
