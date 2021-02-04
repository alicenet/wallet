import React, { useContext, useState, useEffect } from 'react';
import { StoreContext } from "../Store/store.js";
import { Container, Grid, Form, Input, Segment, Button, Divider, Icon } from "semantic-ui-react"
import Switch from "react-switch";
const Web3 = require('web3');

function Accounts(props) {
    // Store states and actions to update state
    const { store, actions } = useContext(StoreContext);
    // Keystore json and password
    const [keystoreData, addKeystoreData] = useState({ "keystore": false, "password": "", "fileName": false });
    // private key and curve
    const [privKData, addPrivKData] = useState({ "privK": "", "curve": false })

    // Updates for when component mounts or updates
    useEffect(() => {
        // Reset this component to orginal state
        if (props.states.refresh) {
            actions.addWallet(false);
            addKeystoreData({ "keystore": false, "password": "" });
            props.states.setRefresh(false);
        }
    }, [props, actions]);

    // Keystore file selected, send to handleFile() and update "keystoreData"
    const fileChange = async (e) => {
        e.preventDefault();
        props.states.setLoading("Loading Keystore")
        try {
            let keystore = await handleFile(e);
            let newData = keystoreData;
            newData["keystore"] = keystore;
            addKeystoreData(newData)
        }
        catch (ex) {
            props.state.setError(String(ex));
        }
        props.states.setLoading(false)
    };

    // Load the keystore contents as a text file, return to fileChange();
    const handleFile = (event) => {
        return new Promise((resolve, reject) => {
            let file = event.target.files[0];
            let newData = keystoreData;
            newData["filename"] = file.name.substring(0, 16);
            addKeystoreData(newData);
            let reader = new FileReader();
            reader.readAsText(file);
            reader.onabort = () => { reject(new Error({ "keystore": "Aborted loading keystore file" })) }
            reader.onerror = () => { reject(new Error({ "keystore": "Error loading keystore file" })) }
            reader.onload = () => { resolve(reader.result) };
        });
    }

    // Check for the keystore and password in "keystoreData", continue to addAccount()
    const handleSubmitKS = (event) => {
        event.preventDefault();
        props.states.setLoading("Loading Wallet")
        if (!keystoreData.keystore) {
            props.states.setLoading(false);
            props.states.setError("No Keystore provided");
            return;
        }
        if (!keystoreData.password || keystoreData.password === "") {
            props.states.setLoading(false);
            props.states.setError("No password provided");
            return;
        }
        let keystore = keystoreData.keystore
        let password = keystoreData.password
        addKeystoreData({ "keystore": false, "password": "" });
        setTimeout(function () { addAccount(keystore, password); }, 500);
    }

    // Check for the privateKey and curve in "privKData, continue to addAccount()
    const handleSubmitPK = (event) => {
        event.preventDefault();
        props.states.setLoading("Loading Wallet")
        if (!privKData.privK || privKData.privK === "") {
            props.states.setLoading(false);
            props.states.setError("No Private Key provided");
            return;
        }
        let privK = privKData.privK
        let curve = privKData.curve
        addPrivKData({ "privK": "", "curve": "" });
        setTimeout(function () { addAccount(false, privK, curve); }, 500);
    }

    // update "keystoreData"[password] when password field updates
    const handleChangeKS = (event) => {
        addKeystoreData({
            ...keystoreData,
            "password": event.target.value
        })
    }
    // update privKData on value change
    const handleChangePK = (event, e, v) => {
        if (e === "curve") {
            addPrivKData({
                ...privKData,
                [e]: event
            })
            console.log(privKData["curve"])
            return;
        }
        addPrivKData({
            ...privKData,
            [e]: event.target.value
        })
    }
    // Decrypt keystore file with password or use PrivK and curve and attempt to add to MadWalletJS
    const addAccount = async (keystore, passwordOrPrivateKey, curve) => {
        try {
            if (keystore) {
                let curve = JSON.parse(keystore)["curve"]
                if (!curve) {
                    curve = 1;
                }
                delete keystore["curve"];
                let web3 = new Web3();
                let account = web3.eth.accounts.decrypt(keystore, passwordOrPrivateKey);
                await store.wallet.Account.addAccount(account.privateKey, curve);
            }
            else {
                if (!curve) {
                    curve = 1;
                }
                else {
                    curve = 2;
                }
                await store.wallet.Account.addAccount(passwordOrPrivateKey, curve);
            }
        }
        catch (ex) {
            props.states.setError(String(ex));
        }
        props.states.setLoading(false)
    }

    // List all accounts inside of MadWalletJS
    const accountsList = () => {
        if (!store.wallet) {
            return (<></>);
        }
        return store.wallet.Account.accounts.map(function (e, i) {
            return (
                <Segment.Group className="segment-card" compact={true} key={i} raised>
                    <Segment textAlign="left">Address: 0x{e.address}<Icon name="copy outline" className="click" onClick={() => props.states.copyText("0x" + e.address)} /></Segment>
                    <Segment textAlign="left">Curve: {e.curve === 1 ? "SECP" : "BN"}</Segment>
                </Segment.Group>
            )

        })
    }

    return (
        <Grid stretched centered={true}>
            <Container textAlign="center">
                <h3>Add Wallets</h3>
            </Container>
            <Grid.Row centered>
                <Segment raised placeholder textAlign="center">
                    <Grid columns={2} relaxed='very' stackable>
                        <Grid.Column>
                            <Form>
                                <Button
                                    color={keystoreData["keystore"] ? "green" : "grey"}
                                    as="label"
                                    htmlFor="file"
                                    type="button"
                                    content={keystoreData["filename"] ? keystoreData["filename"] : "Keystore"}
                                    labelPosition="left"
                                    icon={keystoreData["keystore"] ? "check circle" : "file"}
                                />
                                <input
                                    type="file"
                                    hidden
                                    id="file"
                                    onChange={(e) => fileChange(e)}
                                    onClick={e => (e.target.value = null)}
                                />
                                <Form.Field>
                                    <Input type="password" onChange={(event) => { handleChangeKS(event, "password") }} value={keystoreData["password"] || ""} placeholder="Password"></Input>
                                </Form.Field>
                                <Form.Field>
                                    <Button color="blue" type='submit' onClick={(event) => { handleSubmitKS(event) }}>Load Keystore</Button>
                                </Form.Field>
                            </Form>
                        </Grid.Column>
                        <Grid.Column textAlign="center" verticalAlign='middle'>
                            <Form>
                                <Input type="password" onChange={(event) => { handleChangePK(event, "privK") }} value={privKData["privK"] || ""} placeholder="PrivateKey"></Input>
                                <Form.Group className="switch" inline>
                                    <label>BN Address</label>
                                    <Switch onColor="#4aec75" height={22} width={46} offColor="#ff6464" offHandleColor="#212121" onHandleColor="#f0ece2" onChange={(event, data) => { handleChangePK(event, "curve", data) }} checked={Boolean(privKData["curve"])} />
                                </Form.Group>
                                <Form.Field>
                                    <Button color="blue" type='submit' onClick={(event) => { handleSubmitPK(event) }}>Load Private Key</Button>
                                </Form.Field>
                            </Form>
                        </Grid.Column>
                    </Grid>
                    <Divider hidden fitted vertical>Or</Divider>
                </Segment>
            </Grid.Row>
            <Grid.Row>
                <Container>
                    <Segment raised>
                        <p>{store && store.wallet && store.wallet.Account.accounts.length === 0 ? "No wallets added!" : ""}</p>
                        {accountsList()}
                    </Segment>
                </Container>
            </Grid.Row>
        </Grid >
    )
}
export default Accounts;
