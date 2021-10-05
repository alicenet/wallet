import React from 'react';

import { Header, Container, Button } from 'semantic-ui-react'

import withWalletDrawer from 'hocs/withWalletDrawer/withWalletDrawer';

function Hub({ toggleWalletDrawer }) {

    return (

        <Container>


            <Header>Not much yet -- Wallet Overview TOBE </Header>

            <Button onClick={toggleWalletDrawer} content="toggleDrawer" />
        
        </Container>

    )

}

export default withWalletDrawer(Hub);