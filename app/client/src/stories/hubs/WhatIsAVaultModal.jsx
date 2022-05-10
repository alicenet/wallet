import React, { useState } from 'react';
import { Button, Container, Header, Modal } from 'semantic-ui-react';

function WhatIsAVaultModal() {

    const [openModal, setOpenModal] = useState(false);

    return (
        <Modal
            onClose={() => setOpenModal(false)}
            onOpen={() => setOpenModal(true)}
            open={openModal}
            dimmer="inverted"
            trigger={<Button className="transparent text-sm text-black underline">What is a vault?</Button>}
        >

            <Modal.Content>

                <Modal.Description className="flex flex-col items-center gap-10">

                    <Header content="AliceNet Wallet Vault" as="h3" className="my-0" />

                    <Container className="flex flex-auto flex-col gap-3 px-3 text-center">

                        <p>AliceNet Wallet keeps track of your wallets by using an encrypted vault file.</p>

                        <p>Any wallets generated by AliceNet Wallet, imported via private key or imported via
                            keystore are secured by your passphrase in the vault file.</p>

                        <p>Some users may not wish to subject to a single point of failure in wallet
                            storage. To recognize this you will get the final say over how your wallets are
                            stored and will be given the option to opt out of vault storage.</p>

                        <p>Please note that opting out of vault storage will make user flows more
                            complicated, and you will be asked for individual key-store passwords frequently
                            when loading and interacting with wallets.</p>

                    </Container>

                    <Button color="teal" onClick={() => setOpenModal(false)} content="Got it!" />

                </Modal.Description>

            </Modal.Content>

        </Modal>

    )

}

export default WhatIsAVaultModal;
