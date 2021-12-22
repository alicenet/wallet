import React from 'react';
import { Button, Container, Grid, Header } from 'semantic-ui-react'
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';

import Page from 'layout/Page';

export default function AddWalletMenu() {

    const history = useHistory();
    const { vaultExists } = useSelector(state => ({ vaultExists: state.vault.exists }))

    let walletButtons = [
        { content: "Import Keystore", icon: "download", onClick: () => history.push('/addWallet/importKeystore') },
        { content: "Import Private Key", icon: "download", onClick: () => history.push('/addWallet/importPrivateKey') },
        { content: "Go Back", icon: "arrow left", onClick: () => history.push('/hub'), color: "orange" },
    ]

    if (vaultExists) {
        walletButtons.unshift(
            { content: "Generate Wallet", icon: "plus", onClick: () => history.push('/addWallet/generate') }
        )
    }

    return (
        <Page showNetworkStatus>

            <Container fluid className="h-full flex items-center justify-center">

                <Grid textAlign="center">

                    <Grid.Column width={16} className="mb-8">

                        <Header className="text-gray-500 mb-8">Add New Wallet</Header>

                        <div className="text-sm">

                            <p>A wallet can be generated against your mnemonic or imported.</p>

                            <p>Please note that imported wallets are not recoverable from your seed phrase.</p>

                        </div>

                    </Grid.Column>

                    <Grid.Column width={16} className="flex flex-auto flex-col items-center gap-5">

                        <div className="flex flex-auto flex-col items-center gap-3 w-72">

                            {
                                walletButtons.map((walletButton, index) =>
                                    <Button
                                        labelPosition="left"
                                        basic
                                        color={walletButton.color || "purple"}
                                        size="small"
                                        key={`wallet-button-${index}`}
                                        content={walletButton.content}
                                        icon={walletButton.icon}
                                        className="w-56 text-left"
                                        onClick={walletButton.onClick}
                                    />
                                )
                            }

                        </div>

                    </Grid.Column>

                </Grid>

            </Container>

        </Page>
    )

}