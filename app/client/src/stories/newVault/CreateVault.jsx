import React from "react";

import { useHistory } from "react-router-dom";

import { Button, Container, Grid, Header } from "semantic-ui-react";

import Page from "layout/Page";

import DeterministicWalletGenerationModal from "./DeterministicWalletGenerationModal";

function CreateVault() {
    const history = useHistory();

    return (
        <Page>
            <Grid textAlign="center" className="m-0">
                <Grid.Column width={16} className="p-0 self-center">
                    <Header
                        content="Lets setup your vault"
                        as="h3"
                        className="m-0"
                    />
                </Grid.Column>

                <Grid.Column width={16} className="p-0 self-center">
                    <p>
                        Internal wallets will be generated through a seed phrase
                        that will be shown on the next step.
                    </p>

                    <p>
                        Your seed phrase is the key to your internal wallets,
                        please keep it in a secure location.
                    </p>
                </Grid.Column>

                <Grid.Column width={16} className="p-0 self-center">
                    <p className="text-sm">
                        Please note that if you import additional wallets by
                        private key they will be considered external wallets.
                    </p>

                    <p className="text-sm">
                        Please keep those keys safe, as the seed phrase will not
                        cover any imported wallets!
                    </p>
                </Grid.Column>

                <Grid.Column width={6} className="p-0 self-center">
                    <Container className="flex flex-col justify-between gap-2">
                        <Button
                            color="teal"
                            content="Get Seed Phrase"
                            onClick={() =>
                                history.push("/newVault/getNewSeedPhrase")
                            }
                        />

                        <Button
                            color="black"
                            basic
                            content="Go Back"
                            onClick={() => history.push("/")}
                        />

                        <DeterministicWalletGenerationModal>
                            <Button className="transparent text-sm text-black underline">
                                More Info On How Wallets Are Generated
                            </Button>
                        </DeterministicWalletGenerationModal>
                    </Container>
                </Grid.Column>
            </Grid>
        </Page>
    );
}

export default CreateVault;
