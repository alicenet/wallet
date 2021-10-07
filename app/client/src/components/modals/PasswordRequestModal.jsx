import useFormState from 'hooks/useFormState';
import { useDispatch, useSelector } from 'react-redux';
import { MODAL_ACTION_TYPES } from 'redux/constants/_constants';
import { Button, Form, Header, Modal } from 'semantic-ui-react';
import { electronStoreCommonActions } from 'store/electronStoreHelper';
import { classNames } from 'util/_util';

/**
 * Password request modal -- Redux state handles open/close as well as the success-submit callback.
 * @returns
 */
export default function PasswordRequestModal() {

    const dispatch = useDispatch();
    const [formState, formSetter] = useFormState(["password"]);
    const [isOpen, reason, callback] = useSelector(s => ([s.modal.password_req_modal, s.modal.password_req_reason, s.modal.password_req_cb]));

    const tryPassword = async () => {
        let success = await electronStoreCommonActions.checkPasswordAgainstPreflightHash(formState.password.value);
        if (!success) {
            return formSetter.setPasswordError("Incorrect Password!");
        }
        else {
            formSetter.clearPasswordError();
            formSetter.setPassword("");
            callback(formState.password.value);
            dispatch({ type: MODAL_ACTION_TYPES.CLOSE_PW_REQUEST });
        }
    }

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

                <div className="text-sm">
                    Your password has been requested for the reason above.
                </div>

                <Form size="small" className="mt-4" onSubmit={tryPassword} error={!!formState.password.error}>
                    <Form.Input error={!!formState.password.error} icon="key" value={formState.password.value} onChange={e => formSetter.setPassword(e.target.value)}/>
                </Form>

            </Modal.Content>

            <Modal.Actions className={classNames({ "flex justify-between": !!formState.password.error })}>
                {!!formState.password.error ? (
                    <Button size="mini" content="Can't Remember Password" basic color="orange" onClick={() => console.log("CAT TODO!")}/>
                ) : null}
                <Button size="mini" content={formState.password.error ? "Try Again" : "Submit"} basic color={formState.password.error ? "red" : "green"} onClick={tryPassword}/>
            </Modal.Actions>

        </Modal>
    )

}