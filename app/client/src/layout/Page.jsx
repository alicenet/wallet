import React from 'react';
import { Container } from 'semantic-ui-react';

import HeaderMenu from './HeaderMenu';
import NetworkStatusIndicator from 'components/overlays/NetworkStatusIndicator';

const Page = ({ children, showMenu, showNetworkStatus }) => {

    return (
        <Container className="h-full flex flex-col" fluid>

            <HeaderMenu showMenu={showMenu}/>

            <Container className="w-full h-full flex">

                {children}

            </Container>

            {showNetworkStatus && <NetworkStatusIndicator/>}

        </Container>
    );
};

export default Page;
