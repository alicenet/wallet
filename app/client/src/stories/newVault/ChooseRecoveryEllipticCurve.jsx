import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { Button, Container, Grid, Header, Icon, Radio } from 'semantic-ui-react';

import Page from '../../layout/Page';
import { curveTypes } from 'util/_util';
import { USER_ACTIONS } from 'redux/actions/_actions';
import KeyOperationCurveModal from './KeyOperationCurveModal';

function ChooseRecoveryEllipticCurve() {

    const history = useHistory();
    const dispatch = useDispatch();

    const { desiredCurve, seedPhrase } = useSelector(state => ({
        seedPhrase: state.user.potential_seed_phrase.split(' '),
        desiredCurve: state.user.desired_hd_curve,
    }));

    const [curveType, setCurveType] = React.useState(desiredCurve || curveTypes.SECP256K1)

    const secureMyVault = () => {
        dispatch(USER_ACTIONS.setDesiredCurveType(curveType));
        history.push('/newVault/secureNewVault');
    }

    return (
        <Page>

            <Grid textAlign="center" className="m-0">

                <Grid.Column width={16} className="p-0 self-center">

                    <Header content="Phrase Entered" as="h3" className="m-0"/>

                </Grid.Column>

                <Grid.Column width={10} className="p-0 self-center">

                    <p>You have successfully entered your seed phrase.</p>

                    <Container fluid>

                        {seedPhrase.map((word, index) =>
                            <Button
                                key={`seed-phrase-btn-${index}`}
                                className="mx-2 my-1"
                                color="blue"
                                content={word}
                            />
                        )}

                    </Container>

                </Grid.Column>

                <Grid.Column width={16} className="p-0 self-center">

                    <p className="text-sm">Using this seed phrase, your wallets will be generated.</p>

                    <p className="text-sm">Please make sure to select the same Key Operation Curve that you used when creating the vault.</p>

                </Grid.Column>

                <Grid.Column width={10} className="p-0 self-center">

                    <Container className="p-3 text-left border-2 border-solid border-gray-300">

                        <p><strong>Advanced Options</strong></p>

                        <KeyOperationCurveModal>

                            <p className="text-sm">

                                <strong>
                                    Public Address Key Operation Curve
                                    <Icon name="question circle" style={{ cursor: 'pointer' }} className="px-2"/>

                                </strong>
                            </p>

                        </KeyOperationCurveModal>

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

                <Grid.Column width={12} className="p-0 self-center">

                    <Container className="flex justify-between">

                        <Button color="orange" basic content="Go Back" className="m-0" onClick={history.goBack}/>

                        <Button color="teal" basic content="Secure My Vault" className="m-0" onClick={secureMyVault}/>

                    </Container>

                </Grid.Column>

            </Grid>

        </Page>
    )

}

export default ChooseRecoveryEllipticCurve;