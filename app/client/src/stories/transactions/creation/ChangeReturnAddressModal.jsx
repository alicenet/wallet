import React, { useEffect, useMemo, useState } from "react";
import {
    Button,
    Checkbox,
    Form,
    Grid,
    Header,
    Icon,
    Modal,
    Popup,
} from "semantic-ui-react";
import { useDispatch, useSelector } from "react-redux";

import { TRANSACTION_ACTIONS } from "redux/actions/_actions";
import utils from "util/_util";
import { curveTypes } from "util/wallet";
import { useFormState } from "hooks/_hooks";

export default function ChangeReturnAddressModal({ open, onClose }) {
    const dispatch = useDispatch();

    const { internal, external, changeReturn } = useSelector((state) => ({
        internal: state.vault.wallets.internal,
        external: state.vault.wallets.external,
        changeReturn: state.transaction.changeReturn,
    }));

    const [formState, formSetter, onSubmit] = useFormState([
        {
            name: "ChangeReturn",
            display: "Change Return Address",
            type: "address",
            isRequired: true,
            value: changeReturn?.address,
        },
    ]);

    const [curveType, setCurveType] = useState(changeReturn?.curve);
    const [isBNCurveChecked, setIsBNCurveChecked] = useState(false);

    const wallets = useMemo(
        () =>
            internal.concat(external).map((wallet) => {
                return {
                    text: `${wallet.name} (${utils.string.addCurvePrefix(
                        wallet.address,
                        wallet.curve
                    )})`,
                    value: wallet.address,
                    curve: wallet.curve,
                };
            }) || [],
        [internal, external]
    );

    useEffect(() => {
        if (formState.ChangeReturn.value) {
            setCurveType(
                wallets.find(
                    (wallet) => wallet.value === formState.ChangeReturn.value
                )?.curve
            );
            setIsBNCurveChecked(false);
        } else {
            setCurveType(changeReturn?.curve);
        }
    }, [changeReturn?.curve, formState, wallets]);

    const handleSubmit = async () => {
        dispatch(
            TRANSACTION_ACTIONS.saveChangeReturnAddress({
                address: utils.string.removeHexPrefix(
                    formState.ChangeReturn.value
                ),
                curve: wallets.find(
                    (wallet) => wallet.value === formState.ChangeReturn.value
                )?.curve,
            })
        );
        onClose();
    };

    return (
        <Modal open={open} onClose={onClose} size="small">
            <Modal.Header className="text-center">
                <Header as="h4">Change Return Address</Header>
            </Modal.Header>

            <Modal.Content>
                <Form
                    className="text-sm mini-error-form"
                    onSubmit={() => onSubmit(handleSubmit)}
                >
                    <Grid className="m-0">
                        <Grid.Row className="content-between">
                            <Form.Dropdown
                                required
                                label="Return Address"
                                className="w-full"
                                defaultValue={changeReturn?.address}
                                options={wallets}
                                placeholder="Choose UTXO Return Address"
                                search
                                selection
                                closeOnChange
                                onChange={(e, { value }) =>
                                    formSetter.setChangeReturn(value)
                                }
                                error={
                                    !!formState.ChangeReturn.error && {
                                        content: formState.ChangeReturn.error,
                                    }
                                }
                            />
                        </Grid.Row>

                        {curveType === curveTypes.BARRETO_NAEHRIG && (
                            <Grid.Row className="content-between pb-0">
                                <Checkbox
                                    className="flex items-end text-xs uppercase font-bold pb-2"
                                    checked={isBNCurveChecked}
                                    onChange={() => {
                                        setIsBNCurveChecked(
                                            (prevState) => !prevState
                                        );
                                    }}
                                    label={
                                        <>
                                            <label className={"labelCheckbox"}>
                                                This is a BN
                                            </label>
                                            <Popup
                                                size="mini"
                                                position="right center"
                                                trigger={
                                                    <Icon
                                                        name="question circle"
                                                        className="ml-1 mb-1.5"
                                                    />
                                                }
                                                content="Is this a BN Curve address?"
                                            />
                                        </>
                                    }
                                />
                            </Grid.Row>
                        )}
                    </Grid>
                </Form>
            </Modal.Content>

            <Modal.Actions className="flex justify-between">
                <Button color="black" basic onClick={onClose} content="Close" />

                <Button
                    content="Submit"
                    color="teal"
                    disabled={
                        curveType === curveTypes.BARRETO_NAEHRIG &&
                        !isBNCurveChecked
                    }
                    onClick={() => onSubmit(handleSubmit)}
                />
            </Modal.Actions>
        </Modal>
    );
}
