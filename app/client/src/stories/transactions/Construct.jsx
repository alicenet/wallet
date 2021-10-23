import React, { useEffect, useState } from 'react';
import { Button, Container, Grid, Header } from 'semantic-ui-react';
import Page from 'layout/Page';
import { INTERFACE_ACTIONS } from 'redux/actions/_actions';
import { useDispatch } from 'react-redux';

import { tabPaneIndex } from 'layout/HeaderMenu';
import AddValueStoreButton from './AddValueStoreButton';
import AddDataStoreButton from './AddDataStoreButton';

function Construct() {

    const dispatch = useDispatch();

    const [selectedDataStore, setSelectedDataStore] = useState({ from: null, to: null, duration: null, key: null, value: null });
    const [selectedValueStore, setSelectedValueStore] = useState({ from: null, to: null, value: null });

    useEffect(() => {
        dispatch(INTERFACE_ACTIONS.updateActiveTabPane(tabPaneIndex.Transactions));
    }, [dispatch]);

    return (
        <Page showMenu>

            <Grid textAlign="center" className="m-0">

                <Grid.Column width={16} className="p-0 self-center">

                    <Header content="Construct a transaction" as="h3" className="m-0"/>

                </Grid.Column>

                <Grid.Column width={8} className="p-0 self-center text-sm">

                    <p>A selector is gonna be here.</p>

                </Grid.Column>

                <Grid.Column width={8} className="p-0 self-center text-sm">

                    <Container className="flex justify-evenly">

                        <AddDataStoreButton dataStore={selectedDataStore}/>

                        <AddValueStoreButton valueStore={selectedValueStore}/>

                    </Container>

                </Grid.Column>

                <Grid.Column width={16} className="p-0 self-center">

                    <Button color="teal" content='Send Transactions' disabled className="m-0"/>

                </Grid.Column>

            </Grid>

        </Page>
    )

}

export default Construct;
