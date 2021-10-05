import React from 'react';

import { Container, Header, Icon, Image, Menu, Tab } from 'semantic-ui-react';

import { useHistory } from 'react-router-dom';

import { useDispatch } from 'react-redux';

import MadIcon from '../Assets/icon.png';

import { USER_ACTIONS } from '../redux/actions/_actions';
import { useSelector } from 'react-redux';

function HeaderMenu({ hideMenu }) {

    const history = useHistory();

    const {exists, optout } = useSelector(s => ({exists: s.vault.exists, optout: s.vault.optout}));
    const existingAccount = (exists || optout);

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

                {false && <Tab activeIndex={-1} menu={{ secondary: true, pointing: true }} panes={[
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

                {!hideMenu && existingAccount && <Menu.Item as='a' header onClick={() => history.push('/wallet/settings')} className="mx-0">

                    <Icon name="cog" size="large" className="mx-0 transform duration-300 hover:rotate-90"/>

                </Menu.Item>}

            </Container>

        </Menu>
    )

}

export default HeaderMenu;
