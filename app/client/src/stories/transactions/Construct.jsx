import React, { useEffect } from 'react';
import { Button, Container, Grid } from 'semantic-ui-react';
import Page from 'layout/Page';
import { INTERFACE_ACTIONS, TRANSACTION_ACTIONS } from 'redux/actions/_actions';
import { useDispatch, useSelector } from 'react-redux';
import isEmpty from 'lodash/isEmpty';

import { tabPaneIndex } from 'layout/HeaderMenu';
import ConstructionModule from './ConstructionModule';

function Construct() {

    const dispatch = useDispatch();

    const { list } = useSelector(state => ({ list: state.transaction.list }));

    useEffect(() => {
        dispatch(INTERFACE_ACTIONS.updateActiveTabPane(tabPaneIndex.Transactions));
    }, []);

    const handleSendTransaction = () => {
        dispatch(TRANSACTION_ACTIONS.clearList());
    };

    return (
        <Page showMenu>

            <Grid textAlign="center" className="m-0">

                <Grid.Column width={16} className="p-0 self-center">

                    <Container>

                        <ConstructionModule/>

                    </Container>

                </Grid.Column>

                <Grid.Column width={16} className="p-0 self-center">

                    <Button color="teal" content='Send Transaction' disabled={isEmpty(list)} onClick={handleSendTransaction} className="m-0"/>

                </Grid.Column>

            </Grid>

        </Page>
    )

}

export default Construct;
