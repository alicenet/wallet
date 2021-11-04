import React from 'react';
import { Segment, Input, Button } from 'semantic-ui-react';

export default function FetchTxs() {

    const [loading, setLoading] = React.useState(false);
    const [txHashVal, setTxHashVal] = React.useState({ value: "", error: "" });
    const updateTxHashVal = (val) => setTxHashVal(s => ({ ...s, value: val }))

    const [polledTxs, setPolledTxs] = React.useState([]);

    const viewTxHash = () => {

    }

    const getTxTable = () => {

    }

    // Pagination Logic
    const txPerPage = 12;
    const totalPages = Math.ceil(polledTxs.length / txPerPage) === 0 ? 1 : Math.ceil(polledTxs.length / txPerPage) ;
    const [activePage, setPage] = React.useState(0);
    const pageForward = () => setPage(s => s + 1);
    const pageBackward = () => setPage(s => s - 1);

    const activeSlice = polledTxs.slice(activePage * txPerPage, (activePage * txPerPage) + txPerPage)

    return (
        <Segment placeholder={polledTxs?.length === 0} className="flex flex-grow h-full bg-red-700 m-0 ml-0 rounded-t-none border-t-0 bg-white shadow-none">

            <div className="flex flex-col justify-between h-full">

                <div className="mb-2 items-center">
                    <Input fluid size="mini" className="mb-2" placeholder="Lookup TX By Hash"
                        onChange={(e) => updateTxHashVal(e.target.value)}
                        value={txHashVal.value}
                        fluid
                        action={{
                            content: "Get TX",
                            size: "mini",
                            onClick: viewTxHash,
                            basic: true,
                            loading: loading === "hashSearch"
                        }} />
                </div>

                <div>
                    {getTxTable()}
                </div>

                <div className="flex justify-between items-center">
                    <Button disabled={activePage === 0} content="Back" size="mini" onClick={pageBackward} />
                    <div className="text-xs">{activePage + 1} / {totalPages} </div>
                    <Button disabled={activePage >= totalPages - 1} content="Next" size="mini" onClick={pageForward} />
                </div>
            </div>

        </Segment>
    )

}