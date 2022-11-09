import React from "react";
import { Button, Form, Grid, Header, Segment } from "semantic-ui-react";
import { useSelector } from "react-redux";
import aliceNetAdapter from "adapters/alicenetAdapter";
import { useValueStoreFormState } from "hooks/_hooks";
import { walletUtils } from "util/_util";

const FormInput = ({ ...props }) => <Form.Input size="mini" {...props} />;

export default function Web3Panel() {
    const { wallets, adapterState } = useSelector((s) => ({
        wallets: [...s.vault.wallets.internal, ...s.vault.wallets.external],
        adapterState: s.adapter.aliceNetAdapter,
    }));

    const [valueFormState, valueFormSetters, valueFormErrors, onValueSubmit] =
        useValueStoreFormState();

    const addValueStore = (state) => {
        let txObject = {};
        txObject["type"] = "VS";
        txObject["name"] = "Value Store";
        txObject["fromAddress"] = state.fromAddress;
        txObject["value"] = state.value;
        txObject["toAddress"] = state.toAddress;
        txObject["bnCurve"] = false;

        aliceNetAdapter.addTxOut(txObject);
    };

    const sendTx = async () => {
        await aliceNetAdapter.createTx();
        await aliceNetAdapter.sendTx();
    };

    const getWalletButtons = (cb = () => {}) => {
        return wallets.map((wallet, idx) => (
            <Form.Button
                size="mini"
                fluid
                content={"w" + (idx + 1)}
                onClick={() => cb(wallet)}
            />
        ));
    };

    const useFromWallet = (wallet) => {
        valueFormSetters.setFromAddress(wallet.address);
    };

    const useToWallet = (wallet) => {
        valueFormSetters.setToAddress(wallet.address);
    };

    return (
        <>
            <Segment>
                <Header as="h4">
                    AliceNet Overview
                    <Header.Subheader>
                        Debug AliceNet instance initiated:{" "}
                        {String(!!adapterState.connected)}
                    </Header.Subheader>
                </Header>
            </Segment>

            <Segment>
                <Header>Transaction Panel</Header>

                <Segment>
                    <Button
                        content="Print AliceNetWalletInstance"
                        size="mini"
                        onClick={() =>
                            console.log(
                                aliceNetAdapter.getAliceNetWalletInstance()
                            )
                        }
                    />
                    <Button
                        content="Print TXout List"
                        size="mini"
                        onClick={() =>
                            console.log(aliceNetAdapter.txOuts.get())
                        }
                        className="ml-4"
                    />
                </Segment>

                <Grid columns={2}>
                    <Grid.Column>
                        <Segment>
                            <Header className="text-sm text-blue-500">
                                Add Value TXo
                            </Header>

                            <Form size="mini" className="mini-error-form">
                                <FormInput
                                    error={
                                        !!valueFormErrors.fromAddress && {
                                            content:
                                                valueFormErrors.fromAddress,
                                        }
                                    }
                                    label={
                                        "From " +
                                        walletUtils.getWalletNameFromAddress(
                                            valueFormState.fromAddress
                                        )
                                    }
                                    size="mini"
                                    value={valueFormState.fromAddress}
                                    onChange={(e) =>
                                        valueFormSetters.setFromAddress(
                                            e.target.value
                                        )
                                    }
                                />

                                <Form.Group widths="equal">
                                    {getWalletButtons(useFromWallet)}
                                </Form.Group>

                                <FormInput
                                    error={
                                        !!valueFormErrors.toAddress && {
                                            content: valueFormErrors.toAddress,
                                        }
                                    }
                                    label={
                                        "To: " +
                                        walletUtils.getWalletNameFromAddress(
                                            valueFormState.toAddress
                                        )
                                    }
                                    size="mini"
                                    value={valueFormState.toAddress}
                                    onChange={(e) =>
                                        valueFormSetters.setFromAddress(
                                            e.target.value
                                        )
                                    }
                                />

                                <Form.Group widths="equal">
                                    {getWalletButtons(useToWallet)}
                                </Form.Group>

                                <FormInput
                                    error={
                                        !!valueFormErrors.value && {
                                            content: valueFormErrors.value,
                                        }
                                    }
                                    label="Value"
                                    size="mini"
                                    value={valueFormState.value}
                                    onChange={(e) =>
                                        valueFormSetters.setValue(
                                            e.target.value
                                        )
                                    }
                                />

                                <Form.Checkbox
                                    className="small-checkbox"
                                    label="Is BN Address"
                                    checked={valueFormState.isBn}
                                    onChange={() =>
                                        valueFormSetters.setIsBn(
                                            !valueFormState.isBn
                                        )
                                    }
                                />

                                <div className="flex justify-between">
                                    <Form.Button
                                        content="Add TXO"
                                        size="mini"
                                        className="mt-4"
                                        onClick={() =>
                                            onValueSubmit(addValueStore)
                                        }
                                    />
                                    <Form.Button
                                        content="Print TXO List"
                                        size="mini"
                                        className="mt-4"
                                        onClick={() =>
                                            console.log(
                                                aliceNetAdapter.txOuts.get()
                                            )
                                        }
                                    />
                                </div>
                            </Form>
                        </Segment>
                    </Grid.Column>

                    <Grid.Column>
                        <Segment>
                            <Header sub>Add Data TXo</Header>
                            <Button content="Send" onClick={sendTx} />
                        </Segment>
                    </Grid.Column>
                </Grid>
            </Segment>
        </>
    );
}
