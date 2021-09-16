import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { Button, Container, Grid, Header, Icon, Modal, Radio } from 'semantic-ui-react';

import Page from '../layout/Page';
import { curveTypes } from 'util/_util';
import { USER_ACTIONS } from 'redux/actions/_actions';

function PhraseEntered() {

    const history = useHistory();
    const dispatch = useDispatch();

    const { seedPhrase, desiredCurve } = useSelector(state => ({
        seedPhrase: state.user.potential_seed_phrase,
        desiredCurve: state.user.desired_hd_curve,
    }));

    const [openModal, setOpenModal] = React.useState(false)
    const [curveType, setCurveType] = React.useState(desiredCurve || curveTypes.SECP256K1)

    const loadMyVault = () => {
        dispatch(USER_ACTIONS.setDesiredCurveType(curveType));
        history.push('/newUserHub')
    }

    return (
        <Page>

            <Grid textAlign="center">

                <Grid.Column width={16} className="my-5">

                    <Header content="Phrase Entered" as="h3" className="my-0"/>

                </Grid.Column>

                <Grid.Column width={16}>

                    <p className="mb-10">You have successfully entered your seed phrase.</p>

                    <p className="text-sm">Using this seed phrase, your wallets will be generated.</p>

                    <p className="text-sm">Please make sure to select the same Key Operation Curve that you used when creating the vault.</p>

                </Grid.Column>

                <Grid.Column width={12} className="flex flex-auto flex-col items-center gap-10">

                    <Container fluid className="flex-wrap text-left max-h-36 overflow-y-auto overscroll-auto">

                        {seedPhrase.map((word, index) => {
                            return (<Button
                                key={`seed-phrase-btn-${index}`}
                                className="mx-2 my-1"
                                color="blue"
                                content={word}
                            />)
                        })}

                    </Container>

                </Grid.Column>

                <Grid.Column width={12}>

                    <Container className="p-3 text-left border-2 border-solid border-gray-300">

                        <p><strong>Advanced Options</strong></p>

                        <Modal
                            onClose={() => setOpenModal(false)}
                            onOpen={() => setOpenModal(true)}
                            open={openModal}
                            dimmer="inverted"
                            trigger={
                                <p className="text-sm">
                                    <strong>
                                        Public Address Key Operation Curve
                                        <Icon name="question circle" style={{ cursor: 'pointer' }} className="px-2"/>
                                    </strong>
                                </p>}
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

                        <Container fluid className="flex flex-auto flex-col gap-4">

                            <Radio
                                label='Secp256k1 (default)'
                                name='curveType'
                                value={curveTypes.SECP256K1}
                                onChange={() => setCurveType(curveTypes.SECP256K1)}
                                checked={curveType === curveTypes.SECP256K1}
                            />

                            <Radio
                                label='Barreto-Naehrig'
                                name='curveType'
                                value={curveTypes.BARRETO_NAEHRIG}
                                onChange={() => setCurveType(curveTypes.BARRETO_NAEHRIG)}
                                checked={curveType === curveTypes.BARRETO_NAEHRIG}
                            />

                        </Container>

                    </Container>

                </Grid.Column>

                <Grid.Column width={16}>

                    <Container className="flex flex-auto flex-row justify-between">

                        <Button color="purple" basic content="Back" onClick={() => history.push('/newVault/useRecoveryPhrase')}/>

                        <Button color="teal" basic content="Load My Vault" onClick={loadMyVault}/>

                    </Container>

                </Grid.Column>

            </Grid>

        </Page>
    )

}

export default PhraseEntered;
