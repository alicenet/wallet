import React, { useContext, useState } from 'react';
import { StoreContext } from "../Store/store.js";
import { Container, Button, Form, Segment, Card, Grid, Icon } from 'semantic-ui-react';
import Switch from "react-switch";

function DataExplorer(props) {
    // Store states
    const { store } = useContext(StoreContext);
    // Search params
    const [searchOpts, setSearchOpts] = useState({ "address": "", "offset": "", "bnCurve": false })
    // All datastores from current query
    const [DataStores, setDataStores] = useState([]);
    // Current page being viewed
    const [activePage, setPage] = useState(1);
    // Datastores displayed in the page view
    const [DSView, setDSView] = useState([]);
    // Amount of datastores to display per page
    const DataPerPage = 5;

    // Update search params
    const handleChange = (event, e, v) => {
        if (e === "bnCurve") {
            setSearchOpts({
                ...searchOpts,
                [e]: event
            })
            return;
        }
        setSearchOpts({
            ...searchOpts,
            [e]: event.target.value
        })
    }

    // Handle next / previous page clicks
    const handlePage = (e) => {
        let page = activePage + e
        if (activePage > page) {
            setDSView(DataStores.slice(((page - 1) * DataPerPage), ((((page - 1) * DataPerPage) + DataPerPage))))
        }
        else if (activePage < page &&
            (
                (DataPerPage * page) - DataStores.length === 0 ||
                DataStores.length % (DataPerPage + 1) !== 0
            )
        ) {
            setDSView(DataStores.slice((activePage * DataPerPage), (((activePage * DataPerPage) + DataPerPage))))
        }
        else {
            getData(DataStores[DataStores.length - 1]["DSLinker"]["DSPreImage"]["Index"], page);
        }
        setPage(page);
    }

    // Sumbit initial query params
    const handleSubmit = (event) => {
        event.preventDefault()
        if (searchOpts["address"] === "") {
            return;
        }
        setPage(1)
        getData(searchOpts["offset"], 1, true);
    }

    // Get data from the RPC
    const getData = async (index, page, submit) => {
        try {
            props.states.setLoading("Getting DataStores...")
            let dataStores = false;
            if (index && index !== "" && submit) {
                let max = (DataPerPage)
                for (let i = max; i > 0; i--) {
                    let attempt = await store.wallet.Rpc.getDataStoreUTXOIDs(searchOpts["address"], (searchOpts["bnCurve"] ? 2 : 1), i, index)
                    if (attempt && attempt.length > 0) {
                        dataStores = attempt;
                        if (i !== 1) {
                            let queryObj = await store.wallet.Rpc.getDataStoreUTXOIDs(searchOpts["address"], (searchOpts["bnCurve"] ? 2 : 1), 1, index)
                            dataStores.unshift(queryObj[0]);
                        }
                        break;
                    }
                }
            }
            else {
                dataStores = await store.wallet.Rpc.getDataStoreUTXOIDs(searchOpts["address"], (searchOpts["bnCurve"] ? 2 : 1), (DataPerPage + 1), index)
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
                let DS = DataStores.concat(DStores[0]);
                setDSView(DS.slice(((page - 1) * DataPerPage), ((((page - 1) * DataPerPage) + DataPerPage))))
                setDataStores(ds => [...ds, ...DStores[0]]);
            }
            else {
                setDSView(DStores[0].slice(((page - 1) * DataPerPage), ((((page - 1) * DataPerPage) + DataPerPage))))
                setDataStores(DStores[0]);
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
        if (DSView.length > 0) {
            return DSView.map(function (e, i) {
                return (
                    <Segment.Group compact={true} key={i}>
                        <Segment textAlign="left">Index: {e["DSLinker"]["DSPreImage"]["Index"]}</Segment>
                        <Segment textAlign="left">Data: {e["DSLinker"]["DSPreImage"]["RawData"]}</Segment>
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
        if (DataStores.length < (DataPerPage + 1)) {
            return (
                <></>
            )
        }
        else {
            return (
                <>
                    <Button onClick={() => handlePage(-1)} disabled={Boolean(activePage === 1)} color="blue" icon>
                        <Icon name='angle left' />
                    </Button>
                    <Button onClick={() => handlePage(1)} disabled={Boolean(activePage === Math.ceil(DataStores.length / DataPerPage))} color="blue" icon>
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
                            <Form.Input onChange={(event, data) => { handleChange(event, "address", data) }} label='Address' placeholder='0x...' />
                            <Form.Input onChange={(event, data) => { handleChange(event, "offset", data) }} label='Offset' placeholder='0x...' />
                        </Form.Group>
                        <Form.Field>
                            <Form.Group className="switch" inline>
                                <label>BN Address</label>
                                <Switch onColor="#4aec75" height={22} width={46} offColor="#ff6464" offHandleColor="#212121" onHandleColor="#f0ece2" onChange={(event, data) => { handleChange(event, "bnCurve", data) }} checked={Boolean(searchOpts["bnCurve"])} />
                            </Form.Group>
                        </Form.Field>
                        <Button color="blue" onClick={(event) => handleSubmit(event)}>Browse</Button>
                    </Form>
                </Segment>
            </Grid.Row>
            <Grid.Row>
                <Container>
                    <Segment raised>
                        <p>{DataStores.length === 0 ? "No DataStores to display!" : ""}</p>
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