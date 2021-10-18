import { ADAPTER_ACTION_TYPES } from '../constants/_constants';
import web3Adapter from 'adapters/web3Adapter';
import { default_log as log } from 'log/logHelper';
import madNetAdapter from 'adapters/madAdapter';
import { toast } from 'react-toastify';
import { SyncToastMessageSuccess } from 'components/customToasts/CustomToasts';

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

export const setWeb3Epoch = epoch => {
    return dispatch => {
        dispatch({ type: ADAPTER_ACTION_TYPES.SET_WEB3_EPOCH, payload: epoch })
    }
}

/**
 * If web3Adapter is not in a connected state attempt a connect
 * @param { Object } initConfig - Init config passthrough for the web3Adapter __init function
 * @returns 
 */export const initWeb3 = (initConfig) => {
    return async (dispatch, getState) => {
        let isConnected = getState().adapter.web3Adapter.connected;
        if (!isConnected) {
            let connected = await web3Adapter.__init(initConfig);
            if (connected.error) {
                return { error: connected.error }
            } else {
                return true;
            }
        } else {
            log.warn("Web3 connection attempt made while already connected. -- Normal on lock/unlock cycles.")
            return { error: "State determined Web3 is already connected. If this is not correct, investigate for errors. :: This is normal after a wallet lock cycle." }
        }
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

/**
 * If madNetAdapter is not in a connected state attempt a connect
 * @param { Object } initConfig - Init config passthrough for the madNetAdapter __init function
 * @returns 
 */
export const initMadNet = (initConfig) => {
    return async (dispatch, getState) => {
        let isConnected = getState().adapter.madNetAdapter.connected;
        if (!isConnected) {
            let connected = await madNetAdapter.__init(initConfig);
            if (connected.error) {
                return { error: connected.error };
            } else {
                return true;
            }
        } else {
            log.warn("MadNet connection attempt made while already connected -- Normal on lock/unlock cycles.")
            return { error: "State determined MadNet is already connected. If this is not correct, investigate for errors. :: This is normal after a wallet lock cycle." }
        }
    }
}

// Single dispatch to call for initiating both Web3 and MadNet adapters after vault unlocking / wallet loads
export const initAdapters = () => {
    return async (dispatch) => {
        let web3Connected = await dispatch(initWeb3({ preventToast: true })); // Attempt to init web3Adapter -- Adapter will handle error toasts
        let madConnected = await dispatch(initMadNet({ preventToast: true })); // Attempt to init madAdapter -- Adapter will handle error toasts
        if (web3Connected && madConnected) {
            toast.success(<SyncToastMessageSuccess basic message="MadNet & Web3 Connected" />, { className: "basic", "autoClose": 2400 })
            return { success: true }
        } else {
            return {
                error: "Unable to initiate both adapters -- Verify network configuration, and check property errors for error collection if needed on subsequent runs.", errors: {
                    web3: web3Connected.error,
                    madNet: madConnected.erros,
                }
            }
        }

    }
}

// Get Latest MadByte Balances/UTXOs for all of madnetWallet.Account.accounts and push balance to redux state
export const updateAndLoadMadNetBalancesToState = () => {

}

// Get eth, util, and stake balances from Web3 instance for all madnetWallet.Account.accounts and push balance to redux state
export const updateAndLoadWeb3BalancesToState = () => {

}