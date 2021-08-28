import React from 'react';

import {Button, Container, Grid, Header, Image, Menu, Modal} from "semantic-ui-react";

import MadIcon from "../../Assets/icon.png";
import {withRouter} from "react-router-dom";

function CreateVault({history}) {

    const [openModal, setOpenModal] = React.useState(false)

    return (
        <div>

            <Menu fixed='top' secondary>

                <Container fluid>

                    <Menu.Item as='a' header className='p-0' onClick={() => history.push('/')}>

                        <Container fluid
                                   className="flex flex-row content-center items-center justify-center self-center justify-items-center"
                        >

                            <Image src={MadIcon} size="mini" className="mx-1"/>

                            <Container fluid>

                                <Header content="MadWallet" as="h4" className="mx-2"/>

                            </Container>

                        </Container>

                    </Menu.Item>

                </Container>

            </Menu>

            <Container>

                <Grid textAlign="center" verticalAlign="middle">

                    <Grid.Column width={16} className="mt-2 mb-2">

                        <p>Internal wallets will be generated through a seed phrase that will be shown on the next
                            step.</p>

                        <p>Your seed phrase is the key to your internal wallets, please keep it in a secure
                            location.</p>

                    </Grid.Column>

                    <Grid.Column width={16} className="mt-2 mb-2">

                        <p>Please note that if you import additional wallets by private key they will be considered
                            external
                            wallets.</p>

                        <p>Please keep those keys safe, as the seed phrase will not cover any imported wallets!</p>

                    </Grid.Column>

                    <Grid.Column width={16} className="flex flex-auto flex-col items-center gap-5">

                        <Container fluid className="flex flex-auto flex-col items-center gap-3 w-72">

                            <Button color="purple" basic content="Get Seed Phrase" fluid/>

                            <Button color="orange" basic content="Just Generate A Keystore" fluid/>

                        </Container>

                        <Modal
                            onClose={() => setOpenModal(false)}
                            onOpen={() => setOpenModal(true)}
                            open={openModal}
                            trigger={<p style={{cursor: 'pointer'}} className="text-purple-800"><strong>More Info On How
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

                                    <Button color='blue' onClick={() => setOpenModal(false)} content="Got it!"/>

                                </Modal.Description>

                            </Modal.Content>

                        </Modal>

                    </Grid.Column>

                </Grid>
            </Container>
        </div>
    )

}

export default withRouter(CreateVault);
