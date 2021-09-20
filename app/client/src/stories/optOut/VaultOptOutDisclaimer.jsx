import React from 'react';

import {Button, Checkbox, Container, Grid, Header} from 'semantic-ui-react';

import {useHistory} from 'react-router-dom';

import Page from '../../layout/Page';

function VaultOptOutDisclaimer() {

    const [isChecked, setIsChecked] = React.useState(false);

    const history = useHistory();

    return (
        <Page>

            <Grid textAlign="center">

                <Grid.Column width={16} className="my-5">

                    <Header content="Vault Opt Out" as="h3" className="my-0"/>

                </Grid.Column>

                <Grid.Column width={15}>

                    <p>When opting out of vault storage you will be sacrificing user experience for security.</p>

                    <p>You will still be given a mnemonic phrase for your first wallet but the seed will not be
                        encrypted and stored to generate additional wallets from. Instead the first wallet’s private
                        keys will be stored in it’s own keystore file.</p>

                    <p>In addition you will be required to input the password for all keystores generated and
                        reimport any imported keys every time you use MadWallet.</p>

                    <p>New keys will be generated off of this mnemonic key and placed into a newly passworded
                        keystores that must be unlocked upon load.</p>

                </Grid.Column>

                <Grid.Column width={16} className="my-5">

                    <p className="text-red-600 uppercase text-sm">

                        <strong>
                            Remember: do not share your seed phrase
                        </strong>

                    </p>

                </Grid.Column>

                <Grid.Column width={16} className="flex-col">

                    <Container fluid className="flex flex-auto flex-col items-center gap-5 w-96">

                        <Button.Group className="flex justify-center w-72">

                            <Button color="orange" basic content="Go Back" fluid onClick={() => history.goBack()}/>

                            <Button color="purple" basic disabled={!isChecked} content="Generate Keystore" fluid onClick={() => history.push('/optOut/generateKeyStore')}/>

                        </Button.Group>

                        <Checkbox onChange={() => setIsChecked(prevState => !prevState)} checked={isChecked}
                                  label={<label>I Understand and wish to opt out of vault storage</label>}/>

                    </Container>

                </Grid.Column>

            </Grid>

        </Page>
    )

}

export default VaultOptOutDisclaimer;
