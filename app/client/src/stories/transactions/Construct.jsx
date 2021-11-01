import React from 'react';
import { useSelector } from 'react-redux';

import { transactionStatus } from 'util/_util';

import ConstructionModule from './creation/ConstructionModule';
import LoadingModule from './loading/LoadingModule';
import InspectionModule from './inspection/InspectionModule';

function Construct() {

    const { status } = useSelector(state => ({
        status: state.transaction.status
    }));

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
