import React from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import Page from '../../layout/Page';

import chunk from 'lodash/chunk';

import { Button, Checkbox, Container, Grid, GridRow, Header, Message } from 'semantic-ui-react';

import { USER_ACTIONS } from 'redux/actions/_actions';

function GetNewSeedPhrase() {

    const history = useHistory();
    const dispatch = useDispatch();
    const { seedPhrase } = useSelector(state => ({ seedPhrase: state.user.potential_seed_phrase }));

    const seedPhraseSplitted = seedPhrase.split(' '); // Split to array

    const [isChecked, setIsChecked] = React.useState(false);

    const rollPotentialSeedPhrase = React.useCallback(() => dispatch(USER_ACTIONS.setNewPotentialMnemonic()), [dispatch]);

    React.useEffect(() => {
        rollPotentialSeedPhrase();
    }, [rollPotentialSeedPhrase]); // Roll initial seed phrase

    return (
        <Page>

            <Grid textAlign="center" className="m-0">

                <Grid.Column width={16} className="p-0 self-center">

                    <Header content="Your Seed Phrase" as="h3" className="m-0" />

                </Grid.Column>

                <Grid.Column width={16} className="p-0 self-center">

                    <p>Below is your seed phrase, please store it in a secure place.</p>

                    <p>You will be required to re-enter it on the next page.</p>

                </Grid.Column>

                <Grid.Column width={12} className="p-0 self-center">

                    <Grid celled columns={6} className="m-0">

                        {chunk(seedPhraseSplitted, Math.floor(seedPhraseSplitted.length / 2)).map((someSeeds, index) =>

                            <GridRow key={`seed-row-${index}`}>

                                {someSeeds.map((word, position) => <Grid.Column key={`seed-column-${position}`}>{word}</Grid.Column>)}

                            </GridRow>
                        )}

                    </Grid>

                </Grid.Column>

                <Grid.Column width={16} className="p-0 self-center">

                    <p className="text-red-600 uppercase text-sm">

                        <strong>Do not share your seed phrase</strong>

                    </p>

                    <Button circular size="tiny" icon="redo" content="Reroll Phrase" onClick={rollPotentialSeedPhrase} />

                </Grid.Column>

                <Grid.Column width={12} className="p-0 self-center">

                    <Message
                        size="mini"
                        icon="warning"
                        header="The vault password and recovery phrase are very important."
                        content="Keep the recovery seed in a safe place so you can recover you wallets if necessary."
                        warning
                    />

                </Grid.Column>

                <Grid.Column width={12} className="p-0 self-center">

                    <Container className="flex justify-between">

                        <div>

                            <Button color="black" basic content="Go Back" onClick={() => history.push('/newVault/createVault')} />

                        </div>

                        <div className="flex flex-col gap-2">

                            <Button
                                color="teal"
                                disabled={!isChecked}
                                content="Verify The Seed Phrase"
                                onClick={() => history.push('/newVault/verifySeedPhrase')}
                            />

                            <Checkbox
                                onChange={() => setIsChecked(prevState => !prevState)}
                                checked={isChecked}
                                label={<label className="text-sm">I Have Stored This Seed Securely</label>}
                            />

                        </div>

                    </Container>

                </Grid.Column>

            </Grid>

        </Page>
    )

}

export default GetNewSeedPhrase;