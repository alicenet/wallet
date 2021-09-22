import React from 'react';

import PropTypes from 'prop-types';

import {Button, Container, Grid, Header, Label, Segment, TextArea} from 'semantic-ui-react';

import {useHistory} from 'react-router-dom';
import {useSelector} from 'react-redux';

import uniq from 'lodash/uniq';

import Page from '../../layout/Page';

function VerifyYourSeedPhrase() {

    const [seedPhraseIsCorrect, setSeedPhraseIsCorrect] = React.useState(false);
    const [chosenPhrase, setChosenPhrase] = React.useState(Array(12).fill(null));
    const [verifyPhraseButtonText, setVerifyPhraseButtonText] = React.useState("Verify Phrase");

    const history = useHistory();
    const {seedPhrase} = useSelector(state => ({seedPhrase: state.user.potential_seed_phrase}));

    React.useEffect(() => {
        if (seedPhraseIsCorrect) {
            setVerifyPhraseButtonText("Verify Phrase")
        } else {
            setVerifyPhraseButtonText("Phrase isn't correct yet!")
        }
    }, [seedPhraseIsCorrect]);

    React.useEffect(() => {
        setSeedPhraseIsCorrect(uniq(chosenPhrase.filter(word => !!word)).length === 12);
    }, [chosenPhrase]);

    const handlePhraseClick = (word, index) => {
        let phrase = [...chosenPhrase];
        if (chosenPhrase[index] === word) {
            phrase[index] = null;
        } else {
            phrase[index] = word;
        }
        setChosenPhrase(phrase)
    };

    const isButtonDisabled = (word, index) => chosenPhrase[index] === word;

    return (
        <Page>

            <Grid textAlign="center" className="m-0">

                <Grid.Column width={16} className="p-0 self-center">

                    <Header content="Verify Your Seed Phrase" as="h3" className="m-0"/>

                </Grid.Column>

                <Grid.Column width={16} className="p-0 self-center">

                    <p>Verify your seed phrase by clicking in the correct order.</p>

                </Grid.Column>

                <Grid.Column width={12} className="p-0 self-center">

                    <Container fluid className="flex-wrap text-left">

                        {seedPhrase.split(' ').map((word, index) =>
                            <Button
                                key={`seed-phrase-btn-${index}`}
                                className="mx-2 my-1"
                                color="blue"
                                content={word}
                                toggle
                                basic={isButtonDisabled(word, index)}
                                active={isButtonDisabled(word, index)}
                                onClick={() => handlePhraseClick(word, index)}
                            />
                        )}

                    </Container>

                </Grid.Column>

                <Grid.Column width={12} className="p-0 self-center">

                    <Container>

                        <Segment className="p-0">

                            <Label attached='top'>Seed Phrase</Label>

                            <TextArea rows={3} disabled value={chosenPhrase.join(' ')}
                                      className="border-0 hover:border-gray-500 focus:border-gray-500 focus:outline-none w-full p-3 resize-none"/>

                        </Segment>

                    </Container>

                </Grid.Column>

                <Grid.Column width={12} className="p-0 self-center">

                    <Container className="flex justify-between">

                        <Button color="purple" basic content="Get New Seed Phrase"
                                onClick={() => history.push('/newVault/getNewSeedPhrase')}/>

                        <Button color={seedPhraseIsCorrect ? 'teal' : 'red'} disabled={!seedPhraseIsCorrect}
                                basic className="m-0"
                                content={verifyPhraseButtonText}
                                onClick={() => history.push('/newVault/chooseEllipticCurve')}/>

                    </Container>

                </Grid.Column>

            </Grid>

        </Page>
    )

}

export default VerifyYourSeedPhrase;

VerifyYourSeedPhrase.defaultProps = {
    seedPhrase: '',
};

VerifyYourSeedPhrase.propTypes = {
    seedPhrase: PropTypes.string.isRequired,
};
