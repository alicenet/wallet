import React from 'react';

import {useHistory} from 'react-router-dom';

import {Button, Checkbox, Container, Grid, Header, Icon, Modal, Radio} from 'semantic-ui-react';

import Page from '../layout/Page';

function SeedPhraseVerified() {

    const [openModal, setOpenModal] = React.useState(false)

    const [curveType, setCurveType] = React.useState(1)

    const history = useHistory();

    const toggleCurveType = (curveType) => {
        setCurveType(curveType)
    }

    return (
        <Page>

            <Grid textAlign="center">

                <Grid.Column width={16} className="my-5">

                    <Header content="Seed Phrase Verified" as="h3" className="my-0"/>

                </Grid.Column>

                <Grid.Column width={16}>

                    <p>You have successfully verified your seed phrase.</p>

                    <p className="text-sm">Using this seed phrase, your first wallet will be generated.</p>

                </Grid.Column>

                <Grid.Column width={8} className="my-20 p-3 text-left border-2" style={{border: 'solid lightgray'}}>

                    <p className="border border-black"><strong>Advanced Options</strong></p>

                    <Modal
                        onClose={() => setOpenModal(false)}
                        onOpen={() => setOpenModal(true)}
                        open={openModal}
                        dimmer="inverted"
                        trigger={
                            <p className="text-sm">

                                <strong>
                                    Key Operation Curve&nbsp;
                                    <Icon name="question circle" style={{cursor: 'pointer'}} className="mx-0"/>
                                </strong>
                            </p>}
                    >

                        <Modal.Content>

                            <Modal.Description className="flex flex-col items-center gap-10">

                                <Header content="Key Operation Curve" as="h3" className="my-0"/>

                                <Container className="flex flex-auto flex-col gap-3 p-5 text-center">

                                    <p>Mad Wallet allows you to set the default ECC for generating the key pair.</p>

                                    <p>ECC types are set on a per vault basis and will be used for all wallets generated
                                        with this seed.</p>

                                    <p>If you change from the default type, make a note of it for when you import your
                                        seed for recovery.</p>

                                    <p>Additional wallets of the opposing type can be generated or imported if
                                        necessary, but will not be recoverable by the vault seed phrase.</p>

                                </Container>

                                <Button color="purple" onClick={() => setOpenModal(false)} content="Got it!"/>

                            </Modal.Description>

                        </Modal.Content>

                    </Modal>

                    <Container fluid className="flex flex-auto flex-col gap-4">

                        <Radio
                            label='Secp256k1 (default)'
                            name='curveType'
                            value='1'
                            onChange={() => toggleCurveType(1)}
                            checked={curveType === 1}
                        />

                        <Radio
                            label='Barreto-Naehrig'
                            name='curveType'
                            value='2'
                            onChange={() => toggleCurveType(2)}
                            checked={curveType === 2}
                        />

                    </Container>


                </Grid.Column>

                <Grid.Column width={16} className="flex-col">

                    <Container fluid className="flex flex-auto flex-col items-center gap-2 w-60">

                        <Button color="teal" basic content="Generate My Wallet" fluid
                                onClick={() => history.push('/')}/>

                        <Checkbox label={<label className="text-sm">Show Advanced Wallet Options</label>}/>

                    </Container>

                </Grid.Column>

            </Grid>

        </Page>
    )

}

export default SeedPhraseVerified;
