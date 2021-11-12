import React from 'react';

import { Container, Header, Icon, Image, Menu, Popup } from 'semantic-ui-react';
import { useHistory, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import MadIcon from 'Assets/icon.png';
import { VAULT_ACTIONS } from 'redux/actions/_actions';

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

    const goto = (path) => {
        history.push(path);
    }

    const MenuTabItem = ({ name, activeId, gotoPath }) => {
        return (
            <Menu.Item
                className="cursor-pointer hover:bg-gray-200 hover:bg-opacity-50 hover:rounded-2xl"
                content={name}
                active={activeId === activeTabPane}
                onClick={() => goto(gotoPath)}
            />
        )
    }

    return (
        <Menu size="mini" secondary compact pointing className="m-0 my-1 border-b-0">

            <div className="flex justify-between w-full">

                <Menu.Item header className='p-0 mx-2 border-right-none'>

                    <Container fluid className="flex flex-row items-center gap-4">

                        <Image src={MadIcon} size="mini" />

                        <Container fluid>

                            <Header content="MadWallet" as="h4" />

                        </Container>

                    </Container>

                </Menu.Item>

                <div className="flex">

                    {showMenu && existingAccount && (<>
                        <MenuTabItem name="Wallets" activeId={tabPaneIndex.Wallets} gotoPath="/hub" />
                        <MenuTabItem name="Transactions" activeId={tabPaneIndex.Transactions} gotoPath="/transactions" />
                    </>)}

                </div>

                <div className="flex">

                    {
                        !vaultLocked && !pathIsLockExempt() &&
                        <Popup size="mini"
                            content="Lock Vault"
                            position="right center"
                            offset="0, -4"
                            trigger={
                                <Menu.Item as='a' header onClick={() => dispatch(VAULT_ACTIONS.lockVault())} className="px-3 hover:bg-transparent">

                                    <Icon
                                        onMouseEnter={() => setLockIcon("lock")}
                                        onMouseLeave={() => setLockIcon("unlock")}
                                        name={lockIcon}
                                        className="transform duration-300 rotate-12 hover:rotate-0"
                                    />

                                </Menu.Item>
                            }

                        />
                    }

                    {
                        existingAccount &&
                        <Popup size="mini"
                            content="Open Settings"
                            position="right center"
                            offset="0, -4"
                            trigger={
                                <Menu.Item as='a' header onClick={() => history.push('/wallet/settings')} className="px-3 hover:bg-transparent">
                                    <Icon name="cog" className="transform duration-300 hover:rotate-90" />
                                </Menu.Item>
                            }
                        />

                    }

                </div>

            </div>

        </Menu>
    )

}

export default HeaderMenu;
