import React from 'react';

import { Button, Checkbox, Container, Grid, Header } from 'semantic-ui-react';

import { useHistory } from 'react-router-dom';

import Page from '../../layout/Page';

function VaultOptOutDisclaimer() {

    const [isChecked, setIsChecked] = React.useState(false);

    const history = useHistory();

    return (
        <Page>

            <Grid textAlign="center" className="m-0">

                <Grid.Column width={16} className="p-0 self-center">

                    <Header content="Vault Opt Out" as="h3" className="m-0" />

                </Grid.Column>

                <Grid.Column width={14} className="p-0 self-center">

                    <p>When opting out of vault storage you will be sacrificing user experience for security.</p>

                    <p>You will still be given a mnemonic phrase for your first wallet but the seed will not be encrypted and stored to generate additional wallets from. Instead
                        the first wallet’s private keys will be stored in it’s own keystore file.</p>

                    <p>In addition you will be required to input the password for all keystores generated and
                        reimport any imported keys every time you use MadWallet.</p>

                    <p>New keys will be generated off of this mnemonic key and placed into a newly passworded
                        keystores that must be unlocked upon load.</p>

                </Grid.Column>

                <Grid.Column width={16} className="p-0 self-center">

                    <p className="text-red-600 uppercase text-sm">

                        <strong>Remember: do not share your seed phrase</strong>

                    </p>

                </Grid.Column>

                <Grid.Column width={12} className="p-0 self-center">

                    <Container className="flex justify-between">

                        <div>

                            <Button color="orange" basic content="Go Back" className="m-0 h-11" onClick={() => history.goBack()} />

                        </div>

                        <div className="flex flex-col gap-2">

                            <Button.Group size='large'>

                                <Button color="purple" basic disabled={!isChecked} content="New" className="m-0 h-11" onClick={() => history.push('/YourSeedPhrase')} />

                                <Button.Or className="w-0 self-center text-sm" />

                                <Button color="purple" basic disabled={!isChecked} content="Existing" className="m-0 h-11" onClick={() => history.push('/YourSeedPhrase')} />

                            </Button.Group>

                        </div>

                    </Container>

                </Grid.Column>

            </Grid>

        </Page>
    )

}

export default VaultOptOutDisclaimer;
