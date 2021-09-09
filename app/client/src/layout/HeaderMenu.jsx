import React from 'react';

import {Container, Header, Icon, Image, Menu, Tab} from 'semantic-ui-react';

import {withRouter} from 'react-router-dom';

import MadIcon from '../Assets/icon.png';

function CreateVault({history, showTabs}) {

    return (
        <Menu secondary className="m-0">

            <Container fluid className="flex flex-row content-center justify-start">

                <Menu.Item as='a' header className='p-0' onClick={() => history.push('/')}>

                    <Container fluid className="flex flex-row items-center">

                        <Image src={MadIcon} size="mini" className="mx-1"/>

                        <Container fluid>

                            <Header content="MadWallet" as="h4" className="mx-2"/>

                        </Container>

                    </Container>

                </Menu.Item>

            </Container>

            <Container fluid className="flex flex-row content-center justify-center">

                {showTabs && <Tab activeIndex={-1} menu={{secondary: true, pointing: true}} panes={[
                    {
                        menuItem: 'Wallets'
                    },
                    {
                        menuItem: 'Transactions'
                    },
                    {
                        menuItem: 'MadNet'
                    },
                    {
                        menuItem: 'Ethereum'
                    },
                ]}/>}

            </Container>

            <Container fluid className="flex flex-row content-center justify-end">

                <Menu.Item as='a' header onClick={() => history.push('/')} className="mx-0">

                    <Icon name="cog" size="large" className="mx-0"/>

                </Menu.Item>

            </Container>

        </Menu>
    )

}

export default withRouter(CreateVault);
