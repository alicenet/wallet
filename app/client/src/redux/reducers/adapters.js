import { ADAPTER_ACTION_TYPES } from '../constants/_constants';
import { reduxState_logger as log } from '../../log/logHelper';

//  Any user editable and saveable configurations are loaded here
export const initialAdapterState = {
    web3Adapter: {
        connected: false, // Has the web3 instance been initiated and is it connected?
        error: false, // If an error has occurred when interracting with the ethereum provider
        epoch: false, // Current epoch time -- False if not able to || hasn't been polled
        validators: false, // Current number of validators -- False if not able to || hasn't been polled
        max_validators: false, // Max number of validators -- False if not able to || hasn't been polled
    },
    madNetAdapter: {
        can_connect: false,
        error: false,
    }
}

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

        case ADAPTER_ACTION_TYPES.SET_MADNET_CONNECTED:
            return Object.assign({}, state, {
                madNetAdapter: { ...state.madNetAdapter, connected: action.payload }
            });

        case ADAPTER_ACTION_TYPES.SET_MADNET_ERROR:
            return Object.assign({}, state, {
                madNetAdapter: { ...state.madNetAdapter, error: action.payload }
            });

        default:
            return state;

    }

}