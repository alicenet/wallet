import React from 'react';

import { Container, Header, Icon, Image, Menu, Tab } from 'semantic-ui-react';
import { useHistory, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import MadIcon from '../Assets/icon.png';
import { VAULT_ACTIONS } from '../redux/actions/_actions';

export const tabPaneIndex = {
    Wallets: 0,
    Transactions: 1,
    MadNet: 2,
    Ethereum: 3,
}

function HeaderMenu({ showMenu }) {

    const history = useHistory();
    const dispatch = useDispatch();
    const location = useLocation();
    const pathname = location.pathname;

    const [lockIcon, setLockIcon] = React.useState("unlock");

    const exemptLockLocations = ['/returningUserLoad/hasKeystore', 'wallet/settings', 'wallet/advancedSettings'];
    const pathIsLockExempt = () => { // The lock should not appear on any page in exemptLockLocations
        for (let path of exemptLockLocations) {
            if (pathname.indexOf(path) !== -1) {
                return true
            }
        }
        return false;
    }

    const activeTabPane = ((() => {
        if (pathname.indexOf("/hub") !== -1) { return tabPaneIndex.Wallets }
        if (pathname.indexOf("/transactions") !== -1) { return tabPaneIndex.Transactions }
        return tabPaneIndex.Wallets;
    })())

    const { exists, optout, vaultLocked } = useSelector(s => ({
        vaultLocked: s.vault.is_locked,
        exists: s.vault.exists,
        optout: s.vault.optout,
    }));

    const existingAccount = exists || optout;

    const handleTabChange = (e, { activeIndex, panes }) => {
        if (panes[activeIndex].destination) {
            history.push(panes[activeIndex].destination);
        }
    };

    const tabPanes = [
        { menuItem: 'Wallets', destination: '/hub' },
        { menuItem: 'Transactions', destination: '/transactions' },
        // { menuItem: 'MadNet' },
        // { menuItem: 'Ethereum' }
    ];

    return (
        <Menu secondary className="m-0 my-1">

            <Container fluid className="flex flex-row content-center justify-start">

                <Menu.Item header className='p-0 mx-2'>

                    <Container fluid className="flex flex-row items-center gap-4">

                        <Image src={MadIcon} size="mini" />

                        <Container fluid>

                            <Header content="MadWallet" as="h4" />

                        </Container>

                    </Container>

                </Menu.Item>

                <Container className="w-20" />

                {showMenu && existingAccount && (

                    <div className="flex justify-center items-centers">
                        <Tab
                            className="text-lg menu-tabs relative left-1"
                            menu={{ secondary: true }}
                            panes={tabPanes}
                            activeIndex={activeTabPane}
                            onTabChange={handleTabChange}
                        />
                    </div>
                )}

            </Container>


            <Container fluid className="flex flex-row content-center justify-end">

                {!vaultLocked && !pathIsLockExempt() && <Menu.Item as='a' header onClick={() => dispatch(VAULT_ACTIONS.lockVault())} className="mx-0 hover:bg-transparent">

                    <Icon onMouseEnter={() => setLockIcon("lock")} onMouseLeave={() => setLockIcon("unlock")} name={lockIcon} size="large" className="mx-0 transform duration-300 rotate-12 hover:rotate-0" />

                </Menu.Item>}

                {existingAccount && <Menu.Item as='a' header onClick={() => history.push('/wallet/settings')} className="mx-0 hover:bg-transparent">

                    <Icon name="cog" size="large" className="mx-0 transform duration-300 hover:rotate-90" />

                </Menu.Item>}

            </Container>

        </Menu>
    )

}

export default HeaderMenu;
