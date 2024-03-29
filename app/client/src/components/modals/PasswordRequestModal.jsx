import React, { useEffect, useState } from 'react';
import useFormState from 'hooks/useFormState';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Form, Header, Icon, Modal } from 'semantic-ui-react';

import { MODAL_ACTION_TYPES } from 'redux/constants/_constants';
import { electronStoreCommonActions } from 'store/electronStoreHelper';

/**
 * Password request modal -- Redux state handles open/close as well as the success-submit callback.
 * @returns
 */
export default function PasswordRequestModal() {

    const dispatch = useDispatch();
    const [formState, formSetter, onSubmit] = useFormState([
        {
            name: 'password',
            type: 'string',
            isRequired: true,
            validation: {
                check: async (password) => await electronStoreCommonActions.checkPasswordAgainstPreflightHash(password), // Check password against preflight hash
                message: 'Incorrect Password!'
            }
        }
    ]);
    const [isOpen, reason, callback] = useSelector(s => ([s.modal.password_req_modal, s.modal.password_req_reason, s.modal.password_req_cb]));

    const [showPassword, setShowPassword] = React.useState(false);

    const closeModal = async () => {
        formSetter.setPassword('');
        formSetter.clearPasswordError();
        dispatch({ type: MODAL_ACTION_TYPES.CLOSE_PW_REQUEST });
    };

    const tryPassword = async () => {
        formSetter.setPassword('');
        callback(formState.password.value);
        dispatch({ type: MODAL_ACTION_TYPES.CLOSE_PW_REQUEST });
    };

    const [passwordHint, setPasswordHint] = useState('');

    useEffect(() => {
        const checkForPasswordHint = async () => {
            let passwordHint = await electronStoreCommonActions.readPasswordHint();
            typeof passwordHint === 'string' ? setPasswordHint(passwordHint) : setPasswordHint('');
        }
        checkForPasswordHint();
    }, []);

    return (
        <Modal open={isOpen}>

            <Modal.Header>
                <Header as="h3">
                    <Header.Content>
                        Password Request
                        <Header.Subheader>
                            <span className="font-bold text-gray-600">Reason:</span>
                            <span className="text-gray-400 ml-2">
                                {reason}
                            </span>
                        </Header.Subheader>
                                                
                    </Header.Content>
                </Header>

            </Modal.Header>

            <Modal.Content>

                <Form size="small" className="mini-error-form text-left" onSubmit={() => onSubmit(tryPassword)} error={!!formState.password.error}>

                    <Form.Input
                        label="Vault Password"
                        type={showPassword ? "text" : "password"}
                        error={!!formState.password.error && { content: formState.password.error }}
                        value={formState.password.value}
                        onChange={e => formSetter.setPassword(e.target.value)}
                        icon={<Icon link name={showPassword ? "eye" : "eye slash"} onClick={() => setShowPassword(s => !s)} />}
                    />

                    <div>
                        <span className="font-bold text-gray-600">Password Hint:</span>
                        <span className="text-gray-400 ml-2">
                            {passwordHint}
                        </span>
                    </div>

                </Form>

            </Modal.Content>

            <Modal.Actions>

                <div className="flex justify-between">

                    <Button className="transparent" content="Close" onClick={closeModal} basic />

                    <Button
                        content={formState.password.error ? "Try Again" : "Submit"}
                        color="teal"
                        onClick={() => onSubmit(tryPassword)}
                    />

                </div>

            </Modal.Actions>

        </Modal>
    )

}