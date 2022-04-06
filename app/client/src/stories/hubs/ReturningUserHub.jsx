import React, { useContext, useEffect, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import head from 'lodash/head';
import { Button, Container, Divider, Grid, Header, Loader, Menu, Popup } from 'semantic-ui-react'

import Page from 'layout/Page';
import { classNames } from 'util/generic';
import { Datastores, SearchTXs, Overview, WalletTXs } from './tabPanes/_tabPanes';
import { WalletHubContext } from 'context/WalletHubContext';

export default function Hub() {

    const { internal, external } = useSelector(state => (
        { internal: state.vault.wallets.internal, external: state.vault.wallets.external }
    ));

    const wallets = useMemo(() => internal.concat(external) || [], [internal, external]);
    const history = useHistory();

    const [openDrawer, setOpenDrawer] = React.useState(true);
    const { selectedWallet, setSelectedWallet, activeTabPane, setActiveTabPane } = useContext(WalletHubContext);

    const gotoAddWallet = () => {
        history.push('/addWallet/menu');
    }

    const handleTabChange = (e, { index }) => {
        setActiveTabPane(index);
    };

    useEffect(() => {
        if (wallets.length > 0 && !selectedWallet) {
            setSelectedWallet(head(wallets));
        }
    }, [wallets, selectedWallet, setSelectedWallet])

    const panes = [
        {
            name: 'Overview',
            render: () => <Overview wallet={selectedWallet} />,
        },
        {
            name: 'Datastores',
            render: () => <Datastores wallet={selectedWallet} />,
        },
        {
            name: `Wallet txs`,
            render: () => <WalletTXs wallet={selectedWallet} />,
        },
        {
            name: 'Search txs',
            render: () => <SearchTXs wallet={selectedWallet} />,
        },
    ];

    return (
        <Page showMenu showNetworkStatus>

            <div className="relative">

                <Grid columns={2} className="m-0 h-full">

                    <Grid.Column width={openDrawer ? 3 : 1} className={`duration-300 pl-6 transition-transform transition-width pr-0`}>

                        <Container className="flex flex-col gap-10 h-full">

                            <Container className="gap-3 flex flex-row justify-center items-center text-justify add-wallets">

                                <Button circular size={openDrawer ? 'mini' : 'mini'} className="m-0" icon="add" onClick={gotoAddWallet} />

                                {openDrawer && <Header as='h4' className="m-0 text-gray-700">Wallets</Header>}

                            </Container>

                            <Container className="flex flex-col gap-3 p-0 max-h-104 overflow-y-auto overscroll-contain no-scrollbar items-stretch">

                                {wallets.map((wallet, index) =>
                                <Popup size="mini"
                                    content={wallet.name}
                                    position="right center"
                                    offset="0 -4"
                                    key={wallet.address}
                                    trigger={
                                        <Button
                                            color="teal"
                                            content={openDrawer ? <span style={{ textOverflow: "ellipsis", whiteSpace: "nowrap" }} className="block overflow-hidden">{wallet.name}</span> : wallet.name.substring(0, 2)}
                                            className={classNames("flex-shrink-0 m-0 p-2 rounded-sm",
                                                { "text-xs uppercase": !openDrawer }, { "text-sm": openDrawer })}
                                            style={{ minWidth: "28px" }}
                                            basic={selectedWallet && wallet.address !== selectedWallet.address}
                                            onClick={() => setSelectedWallet(wallet)}
                                            size="mini"
                                        />
                                    }
                                />
                                    
                                )}

                            </Container>

                        </Container>

                    </Grid.Column>

                    <Grid.Column width={1} className="p-0">

                        <Divider vertical className={`duration-300 transition-transform transition-left}`}>

                            <div className="flex">

                                <Button
                                    className="-mt-4 mr-0 z-10 transition-bg hover:bg-gray-300"
                                    style={{ backgroundColor: '#E0E1E2' }}
                                    circular
                                    size="mini"
                                    icon={`triangle ${openDrawer ? 'left' : 'right'}`}
                                    onClick={() => setOpenDrawer(prevState => !prevState)}
                                />

                            </div>

                        </Divider>

                    </Grid.Column>

                    <Grid.Column width={openDrawer ? 12 : 14} className="flex flex-col duration-300 transition-transform transition-width pl-0 pr-6">

                        <Container className="flex flex-col">
                            {selectedWallet ?
                                <div>
                                    <Menu tabular attached={"top"} className="tab-panes">
                                        {panes.map((pane, index) =>
                                            <Menu.Item
                                                key={`menu-item-${index}-${pane.name}`}
                                                name={pane.name}
                                                index={index}
                                                active={activeTabPane === index}
                                                onClick={handleTabChange}
                                            />
                                        )}
                                        <Menu.Menu position="right">
                                            <Menu.Item disabled name="Block Explorer" />
                                        </Menu.Menu>
                                    </Menu>
                                    {panes[activeTabPane].render()}
                                </div>
                                :
                                <Loader active />
                            }
                        </Container>

                    </Grid.Column>

                </Grid>

            </div>

        </Page>
    )
}
