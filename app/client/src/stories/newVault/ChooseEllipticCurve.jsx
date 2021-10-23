import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { Button, Checkbox, Container, Grid, Header, Icon, Radio } from 'semantic-ui-react';

import Page from '../../layout/Page';
import { classNames, curveTypes } from 'util/_util';
import { USER_ACTIONS } from 'redux/actions/_actions';
import KeyOperationCurveModal from './KeyOperationCurveModal';

function ChooseEllipticCurve() {

    const [enableAdvancedWalletOptions, setEnableAdvancedOptions] = React.useState(false)
    const history = useHistory();
    const [curveType, setCurveType] = React.useState(curveTypes.SECP256K1)

    const dispatch = useDispatch();

    const generateWallet = () => {
        // Set desired curve to active curve state and advance screen
        dispatch(USER_ACTIONS.setDesiredCurveType(curveType));
        history.push('/newVault/secureNewVault');
    }

    const toggleAdvancedOptions = () => {
        setEnableAdvancedOptions(prevState => !prevState);
        setCurveType(1);
    }

    return (
        <Page>

            <Grid textAlign="center" className="m-0">

                <Grid.Column width={16} className="p-0 self-center">

                    <Header content="Seed Phrase Verified" as="h3" className="m-0"/>

                </Grid.Column>

                <Grid.Column width={16} className="p-0 self-center">

                    <p>You have successfully verified your seed phrase.</p>

                    <p className="text-sm">Using this seed phrase, your first wallet will be generated.</p>

                </Grid.Column>

                <Grid.Column width={10} className="p-0 self-center">

                    <Checkbox onChange={toggleAdvancedOptions} className="py-5"
                              checked={enableAdvancedWalletOptions}
                              label={<label className="text-sm">Enable Advanced Wallet Options</label>}/>

                    <Container
                        className={classNames("p-3 text-left border-2 border-solid border-gray-300", { 'bg-gray-300': !enableAdvancedWalletOptions })}>

                        <p className="border border-black"><strong>Advanced Options</strong></p>

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
                                readOnly={!enableAdvancedWalletOptions}
                            />

                            <Radio
                                label='Barreto-Naehrig'
                                name='curveType'
                                value={curveTypes.BARRETO_NAEHRIG}
                                onChange={() => setCurveType(curveTypes.BARRETO_NAEHRIG)}
                                checked={curveType === curveTypes.BARRETO_NAEHRIG}
                                readOnly={!enableAdvancedWalletOptions}
                            />

                        </Container>

                    </Container>

                </Grid.Column>

                <Grid.Column width={12} className="p-0 self-center">

                    <Container className="flex justify-between">

                        <Button color="orange" basic className="m-0" content="Go Back" onClick={history.goBack}/>

                        <Button color="teal" basic className="m-0" content="Secure My Vault" onClick={generateWallet}/>

                    </Container>

                </Grid.Column>

            </Grid>

        </Page>
    )

}

export default ChooseEllipticCurve;
