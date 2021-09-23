import React from 'react';

import PropTypes from 'prop-types';

import {Button, Container, Grid, Header, Label, Segment, TextArea} from 'semantic-ui-react';

import {useHistory} from 'react-router-dom';
import {useSelector} from 'react-redux';

import shuffle from 'lodash/shuffle';

import Page from '../../layout/Page';

function VerifyYourSeedPhrase() {

    const [actionedButtons, setActionedButtons] = React.useState(new Set());
    const [seedPhraseIsCorrect, setSeedPhraseIsCorrect] = React.useState(false);
    const [chosenPhrase, setChosenPhrase] = React.useState([]);
    const [verifyPhraseButtonText, setVerifyPhraseButtonText] = React.useState("Verify Phrase");
    const [shuffledSeedPhrase, setShuffledSeedPhrase] = React.useState([]);

    const history = useHistory();
    const {seedPhrase} = useSelector(state => ({seedPhrase: state.user.potential_seed_phrase}));

    React.useEffect(() => {
        setShuffledSeedPhrase(shuffle(seedPhrase.split(' ')));
    }, [seedPhrase])

    React.useEffect(() => {
        if (seedPhraseIsCorrect) {
            setVerifyPhraseButtonText("Verify Phrase")
        } else {
            setVerifyPhraseButtonText("Phrase isn't correct!")
        }
    }, [seedPhraseIsCorrect]);

    React.useEffect(() => {
        setSeedPhraseIsCorrect(chosenPhrase.length === 12);
    }, [chosenPhrase]);

    const handlePhraseClick = (word, index) => {
        let phrase = [...chosenPhrase];
        let indexOf = chosenPhrase.indexOf(word);

        if (actionedButtons.has(index)) {
            if (indexOf !== -1) {
                actionedButtons.delete(index);
                phrase.splice(indexOf, 1);
            }
        } else {
            setActionedButtons(prevState => prevState.add(index))
            phrase.push(word);
        }
        setChosenPhrase(phrase);
    };

    const isButtonDisabled = index => actionedButtons.has(index);

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

                        {shuffledSeedPhrase.map((word, index) =>
                            <Button
                                key={`seed-phrase-btn-${index}`}
                                className="mx-2 my-1"
                                color="blue"
                                content={word}
                                toggle
                                basic={isButtonDisabled(index)}
                                active={isButtonDisabled(index)}
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
