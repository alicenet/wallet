import React from 'react';
import ErrorModal from './ErrorModal';
import { connect } from "react-redux";
import { MODAL_ACTIONS } from 'redux/actions/_actions';

function GlobalModalHandler({ modalState, dispatch }) {

    return (

        <ErrorModal open={modalState.globalErrorModal} message={modalState.globalErrorText} closeFx={() => dispatch(MODAL_ACTIONS.clearGlobalErrorModal())}/>

    )

}

const modalState = (state => ({ modalState: state.modal }));
export default connect(modalState)(GlobalModalHandler);