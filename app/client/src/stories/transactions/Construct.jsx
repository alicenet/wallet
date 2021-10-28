import React, { useEffect } from 'react';
import { INTERFACE_ACTIONS } from 'redux/actions/_actions';
import { useDispatch, useSelector } from 'react-redux';

import { tabPaneIndex } from 'layout/HeaderMenu';
import { transactionStatus } from 'util/_util';

import ConstructionModule from './creation/ConstructionModule';
import LoadingModule from './loading/LoadingModule';
import InspectionModule from './inspection/InspectionModule';

function Construct() {

    const dispatch = useDispatch();

    const { status } = useSelector(state => ({
        status: state.transaction.status
    }));

    useEffect(() => {
        dispatch(INTERFACE_ACTIONS.updateActiveTabPane(tabPaneIndex.Transactions));
    }, []);

    switch (status) {
        case transactionStatus.CREATION:
            return <ConstructionModule/>;
        case transactionStatus.LOADING:
            return <LoadingModule/>;
        case transactionStatus.INSPECTION:
            return <InspectionModule/>;
        default:
            return null;
    }

}

export default Construct;
