import React, { useEffect } from 'react';

import { Container, Header, Icon, Image, Menu, Tab } from 'semantic-ui-react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import MadIcon from '../Assets/icon.png';

import { INTERFACE_ACTIONS } from '../redux/actions/_actions';

function HeaderMenu({ showMenu }) {

    const history = useHistory();
    const dispatch = useDispatch();

    const { exists, optout, activeTabPane } = useSelector(s => ({
        exists: s.vault.exists,
        optout: s.vault.optout,
        activeTabPane: s.interface.activeTabPane,
    }));

    const existingAccount = exists || optout;

    const handleTabChange = (e, { activeIndex, panes }) => {
        if (panes[activeIndex].destination) {
            console.log(activeIndex)
            dispatch(INTERFACE_ACTIONS.updateActiveTabPane(activeIndex));
            history.push(panes[activeIndex].destination);
        }
    };

    const tabPanes = [
        { menuItem: 'Wallets', destination: '/hub' },
        { menuItem: 'Transactions', destination: '/transactions' },
        { menuItem: 'MadNet' },
        { menuItem: 'Ethereum' }
    ];

    return (
        <Menu secondary className="m-0 my-1">

            <Container fluid className="flex flex-row content-center justify-start">

                <Menu.Item as='a' header className='p-0 mx-2 hover:bg-transparent' onClick={() => history.push('/')}>

                    <Container fluid className="flex flex-row items-center gap-4">

                        <Image src={MadIcon} size="mini"/>

                        <Container fluid>

                            <Header content="MadWallet" as="h4"/>

                        </Container>

                    </Container>

                </Menu.Item>

            </Container>

            <Container fluid className="flex flex-row content-center justify-center items-center">

                {showMenu && existingAccount && (

                    <Tab
                        className="overwrite-tab smaller text-xs"
                        menu={{ secondary: true, pointing: true }}
                        panes={tabPanes}
                        activeIndex={activeTabPane}
                        onTabChange={handleTabChange}
                    />
                )}

            </Container>

            <Container fluid className="flex flex-row content-center justify-end">

                {existingAccount && <Menu.Item as='a' header onClick={() => history.push('/wallet/settings')} className="mx-0 hover:bg-transparent">

                    <Icon name="cog" size="large" className="mx-0 transform duration-300 hover:rotate-90"/>

                </Menu.Item>}

            </Container>

        </Menu>
    )

}

export default HeaderMenu;
