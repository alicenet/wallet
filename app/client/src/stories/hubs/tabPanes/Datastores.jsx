import React from 'react';
import { Button, Header, Icon, Loader, Message, Popup, Segment, Table } from 'semantic-ui-react';
import madNetAdapter from 'adapters/madAdapter';
import { getMadWalletInstance } from 'redux/middleware/WalletManagerMiddleware';
import utils from 'util/_util';
import usePrevious from 'hooks/usePrevious';
import { useHistory } from 'react-router';
import copy from 'copy-to-clipboard';
import { default_log as log } from 'log/logHelper';

export default function Datastores({ wallet }) {

    const history = useHistory();
    const lastWallet = usePrevious(wallet);

    const [page, setPage] = React.useState(1);
    const lastPage = usePrevious(page);

    const pageForward = () => setPage(s => s + 1);
    const pageBack = () => setPage(s => s - 1);

    const [fetchLoader, setFetchLoader] = React.useState(false);
    const [datastores, setDataStores] = React.useState([]);
    const [prevIndex, setPrevIndex] = React.useState("") // Use for previous page when available
    const [nextIndexToUse, setNextIndexToUse] = React.useState(""); // Use for next index in pagination -- Pulled from last of stack on data pull

    const maxDataPerPage = 15; // Max Datastores per page -- TODO: Adjust after final testing

    const [nextPageExists, setNextPageExists] = React.useState(false);

    const [loadingTx, setLoadingTx] = React.useState(false);

    const inspectTx = async (dStore) => {
        setLoadingTx(true);
        let res = await madNetAdapter.viewTransaction(dStore.txHash);
        setLoadingTx(false);
        history.push('/inspectTx', {
            tx: res.tx.Tx,
        })
    }

    // Fetch the data stores on mount and wallet/page changes
    React.useEffect(() => {

        const getData = async () => {

            let dir = "backwards"

            if (page > lastPage) {
                dir = "forwards"
            }

            let indexToUse = dir === "forwards" ? nextIndexToUse : prevIndex;

            let madWalletInstance = getMadWalletInstance();
            let dsSearchOpts = madNetAdapter.dsSearchOpts.get();
            let foundStores = [];
            for (let i = (maxDataPerPage + 1); i > 0; i--) {
                let attempt = await madWalletInstance.Rpc.getDataStoreUTXOIDs(dsSearchOpts["address"], (dsSearchOpts["bnCurve"] ? 2 : 1), i, indexToUse)
                if (attempt && attempt.length > 0) {
                    foundStores = attempt;
                    break;
                }
            }
            /// If found stores has length of +1 of maxDataPerPage we know the next page exists
            // -- Additionally slice the +1 off for the UI so only the max per page is shown
            if (foundStores.length > maxDataPerPage) {
                setNextPageExists(true);
                foundStores = foundStores.slice(0, foundStores.length - 1);
            } else {
                setNextPageExists(false);
            }
            if (foundStores.length === 0) { return setDataStores([]); }
            let UTXOIDS = [];
            for (let i = 0; i < foundStores.length; i++) {
                UTXOIDS.push(foundStores[i]["UTXOID"]);
            }
            let DStores = await madWalletInstance.Rpc.getUTXOsByIds(UTXOIDS); // This returns [DS, VS, AS] stores respectively
            let dStores = DStores[0]; // Extract just the Datastore array
            // Extract data from stores
            dStores = await utils.transaction.parseDsLinkers(dStores);
            // Set pagination indices
            setPrevIndex(page === 2 ? "" : indexToUse); // Set the just used index as the prev-index to use
            setNextIndexToUse(dStores[dStores.length - 1].index); // Set the next-index to the last element in the array
            // Set the data stores
            setDataStores(dStores);

        }

        const fetchDatastores = async () => {
            setFetchLoader(true);
            // Set active page in adapter to 1
            madNetAdapter.setDsActivePage(1)
            // Set dataStoreSearch address to the active wallet to the current wallet address
            madNetAdapter.setDsSearchAddress(wallet.address);
            await getData();
            setFetchLoader(false);
        };

        // Reset page if wallet changes
        if (wallet.address !== lastWallet?.address) {
            setPage(1);
            setPrevIndex(false);
            setNextIndexToUse("");
        }

        fetchDatastores();
    }, [wallet, page, lastWallet?.address]);

    const getDatastoreDisplay = () => {

        const getRows = () => {
            return datastores.map(dstore => (
                <Table.Row>
                    <Popup
                        trigger={
                            <Table.Cell className="cursor-pointer hover:bg-gray-100" 
                                content={utils.string.splitStringWithEllipsis(dstore.txHash, 5)} 
                                onClick={() => copy(dstore.txHash)}
                            />
                        }
                        size="mini"
                        content="Click to copy complete hash"
                        position="left center"
                    />
                    <Table.Cell content={dstore.issued} />
                    <Table.Cell content={dstore.expiry} />
                    <Table.Cell content={parseInt(dstore.fee, 16)} />
                    <Table.Cell content={parseInt(dstore.deposit, 16)} />
                    <Table.Cell content={utils.generic.hexToUtf8Str(dstore.index)} />
                    <Table.Cell content={utils.generic.hexToUtf8Str(dstore.value)} />
                    <Table.Cell className="cursor-pointer hover:bg-gray-100 text-center" onClick={() => inspectTx(dstore)} content={<Icon name="search" loading={loadingTx} />} />
                </Table.Row>
            ))
        }

        return (<div className="flex flex-col justify-between h-full">

            <div className="">
                <Table size="small" compact celled className="text-xs" color="blue">

                    <Table.Header>
                        <Table.HeaderCell>TxHash</Table.HeaderCell>
                        <Table.HeaderCell>Issued</Table.HeaderCell>
                        <Table.HeaderCell>Expires</Table.HeaderCell>
                        <Table.HeaderCell>Fee</Table.HeaderCell>
                        <Table.HeaderCell>Deposit</Table.HeaderCell>
                        <Table.HeaderCell>Index</Table.HeaderCell>
                        <Table.HeaderCell>Value</Table.HeaderCell>
                        <Table.HeaderCell content="" />
                    </Table.Header>

                    {getRows()}

                </Table>
            </div>

            <div className="mt-4">
                <Button.Group size="mini" className="flex justify-between">
                    <Button content="Prev Page" onClick={pageBack} disabled={page === 1} />
                    <Button className="ml-2 cursor-default bg-gray-400 text-white" content={"Page " + page} />
                    <Button className="ml-2" content="Next Page" disabled={!nextPageExists} onClick={pageForward} />
                </Button.Group>
            </div>

        </div>)

    }

    return (
        <Segment className="bg-white m-0 border-solid border border-gray-300 rounded-b border-t-0 rounded-tr-none rounded-tl-none">

            {fetchLoader && <Loader size="large" active content="Searching for Datastores" className="text-sm text-gray-500" />}

            {fetchLoader === false && datastores.length === 0 && (
                <div className="flex justify-center items-center h-full">
                    <Header className="m-0 text-gray-500">
                        No datastores were found
                    </Header>
                </div>
            )}

            {!fetchLoader && datastores.error && <Message content={datastores.error} error size="mini" />}

            {!fetchLoader && datastores.length > 0 && getDatastoreDisplay()}

        </Segment>
    );
}
