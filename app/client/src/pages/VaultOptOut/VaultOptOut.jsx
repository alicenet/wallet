import React from 'react';

import {Button, Checkbox, Container, Grid, Header} from "semantic-ui-react";

import {withRouter} from "react-router-dom";

import HeaderMenu from "../../Components/HeaderMenu";

function VaultOptOut({history}) {

    const [isChecked, setIsChecked] = React.useState(false);

    return (
        <div>

            <HeaderMenu/>

            <Container>

                <Grid textAlign="center" verticalAlign="middle">

                    <Grid.Column width={16}>

                        <Header content="Vault Opt Out" as="h3" className="my-0"/>

                    </Grid.Column>

                    <Grid.Column width={16} className="m-2">

                        <p>When opting out of vault storage you will be sacrificing user experience for security.</p>

                        <p>You will still be given a mnemonic phrase for your first wallet but the seed will not be
                            encrypted and stored to generate additional wallets from. Instead the first wallet’s private
                            keys will be stored in it’s own keystore file.</p>

                        <p>In addition you will be required to input the password for all keystores generated and
                            reimport any imported keys every time you use MadWallet.</p>

                        <p>New keys will be generated off of this mnemonic key and placed into a newly passworded
                            keystores that must be unlocked upon load.</p>

                    </Grid.Column>

                    <Grid.Column width={16} className="m-2">

                        <p className="text-red-600 uppercase text-sm">

                            <strong>
                                Remember: do not share your seed phrase
                            </strong>

                        </p>

                    </Grid.Column>

                    <Grid.Column width={16} className="flex flex-auto flex-col items-center gap-5">

                        <Container fluid className="flex flex-auto flex-col items-center gap-5 w-96">

                            <Button color="purple" basic disabled={!isChecked} content="Generate Seed" fluid onClick={() => history.push('/')}/>

                            <Checkbox onChange={() => setIsChecked(prevState => !prevState)} checked={isChecked}
                                      label={<label>I Understand and wish to opt out of vault storage</label>}/>

                        </Container>

                    </Grid.Column>

                </Grid>

            </Container>

        </div>
    )

}

export default withRouter(VaultOptOut);
