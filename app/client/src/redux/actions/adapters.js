import { ADAPTER_ACTION_TYPES } from '../constants/_constants';

export const setWeb3Connected = (isConnected) => {
    return dispatch => {
        dispatch({ type: ADAPTER_ACTION_TYPES.SET_WEB3_CONNECTED, payload: isConnected })
    }
}

export const setWeb3Error = (error) => {
    return dispatch => {
        dispatch({ type: ADAPTER_ACTION_TYPES.SET_WEB3_ERROR, payload: error })
    }
}

export const setWeb3Info = (epoch, validators, max_validators) => {
    return dispatch => {
        dispatch({ type: ADAPTER_ACTION_TYPES.SET_WEB3_INFO, payload: { epoch: epoch, validators: validators, max_validators: max_validators } })
    }
}

export const setWeb3ValidatorCount = valCountString => {
    return dispatch => {
        dispatch({ type: ADAPTER_ACTION_TYPES.SET_WEB3_VALIDATORS, payload: valCountString })
    }
}

export const setMadNetConnected = (isConnected) => {
    return dispatch => {
        dispatch({ type: ADAPTER_ACTION_TYPES.SET_MADNET_CONNECTED, payload: isConnected })
    }
}

export const setMadNetError = (error) => {
    return dispatch => {
        dispatch({ type: ADAPTER_ACTION_TYPES.SET_MADNET_ERROR, payload: error })
    }
}

export const setMadNetKeyChainValue = (keyChain, value) => {
    return dispatch => {
        dispatch({ type: ADAPTER_ACTION_TYPES.SET_MADNET_KEYCHAIN_VALUE, payload: { keyChain: keyChain, value: value } })
    }
}