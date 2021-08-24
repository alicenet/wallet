import React from 'react';
import { Modal, Message } from 'semantic-ui-react';
import log from 'loglevel';

/**
 * Generic Error Modal
 * @prop {String} message - Message to show the user
 * @prop {Function} tryAgainCb - Method to try again -- If passed will show try again button for passed function  
 * @prop {Boolean} open - Is the modal open?
 * @prop {Function} closeFx - Closing function for the modal state
 */
export default function ErrorModal(props) {

    if (props.closeFx === 'undefined') {
        throw new Error('Invoking ErrorModal without a parent close function passed as prop "closeFx"!');
    }

    let errActions = [{ content: 'Close', negative: true, onClick: props.closeFx }];

    // Handle prop overwrites
    const modalProps = Object.assign({ ...props }, {
        header: "Error!",
        size: props.size ? props.size : "tiny",
        actions: props.actions ? props.actions : errActions,
        content: <Message error style={{borderRadius: "0px"}}>{props.message}</Message>
    });

    return <Modal {...modalProps} />;

}