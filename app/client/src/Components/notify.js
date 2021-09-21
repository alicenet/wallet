import React, { useEffect, useContext, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { StoreContext } from "../oldStore/store.js";
import 'react-toastify/dist/ReactToastify.css';

// Toasty notifications
function Notify(props) {
    // Store states
    const { store } = useContext(StoreContext);
    const [txHash, setTxHash] = useState(false)

    useEffect(() => {
        if (props.states.isNotify["msg"]) {
            toast[(props.states.isNotify["type"] ? props.states.isNotify["type"] : "info")](props.states.isNotify["msg"], {
                position: "bottom-right",
                autoClose: 5000,
                hideProgressBar: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            setTxHash(props.states.isNotify["txHash"])
            props.states.setNotify({})
        }
    }, [props])

    const viewTx = () => {
        if (txHash) {
            store.madNetAdapter.viewTransaction(txHash, true);
        }
        return
    }

    return (
        <ToastContainer
            position="bottom-right"
            autoClose={5000}
            hideProgressBar
            newestOnTop
            rtl={false}
            pauseOnFocusLoss={false}
            draggable
            pauseOnHover
            onClick={() => viewTx()}
        />
    )
}
export default Notify;