import React from 'react';

import { Button, Container, Grid, Header, Label, Segment, TextArea } from 'semantic-ui-react';

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
        seedPhraseIsCorrect ?
            setVerifyPhraseButtonText("Use This Phrase")
            : setVerifyPhraseButtonText("Phrase isn't correct");
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
    };

    const phraseEntered = () => {
        dispatch(USER_ACTIONS.setExistingMnemonic(parsedSeedPhrase));
        history.push('/newVault/chooseRecoveryEllipticCurve');
    };

    return (
        <Page>

            <Grid textAlign="center" className="m-0">

                <Grid.Column width={16} className="p-0 self-center">

                    <Header content="Use A Recovery Phrase" as="h3" className="m-0" />

                </Grid.Column>

                <Grid.Column width={16} className="p-0 self-center">

                    <p>Enter a seed and select deterministic wallets to import from that seed.<br />
                        These accounts will be added to your current wallet vault.</p>

                </Grid.Column>

                <Grid.Column width={16} className="p-0 self-center">

                    <p>Only attempt imports of seeds that you have used this derivation path with for results you expect.</p>

                </Grid.Column>

                <Grid.Column width={12} className="p-0 self-center">

                    <Container>

                        <Segment className="p-0">

                            <Label attached='top'>Seed Phrase</Label>

                            <TextArea
                                ref={input => input && input.focus()}
                                rows={3}
                                value={seedPhrase}
                                onChange={e => handlePhraseChange(e.target.value)}
                                className="border-0 hover:border-gray-500 focus:border-gray-500 focus:outline-none w-full p-3 resize-none"
                            />

                        </Segment>

                        <p className="text-xs"> Please note the derivation path: m/44'/0'/0'/0/0 will be used.</p>

                    </Container>

                </Grid.Column>

                <Grid.Column width={12} className="p-0 self-center">

                    <Container fluid className="flex flex-wrap gap-2 text-left max-h-24 overflow-y-auto overscroll-auto" style={{ minHeight: "72px" }}>

                        {parsedSeedPhrase.map((word, index) =>
                            <Button key={`seed-phrase-btn-${index}`} color="blue" content={word} size="mini" />
                        )}

                    </Container>

                </Grid.Column>

                <Grid.Column width={12} className="p-0 self-center">

                    <Container className="flex justify-between">

                        <Button color="black" basic content="Go Back" onClick={history.goBack} />

                        <Button color="teal" disabled={!seedPhraseIsCorrect} content={verifyPhraseButtonText} onClick={phraseEntered} />

                    </Container>

                </Grid.Column>

            </Grid>

        </Page>
    )

}

export default EnterRecoveryPhrase;
