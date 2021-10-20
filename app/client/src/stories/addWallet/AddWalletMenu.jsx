import React from 'react';
import { Container, Grid, Header, Button } from 'semantic-ui-react'
import { useHistory } from 'react-router';

export default function AddWalletMenu() {

    const history = useHistory();

    const walletButtons = [
        { content: "Generate Wallet", icon: "plus", onClick: () => history.push('/addWallet/generate') },
        { content: "Import Keystore", icon: "download", onClick: () => history.push('/addWallet/importKeystore') },
<<<<<<< HEAD
        { content: "Import Private Key", icon: "download", onClick: () => history.push('/addWallet/importPrivateKey') },
=======
        { content: "Import Private Key", icon: "download", onClick: () => history.push('/addWallet/importPrivKey') },
>>>>>>> Add Wallets Menu && Add Internal Wallet
        { content: "Go Back", icon: "arrow left", onClick: () => history.goBack(), color: "orange" },
    ]

    const getWalletAdditionButtons = () => {
        return walletButtons.map(buttonSettings => {
            const bs = buttonSettings;
            const bProps = { labelPosition: "left", basic: true, color: bs.color || "purple", size: "small" }
            return <Button content={bs.content} icon={bs.icon} {...bProps} className="w-56 text-left" onClick={bs.onClick} />
        })
    }

    return (

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
                        {getWalletAdditionButtons()}
                    </div>

                </Grid.Column>

            </Grid>

        </Container>

    )

}