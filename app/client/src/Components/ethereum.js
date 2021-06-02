import React, { useContext, useState, useEffect, useRef } from 'react';
import { StoreContext } from "../Store/store.js";
import Web3Adapter from '../Utils/web3Adapter.js';
import { Icon, Container, Button, Grid, Card, Form, Segment, Statistic, Menu } from 'semantic-ui-react';

function Ethereum(props) {
    // Store states and actions to update state
    const { store, actions } = useContext(StoreContext);
    // Ethereum options
    const [opts, updateOpts] = useState({});
    // Contracts, methods, arguments to be fulfilled by the web3Adapter
    const [contractFn, updateContractFn] = useState({ "staking": {}, "validators": {}, "stakingToken": {}, "utilityToken": {}, "deposit": {} });
    // Function list to show
    const [contractCard, setContractCard] = useState("tokens");
    // Initial connection lock
    const connectAttempt = useRef(false);
    const update = useRef(false)

    // Add the web3Adapter and initialize
    const addAdapter = async (forceConnect) => {
        if (!store.web3Adapter || forceConnect) {
            props.states.setLoading("Connecting to Ethereum...");
            if (store.web3Adapter && !store.web3Adapter.connected && !forceConnect) {
                return;
            }
            let web3Adapter = new Web3Adapter(store.settings, adapterCb);
            await web3Adapter.init()
            await actions.addWeb3Adapter(web3Adapter)
            update.current = true;
        }
    }

    // Updates for when component mounts or updates
    useEffect(() => {
        // Reset this component to orginal state
        if (props.states.refresh) {
            actions.addWeb3Adapter(false);
            updateOpts({});
            updateContractFn({ "staking": {}, "validators": {}, "stakingToken": {}, "utilityToken": {}, "deposit": {} })
            props.states.setRefresh(false);
        }

        if (store.web3Adapter &&
            store.web3Adapter.registryContract &&
            store.web3Adapter.provider &&
            !update.current &&
            (
                store.web3Adapter.registryContract !== store.settings.registryContract ||
                store.web3Adapter.provider !== store.settings.ethereumProvider
            )
        ) {
            update.current = true;
            addAdapter(true);
        }

        // Attempt to setup adapter if not previously instanced
        if (!store.web3Adapter && !connectAttempt.current) {
            connectAttempt.current = true;
            addAdapter();
        }
    }, [props, actions, store.web3Adapter]) // eslint-disable-line react-hooks/exhaustive-deps

    // Callback for the web3Adapter to update the component
    const adapterCb = async (event, data) => {
        props.states.setUpdateView((updateView) => ++updateView);
        switch (event) {
            case 'success':
                if (data) {
                    props.states.setNotify(data)
                }
                break;;
            case 'wait':
                props.states.setLoading(data);;
                return;;
            case 'error':
                props.states.setError(data);;
                break;;
            default:
                console.log(event)
        }
        props.states.setLoading(false);
    }

    // Added the selected address to web3Adapter using the accounts private key
    const web3Address = async (address) => {
        let account = await store.wallet.Account.getAccount(address)
        await store.web3Adapter.useAccount(account["MultiSigner"]["secpSigner"]["privK"])
    }

    // Select new address and get information on it from the contracts
    const updateAddress = async (event, v) => {
        props.states.setLoading("Gathering Address Information");
        let newData = opts;
        newData["address"] = v.value
            ?
            v.value
            :
            false;
        await web3Address(v.value)
        updateOpts(newData);
    }

    // Display available addresses with Secp curve
    const availAddr = () => {
        let availableEth = [];
        if (!store.wallet) { return [{ key: 0, text: false, value: false }] }
        store.wallet.Account.accounts.map(function (e, i) {
            if (e["curve"] === 1) {
                availableEth.push({ "text": "0x" + e["address"].substring(0, 6) + "..." + e["address"].substring(e["address"].length - 6), "value": "0x" + e["address"].toLowerCase(), "key": i });
            }
            return true;
        });
        return availableEth;
    }

    // Select address or if initialization failed, try to reconnect to web3 provider and contracts
    const options = () => {
        if (!store.web3Adapter.failed && !store.web3Adapter.connected) {
            return (<h3>Connecting...</h3>)
        }
        if (store.web3Adapter.failed) {
            return (
                <Button onClick={() => addAdapter(true)}>Reconnect</Button>
            )
        }
        let status = (<></>)
        if (store.web3Adapter && store.web3Adapter.selectedAddress && store.web3Adapter["account"]) {
            status = (
                <Grid>
                    <Grid.Row columns={2} divided>
                        <Grid.Column textAlign="center">
                            <p>Validator: {store.web3Adapter.account["validatorInfo"]["isValidator"] ? <Icon color="green" name="checkmark" /> : <Icon color="red" name="close" />}</p>
                        </Grid.Column>
                        <Grid.Column textAlign="center">
                            <p>Staking: {store.web3Adapter.account["validatorInfo"]["isStaking"] && store.web3Adapter.account["validatorInfo"]["isStaking"] !== "0" ? <Icon color="green" name="checkmark" /> : <Icon color="red" name="close" />} </p>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            )
        }
        return (
            <>
                <Form>
                    <Form.Select
                        label='Address'
                        options={availAddr()}
                        defaultValue={store.web3Adapter.selectedAddress ? store.web3Adapter.selectedAddress.toLowerCase() : ""}
                        onChange={(event, v) => { updateAddress(event, v) }}
                    />
                </Form>
                {status}
            </>
        )
    }

    // Update contractFn from user input
    const handleChange = (fn, f, event) => {
        let fields = contractFn;
        if (!fields) { fields = {} }
        if (!fields[fn]) {
            fields[fn] = {}
        }
        fields[fn][f] = event.target.value
        updateContractFn(fields);
    }

    const addrInfo = () => {
        if (!store.web3Adapter || !store.web3Adapter.account["balances"]["eth"]) { return (<></>) }
        return (
            <>
                <Grid.Column>
                    <Segment textAlign="center">
                        <h3>Balances</h3>
                        {balances()}
                    </Segment>
                </Grid.Column>

                <Grid.Column>
                    <Segment textAlign="center">
                        <h3>Allowances</h3>
                        {allowances()}
                    </Segment>
                </Grid.Column>

                <Grid.Column>
                    <Segment textAlign="center">
                        <h3>Staking</h3>
                        {stakeInfo()}
                    </Segment>
                </Grid.Column>
            </>
        )
    }

    const balances = () => {
        if (!store.web3Adapter || !store.web3Adapter.account["balances"]["eth"]) { return (<></>) }
        return (
            <Segment.Group>
                <Segment className="notifySegments" textAlign="left">ETH: {store.web3Adapter.account["balances"]["eth"] ? String(store.web3Adapter.account["balances"]["eth"]) : ""}</Segment>
                <Segment className="notifySegments" textAlign="left">STAKE: {store.web3Adapter.account["balances"]["stakingToken"]["balance"] ? String(store.web3Adapter.account["balances"]["stakingToken"]["balance"]) : ""}</Segment>
                <Segment className="notifySegments" textAlign="left">UTIL: {store.web3Adapter.account["balances"]["utilityToken"]["balance"] ? String(store.web3Adapter.account["balances"]["utilityToken"]["balance"]) : ""}</Segment>
            </Segment.Group>
        )
    }

    const allowances = () => {
        if (!store.web3Adapter || !store.web3Adapter.account["balances"]["eth"]) { return (<></>) }
        return (
            <Segment.Group>
                <Segment className="notifySegments" textAlign="left">STAKE: {store.web3Adapter.account["balances"]["stakingToken"]["allowance"] ? String(store.web3Adapter.account["balances"]["stakingToken"]["allowance"]) : ""}</Segment>
                <Segment className="notifySegments" textAlign="left">UTIL: {store.web3Adapter.account["balances"]["utilityToken"]["allowance"] ? String(store.web3Adapter.account["balances"]["utilityToken"]["allowance"]) : ""}</Segment>
            </Segment.Group>
        )
    }

    // Display ethereum / contract information for the selected address
    const stakeInfo = () => {
        if (!store.web3Adapter || !store.web3Adapter.account["balances"]["eth"]) { return (<></>) }
        return (
            <>
                <Segment.Group>
                    <Segment className="notifySegments" textAlign="left">Reward: {store.web3Adapter.account["validatorInfo"]["rewardBalance"] ? store.web3Adapter.account["validatorInfo"]["rewardBalance"] : "0"} </Segment>
                    <Segment className="notifySegments" textAlign="left">Locked: {store.web3Adapter.account["validatorInfo"]["stakingBalance"] ? store.web3Adapter.account["validatorInfo"]["stakingBalance"] : "0"} </Segment>
                    <Segment className="notifySegments" textAlign="left">Unlocked: {store.web3Adapter.account["validatorInfo"]["unlockedBalance"] ? store.web3Adapter.account["validatorInfo"]["unlockedBalance"] : "0"} </Segment>
                </Segment.Group>
            </>
        )
    }

    // Deposit contract functions
    const utilityToken = () => {
        if (!store.web3Adapter || !store.web3Adapter.selectedAddress) { return <></> }
        return (
            <>
                <Card >
                    <Card.Content>
                        <Form>
                            <Form.Field>
                                <h4>Deposit</h4>
                                <label>Amount</label><input id="amount" onChange={(event) => { handleChange("deposit", "amount", event) }} placeholder="uint256" />
                                <Button color="green" onClick={async (e) => { e.preventDefault(); await store.web3Adapter.deposit(contractFn["deposit"]["amount"]) }}>Send</Button>
                            </Form.Field>
                        </Form>
                    </Card.Content>
                </Card>
                <Card >
                    <Card.Content>
                        <Form>
                            <Form.Field>
                                <h4>Approve Deposit Allowance</h4>
                                <label>Amount</label><input id="amount" onChange={(event) => { handleChange("utilityToken", "approve", event) }} placeholder="uint256" />
                                <Button color="green" onClick={async (e) => { e.preventDefault(); await store.web3Adapter.approveUtilityAllowance(contractFn["utilityToken"]["approve"]) }}>Send</Button>
                            </Form.Field>
                        </Form>
                    </Card.Content>
                </Card>
            </>
        )
    }

    // Token contract functions
    const stakingToken = () => {
        if (!store.web3Adapter || !store.web3Adapter.selectedAddress) { return <></> }
        return (
            <Card >
                <Card.Content>
                    <Form>
                        <Form.Field>
                            <h4>Approve Staking Allowance</h4>
                            <label>Amount</label><input id="amount" onChange={(event) => { handleChange("stakingToken", "approve", event) }} placeholder="uint256" />
                            <Button color="green" onClick={async (e) => { e.preventDefault(); await store.web3Adapter.approveStakingAllowance(contractFn["stakingToken"]["approve"]) }}>Send</Button>
                        </Form.Field>
                    </Form>
                </Card.Content>
            </Card>
        )
    }

    // Validator contract functions
    const validator = () => {
        if (!store.web3Adapter || !store.web3Adapter.selectedAddress) { return <></> }
        return (
            <>
                <Card >
                    <Card.Content>
                        <Form>
                            <Form.Field>
                                <h4>Add Validator</h4>
                                <Button color="purple" onClick={(e) => { e.preventDefault(); store.web3Adapter.addRemoveValidator("addValidator") }}>Send</Button>
                            </Form.Field>
                        </Form>
                    </Card.Content>
                </Card>
                <Card >
                    <Card.Content>
                        <Form>
                            <Form.Field>
                                <h4>Remove Validator</h4>
                                <Button color="purple" onClick={async (e) => { e.preventDefault(); await store.web3Adapter.addRemoveValidator("removeValidator") }}>Send</Button>
                            </Form.Field>
                        </Form>
                    </Card.Content>
                </Card>
            </>
        )
    }

    // Staking contract functions
    const staking = () => {
        if (!store.web3Adapter || !store.web3Adapter.selectedAddress) { return <></> }
        return (
            <>
                <Card >
                    <Card.Content>
                        <Form>
                            <Form.Field>
                                <h4>Lock Stake</h4>
                                <label>Amount</label><input id="amount" onChange={(event) => { handleChange("stakingToken", "lock", event) }} placeholder="uint256" />
                                <Button color="red" onClick={async (e) => { e.preventDefault(); await store.web3Adapter.lockUnlockStake(contractFn["stakingToken"]["lock"], "lockStake") }}>Send</Button>
                            </Form.Field>
                        </Form>
                    </Card.Content>
                </Card>
                <Card >
                    <Card.Content>
                        <Form>
                            <Form.Field>
                                <h4>Unlock Stake</h4>
                                <label>Amount</label><input id="amount" onChange={(event) => { handleChange("stakingToken", "unlock", event) }} placeholder="uint256" />
                                <Button color="red" onClick={async (e) => { e.preventDefault(); await store.web3Adapter.lockUnlockStake(contractFn["stakingToken"]["unlock"], "unlockStake") }}>Send</Button>
                            </Form.Field>
                        </Form>
                    </Card.Content>
                </Card>
                <Card >
                    <Card.Content>
                        <Form>
                            <Form.Field>
                                <h4>Unlock Reward</h4>
                                <Button color="red" onClick={async (e) => { e.preventDefault(); await store.web3Adapter.method("stakingToken", "unlockReward") }}>Send</Button>
                            </Form.Field>
                        </Form>
                    </Card.Content>
                </Card>
                <Card >
                    <Card.Content>
                        <Form>
                            <Form.Field>
                                <h4>Request Unlock</h4>
                                <Button color="red" onClick={async (e) => { e.preventDefault(); await store.web3Adapter.lockUnlockStake("staking", "requestUnlockStake") }}>Send</Button>
                            </Form.Field>
                        </Form>
                    </Card.Content>
                </Card>
                <Card >
                    <Card.Content>
                        <Form>
                            <Form.Field>
                                <h4>Withdraw</h4>
                                <label>Amount</label><input id="amount" onChange={(event) => { handleChange("stakingToken", "withdraw", event) }} placeholder="uint256" />
                                <Button color="red" onClick={async (e) => { e.preventDefault(); await store.web3Adapter.method("stakingToken", "withdraw", { "amount": contractFn["stakingToken"]["withdraw"]["amount"] }) }}>Send</Button>
                            </Form.Field>
                        </Form>
                    </Card.Content>
                </Card>
            </>
        )
    }

    const fnMenu = () => {
        // TODO: Use updated ABI and test methods
        return (<></>)

        if (!store.web3Adapter || !store.web3Adapter.selectedAddress) {
            return (<></>)
        }
        return (
            <>
                <Grid.Row>
                    <Container><h2>Contract Methods</h2></Container>
                </Grid.Row>
                <Grid.Column width={3}>
                    <Menu fluid vertical tabular>
                        <Menu.Item
                            name='Tokens'
                            active={contractCard === 'tokens'}
                            onClick={() => setContractCard('tokens')}
                        />
                        <Menu.Item
                            name='Staking'
                            active={contractCard === 'staking'}
                            onClick={() => setContractCard('staking')}
                        />
                        <Menu.Item
                            name='Validator'
                            active={contractCard === 'validator'}
                            onClick={() => setContractCard('validator')}
                        />
                    </Menu>
                </Grid.Column>

                <Grid.Column stretched width={12}>
                    <Segment>
                        <Card.Group centered>
                            {cardRender()}
                        </Card.Group>
                    </Segment>
                </Grid.Column>
            </>
        )
    }

    const cardRender = () => {
        switch (contractCard) {
            case 'tokens':
                return (<>{utilityToken()}{stakingToken()}</>);
            case 'staking':
                return (<>{staking()}</>);
            case 'validator':
                return (<>{validator()}</>);
            default:
                return (<></>);
        }
    }

    const chainInfo = () => {
        if (!store.web3Adapter.connected) {
            return (
                <></>
            )
        }
        return (
            <Grid.Column>
                <Segment textAlign="center">
                    <Statistic.Group size="large">
                        <Statistic>
                            <Statistic.Value>{store.web3Adapter && store.web3Adapter["info"]["epoch"] ? String(store.web3Adapter["info"]["epoch"]) : "?"}</Statistic.Value>
                            <Statistic.Label>Epoch</Statistic.Label>
                        </Statistic>
                        <Statistic>
                            <Statistic.Value>{store.web3Adapter && store.web3Adapter["info"]["validators"] ? String(store.web3Adapter["info"]["validators"]) : "?"}</Statistic.Value>
                            <Statistic.Label>Validators</Statistic.Label>
                        </Statistic>
                    </Statistic.Group>
                </Segment>
            </Grid.Column>
        )
    }

    return (
        <Grid container stackable centered={true}>
            <Container textAlign="center"><h3>Ethereum</h3></Container>
            <Grid.Row textAlign="center" centered columns={2}>
                {chainInfo()}
                <Grid.Column>
                    <Segment textAlign="center">
                        {options()}
                    </Segment>
                </Grid.Column>
            </Grid.Row>
            <Grid.Row centered textAlign="center" columns={3}>
                {addrInfo()}
            </Grid.Row>

            <Grid.Row centered>
                {fnMenu()}
            </Grid.Row>
        </Grid>
    )
}
export default Ethereum;