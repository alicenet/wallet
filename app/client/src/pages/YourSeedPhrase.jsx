import React from 'react';
import Page from '../layout/Page';
import PropTypes from 'prop-types'
import chunk from 'lodash/chunk';
import {Button, Checkbox, Container, Grid, GridRow, Header} from 'semantic-ui-react';
import {USER_ACTIONS} from 'redux/actions/_actions';
import {connect} from 'react-redux';
import {useHistory} from 'react-router-dom';

function YourSeedPhrase({seedPhrase, dispatch}) {

    seedPhrase = seedPhrase.split(' ');

    const [isChecked, setIsChecked] = React.useState(false);
    const history = useHistory();

    const rollPotentialSeedPhrase = React.useCallback(() => dispatch(USER_ACTIONS.setNewPotentialMnemonic()), [dispatch]);

    React.useEffect(() => {
        rollPotentialSeedPhrase();
    }, [rollPotentialSeedPhrase]); // Roll initial seed phrase

    return (
        <Page>

            <Grid textAlign="center">

                <Grid.Column width={16} className="my-5">

                    <Header content="Your Seed Phrase" as="h3" className="my-0"/>

                </Grid.Column>

                <Grid.Column width={16}>

                    <p>Below is your seed phrase, please store it in a secure place.</p>

                    <p>You will be required to re-enter it on the next page.</p>

                </Grid.Column>

                <Grid.Column width={16}>

                    <Grid celled columns={6}>

                        {chunk(seedPhrase, Math.floor(seedPhrase.length / 2)).map((someSeeds, index) =>

                            <GridRow key={`seed-row-${index}`}>

                                {someSeeds.map(word => <Grid.Column key={word}>{word}</Grid.Column>)}


                            </GridRow>
                        )}

                    </Grid>

                </Grid.Column>

                <Grid.Column width={16}>

                    <Button size="tiny" content="Reroll Phrase" onClick={rollPotentialSeedPhrase}/>

                </Grid.Column>

                <Grid.Column width={16}>

                    <p className="text-red-600 uppercase text-sm">

                        <strong>Do not share your seed phrase</strong>

                    </p>

                </Grid.Column>

                <Grid.Column width={16} className="flex-col">

                    <Container fluid className="flex flex-auto flex-col items-center gap-5 w-96">

                        <Button.Group className="flex justify-center w-72">

                            <Button color="orange" basic
                                    content="Go Back" fluid
                                    onClick={() => history.goBack()}/>

                            <Button color="purple" basic disabled={!isChecked}
                                    content="Verify The Seed Phrase" fluid
                                    onClick={() => history.push('/newVault/verifyYourSeedPhrase')}/>

                        </Button.Group>

                        <Checkbox onChange={() => setIsChecked(prevState => !prevState)} checked={isChecked}
                                  label={<label>I Have Stored This Seed Securely</label>}/>

                    </Container>

                </Grid.Column>

            </Grid>

        </Page>
    )

}

YourSeedPhrase.defaultProps = {
    seedPhrase: "",
};

YourSeedPhrase.propTypes = {
    seedPhrase: PropTypes.string.isRequired
};

const stateMap = state => ({seedPhrase: state.user.potential_seed_phrase});
export default connect(stateMap)(YourSeedPhrase);