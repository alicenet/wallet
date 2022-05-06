import { ADAPTER_ACTION_TYPES } from '../constants/_constants';
import { reduxState_logger as log } from '../../log/logHelper';

//  Any user editable and savable configurations are loaded here
export const initialAdapterState = {
    web3Adapter: {
        connected: false, // Has the web3 instance been initiated and is it connected?
        busy: false,
        error: false, // If an error has occurred when interacting with the ethereum provider
        epoch: false, // Current epoch time -- False if not able to || hasn't been polled
        validators: false, // Current number of validators -- False if not able to || hasn't been polled
        max_validators: false, // Max number of validators -- False if not able to || hasn't been polled
    },
    aliceNetAdapter: {
        connected: false,
        busy: false,
        error: false,
        transactions: {
            txOuts: [],
            pendingtx: false,
            pendingLocked: false,
            changeAddress: { "address": "", "bnCurve": false },
        },
        blocks: {
            list: [],
            started: false,
            locked: false,
            id: false,
            mbAttempts: false,
        },
        fees: {},
    }
}

// aliceNetAdapter[key1][key2][key3]

/* Modal Reducer */
export default function adapterReducer(state = initialAdapterState, action) {

    switch (action.type) {

        case ADAPTER_ACTION_TYPES.SET_WEB3_CONNECTED:
            return Object.assign({}, state, {
                web3Adapter: { ...state.web3Adapter, connected: action.payload }
            });

        case ADAPTER_ACTION_TYPES.SET_WEB3_ERROR:
            return Object.assign({}, state, {
                web3Adapter: { ...state.web3Adapter, error: action.payload }
            });

        case ADAPTER_ACTION_TYPES.SET_WEB3_INFO:
            return Object.assign({}, state, {
                web3Adapter: { ...state.web3Adapter, epoch: action.payload.epoch, validators: action.payload.validators, max_validators: action.payload.validators }
            });

        case ADAPTER_ACTION_TYPES.SET_WEB3_EPOCH:
            return Object.assign({}, state, {
                web3Adapter: { ...state.web3Adapter, epoch: action.payload }
            });

        case ADAPTER_ACTION_TYPES.SET_ALICENET_CONNECTED:
            return Object.assign({}, state, {
                aliceNetAdapter: { ...state.aliceNetAdapter, connected: action.payload }
            });

        case ADAPTER_ACTION_TYPES.SET_ALICENET_ERROR:
            return Object.assign({}, state, {
                aliceNetAdapter: { ...state.aliceNetAdapter, error: action.payload }
            });

        // On disconnect set initial adapter state
        case ADAPTER_ACTION_TYPES.SET_DISCONNECTED:
            return Object.assign({}, initialAdapterState);

        case ADAPTER_ACTION_TYPES.SET_WEB3_BUSY:
            return Object.assign({}, state, {
                web3Adapter: { ...state.web3Adapter, busy: action.payload }
            });

        case ADAPTER_ACTION_TYPES.SET_ALICENET_BUSY:
            return Object.assign({}, state, {
                aliceNetAdapter: { ...state.aliceNetAdapter, busy: action.payload }
            });

        /**
         * A payload dependant state setter action for the aliceNetAdapter state
         * --  Supports upto object depth of 3
         * Requires payload.keyChain and payload.value
         */
        case ADAPTER_ACTION_TYPES.SET_ALICENET_KEYCHAIN_VALUE:
            let keyDepth = action.payload.keyChain.length;
            let keyTargets = action.payload.keyChain;
            let newAdapterState = { ...state.aliceNetAdapter };
            if (keyDepth === 1) {
                newAdapterState[keyTargets[0]] = action.payload.value;
            } else if (keyDepth === 2) {
                // Create none existent object if needed
                if (!newAdapterState[keyTargets[0]]) {
                    newAdapterState[keyTargets[0]] = {};
                }
                newAdapterState[keyTargets[0]][keyTargets[1]] = action.payload.value;
            } else if (keyDepth === 3) {
                newAdapterState[keyTargets[0]][keyTargets[1]][keyTargets[2]] = action.payload.value;
            } else { // Fallback to prev state
                log.warn("Falling back to previous state during SET_ALICENET_KEYCHAIN_VALUE, verify keyChain accessors and value set on payload correctly.")
                newAdapterState = { ...state.aliceNetAdapter }
            }
            return Object.assign({}, state, {
                aliceNetAdapter: newAdapterState,
            });

        default:
            return state;

    }

}