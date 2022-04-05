import React, { useEffect, useState } from 'react';
import { Button, Container, Grid, Header, Label, Segment, TextArea } from 'semantic-ui-react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import isEqual from 'lodash/isEqual';
import shuffle from 'lodash/shuffle';
import Page from 'layout/Page';
import { isDebug } from 'util/generic';

function VerifyYourSeedPhrase() {

    const [actionedButtons, setActionedButtons] = useState(new Set());
    const [seedPhraseIsCorrect, setSeedPhraseIsCorrect] = useState(false);
    const [chosenPhrase, setChosenPhrase] = useState([]);
    const [verifyPhraseButtonText, setVerifyPhraseButtonText] = useState("Verify Phrase");
    const [shuffledSeedPhrase, setShuffledSeedPhrase] = useState([]);

    const history = useHistory();
    const { seedPhrase } = useSelector(state => ({ seedPhrase: state.user.potential_seed_phrase }));

    useEffect(() => {
        if (isDebug) {
            return setShuffledSeedPhrase(seedPhrase.split(' '));
        } // Skip shuffle for debug mode
        setShuffledSeedPhrase(shuffle(seedPhrase.split(' ')));
    }, [seedPhrase]);

    useEffect(() => {
        if (seedPhraseIsCorrect) {
            setVerifyPhraseButtonText("Verify Phrase");
        }
        else {
            setVerifyPhraseButtonText("Phrase isn't correct!");
        }
    }, [seedPhraseIsCorrect]);

    useEffect(() => {
        setSeedPhraseIsCorrect(isDebug ? chosenPhrase.length === 12 : isEqual(chosenPhrase, seedPhrase.split(" ")));
    }, [chosenPhrase, seedPhrase]);

    const handlePhraseClick = (word, index) => {
        let phrase = [...chosenPhrase];
        let indexOf = chosenPhrase.indexOf(word);

        if (actionedButtons.has(index)) {
            if (indexOf !== -1) {
                actionedButtons.delete(index);
                phrase.splice(indexOf, 1);
            }
        }
        else {
            setActionedButtons(prevState => prevState.add(index));
            phrase.push(word);
        }
        setChosenPhrase(phrase);
    };

    const isButtonDisabled = index => actionedButtons.has(index);

    return (
        <Page>

            <Grid textAlign="center" className="m-0">

                <Grid.Column width={16} className="p-0 self-center">

                    <Header content="Verify Your Seed Phrase" as="h3" className="m-0" />

                </Grid.Column>

                <Grid.Column width={16} className="p-0 self-center">

                    <p>Verify your seed phrase by clicking in the correct order.</p>

                </Grid.Column>

                <Grid.Column width={12} className="p-0 self-center">

                    <Container fluid className="flex-wrap text-left">

                        {shuffledSeedPhrase.map((word, index) =>
                            <Button
                                key={`seed-phrase-btn-${index}`}
                                size="small"
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

                            <TextArea
                                rows={3}
                                disabled
                                value={chosenPhrase.join(' ')}
                                className="border-0 hover:border-gray-500 focus:border-gray-500 focus:outline-none w-full p-3 resize-none"
                            />

                        </Segment>

                    </Container>

                </Grid.Column>

                <Grid.Column width={12} className="p-0 self-center">

                    <Container className="flex justify-between">

                        <Button
                            color="black"
                            basic
                            content="Get New Seed Phrase"
                            onClick={() => history.push('/newVault/getNewSeedPhrase')}
                        />

                        <Button
                            color="teal"
                            disabled={!seedPhraseIsCorrect}
                            content={verifyPhraseButtonText}
                            onClick={() => history.push('/newVault/chooseEllipticCurve')}
                        />

                    </Container>

                </Grid.Column>

            </Grid>

        </Page>
    )

}

export default VerifyYourSeedPhrase;