import React from 'react';

import PropTypes from 'prop-types';

import {Button, Container, Grid, Header, TextArea} from 'semantic-ui-react';

import { useHistory } from 'react-router-dom';

import Page from '../layout/Page';

function VerifyYourSeedPhrase({ seedPhrase }) {

    const [seedPhraseIsCorrect, setSeedPhraseIsCorrect] = React.useState(false);

    const [chosenPhrase, setChosenPhrase] = React.useState([]);

    const [verifyPhraseButtonText, setVerifyPhraseButtonText] = React.useState("Verify Phrase");

    const history = useHistory();

    React.useEffect(() => {
        if (seedPhraseIsCorrect) {
            setVerifyPhraseButtonText("Verify Phrase")
        } else {
            setVerifyPhraseButtonText("Phrase isn't correct yet!")
        }
    }, [seedPhraseIsCorrect]);

    React.useEffect(() => {
        setSeedPhraseIsCorrect(chosenPhrase.length === 12);
    }, [chosenPhrase]);

    const handlePhraseClick = word => {
        if (chosenPhrase.includes(word)) {
            setChosenPhrase(chosenPhrase.filter(phrase => phrase !== word));
        } else {
            setChosenPhrase(chosenPhrase.concat([word]));
        }
    };

    const isButtonDisabled = word => chosenPhrase.includes(word);

    return (
        <Page>

            <Grid textAlign="center">

                <Grid.Column width={16} className="my-5">

                    <Header content="Verify Your Seed Phrase now" as="h3" className="my-0"/>

                </Grid.Column>

                <Grid.Column width={16}>

                    <p>Verify your seed phrase by clicking in the correct order.</p>

                </Grid.Column>

                <Grid.Column className="flex flex-auto flex-col items-center gap-10">

                    <Container fluid className="flex-wrap text-left">

                        {seedPhrase.map((word, index) =>
                            <Button
                                key={`seed-phrase-btn-${index}`}
                                className="mx-2 my-1"
                                color="blue"
                                toggle
                                content={word}
                                basic={isButtonDisabled(word)}
                                active={isButtonDisabled(word)}
                                onClick={() => handlePhraseClick(word)}
                            />)}

                    </Container>

                    <Container className="flex flex-auto flex-col justify-center gap-10">

                        <TextArea rows={4} disabled value={chosenPhrase.join(' ')}
                                  className="bg-white p-4 rounded border-3 border-gray-400 hover:border-gray-500 focus:border-gray-500 focus:outline-none"/>

                        <Container className="flex flex-auto flex-row justify-between">

                            <Button color="purple" basic content="Get New Seed Phrase"
                                    onClick={() => history.push('/yourSeedPhrase')}/>

                            <Button color={seedPhraseIsCorrect ? 'teal' : 'red'} disabled={!seedPhraseIsCorrect}
                                    basic
                                    content={verifyPhraseButtonText}
                                    onClick={() => history.push('/seedPhraseVerified')}/>

                        </Container>

                    </Container>

                </Grid.Column>

            </Grid>

        </Page>
    )

}

export default VerifyYourSeedPhrase;

VerifyYourSeedPhrase.defaultProps = {
    seedPhrase: ['apart', 'think', 'stumble', 'derive', 'tank', 'gown', 'gas', 'squat', 'crack', 'whisper', 'knee', 'hint', 'hammer', 'goose', 'deer', 'science'],
};

VerifyYourSeedPhrase.propTypes = {
    seedPhrase: PropTypes.arrayOf(PropTypes.string),
};
