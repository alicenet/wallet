import React from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import head from 'lodash/head';
import { Button, Container, Divider, Grid, Header, Loader, Tab } from 'semantic-ui-react'

import Page from 'layout/Page';
import { classNames } from 'util/generic';
import { Datastores, Overview, RecentTxs, FetchTxs } from './tabPanes/_tabPanes';
import { SelectedWalletContext } from 'context/Hub_SelectedWalletContext';

export default function Hub() {

    const { internal, external } = useSelector(state => (
        { internal: state.vault.wallets.internal, external: state.vault.wallets.external }
    ));

    const wallets = React.useMemo(() => internal.concat(external) || [], [internal, external]);
    const history = useHistory();

    const [openDrawer, setOpenDrawer] = React.useState(true);
    const { selectedWallet, setSelectedWallet } = React.useContext(SelectedWalletContext);

    const { vaultExistsAndIsLocked } = useSelector(s => ({ vaultExistsAndIsLocked: s.vault.is_locked }))

    const gotoAddWallet = () => {
        history.push('/addWallet/menu');
    }

    React.useEffect(() => {
        if (vaultExistsAndIsLocked) {
            history.push('/'); // Send to root for appropriate redirect
        }
    }, [vaultExistsAndIsLocked, history])

    React.useEffect(() => {
        if (wallets.length > 0 && !selectedWallet) {
            setSelectedWallet(head(wallets));
        }
    }, [wallets, selectedWallet, setSelectedWallet])

    const internalPanelHeightStyle = { height: "456px", maxHeight: "456px" };

    const panes = [
        {
            menuItem: 'Overview',
            render: () => <Overview wallet={selectedWallet}/>,
        },
        {
            menuItem: 'Recent TXs',
            render: () => <RecentTxs wallet={selectedWallet}/>,
        },
        {
            menuItem: 'Datastores',
            render: () => <Datastores wallet={selectedWallet}/>,
        },
        {
            menuItem: 'Find Tx',
            render: () => <FetchTxs wallet={selectedWallet}/>,
        },
    ];

    return (
        <Page showMenu>

            <div className="relative">

                <Grid columns={2} className="m-0 h-full">

                    <Grid.Column width={openDrawer ? 3 : 1} className={`duration-300 pl-6 transition-transform transition-width pr-0`}>

                        <Container className="flex flex-col gap-10 h-full">

                            <Container className="gap-3 flex flex-row justify-center items-center text-justify">

                                <Button circular size={openDrawer ? 'mini' : 'mini'} className="m-0" icon="add" onClick={gotoAddWallet}/>

                                {openDrawer && <Header as='h4' className="m-0 text-gray-700">Wallets</Header>}

                            </Container>

                            <Container className="flex flex-col gap-3 p-0 max-h-104 overflow-y-auto overscroll-contain no-scrollbar items-stretch">

                                {wallets.map((wallet, index) =>
                                    <Button
                                        key={wallet.address}
                                        color="purple"
                                        content={openDrawer ? wallet.name : index + 1}
                                        className={classNames("flex-shrink-0 m-0 p-2 bg-purple-900 hover:bg-blue-800 rounded-sm",
                                            { "text-xs": !openDrawer }, { "text-sm": openDrawer })}
                                        style={{ minWidth: "28px" }}
                                        disabled={selectedWallet && wallet.address === selectedWallet.address}
                                        basic={selectedWallet && wallet.address !== selectedWallet.address}
                                        onClick={() => setSelectedWallet(wallet)}
                                        size="mini"
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

                    <Grid.Column width={openDrawer ? 12 : 14} className="duration-300 transition-transform transition-width p-0 pr-4 pt-4">

                        <Container>
                            {selectedWallet ? <Tab panes={panes} className=""/> : <Loader active/>}
                        </Container>

                    </Grid.Column>

                </Grid>

            </div>

        </Page>
    )

}

