import React, { useContext, useState, useEffect } from 'react';
import { StoreContext } from "../Store/store.js";
import { Container, Grid, Form, Input, Segment, Button, Divider, Icon, Rail, Modal } from "semantic-ui-react"
import Switch from "react-switch";
import Accts from '../Utils/accounts.js';

function Accounts(props) {
    // Store states and actions to update state
    const { store } = useContext(StoreContext);
    // Keystore json and password
    const [keystoreData, addKeystoreData] = useState({ "keystore": false, "password": "", "fileName": false });
    // private key and curve
    const [privKData, addPrivKData] = useState({ "privK": "", "curve": false })
    // create keystore
    const [changeKSData, addChangeKSData] = useState({ "passwordConfirm": "", "password": "", "curve": false, "keystore": false })

    // create new keystore modal
    const [open, setOpen] = React.useState(false)

    useEffect(() => { }, [])
    // Keystore file selected, send to adapter.handleFile() and update "keystoreData"
    const fileChange = (e) => {
        e.preventDefault();
        let accounts = new Accts(adapter, store.wallet);
        accounts.handleFile(e);
    };

    // add keystore file to state from adapter
    const handleKeystoreFile = (newData) => {
        addKeystoreData(newData);
    }

    // Check for the keystore and password in "keystoreData", continue to addAccount()
    const handleSubmitKS = (event) => {
        event.preventDefault();
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
        let accounts = new Accts(adapter, store.wallet);
        accounts.addAccount(keystore, password)
    }

    // Check for the privateKey and curve in "privKData, continue to addAccount()
    const handleSubmitPK = (event) => {
        event.preventDefault();
        if (!privKData.privK || privKData.privK === "") {
            props.states.setLoading(false);
            props.states.setError("No Private Key provided");
            return;
        }
        let privK = privKData.privK
        let curve = privKData.curve
        let accounts = new Accts(adapter, store.wallet);
        accounts.addAccount(false, privK, curve)
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
            return;
        }
        addPrivKData({
            ...privKData,
            [e]: event.target.value
        })
    }

    const handleChangeCreateKS = (event, e, v) => {
        if (e === "curve") {
            addChangeKSData({
                ...changeKSData,
                [e]: event
            })
            return;
        }
        addChangeKSData({
            ...changeKSData,
            [e]: event.target.value
        })
    }

    const handleSubmitCreateKS = (event) => {
        event.preventDefault();
        if (!changeKSData.password || changeKSData.password === "") {
            props.states.setLoading(false);
            props.states.setError("No password provided");
            return;
        }
        if (!changeKSData.passwordConfirm || changeKSData.passwordConfirm === "") {
            props.states.setLoading(false);
            props.states.setError("Must confirm password");
            return;
        }
        if (changeKSData.passwordConfirm !== changeKSData.password) {
            props.states.setLoading(false);
            props.states.setError("Passwords do not match");
            return;
        }
        let password = changeKSData.password
        let curve = changeKSData.curve
        let accounts = new Accts(adapter, store.wallet);
        accounts.createAccount(password, curve)
    }

    const adapter = (e, event, data) => {
        props.states.setUpdateView((updateView) => ++updateView);
        switch (event) {
            case 'wait':
                props.states.setLoading(data);;
                return;;
            case 'keystore':
                handleKeystoreFile(data);;
                return;;
            case 'closeModal':
                setOpen(false);;
                return;;
            case 'err':
                props.states.setError(String(data));;
                return;;
        }
        addPrivKData({ "privK": "", "curve": "" });
        addKeystoreData({ "keystore": false, "password": "" });
        addChangeKSData({"password": "", "curve": false, "keystore": false });;
        props.states.setLoading(false);
    }

    // List all accounts inside of MadWalletJS
    const accountsList = () => {
        if (store.wallet.Account.accounts.length === 0) {
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

    // modal to create a new keystore
    const createKeystore = () => {
        return (
            <>
                <Modal
                    onClose={() => setOpen(false)}
                    onOpen={() => setOpen(true)}
                    open={open}
                >
                    <Modal.Content>
                        <Container>
                            <Grid centered>
                                <Form>
                                    <Form.Field>
                                    <Input type="password" onChange={(event) => { handleChangeCreateKS(event, "password") }} value={changeKSData["password"] || ""} placeholder="Password"></Input>
                                    </Form.Field>
                                    <Form.Field>
                                    <Input type="password" onChange={(event) => { handleChangeCreateKS(event, "passwordConfirm") }} value={changeKSData["passwordConfirm"] || ""} placeholder="Confirm Password"></Input>
                                    </Form.Field>
                                    <Form.Group className="switch" inline>
                                        <label>BN Address</label>
                                        <Switch onColor="#4aec75" height={22} width={46} offColor="#ff6464" offHandleColor="#212121" onHandleColor="#f0ece2" onChange={(event, data) => { handleChangeCreateKS(event, "curve", data) }} checked={Boolean(changeKSData["curve"])} />
                                    </Form.Group>
                                    <Form.Field>
                                        <Button color="blue" type='submit' onClick={(event) => { handleSubmitCreateKS(event) }}>Create Keystore</Button>
                                    </Form.Field>
                                </Form>
                            </Grid>
                        </Container>
                    </Modal.Content>
                </Modal>
            </>)
    }

    return (
        <>
            {createKeystore()}
            <Grid stretched centered={true}>
                <Container textAlign="center">
                    <h3>Add Wallets</h3>
                </Container>

                <Grid.Row centered>
                    <Segment raised placeholder textAlign="center">
                    <Button floated="right" onClick={() => setOpen(true)} className="green">Create Keystore</Button>
                    <Divider/>
                        <Grid columns={2} relaxed='very' stackable>
                            <Grid.Column>
                                <Form>
                                    <Button
                                        color={keystoreData["keystore"] ? "green" : "grey"}
                                        as="label"
                                        htmlFor="file"
                                        type="button"
                                        content={keystoreData["filename"] ? keystoreData["filename"] : "Keystore File"}
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
                            <p>{store.wallet.Account.accounts.length === 0 ? "No wallets added!" : ""}</p>
                            {accountsList()}
                        </Segment>
                    </Container>
                </Grid.Row>
            </Grid >
        </>
    )
}
export default Accounts;
