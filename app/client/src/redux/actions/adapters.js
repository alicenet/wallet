import { ADAPTER_ACTION_TYPES, VAULT_ACTION_TYPES } from '../constants/_constants';
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

/**
 * Get and store the latest balances for a given address to redux state
 * @param { String } address 
 * @returns { Array } [latestAddressBalances, allBalances]
 */
export const getAndStoreLatestBalancesForAddress = (address) => {
    return async (dispatch, getState) => {
        let state = getState();
        let wallets = [...state.vault.wallets.internal, ...state.vault.wallets.external];
        let web3Connected = state.adapter.web3Adapter.connected;
        let madNetConnected = state.adapter.madNetAdapter.connected;
        let balanceState = { ...state.vault.balances }; // Get current balances for state object update

        // Set default balance object for this address
        let addressBalances = {
            eth: "Not Available",
            stake: "Not Available",
            stakeAllowance: "Not Available",
            util: "Not Available",
            utilAllowance: "Not Available",
            madBytes: "Not Available",
            madUTXOs: [],
        }

        let balancePromises = []; // [eth, [stake,stakeAllow,util,utilAllow], [madBytes, UTXOs]]

        // First get eth/staking/util balances -- Only if web3 connected
        if (web3Connected) {
            // Get the account privK based on the address from state to add to web3 to fetch balance information
            let wallet
            try {
                wallet = wallets.filter(wal => wal.address === address)[0];
                balancePromises.push(web3Adapter.useAccount(wallet.privK));
            } catch (ex) {
                log.warn("Unable to parse wallet data for web3 balances of address: " + address, ". Is there a state imbalance? Error: ", ex);
            }
        }
        // Push an IIFE for a false resolving promise to position 0, to maintain array positions for the Promise.all resolve
        else {
            balancePromises.push((() => (new Promise(res => (res(false))))())); 
            log.debug("Skipping eth/staking/util balance fetch for address: " + address + " :: Web3 not connected.")
        }
        // Second get madBytes balance/utxos -- Only if madNet connected
        if (madNetConnected) {
            balancePromises.push(madNetAdapter.getMadWalletBalanceWithUTXOsForAddress(address));
        } else { log.debug("Skipping madBytes/UTXO balance fetch for address: " + address + " :: MadNet not connected.") }

        // If neither mad or web3 is connected, don't bother to try and pull balances
        if (!madNetConnected && !web3Connected) {
            return false;
        }

        let foundBalances = await Promise.all(balancePromises);

        // Inject eth
        if (typeof foundBalances[0] !== false && typeof foundBalances[0] !== 'undefined' && !foundBalances[0].error) {
            addressBalances.eth = foundBalances[0].balances.eth;
            addressBalances.stake = foundBalances[0].balances.stakingToken.balance;
            addressBalances.stakeAllowance = foundBalances[0].balances.stakingToken.allowance;
            addressBalances.util = foundBalances[0].balances.utilityToken.balance;
            addressBalances.utilAllowance = foundBalances[0].balances.utilityToken.allowance;
        }
        // Mad Bytes/UTXOs
        if (typeof foundBalances[1] !== 'undefined' && !foundBalances[1].error) {
            let [madBytes, madUtxos] = foundBalances[1];
            addressBalances.madBytes = madBytes;
            addressBalances.madUTXOs = madUtxos;
        }

        // Condense to updated state
        let updatedBalanceState = {
            ...balanceState,
            [address]: addressBalances
        }

        // Set new balance to state
        dispatch({ type: VAULT_ACTION_TYPES.SET_BALANCES_STATE, payload: updatedBalanceState })

        // Return latest found balances and the complete updated balance state
        return [addressBalances, updatedBalanceState];

    }
}