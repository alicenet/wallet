import React from 'react';

import {Button, Container, Grid, Header, Image} from "semantic-ui-react";

import MadIcon from "../../Assets/icon.png";
import {withRouter} from "react-router-dom";

function CreateVault({history}) {

    return (
        <Grid textAlign="center" verticalAlign="middle">

            <Grid.Column width={16}>

                <Header content="Welcome to" as="h3" className="my-0"/>

                <Image src={MadIcon} size="tiny" centered/>

                <Header content="MadWallet" as="h3" className="my-0"/>

            </Grid.Column>

            <Grid.Column width={16} className="mt-2 mb-2">

                <p>Internal wallets will be generated through a seed phrase that will be shown on the next step.</p>

                <p>Your seed phrase is the key to your internal wallets, please keep it in a secure location.</p>

            </Grid.Column>

            <Grid.Column width={16} className="flex flex-auto flex-col items-center gap-5">

                <Container fluid className="flex flex-auto flex-col items-center gap-3 w-72">

                    <Button color="purple" basic content="Get Seed Phrase" fluid onClick={() => history.push('/')}/>

                    <Button color="orange" basic content="Just Generate A Keystore" fluid/>

                </Container>

                <p className="text-purple-500">More Info On How Wallets Are Generated</p>

            </Grid.Column>

        </Grid>
    )

}

export default withRouter(CreateVault);
