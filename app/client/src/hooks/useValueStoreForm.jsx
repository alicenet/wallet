import { isBoolean } from "lodash";
import React from "react";
import validator from "validator";
import Web3 from "web3";

/**
 * Isolated form hook for Value TXouts
 * @param { String } fromInit - Initial from value
 * @param { String } toInit - Initial to value
 * @param { Integer } valueInit - initial value
 * @param { Boolean } isBnInit - Is from a bn address?
 * @param { Function (fromAddress, toAddress, value, isBn) => {} } postVerifyCallback - Callback to run after form verification
 * @returns
 */
export default function useValueStoreFormState(
    postVerifyCallback = () => {},
    fromInit = "",
    toInit = "",
    valueInit = "",
    isBnInit = ""
) {
    const [state, setState] = React.useState({
        fromAddress: fromInit,
        toAddress: toInit,
        value: valueInit,
        isBn: isBnInit ? isBnInit : false,
    });

    const [errors, setError] = React.useState({
        fromAddress: "",
        toAddress: "",
        value: "",
        isBn: "",
        any: "",
    });

    const setStateByKey = (key, newVal) =>
        setState((state) => ({ ...state, [key]: newVal }));
    const setErrorByKey = (key, newErr) =>
        setError((state) => ({ ...state, [key]: newErr }));

    const setters = {
        setFromAddress: (val) => setStateByKey("fromAddress", val),
        setToAddress: (val) => setStateByKey("toAddress", val),
        setValue: (val) => setStateByKey("value", val),
        setIsBn: (val) => setStateByKey("isBn", val),
    };

    const onSubmit = (callback = false) => {
        let error = false;

        if (!Web3.utils.isAddress("0x" + state.fromAddress)) {
            error = true;
            setErrorByKey("fromAddress", "Must be a valid address");
        } else {
            setErrorByKey("fromAddress", "");
        }

        if (!Web3.utils.isAddress("0x" + state.toAddress)) {
            error = true;
            setErrorByKey("toAddress", "Must be a valid address");
        } else {
            setErrorByKey("toAddress", "");
        }

        if (!validator.isNumeric(state.value)) {
            error = true;
            setErrorByKey("value", "Must be a number");
        } else {
            setErrorByKey("value", "");
        }

        if (!isBoolean(state.isBn)) {
            error = true;
            setErrorByKey("isBn", "Must be a boolean");
        } else {
            setErrorByKey("isBn", "");
        }

        // If any error, no callback
        if (error) {
            return setErrorByKey("any", "");
        } else {
            setErrorByKey("any", "");
        }

        return !!callback ? callback(state) : postVerifyCallback(state);
    };

    return [state, setters, errors, onSubmit];
}
