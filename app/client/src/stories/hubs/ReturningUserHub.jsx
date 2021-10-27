import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import head from 'lodash/head';
import { Button, Container, Divider, Grid, Header, Loader, Tab } from 'semantic-ui-react'

import Page from 'layout/Page';
import { classNames } from 'util/generic';
import { Datastores, Overview, RecentTxs } from './tabPanes/_tabPanes';
import { INTERFACE_ACTIONS } from 'redux/actions/_actions';
import { tabPaneIndex } from 'layout/HeaderMenu';

export default function Hub() {

    const { internal, external } = useSelector(state => (
        { internal: state.vault.wallets.internal, external: state.vault.wallets.external }
    ));

    const wallets = React.useMemo(() => internal.concat(external) || [], [internal, external]);
    const dispatch = useDispatch();
    const history = useHistory();

    const [openDrawer, setOpenDrawer] = React.useState(true);
    const [selectedWallet, setSelectedWallet] = React.useState(null);

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
        if (wallets.length > 0) {
            setSelectedWallet(head(wallets));
        }
    }, [wallets])

    useEffect(() => {
        dispatch(INTERFACE_ACTIONS.updateActiveTabPane(tabPaneIndex.Wallets));
    }, []); // eslint-disable-line

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
    ];

    return (
        <Page showMenu>

            <div className="relative">

                <Grid columns={2} className="m-0 h-full">

                    <Grid.Column className={`duration-300 transition-transform transition-width w-1/${openDrawer ? '3' : '8'}`}>

                        <Container className="flex flex-col gap-10 h-full">

                            <Container className="gap-3 flex flex-row justify-center items-center text-justify">

                                <Button circular size={openDrawer ? 'mini' : 'small'} className="m-0" icon="add" onClick={gotoAddWallet} />

                                {openDrawer && <Header as='h3' className="m-0">Wallets</Header>}

                            </Container>

                            <Container className="flex flex-col gap-3 px-3 max-h-104 overflow-y-auto overscroll-contain no-scrollbar items-stretch">

                                {wallets.map((wallet, index) =>
                                    <Button
                                        key={wallet.address}
                                        color="purple"
                                        content={openDrawer ? wallet.name : index + 1}
                                        className={classNames("flex-shrink-0 m-0 p-2.5")}
                                        basic={selectedWallet && wallet.address !== selectedWallet.address}
                                        onClick={() => setSelectedWallet(wallet)}
                                    />
                                )}

                            </Container>

                        </Container>

                    </Grid.Column>

                    <Grid.Column className={`p-0 duration-300 transition-transform transition-width w-${openDrawer ? '2/3' : '7/8'}`}>

                        <Container className="p-4">

                            {selectedWallet ? <Tab className="overwrite-tab" menu={{ secondary: true, pointing: true }} panes={panes}/> : <Loader active/>}

                        </Container>

                    </Grid.Column>

                </Grid>

                <Divider vertical className={`duration-300 transition-transform transition-left left-1/${openDrawer ? 3 : 8}`}>

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

            </div>

        </Page>
    )

}

