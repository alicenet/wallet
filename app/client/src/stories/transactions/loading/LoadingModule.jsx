import React from "react";
import { Button, Grid, Header, Loader } from "semantic-ui-react";
import Page from "layout/Page";
import { useSelector } from "react-redux";

function LoadingModule() {
    // State toggle to advance loading module occurs in AdapterActions.sendTransactionReducerTXs
    const pendingTxHash = useSelector(
        (state) => state.transaction.lastSentTxHash
    );

    return (
        <Page showMenu showNetworkStatus>
            <Grid textAlign="center" className="m-0" container>
                <Grid.Column width={16} className="p-0 self-center">
                    <Header as="h4" className="m-0">
                        TX Hash:
                        <Header.Subheader className="mt-2">
                            {pendingTxHash ? (
                                pendingTxHash
                            ) : (
                                <Loader size="mini" inline />
                            )}
                        </Header.Subheader>
                    </Header>
                </Grid.Column>

                <Grid.Column width={16} className="p-0 self-center">
                    <Loader
                        active
                        className="font-bold"
                        content={
                            !pendingTxHash
                                ? "Awaiting TxHash"
                                : "Awaiting Mining"
                        }
                    />
                </Grid.Column>

                <Grid.Column width={16} className="p-0 self-center">
                    <p className="text-sm text-yellow-600">
                        <strong>
                            If you don&apos;t feel like waiting, you don&apos;t
                            have to!
                            <br />
                            Notifications will appear regarding transaction
                            updates.
                        </strong>
                    </p>
                </Grid.Column>

                <Grid.Column width={16} className="p-0 self-center">
                    <Button
                        color="teal"
                        content="Waiting. . ."
                        disabled
                        className="m-0 w-52"
                    />
                </Grid.Column>
            </Grid>
        </Page>
    );
}

export default LoadingModule;
