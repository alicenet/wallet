import React from 'react';

import {Button, Container, Grid, Header} from "semantic-ui-react";

import HeaderMenu from "../../Components/HeaderMenu";


function VaultOptOut() {

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

                        <p>You will still be given a mnemonic phrase for your first wallet but the seed will not be encrypted and stored to generate additional wallets from. Instead the first wallet’s private keys will be stored in it’s own keystore file.</p>

                        <p>In addition you will be required to input the password for all keystores generated and reimport any imported keys every time you use MadWallet.</p>

                        <p>New keys will be generated off of this mnemonic key and placed into a newly passworded keystores that must be unlocked upon load.</p>

                    </Grid.Column>

                    <Grid.Column width={16} className="flex flex-auto flex-col items-center gap-5">

                        <Container fluid className="flex flex-auto flex-col items-center gap-5 w-72">

                            <Button color="purple" basic disabled content="Generate Seed" fluid/>

                        </Container>

                    </Grid.Column>

                </Grid>

            </Container>

        </div>
    )

}

export default VaultOptOut;
