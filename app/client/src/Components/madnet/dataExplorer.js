import React, { useContext, useEffect } from 'react';
import { StoreContext } from "../../Store/store.js";
import { Container, Button, Form, Segment, Card, Grid, Icon } from 'semantic-ui-react';
import Switch from "react-switch";

function DataExplorer(props) {
    // Store states
    const { store } = useContext(StoreContext);

    // Amount of datastores to display per page
    const DataPerPage = 5;

    useEffect(() => {
        if (store.madNetAdapter.dsRedirected) {
            store.madNetAdapter.dsSearchOpts = store.madNetAdapter.dsRedirected;
            store.madNetAdapter.dsRedirected = false;
            handleSubmit();
        }
    }, [store.madNetAdapter.dsRedirected]); // eslint-disable-line react-hooks/exhaustive-deps

    // Update search params
    const handleChange = (event, e, v) => {
        let opts = JSON.parse(JSON.stringify(store.madNetAdapter.dsSearchOpts));
        if (e === "bnCurve") {
            opts[e] = event;
            store.madNetAdapter.setDsSearchOpts(opts);
            return;
        }
        opts[e] = event.target.value;
        store.madNetAdapter.setDsSearchOpts(opts);
    }

    // Handle next / previous page clicks
    const handlePage = (e) => {
        let page = store.madNetAdapter.dsActivePage + e
        if (store.madNetAdapter.dsActivePage > page) {
            store.madNetAdapter.setDsView(store.madNetAdapter.dsDataStores.slice(((page - 1) * DataPerPage), ((((page - 1) * DataPerPage) + DataPerPage))))
        }
        else if (store.madNetAdapter.dsActivePage < page &&
            (
                (DataPerPage * page) - store.madNetAdapter.dsDataStores.length === 0 ||
                store.madNetAdapter.dsDataStores.length % (DataPerPage + 1) !== 0
            )
        ) {
            store.madNetAdapter.setDsView(store.madNetAdapter.dsDataStores.slice((store.madNetAdapter.dsActivePage * DataPerPage), (((store.madNetAdapter.dsActivePage * DataPerPage) + DataPerPage))))
        }
        else {
            getData(store.madNetAdapter.dsDataStores[store.madNetAdapter.dsDataStores.length - 1]["DSLinker"]["DSPreImage"]["Index"], page);
        }
        store.madNetAdapter.setDsActivePage(page);
    }

    // Sumbit initial query params
    const handleSubmit = (event) => {
        if (event) {
            event.preventDefault();
        }
        if (store.madNetAdapter.dsSearchOpts["address"] === "") {
            return;
        }
        store.madNetAdapter.setDsActivePage(1)
        getData(store.madNetAdapter.dsSearchOpts["offset"], 1, true);
    }

    // Get data from the RPC
    const getData = async (index, page, submit) => {
        try {
            props.states.setLoading("Getting DataStores...")
            let dataStores = false;
            if (index && index !== "" && submit) {
                let max = (DataPerPage)
                for (let i = max; i > 0; i--) {
                    let attempt = await store.wallet.Rpc.getDataStoreUTXOIDs(store.madNetAdapter.dsSearchOpts["address"], (store.madNetAdapter.dsSearchOpts["bnCurve"] ? 2 : 1), i, index)
                    if (attempt && attempt.length > 0) {
                        dataStores = attempt;
                        if (i !== 1) {
                            let queryObj = await store.wallet.Rpc.getDataStoreUTXOIDs(store.madNetAdapter.dsSearchOpts["address"], (store.madNetAdapter.dsSearchOpts["bnCurve"] ? 2 : 1), 1, index)
                            dataStores.unshift(queryObj[0]);
                        }
                        break;
                    }
                }
            }
            else {
                dataStores = await store.wallet.Rpc.getDataStoreUTXOIDs(store.madNetAdapter.dsSearchOpts["address"], (store.madNetAdapter.dsSearchOpts["bnCurve"] ? 2 : 1), (DataPerPage + 1), index)
            }
            if (!dataStores) {
                props.states.setLoading(false);
                return;
            }
            let UTXOIDS = []
            for (let i = 0; i < dataStores.length; i++) {
                UTXOIDS.push(dataStores[i]["UTXOID"])
            }
            let DStores = await store.wallet.Rpc.getUTXOsByIds(UTXOIDS)
            if (!submit) {
                let DS = store.madNetAdapter.dsDataStores.concat(DStores[0]);
                store.madNetAdapter.setDsView(DS.slice(((page - 1) * DataPerPage), ((((page - 1) * DataPerPage) + DataPerPage))))
                store.madNetAdapter.setDsDataStores(ds => [...ds, ...DStores[0]]);
            }
            else {
                store.madNetAdapter.setDsView(DStores[0].slice(((page - 1) * DataPerPage), ((((page - 1) * DataPerPage) + DataPerPage))))
                store.madNetAdapter.setDsDataStores(DStores[0]);
            }
            props.states.setLoading(false);
            props.states.setUpdateView((updateView) => ++updateView);
        }
        catch (ex) {
            props.states.setLoading(false);
            props.states.setError(String(ex));
            props.states.setUpdateView((updateView) => ++updateView);
        }
    }

    // View search results
    const dataView = () => {
        if (store.madNetAdapter.dsView.length > 0) {
            return store.madNetAdapter.dsView.map(function (e, i) {
                return (
                    <Segment.Group compact={true} key={i}>
                        <Segment className="notifySegments" textAlign="left">Index: 0x{e["DSLinker"]["DSPreImage"]["Index"]} <Icon name="copy outline" className="click" onClick={() => props.states.copyText("0x" + e["DSLinker"]["DSPreImage"]["Index"])} /> </Segment>
                        <Segment className="notifySegments" textAlign="left">Data: 0x{e["DSLinker"]["DSPreImage"]["RawData"]} <Icon name="copy outline" className="click" onClick={() => props.states.copyText("0x" + e["DSLinker"]["DSPreImage"]["RawData"])} /> </Segment>
                        <Segment className="notifySegments" textAlign="left">Transaction Hash: 0x{e["DSLinker"]["TxHash"]} <Icon name="copy outline" className="click" onClick={() => props.states.copyText("0x" + e["DSLinker"]["TxHash"])} /> <Icon className="click" name="external" onClick={() => store.madNetAdapter.viewTransaction(e["DSLinker"]["TxHash"], true)} /></Segment>
                    </Segment.Group>
                )
            });
        }
        else {
            return (<></>)
        }
    }

    // Pagination buttons
    const paginate = () => {
        if (store.madNetAdapter.dsDataStores.length < (DataPerPage + 1)) {
            return (
                <></>
            )
        }
        else {
            return (
                <>
                    <Button onClick={() => handlePage(-1)} disabled={Boolean(store.madNetAdapter.dsActivePage === 1)} color="blue" icon>
                        <Icon name='angle left' />
                    </Button>
                    <Button onClick={() => handlePage(1)} disabled={Boolean(store.madNetAdapter.dsActivePage === Math.ceil(store.madNetAdapter.dsDataStores.length / DataPerPage))} color="blue" icon>
                        <Icon name='angle right' />
                    </Button>
                </>
            )
        }
    }

    // Render
    return (
        <Grid stretched centered={true}>
            <Container textAlign="center"></Container>
            <Grid.Row stretched centered={true}>
                <Segment raised>
                    <Form fluid="true">
                        <Form.Group>
                            <Form.Input value={store.madNetAdapter.dsSearchOpts["address"]} onChange={(event, data) => { handleChange(event, "address", data) }} label='Address' placeholder='0x...' />
                            <Form.Input value={store.madNetAdapter.dsSearchOpts["offset"]} onChange={(event, data) => { handleChange(event, "offset", data) }} label='Offset' placeholder='0x...' />
                        </Form.Group>
                        <Form.Field>
                            <Form.Group className="switch" inline>
                                <label>BN Address</label>
                                <Switch onColor="#4aec75" height={22} width={46} offColor="#ff6464" offHandleColor="#212121" onHandleColor="#f0ece2" onChange={(event, data) => { handleChange(event, "bnCurve", data) }} checked={Boolean(store.madNetAdapter.dsSearchOpts["bnCurve"])} />
                            </Form.Group>
                        </Form.Field>
                        <Button color="blue" onClick={(event) => handleSubmit(event)}>Browse</Button>
                    </Form>
                </Segment>
            </Grid.Row>
            <Grid.Row>
                <Container>
                    <Segment raised>
                        <p>{store.madNetAdapter.dsDataStores.length === 0 ? "No DataStores to display!" : ""}</p>
                        <Card.Group centered={true}>
                            {dataView()}
                        </Card.Group>
                    </Segment>
                    {paginate()}
                </Container>
            </Grid.Row>
        </Grid>
    )
}
export default DataExplorer;