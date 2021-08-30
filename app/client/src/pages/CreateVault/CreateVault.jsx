import React from 'react';

import {Button, Container, Grid, Header, Modal} from "semantic-ui-react";

import HeaderMenu from "./HeaderMenu";

function CreateVault() {

    const [openModal, setOpenModal] = React.useState(false)

    return (
        <div>

            <HeaderMenu/>

            <Container fluid>

                <Grid textAlign="center" verticalAlign="middle">

                    <Grid.Column width={16}>

                        <Header content="Lets setup your vault" as="h3" className="my-0"/>

                    </Grid.Column>

                    <Grid.Column width={16} className="mt-2 mb-2">

                        <p>Internal wallets will be generated through a seed phrase that will be shown on the next
                            step.</p>

                        <p>Your seed phrase is the key to your internal wallets, please keep it in a secure
                            location.</p>

                    </Grid.Column>

                    <Grid.Column width={16} className="mt-2 mb-2">

                        <p className="m-0">Please note that if you import additional wallets by private key they will be
                            considered
                            external
                            wallets.</p>

                        <p className="m-0">Please keep those keys safe, as the seed phrase will not cover any imported
                            wallets!</p>

                    </Grid.Column>

                    <Grid.Column width={16} className="flex flex-auto flex-col items-center gap-5">

                        <Container fluid className="flex flex-auto flex-col items-center gap-5 w-72">

                            <Button color="purple" basic content="Get Seed Phrase" fluid/>

                            <Button color="orange" basic content="Just Generate A Keystore" fluid/>

                        </Container>

                        <Modal
                            onClose={() => setOpenModal(false)}
                            onOpen={() => setOpenModal(true)}
                            open={openModal}
                            dimmer="inverted"
                            trigger={<p style={{cursor: 'pointer'}} className="text-purple-400 text-sm"><strong>More
                                Info On How
                                Wallets
                                Are Generated</strong></p>}
                        >

                            <Modal.Content>

                                <Modal.Description className="flex flex-col items-center gap-10">

                                    <Header content="Deterministic Wallet Generation" as="h3" className="my-0"/>

                                    <Container className="flex flex-auto flex-col gap-3 p-5 text-center">

                                        <p>Mad wallet uses the BIP44 standard to implement Seed Phrases and
                                            Deterministic
                                            Wallets.</p>

                                        <p>ASimilar to other wallet software, only the wallets generated inside the Mad
                                            Wallet
                                            application are covered by the seed recovery phrase. If additional imported
                                            wallets
                                            are used you must retain the private keys for those respective wallets or
                                            risk
                                            losing access to them.</p>

                                    </Container>

                                    <Button color="purple" onClick={() => setOpenModal(false)} content="Got it!"/>

                                </Modal.Description>

                            </Modal.Content>

                        </Modal>

                    </Grid.Column>

                </Grid>
            </Container>
        </div>
    )

}

export default CreateVault;
