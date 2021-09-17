import React from 'react';

import { Button, Container, Grid, Header, TextArea } from 'semantic-ui-react';

import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import trim from 'lodash/trim';
import uniq from 'lodash/uniq';
import toLower from 'lodash/toLower';
import words from 'lodash/words';

import Page from '../../layout/Page';
import { USER_ACTIONS } from '../../redux/actions/_actions';

function EnterRecoveryPhrase() {

    const { storedSeedPhrase } = useSelector(state => ({
        storedSeedPhrase: state.user.potential_seed_phrase.split(' '),
    }));

    const [seedPhraseIsCorrect, setSeedPhraseIsCorrect] = React.useState(false);
    const [verifyPhraseButtonText, setVerifyPhraseButtonText] = React.useState('Use This Phrase');
    const [seedPhrase, setSeedPhrase] = React.useState((storedSeedPhrase || []).join(' '));
    const [parsedSeedPhrase, setParsedSeedPhrase] = React.useState([]);

    const history = useHistory();
    const dispatch = useDispatch();

    React.useEffect(() => {
        if (seedPhraseIsCorrect) {
            setVerifyPhraseButtonText("Verify Phrase")
        }
        else {
            setVerifyPhraseButtonText("Phrase isn't correct")
        }
    }, [seedPhraseIsCorrect]);

    React.useEffect(() => {
        setSeedPhraseIsCorrect(parsedSeedPhrase.length === 12
            && uniq(parsedSeedPhrase).length === 12
            && parsedSeedPhrase.every(phrase => phrase.length > 2 && phrase.length < 9));
    }, [parsedSeedPhrase]);

    React.useEffect(() => {
        setParsedSeedPhrase(words(seedPhrase).map(word => trim(word)).filter(word => word.length > 0));
    }, [seedPhrase]);

    const handlePhraseChange = phrase => {
        setSeedPhrase((toLower(phrase).match(/[a-z ]/g) || []).join(''));
    }

    const phraseEntered = () => {
        dispatch(USER_ACTIONS.setExistingMnemonic(parsedSeedPhrase));
        history.push('/newVault/chooseEllipticCurve', {isRestore: true});
    }

    return (
        <Page>

            <Grid textAlign="center">

                <Grid.Column width={16} className="my-5">

                    <Header content="Use A Recovery Phrase" as="h3" className="my-0"/>

                </Grid.Column>

                <Grid.Column width={16}>

                    <p>Please note the derivation path: m/44'/0'/0'/0/0 will be used.</p>

                </Grid.Column>

                <Grid.Column width={16}>

                    <p>Only attempt imports of seeds that you have used this derivation path with for results you expect.</p>

                </Grid.Column>

                <Grid.Column className="flex flex-auto flex-col items-center gap-10">

                    <Container fluid className="flex-wrap text-left max-h-36 overflow-y-auto overscroll-auto" style={{minHeight: "72px"}}>

                        {parsedSeedPhrase.map((word, index) =>
                            <Button
                                key={`seed-phrase-btn-${index}`}
                                className="mx-2 my-1"
                                color="blue"
                                content={word}
                                size="mini"
                            />
                        )}

                    </Container>

                    <Container className="flex flex-auto flex-col justify-center gap-10">

                        <Container className="flex flex-col">
                           <TextArea rows={3} value={seedPhrase} onChange={e => handlePhraseChange(e.target.value)}
                                  className="bg-white p-4 rounded border-3 border-gray-400 hover:border-gray-500 focus:border-gray-500 focus:outline-none mb-0"/>
                                  <p className="mt-2 text-xs"> Please note the derivation path: m/44'/0'/0'/0/0 will be used.</p>
                        </Container>

                        <Container className="flex flex-auto flex-row justify-between">

                            <Button color="purple" basic content="Back"
                                    onClick={() => history.push('/newUserHub')}/>

                            <Button color={seedPhraseIsCorrect ? 'teal' : 'red'} disabled={!seedPhraseIsCorrect}
                                    basic
                                    content={verifyPhraseButtonText}
                                    onClick={phraseEntered}/>

                        </Container>

                    </Container>

                </Grid.Column>

            </Grid>

        </Page>
    )

}

export default EnterRecoveryPhrase;
