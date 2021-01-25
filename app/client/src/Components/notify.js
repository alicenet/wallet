import React, { useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Toasty notifications
function Notify(props) {
    useEffect(() => {
        if (props.states.isNotify["msg"]) {
            toast[(props.states.isNotify["type"] ? props.states.isNotify["type"] : "info")](props.states.isNotify["msg"], {
                position: "bottom-right",
                autoClose: 5000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            props.states.setNotify({})
        }
    }, [props])

    return (
        <ToastContainer
            position="bottom-right"
            autoClose={5000}
            hideProgressBar
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss={false}
            draggable
            pauseOnHover
        />
    )
}
export default Notify;